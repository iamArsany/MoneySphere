const prisma = require("../config/db");
const AppError = require("../utils/appError");
const { toPrismaDecimal } = require("../utils/money");
const { ok } = require("../utils/response");
const { applyAccountDelta, assertOwnedAccount, transactionEffect } = require("../services/accountingService");
const { findCategoryOrThrow } = require("../services/categoryService");
const { checkBudgetAlerts } = require("../services/budgetService");

async function validateTransactionData(tx, userId, data, existingAccountId) {
  const accountId = data.accountId || existingAccountId;
  const account = await assertOwnedAccount(tx, userId, accountId, true);
  if (data.transactionDate && new Date(data.transactionDate) < account.createdAt) {
    throw new AppError(400, "INVALID_DATE", "Transaction date cannot precede the associated account creation date.");
  }
  if (data.type === "expense" && !data.categoryId) throw new AppError(400, "CATEGORY_REQUIRED", "Expense transactions must belong to a category.");
  if (data.categoryId) {
    const category = await findCategoryOrThrow(data.categoryId, data.type === "expense" ? "expense" : undefined);
    if (!category) throw new AppError(400, "INVALID_CATEGORY", "The category is not active or does not match the transaction type.");
  }
}

async function listTransactions(req, res) {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 20), 100);
  const where = {
    userId: req.user.id,
    ...(req.query.accountId ? { accountId: req.query.accountId } : {}),
    ...(req.query.categoryId ? { categoryId: req.query.categoryId } : {}),
    ...(req.query.type ? { type: req.query.type } : {}),
    ...(req.query.startDate || req.query.endDate ? { transactionDate: { ...(req.query.startDate ? { gte: new Date(req.query.startDate) } : {}), ...(req.query.endDate ? { lte: new Date(req.query.endDate) } : {}) } } : {}),
    ...(req.query.minAmount || req.query.maxAmount ? { amount: { ...(req.query.minAmount ? { gte: toPrismaDecimal(req.query.minAmount) } : {}), ...(req.query.maxAmount ? { lte: toPrismaDecimal(req.query.maxAmount) } : {}) } } : {})
  };
  const sortMap = { date: "transactionDate", amount: "amount", category: "categoryId" };
  const orderBy = { [sortMap[req.query.sort] || "transactionDate"]: req.query.order === "asc" ? "asc" : "desc" };
  const [items, total] = await Promise.all([
    prisma.transaction.findMany({ where, include: { account: true, category: true }, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.transaction.count({ where })
  ]);
  return ok(res, { transactions: items, pagination: { page, limit, total } });
}

async function createTransaction(req, res) {
  const transaction = await prisma.$transaction(async (tx) => {
    await validateTransactionData(tx, req.user.id, req.body);
    const created = await tx.transaction.create({
      data: {
        userId: req.user.id,
        accountId: req.body.accountId,
        categoryId: req.body.categoryId,
        type: req.body.type,
        amount: toPrismaDecimal(req.body.amount),
        note: req.body.note,
        description: req.body.description,
        transactionDate: new Date(req.body.transactionDate),
        receiptUrl: req.body.receiptUrl
      }
    });
    await applyAccountDelta(tx, created.accountId, transactionEffect(created.type, created.amount));
    return created;
  });
  if (transaction.type === "expense" && transaction.categoryId) await checkBudgetAlerts(req.user.id, transaction.categoryId, transaction.transactionDate);
  return ok(res, { transaction });
}

async function getTransaction(req, res) {
  const transaction = await prisma.transaction.findFirst({ where: { id: req.params.id, userId: req.user.id }, include: { account: true, category: true } });
  if (!transaction) throw new AppError(404, "TRANSACTION_NOT_FOUND", "The transaction was not found.");
  return ok(res, { transaction });
}

async function updateTransaction(req, res) {
  const updated = await prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) throw new AppError(404, "TRANSACTION_NOT_FOUND", "The transaction was not found.");
    if (existing.type === "initial_balance") throw new AppError(400, "INITIAL_BALANCE_IMMUTABLE", "Initial Balance transactions cannot be directly edited.");
    if (existing.type === "transfer") throw new AppError(400, "TRANSFER_IMMUTABLE", "Transfer transactions must be modified via the transfer flow.");
    const next = { ...existing, ...req.body };
    await validateTransactionData(tx, req.user.id, next, existing.accountId);
    const transaction = await tx.transaction.update({
      where: { id: existing.id },
      data: {
        accountId: req.body.accountId,
        categoryId: req.body.categoryId,
        type: req.body.type,
        amount: req.body.amount !== undefined ? toPrismaDecimal(req.body.amount) : undefined,
        note: req.body.note,
        description: req.body.description,
        transactionDate: req.body.transactionDate ? new Date(req.body.transactionDate) : undefined,
        receiptUrl: req.body.receiptUrl
      }
    });
    await applyAccountDelta(tx, existing.accountId, transactionEffect(existing.type, existing.amount).negated());
    await applyAccountDelta(tx, transaction.accountId, transactionEffect(transaction.type, transaction.amount));
    return transaction;
  });
  if (updated.type === "expense" && updated.categoryId) await checkBudgetAlerts(req.user.id, updated.categoryId, updated.transactionDate);
  return ok(res, { transaction: updated });
}

async function deleteTransaction(req, res) {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) throw new AppError(404, "TRANSACTION_NOT_FOUND", "The transaction was not found.");
    if (existing.type === "initial_balance") throw new AppError(400, "INITIAL_BALANCE_IMMUTABLE", "Initial Balance transactions cannot be directly deleted.");
    if (existing.type === "transfer") throw new AppError(400, "TRANSFER_IMMUTABLE", "Transfer transactions must be modified via the transfer flow.");
    await tx.transaction.delete({ where: { id: existing.id } });
    await applyAccountDelta(tx, existing.accountId, transactionEffect(existing.type, existing.amount).negated());
  });
  return ok(res, { message: "Transaction deleted successfully." });
}

async function bulkDelete(req, res) {
  if (req.body.ids.length > 50) throw new AppError(400, "BULK_LIMIT", "Bulk delete supports up to 50 transactions.");
  await prisma.$transaction(async (tx) => {
    const transactions = await tx.transaction.findMany({ where: { id: { in: req.body.ids }, userId: req.user.id } });
    if (transactions.some((item) => item.type === "initial_balance" || item.type === "transfer")) {
      throw new AppError(400, "IMMUTABLE_TRANSACTION", "Initial Balance and transfer transactions cannot be bulk deleted.");
    }
    await tx.transaction.deleteMany({ where: { id: { in: transactions.map((item) => item.id) }, userId: req.user.id } });
    for (const transaction of transactions) {
      await applyAccountDelta(tx, transaction.accountId, transactionEffect(transaction.type, transaction.amount).negated());
    }
  });
  return ok(res, { message: "Transactions deleted successfully." });
}

module.exports = { listTransactions, createTransaction, getTransaction, updateTransaction, deleteTransaction, bulkDelete };
