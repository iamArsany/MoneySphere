const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const categories = [
  ["Food", "طعام", "expense", "utensils", "#EF4444", true],
  ["Transport", "مواصلات", "expense", "car", "#F97316", true],
  ["Bills", "فواتير", "expense", "receipt", "#EAB308", true],
  ["Entertainment", "ترفيه", "expense", "film", "#8B5CF6", true],
  ["Health", "صحة", "expense", "heart", "#EC4899", true],
  ["Education", "تعليم", "expense", "book", "#3B82F6", true],
  ["Housing", "سكن", "expense", "home", "#14B8A6", true],
  ["Clothing", "ملابس", "expense", "shirt", "#06B6D4", true],
  ["Salary", "راتب", "income", "wallet", "#22C55E", true],
  ["Freelance", "عمل حر", "income", "briefcase", "#10B981", true],
  ["Investment", "استثمار", "income", "trending-up", "#84CC16", true],
  ["Other Income", "دخل آخر", "income", "plus-circle", "#65A30D", true],
  ["Initial Balance", "الرصيد الافتتاحي", "system", "flag", "#64748B", true],
  ["Transfer", "تحويل", "system", "repeat", "#64748B", true]
];

async function main() {
  for (const name of ["guest", "user", "admin"]) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const [nameEn, nameAr, type, icon, color, isSystem] of categories) {
    await prisma.category.upsert({
      where: { nameEn },
      update: {},
      create: { nameEn, nameAr, type, icon, color, isSystem, isActive: true }
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
