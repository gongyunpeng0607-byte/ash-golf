// Turso 迁移：新增 AdminUser 表（不影响已有数据）
const URL = "https://ash-golf-gongyunpeng0607-byte.aws-ap-northeast-1.turso.io";
const TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODExOTM5NTgsImlkIjoiMDE5ZWI3NmItYjAwMS03OGZlLWJlMzItOGVjM2FlZDg1NzYyIiwicmlkIjoiMDZiYTI1MzctNzcyOS00YTkwLWJkOGItYzFiMTI1ZTdkODkxIn0._4siyzgGgmvzUQAr4XLNS4r2t0pPwgkGwvhCWzBvEHzjNUFL35go3gm8VgP2E05j6-pfijbuJZAxENrdv8CwCA";

async function main() {
  const res = await fetch(`${URL}/v2/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [{
        type: "execute",
        stmt: { sql: "CREATE TABLE IF NOT EXISTS AdminUser (id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT, createdAt TEXT DEFAULT (datetime('now')))" }
      }]
    }),
  });

  const data = await res.json();
  if (res.ok) {
    console.log("✓ AdminUser 表已创建（或已存在）");
  } else {
    console.error("✗ 创建失败:", JSON.stringify(data, null, 2));
  }
}

main().catch(console.error);
