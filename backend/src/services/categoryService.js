const prisma = require("../config/db");

async function findCategoryOrThrow(categoryId, type) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category || !category.isActive) return null;
  if (type && category.type !== type && category.type !== "system") return null;
  return category;
}

module.exports = { findCategoryOrThrow };
