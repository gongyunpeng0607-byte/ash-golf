const crypto = require("crypto");

const URL = "https://ash-golf-gongyunpeng0607-byte.aws-ap-northeast-1.turso.io";
const TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODExOTM5NTgsImlkIjoiMDE5ZWI3NmItYjAwMS03OGZlLWJlMzItOGVjM2FlZDg1NzYyIiwicmlkIjoiMDZiYTI1MzctNzcyOS00YTkwLWJkOGItYzFiMTI1ZTdkODkxIn0._4siyzgGgmvzUQAr4XLNS4r2t0pPwgkGwvhCWzBvEHzjNUFL35go3gm8VgP2E05j6-pfijbuJZAxENrdv8CwCA";

async function run() {
  const id = crypto.randomUUID();
  const sql = `INSERT INTO Category(id,name,slug,description,image,createdAt,updatedAt) VALUES('${id}','高爾夫服飾','golf-apparel','Polo衫、外套、褲子等高端高爾夫服飾',NULL,datetime('now'),datetime('now'))`;

  const res = await fetch(`${URL}/v2/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql } }] }),
  });

  const data = await res.json();
  if (!res.ok) { console.error(data); process.exit(1); }
  console.log("✓ 高爾夫服飾分類已添加:", id);
  process.exit(0);
}

run();
