const Decimal = require("decimal.js");
const { Prisma } = require("@prisma/client");

function toMoney(value) {
  const decimal = new Decimal(value);
  if (!decimal.isFinite()) return null;
  return decimal.toDecimalPlaces(2);
}

function toPrismaDecimal(value) {
  const money = toMoney(value);
  return money ? new Prisma.Decimal(money.toFixed(2)) : null;
}

function signedAmount(type, amount) {
  const value = new Decimal(amount.toString());
  if (type === "expense") return value.negated();
  if (type === "transfer") return value;
  return value;
}

module.exports = { Decimal, toMoney, toPrismaDecimal, signedAmount };
