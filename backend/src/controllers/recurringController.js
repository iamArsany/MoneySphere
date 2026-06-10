const prisma = require("../config/db");
const AppError = require("../utils/appError");
const { toPrismaDecimal } = require("../utils/money");
const { ok } = require("../utils/response");
const { assertOwnedAccount } = require("../services/accountingService");
const { findCategoryOrThrow } = require("../services/categoryService");

function nextRunDate(startDate) {
  // TODO: The API spec does not define scheduler preview semantics; initial next_run_date uses start_date.
  return new Date(startDate);
}

async function listRecurring(req, res) {
  const recurring = await prisma.recurringTemplate.findMany({
    where: { userId: req.user.id },
    include: { account: true, category: true },
    orderBy: { createdAt: "desc" }
  });
  return ok(res, { recurring });
}

async function createRecurring(req, res) {
  const template = await prisma.$transaction(async (tx) => {
    await assertOwnedAccount(tx, req.user.id, req.body.accountId);
    const category = await findCategoryOrThrow(req.body.categoryId, req.body.type === "expense" ? "expense" : undefined);
    if (!category) throw new AppError(400, "INVALID_CATEGORY", "The category is not active or does not match the recurring transaction type.");
    return tx.recurringTemplate.create({
      data: {
        userId: req.user.id,
        accountId: req.body.accountId,
        type: req.body.type,
        amount: toPrismaDecimal(req.body.amount),
        categoryId: req.body.categoryId,
        description: req.body.description,
        frequency: req.body.frequency,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
        nextRunDate: nextRunDate(req.body.startDate)
      }
    });
  });
  return ok(res, { recurring: template });
}

async function updateRecurring(req, res) {
  const existing = await prisma.recurringTemplate.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new AppError(404, "RECURRING_NOT_FOUND", "The recurring template was not found.");
  const data = {};
  for (const key of ["accountId", "type", "categoryId", "description", "frequency", "status"]) if (req.body[key] !== undefined) data[key] = req.body[key];
  if (req.body.amount !== undefined) data.amount = toPrismaDecimal(req.body.amount);
  if (req.body.startDate !== undefined) data.startDate = new Date(req.body.startDate);
  if (req.body.endDate !== undefined) data.endDate = req.body.endDate ? new Date(req.body.endDate) : null;
  if (req.body.startDate !== undefined) data.nextRunDate = nextRunDate(req.body.startDate);
  const updated = await prisma.recurringTemplate.update({ where: { id: existing.id }, data });
  return ok(res, { recurring: updated });
}

async function deleteRecurring(req, res) {
  const existing = await prisma.recurringTemplate.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new AppError(404, "RECURRING_NOT_FOUND", "The recurring template was not found.");
  await prisma.recurringTemplate.delete({ where: { id: existing.id } });
  return ok(res, { message: "Recurring template deleted successfully." });
}

async function skipNext(req, res) {
  const existing = await prisma.recurringTemplate.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw new AppError(404, "RECURRING_NOT_FOUND", "The recurring template was not found.");
  const updated = await prisma.recurringTemplate.update({
    where: { id: existing.id },
    data: { skippedDates: { push: existing.nextRunDate } }
  });
  return ok(res, { recurring: updated, message: "Next occurrence skipped." });
}

module.exports = { listRecurring, createRecurring, updateRecurring, deleteRecurring, skipNext };
