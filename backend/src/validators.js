const Joi = require("joi");

const id = Joi.string().uuid({ version: "uuidv4" });
const money = Joi.alternatives().try(Joi.string().pattern(/^\d+(\.\d{1,2})?$/), Joi.number().positive().precision(2));
const password = Joi.string().min(8).pattern(/[A-Z]/).pattern(/\d/).pattern(/[^A-Za-z0-9]/);
const hex = Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/);
const pageQuery = { page: Joi.number().integer().min(1), limit: Joi.number().integer().min(1).max(100), sort: Joi.string(), order: Joi.string().valid("asc", "desc") };

function wrap({ body = {}, params = {}, query = {} }) {
  return Joi.object({ body: Joi.object(body), params: Joi.object(params), query: Joi.object(query) });
}

module.exports = {
  idParam: wrap({ params: { id: id.required() } }),
  register: wrap({ body: { fullName: Joi.string().max(150).required(), email: Joi.string().email().required(), phone: Joi.string().max(20), password: password.required(), preferredLanguage: Joi.string().valid("en", "ar").default("en"), preferredCurrency: Joi.string().length(3).uppercase().default("USD") } }),
  login: wrap({ body: { email: Joi.string().email().required(), password: Joi.string().required(), totp: Joi.string() } }),
  refresh: wrap({ body: { refreshToken: Joi.string() } }),
  forgotPassword: wrap({ body: { email: Joi.string().email().required() } }),
  resetPassword: wrap({ body: { token: Joi.string().required(), password: password.required() } }),
  updateMe: wrap({ body: { fullName: Joi.string().max(150), email: Joi.string().email(), phone: Joi.string().max(20).allow(null), preferredLanguage: Joi.string().valid("en", "ar"), preferredCurrency: Joi.string().length(3).uppercase(), avatarUrl: Joi.string().uri().allow(null) } }),
  listAccounts: wrap({ query: { includeArchived: Joi.string().valid("true", "false") } }),
  createAccount: wrap({ body: { accountName: Joi.string().max(100).required(), accountType: Joi.string().valid("cash", "bank", "credit", "savings", "investment", "custom").required(), initialBalance: money.required(), currency: Joi.string().length(3).uppercase().required(), color: hex, icon: Joi.string().max(50) } }),
  updateAccount: wrap({ params: { id: id.required() }, body: { accountName: Joi.string().max(100), color: hex.allow(null), icon: Joi.string().max(50).allow(null), isArchived: Joi.boolean() } }),
  transfer: wrap({ body: { sourceAccountId: id.required(), destinationAccountId: id.required(), amount: money.required(), date: Joi.date().iso().required(), description: Joi.string().max(200) } }),
  listTransactions: wrap({ query: { ...pageQuery, accountId: id, categoryId: id, type: Joi.string().valid("income", "expense", "transfer", "initial_balance"), startDate: Joi.date().iso(), endDate: Joi.date().iso(), minAmount: money, maxAmount: money } }),
  createTransaction: wrap({ body: { accountId: id.required(), type: Joi.string().valid("income", "expense").required(), amount: money.required(), categoryId: id, transactionDate: Joi.date().iso().required(), description: Joi.string().max(200), note: Joi.string().max(1000), receiptUrl: Joi.string().uri() } }),
  updateTransaction: wrap({ params: { id: id.required() }, body: { accountId: id, type: Joi.string().valid("income", "expense"), amount: money, categoryId: id.allow(null), transactionDate: Joi.date().iso(), description: Joi.string().max(200).allow(null), note: Joi.string().max(1000).allow(null), receiptUrl: Joi.string().uri().allow(null) } }),
  bulkDelete: wrap({ body: { ids: Joi.array().items(id.required()).min(1).max(50).required() } }),
  recurringCreate: wrap({ body: { accountId: id.required(), type: Joi.string().valid("income", "expense").required(), amount: money.required(), categoryId: id.required(), description: Joi.string().max(200), frequency: Joi.string().valid("daily", "weekly", "biweekly", "monthly", "quarterly", "yearly").required(), startDate: Joi.date().iso().required(), endDate: Joi.date().iso() } }),
  recurringUpdate: wrap({ params: { id: id.required() }, body: { accountId: id, type: Joi.string().valid("income", "expense"), amount: money, categoryId: id, description: Joi.string().max(200).allow(null), frequency: Joi.string().valid("daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"), startDate: Joi.date().iso(), endDate: Joi.date().iso().allow(null), status: Joi.string().valid("active", "paused", "completed") } }),
  budgetCreate: wrap({ body: { categoryId: id.required(), amount: money.required(), month: Joi.number().integer().min(1).max(12).required(), year: Joi.number().integer().min(2000).required() } }),
  budgetUpdate: wrap({ params: { id: id.required() }, body: { categoryId: id, amount: money, month: Joi.number().integer().min(1).max(12), year: Joi.number().integer().min(2000) } }),
  listBudgets: wrap({ query: { month: Joi.number().integer().min(1).max(12), year: Joi.number().integer().min(2000) } }),
  listCategories: wrap({ query: { type: Joi.string().valid("income", "expense", "system") } }),
  report: wrap({ body: { reportType: Joi.string().valid("monthly", "annual").required(), month: Joi.when("reportType", { is: "monthly", then: Joi.number().integer().min(1).max(12).required(), otherwise: Joi.forbidden() }), year: Joi.number().integer().min(2000).required(), accountId: id, categoryId: id, transactionType: Joi.string().valid("income", "expense") } }),
  listNotifications: wrap({ query: { ...pageQuery, includeArchived: Joi.string().valid("true", "false") } }),
  preferences: wrap({ body: { preferences: Joi.object().required() } }),
  adminUsers: wrap({ query: { ...pageQuery, search: Joi.string().max(100) } }),
  adminStatus: wrap({ params: { id: id.required() }, body: { status: Joi.string().valid("active", "suspended").required() } }),
  auditQuery: wrap({ query: { ...pageQuery, action: Joi.string().max(100), startDate: Joi.date().iso(), endDate: Joi.date().iso() } }),
  categoryCreate: wrap({ body: { nameEn: Joi.string().max(100).required(), nameAr: Joi.string().max(100).required(), type: Joi.string().valid("income", "expense", "system").required(), icon: Joi.string().max(50), color: hex, isSystem: Joi.boolean().default(false), isActive: Joi.boolean().default(true) } }),
  categoryUpdate: wrap({ params: { id: id.required() }, body: { nameEn: Joi.string().max(100), nameAr: Joi.string().max(100), type: Joi.string().valid("income", "expense", "system"), icon: Joi.string().max(50).allow(null), color: hex.allow(null), isActive: Joi.boolean() } }),
  broadcast: wrap({ body: { title: Joi.string().max(200).required(), message: Joi.string().required(), link: Joi.string().max(500) } })
};
