const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  await db.orderItem.deleteMany();
  await db.cartItem.deleteMany();
  await db.order.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  console.log("✓ 本地数据库已清空");
}

main().catch(console.error).finally(() => db.$disconnect());
