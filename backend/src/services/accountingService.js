const AppError = require("../utils/appError");
const { Decimal, toPrismaDecimal } = require("../utils/money");

function transactionEffect(type, amount) {
  const value = new Decimal(amount.toString());
  if (type === "expense") return value.negated();
  if (type === "income" || type === "initial_balance") return value;
  return new Decimal(0);
}

async function assertOwnedAccount(tx, userId, accountId, includeArchived = false) {
  const account = await tx.account.findFirst({ where: { id: accountId, userId } });
  if (!account || (!includeArchived && account.isArchived)) {
    throw new AppError(404, "ACCOUNT_NOT_FOUND", "The account was not found.");
  }
  return account;
}

async function applyAccountDelta(tx, accountId, delta) {
  const account = await tx.account.findUnique({ where: { id: accountId } });
  const current = new Decimal(account.currentBalance.toString());
  return tx.account.update({
    where: { id: accountId },
    data: { currentBalance: toPrismaDecimal(current.plus(delta)) }
  });
}

async function recalculateAccountBalance(tx, accountId) {
  const account = await tx.account.findUnique({ where: { id: accountId } });
  const transactions = await tx.transaction.findMany({ where: { accountId } });
  const balance = transactions.reduce((sum, item) => sum.plus(transactionEffect(item.type, item.amount)), new Decimal(0));
  return tx.account.update({
    where: { id: accountId },
    data: { currentBalance: toPrismaDecimal(balance), initialBalance: account.initialBalance }
  });
}

module.exports = { assertOwnedAccount, applyAccountDelta, recalculateAccountBalance, transactionEffect };
