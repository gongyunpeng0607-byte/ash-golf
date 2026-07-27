// Turso 迁移：添加 permissions 列
const URL = "https://ash-golf-gongyunpeng0607-byte.aws-ap-northeast-1.turso.io";
const TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODExOTM5NTgsImlkIjoiMDE5ZWI3NmItYjAwMS03OGZlLWJlMzItOGVjM2FlZDg1NzYyIiwicmlkIjoiMDZiYTI1MzctNzcyOS00YTkwLWJkOGItYzFiMTI1ZTdkODkxIn0._4siyzgGgmvzUQAr4XLNS4r2t0pPwgkGwvhCWzBvEHzjNUFL35go3gm8VgP2E05j6-pfijbuJZAxENrdv8CwCA";

async function main() {
  const res = await fetch(`${URL}/v2/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql: "ALTER TABLE AdminUser ADD COLUMN permissions TEXT DEFAULT '[]'" } }] }),
  });
  const data = await res.json();
  const err = data.results?.[0]?.error?.message || "";
  if (err && err.includes("duplicate column")) {
    console.log("✓ permissions 列已存在");
  } else if (res.ok) {
    console.log("✓ permissions 列已添加");
  } else {
    console.error("✗", err || JSON.stringify(data));
  }
}

main().catch(console.error);
