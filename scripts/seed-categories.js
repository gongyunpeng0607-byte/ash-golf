// 重新创建分类 — 生产 + 本地
const TURSO_URL = "https://ash-golf-gongyunpeng0607-byte.aws-ap-northeast-1.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODExOTM5NTgsImlkIjoiMDE5ZWI3NmItYjAwMS03OGZlLWJlMzItOGVjM2FlZDg1NzYyIiwicmlkIjoiMDZiYTI1MzctNzcyOS00YTkwLWJkOGItYzFiMTI1ZTdkODkxIn0._4siyzgGgmvzUQAr4XLNS4r2t0pPwgkGwvhCWzBvEHzjNUFL35go3gm8VgP2E05j6-pfijbuJZAxENrdv8CwCA";

const CATEGORIES = [
  { name: "高爾夫球桿", slug: "golf-clubs", description: "木桿、鐵桿、推桿、挖起桿" },
  { name: "高爾夫服飾", slug: "golf-apparel", description: "Polo衫、外套、褲子等服飾" },
  { name: "高爾夫球", slug: "golf-balls", description: "各品牌高爾夫球" },
  { name: "球袋", slug: "golf-bags", description: "站立袋、腳架袋、旅行袋" },
  { name: "手套", slug: "golf-gloves", description: "真皮手套、合成皮手套" },
  { name: "配件", slug: "golf-accessories", description: "球Tee、測距儀、帽子等周邊" },
];

async function seedTurso() {
  const crypto = await import('crypto');
  const stmts = [];
  for (const c of CATEGORIES) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    stmts.push({
      type: "execute",
      stmt: { sql: `INSERT OR REPLACE INTO Category(id,name,slug,description,createdAt,updatedAt) VALUES('${id}','${c.name}','${c.slug}','${c.description}','${now}','${now}')` }
    });
  }

  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TURSO_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: stmts }),
  });
  const data = await res.json();
  console.log("Turso:", data.results ? `${data.results.filter(r => r.type === "ok").length}/6 categories seeded` : "DONE");
}

async function seedLocal() {
  const { PrismaClient } = require("@prisma/client");
  const db = new PrismaClient();
  for (const c of CATEGORIES) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }
  console.log("Local: 6 categories seeded");
  await db.$disconnect();
}

(async () => {
  await seedTurso();
  await seedLocal();
  console.log("Done! Categories restored.");
})();
