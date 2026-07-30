// 删除 Turso 生产环境所有商品
const URL = "https://ash-golf-gongyunpeng0607-byte.aws-ap-northeast-1.turso.io";
const TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODExOTM5NTgsImlkIjoiMDE5ZWI3NmItYjAwMS03OGZlLWJlMzItOGVjM2FlZDg1NzYyIiwicmlkIjoiMDZiYTI1MzctNzcyOS00YTkwLWJkOGItYzFiMTI1ZTdkODkxIn0._4siyzgGgmvzUQAr4XLNS4r2t0pPwgkGwvhCWzBvEHzjNUFL35go3gm8VgP2E05j6-pfijbuJZAxENrdv8CwCA";

async function main() {
  // 1. 删除所有订单商品
  await fetch(`${URL}/v2/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql: "DELETE FROM OrderItem" } }] }),
  });
  console.log("✓ OrderItem 已清空");

  // 2. 删除所有订单
  await fetch(`${URL}/v2/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql: "DELETE FROM \"Order\"" } }] }),
  });
  console.log("✓ Order 已清空");

  // 3. 删除购物车
  await fetch(`${URL}/v2/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql: "DELETE FROM CartItem" } }] }),
  });
  console.log("✓ CartItem 已清空");

  // 4. 删除所有商品
  await fetch(`${URL}/v2/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql: "DELETE FROM Product" } }] }),
  });
  console.log("✓ Product 已清空");

  // 5. 删除分类
  await fetch(`${URL}/v2/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql: "DELETE FROM Category" } }] }),
  });
  console.log("✓ Category 已清空");

  // 6. 验证
  const check = await fetch(`${URL}/v2/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [
      { type: "execute", stmt: { sql: "SELECT count(*) as c FROM Product" } },
      { type: "execute", stmt: { sql: "SELECT count(*) as c FROM Category" } },
    ] }),
  });
  const data = await check.json();
  console.log(`✓ 验证: Product=${data.results[0].response.result.rows[0][0].value}, Category=${data.results[1].response.result.rows[0][0].value}`);
  console.log("✓ 全部清空完成");
}

main().catch(console.error);
