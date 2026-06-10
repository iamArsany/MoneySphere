const prisma = require("../config/db");
const { ok } = require("../utils/response");

async function listCategories(req, res) {
  const categories = await prisma.category.findMany({
    where: { isActive: true, ...(req.query.type ? { type: req.query.type } : {}) },
    orderBy: { nameEn: "asc" }
  });
  return ok(res, { categories });
}

module.exports = { listCategories };
