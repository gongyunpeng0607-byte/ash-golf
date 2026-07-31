// Turso 迁移：Order 表添加发货追踪字段
const URL = "https://ash-golf-gongyunpeng0607-byte.aws-ap-northeast-1.turso.io";
const TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODExOTM5NTgsImlkIjoiMDE5ZWI3NmItYjAwMS03OGZlLWJlMzItOGVjM2FlZDg1NzYyIiwicmlkIjoiMDZiYTI1MzctNzcyOS00YTkwLWJkOGItYzFiMTI1ZTdkODkxIn0._4siyzgGgmvzUQAr4XLNS4r2t0pPwgkGwvhCWzBvEHzjNUFL35go3gm8VgP2E05j6-pfijbuJZAxENrdv8CwCA";

const COLS = [
  "purchaseStatus TEXT DEFAULT ''",
  "itemCount INTEGER DEFAULT 0",
  "arrivedCount INTEGER DEFAULT 0",
  "purchaseOrderNo TEXT DEFAULT ''",
  "trackingNo TEXT DEFAULT ''",
  "isDropship INTEGER DEFAULT 0",
];

async function main() {
  for (const col of COLS) {
    const colName = col.split(" ")[0];
    const res = await fetch(`${URL}/v2/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql: `ALTER TABLE "Order" ADD COLUMN ${col}` } }] }),
    });
    const data = await res.json();
    const err = data.results?.[0]?.error?.message || "";
    if (err.includes("duplicate column")) console.log(`  ${colName}: already exists`);
    else if (res.ok) console.log(`  ${colName}: added`);
    else console.log(`  ${colName}: skipped (${err})`);
  }
  console.log("Done!");
}

main().catch(console.error);
