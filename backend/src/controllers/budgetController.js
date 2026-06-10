const prisma = require("../config/db");
const AppError = require("../utils/appError");
const { toPrismaDecimal } = require("../utils/money");
const { ok } = require("../utils/response");
const { budgetSummary } = require("../services/budgetService");
const { findCategoryOrThrow } = require("../services/categoryService");

async function listBudgets(req, res) {
  const where = {
    userId: req.user.id,
    ...(req.query.month ? { month: Number(req.query.month) } : {}),
    ...(req.query.year ? { year: Number(req.query.year) } : {})
  };
  const budgets = await prisma.budget.findMany({ where, include: { category: true }, orderBy: [{ year: "desc" }, { month: "desc" }] });
  const summaries = await Promise.all(budgets.map((budget) => budgetSummary(req.user.id, budget)));
  return ok(res, { budgets: summaries });
}

async function createBudget(req, res) {
  const category = await findCategoryOrThrow(req.body.categoryId, "expense");
  if (!category) throw new AppError(400, "INVALID_CATEGORY", "Budgets can only be created for active expense categories.");
  const budget = await prisma.budget.create({
    data: {
      userId: req.user.id,
      categoryId: req.body.categoryId,
      amount: toPrismaDecimal(req.body.amount),
      month: req.body.month,
      year: req.body.year
    },
    include: { category: true }
  });
  return ok(res, { budget: await budgetSummary(req.user.id, budget) });
}

async function updateBudget(req, res) {
  const existing = await prisma.budget.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new AppError(404, "BUDGET_NOT_FOUND", "The budget was not found.");
  const data = {};
  if (req.body.amount !== undefined) data.amount = toPrismaDecimal(req.body.amount);
  for (const key of ["categoryId", "month", "year"]) if (req.body[key] !== undefined) data[key] = req.body[key];
  if (req.body.categoryId) {
    const category = await findCategoryOrThrow(req.body.categoryId, "expense");
    if (!category) throw new AppError(400, "INVALID_CATEGORY", "Budgets can only be created for active expense categories.");
  }
  const budget = await prisma.budget.update({ where: { id: existing.id }, data, include: { category: true } });
  return ok(res, { budget: await budgetSummary(req.user.id, budget) });
}

async function deleteBudget(req, res) {
  const existing = await prisma.budget.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new AppError(404, "BUDGET_NOT_FOUND", "The budget was not found.");
  await prisma.budget.delete({ where: { id: existing.id } });
  return ok(res, { message: "Budget deleted successfully." });
}

module.exports = { listBudgets, createBudget, updateBudget, deleteBudget };
