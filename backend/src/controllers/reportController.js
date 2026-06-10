const PDFDocument = require("pdfkit");
const prisma = require("../config/db");
const { Decimal } = require("../utils/money");
const { ok } = require("../utils/response");
const { monthBounds } = require("../services/budgetService");

function periodBounds(body) {
  if (body.reportType === "monthly") return monthBounds(body.year, body.month);
  return { start: new Date(Date.UTC(body.year, 0, 1)), end: new Date(Date.UTC(body.year + 1, 0, 1)) };
}

async function buildReport(userId, body) {
  const { start, end } = periodBounds(body);
  const where = {
    userId,
    type: { in: ["income", "expense"] },
    transactionDate: { gte: start, lt: end },
    ...(body.accountId ? { accountId: body.accountId } : {}),
    ...(body.categoryId ? { categoryId: body.categoryId } : {}),
    ...(body.transactionType ? { type: body.transactionType } : {})
  };
  const transactions = await prisma.transaction.findMany({ where, include: { account: true, category: true }, orderBy: { transactionDate: "asc" } });
  const income = transactions.filter((item) => item.type === "income").reduce((sum, item) => sum.plus(item.amount.toString()), new Decimal(0));
  const expenses = transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum.plus(item.amount.toString()), new Decimal(0));
  const byCategory = {};
  for (const item of transactions.filter((tx) => tx.type === "expense")) {
    const name = item.category?.nameEn || "Uncategorized";
    byCategory[name] = new Decimal(byCategory[name] || 0).plus(item.amount.toString()).toFixed(2);
  }
  const netSavings = income.minus(expenses);
  const savingsRate = income.isZero() ? new Decimal(0) : netSavings.div(income).mul(100);
  return {
    period: body.reportType === "monthly" ? `${body.year}-${String(body.month).padStart(2, "0")}` : String(body.year),
    totals: {
      totalIncome: income.toFixed(2),
      totalExpenses: expenses.toFixed(2),
      netSavings: netSavings.toFixed(2),
      savingsRate: savingsRate.toDecimalPlaces(2).toNumber()
    },
    expenseBreakdownByCategory: byCategory,
    topExpenseCategories: Object.entries(byCategory).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 5).map(([category, amount]) => ({ category, amount })),
    transactions
  };
}

async function generate(req, res) {
  return ok(res, { report: await buildReport(req.user.id, req.body) });
}

async function exportPdf(req, res) {
  const report = await buildReport(req.user.id, req.body);
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.text(`Personal Finance Tracker Report`, { align: "center" });
  doc.text(`User: ${req.user.fullName}`);
  doc.text(`Period: ${report.period}`);
  doc.text(`Generated: ${new Date().toISOString()}`);
  doc.moveDown();
  doc.text(`Total Income: ${report.totals.totalIncome}`);
  doc.text(`Total Expenses: ${report.totals.totalExpenses}`);
  doc.text(`Net Savings: ${report.totals.netSavings}`);
  doc.text(`Savings Rate: ${report.totals.savingsRate}%`);
  doc.addPage().text("Transactions");
  for (const tx of report.transactions) doc.text(`${tx.transactionDate.toISOString().slice(0, 10)} ${tx.type} ${tx.amount} ${tx.description || ""}`);
  doc.end();
  await new Promise((resolve) => doc.on("end", resolve));
  // TODO: Store PDF in object storage and persist a durable URL. The API spec does not define file storage response fields.
  const pdfBuffer = Buffer.concat(chunks);
  const history = await prisma.reportHistory.create({
    data: {
      userId: req.user.id,
      reportType: req.body.reportType,
      period: report.period,
      filters: req.body,
      pdfUrl: `data:application/pdf;base64,${pdfBuffer.toString("base64")}`
    }
  });
  return ok(res, { report, pdf: { contentType: "application/pdf", base64: pdfBuffer.toString("base64") }, history });
}

async function history(req, res) {
  const reports = await prisma.reportHistory.findMany({ where: { userId: req.user.id }, orderBy: { generatedAt: "desc" }, take: 12 });
  return ok(res, { reports });
}

module.exports = { generate, exportPdf, history };
