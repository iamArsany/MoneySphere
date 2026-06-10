const prisma = require("../config/db");
const { Decimal } = require("../utils/money");
const { sendEmail } = require("./emailService");

function monthBounds(year, month) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return { start, end };
}

async function budgetSummary(userId, budget) {
  const { start, end } = monthBounds(budget.year, budget.month);
  const aggregate = await prisma.transaction.aggregate({
    where: {
      userId,
      categoryId: budget.categoryId,
      type: "expense",
      transactionDate: { gte: start, lt: end }
    },
    _sum: { amount: true }
  });
  const spent = new Decimal((aggregate._sum.amount || 0).toString());
  const limit = new Decimal(budget.amount.toString());
  const remaining = limit.minus(spent);
  const percentUsed = limit.isZero() ? new Decimal(0) : spent.div(limit).mul(100);
  const status = percentUsed.greaterThanOrEqualTo(100) ? "Exceeded" : percentUsed.greaterThanOrEqualTo(80) ? "Warning" : "On Track";
  return {
    ...budget,
    totalSpent: spent.toFixed(2),
    remainingAmount: remaining.toFixed(2),
    percentUsed: percentUsed.toDecimalPlaces(2).toNumber(),
    status
  };
}

async function checkBudgetAlerts(userId, categoryId, date) {
  const txDate = new Date(date);
  const month = txDate.getUTCMonth() + 1;
  const year = txDate.getUTCFullYear();
  const budget = await prisma.budget.findUnique({
    where: { userId_categoryId_month_year: { userId, categoryId, month, year } },
    include: { user: true, category: true }
  });
  if (!budget) return;
  const summary = await budgetSummary(userId, budget);
  if (summary.percentUsed >= 80 && !budget.alertSent80) {
    await prisma.notification.create({
      data: {
        userId,
        title: "Budget warning",
        message: `${budget.category.nameEn} spending reached 80% of budget.`,
        type: "BUDGET_80",
        link: "/budgets"
      }
    });
    await prisma.budget.update({ where: { id: budget.id }, data: { alertSent80: true } });
    await sendEmail({ to: budget.user.email, subject: "Budget warning", text: "Your budget reached 80%." });
  }
  if (summary.percentUsed >= 100 && !budget.alertSent100) {
    await prisma.notification.create({
      data: {
        userId,
        title: "Budget exceeded",
        message: `${budget.category.nameEn} spending reached or exceeded budget.`,
        type: "BUDGET_100",
        link: "/budgets"
      }
    });
    await prisma.budget.update({ where: { id: budget.id }, data: { alertSent100: true } });
    await sendEmail({ to: budget.user.email, subject: "Budget exceeded", text: "Your budget was exceeded." });
  }
}

module.exports = { budgetSummary, checkBudgetAlerts, monthBounds };
