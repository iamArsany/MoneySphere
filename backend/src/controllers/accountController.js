const { v4: uuid } = require("uuid");
const prisma = require("../config/db");
const AppError = require("../utils/appError");
const { toPrismaDecimal, Decimal } = require("../utils/money");
const { ok } = require("../utils/response");
const { applyAccountDelta, assertOwnedAccount, transactionEffect } = require("../services/accountingService");

function accountInclude() {
  return { transactions: { orderBy: { transactionDate: "desc" }, take: 5 } };
}

async function listAccounts(req, res) {
  const accounts = await prisma.account.findMany({
    where: { userId: req.user.id, ...(req.query.includeArchived === "true" ? {} : { isArchived: false }) },
    include: accountInclude(),
    orderBy: { createdAt: "desc" }
  });
  return ok(res, { accounts });
}

async function createAccount(req, res) {
  const count = await prisma.account.count({ where: { userId: req.user.id } });
  if (count >= 10) throw new AppError(400, "ACCOUNT_LIMIT", "A user can create up to 10 financial accounts.");
  const account = await prisma.$transaction(async (tx) => {
    const created = await tx.account.create({
      data: {
        userId: req.user.id,
        accountName: req.body.accountName,
        accountType: req.body.accountType,
        initialBalance: toPrismaDecimal(req.body.initialBalance),
        currentBalance: toPrismaDecimal(req.body.initialBalance),
        currency: req.body.currency,
        color: req.body.color,
        icon: req.body.icon
      }
    });
    await tx.transaction.create({
      data: {
        userId: req.user.id,
        accountId: created.id,
        type: "initial_balance",
        amount: toPrismaDecimal(req.body.initialBalance),
        description: "Initial Balance",
        transactionDate: new Date()
      }
    });
    return created;
  });
  return ok(res, { account });
}

async function getAccount(req, res) {
  const account = await prisma.account.findFirst({ where: { id: req.params.id, userId: req.user.id }, include: accountInclude() });
  if (!account) throw new AppError(404, "ACCOUNT_NOT_FOUND", "The account was not found.");
  const totals = await prisma.transaction.groupBy({
    by: ["type"],
    where: { accountId: account.id, type: { in: ["income", "expense"] } },
    _sum: { amount: true }
  });
  return ok(res, { account, totals });
}

async function updateAccount(req, res) {
  const account = await prisma.account.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!account) throw new AppError(404, "ACCOUNT_NOT_FOUND", "The account was not found.");
  const data = {};
  for (const key of ["accountName", "color", "icon", "isArchived"]) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }
  const updated = await prisma.account.update({ where: { id: account.id }, data });
  return ok(res, { account: updated });
}

async function deleteAccount(req, res) {
  const account = await prisma.account.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!account) throw new AppError(404, "ACCOUNT_NOT_FOUND", "The account was not found.");
  const transactionCount = await prisma.transaction.count({ where: { accountId: account.id } });
  if (transactionCount > 0) {
    const archived = await prisma.account.update({ where: { id: account.id }, data: { isArchived: true } });
    return ok(res, { account: archived, message: "Account has transactions and was archived instead of deleted." });
  }
  await prisma.account.delete({ where: { id: account.id } });
  return ok(res, { message: "Account deleted successfully." });
}

async function transfer(req, res) {
  if (req.body.sourceAccountId === req.body.destinationAccountId) {
    throw new AppError(400, "INVALID_TRANSFER", "Source and destination accounts must be different.");
  }
  const amount = toPrismaDecimal(req.body.amount);
  const pairId = uuid();
  const result = await prisma.$transaction(async (tx) => {
    const source = await assertOwnedAccount(tx, req.user.id, req.body.sourceAccountId);
    const destination = await assertOwnedAccount(tx, req.user.id, req.body.destinationAccountId);
    if (new Date(req.body.date) < source.createdAt || new Date(req.body.date) < destination.createdAt) {
      throw new AppError(400, "INVALID_DATE", "Transaction date cannot precede the associated account creation date.");
    }
    const debit = await tx.transaction.create({
      data: {
        userId: req.user.id,
        accountId: source.id,
        type: "transfer",
        amount,
        description: req.body.description,
        transactionDate: new Date(req.body.date),
        transferPairId: pairId
      }
    });
    const credit = await tx.transaction.create({
      data: {
        userId: req.user.id,
        accountId: destination.id,
        type: "transfer",
        amount,
        description: req.body.description,
        transactionDate: new Date(req.body.date),
        transferPairId: pairId
      }
    });
    await applyAccountDelta(tx, source.id, new Decimal(req.body.amount).negated());
    await applyAccountDelta(tx, destination.id, new Decimal(req.body.amount));
    return { debit, credit };
  });
  return ok(res, result);
}

module.exports = { listAccounts, createAccount, getAccount, updateAccount, deleteAccount, transfer };
