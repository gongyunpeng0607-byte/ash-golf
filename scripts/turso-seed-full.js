// One-time: seed Turso with proper golf products + fix bad slugs
const https = require("https");
const crypto = require("crypto");

const TOKEN =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODExOTM5NTgsImlkIjoiMDE5ZWI3NmItYjAwMS03OGZlLWJlMzItOGVjM2FlZDg1NzYyIiwicmlkIjoiMDZiYTI1MzctNzcyOS00YTkwLWJkOGItYzFiMTI1ZTdkODkxIn0._4siyzgGgmvzUQAr4XLNS4r2t0pPwgkGwvhCWzBvEHzjNUFL35go3gm8VgP2E05j6-pfijbuJZAxENrdv8CwCA";

function execute(stmts) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      requests: stmts.map((s) => ({ type: "execute", stmt: { sql: s } })),
    });
    const req = https.request(
      {
        hostname: "ash-golf-gongyunpeng0607-byte.aws-ap-northeast-1.turso.io",
        path: "/v2/pipeline",
        method: "POST",
        headers: {
          Authorization: "Bearer " + TOKEN,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try { resolve(JSON.parse(data).results); } catch (e) { reject(e); }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function esc(s) {
  return s.replace(/'/g, "''");
}

async function main() {
  try {
    // 1. Delete bad products (slugs that are URLs or just numbers)
    console.log("1. Deleting bad products...");
    await execute([
      "DELETE FROM Product WHERE slug = '11' OR slug LIKE 'https%'",
    ]);
    console.log("   Done.");

    // 2. Check categories
    let cats = await execute(["SELECT * FROM Category"]);
    let rows = cats[0]?.response?.result?.rows || [];
    const cols = cats[0]?.response?.result?.cols.map((c) => c.name);

    if (rows.length === 0) {
      console.log("2. Categories empty, creating...");
      const catData = [
        { name: "高爾夫球桿", slug: "golf-clubs", desc: "木桿、鐵桿、推桿、挖起桿" },
        { name: "高爾夫球", slug: "golf-balls", desc: "各品牌高爾夫球" },
        { name: "球袋", slug: "golf-bags", desc: "站立袋、腳架袋、旅行袋" },
        { name: "手套", slug: "golf-gloves", desc: "真皮與合成皮手套" },
        { name: "配件", slug: "golf-accessories", desc: "球Tee、測距儀、帽子等" },
      ];
      const catIds = {};
      for (const c of catData) {
        const id = crypto.randomUUID();
        catIds[c.slug] = id;
        await execute([
          "INSERT INTO Category(id,name,slug,description) VALUES('" +
            id + "','" + esc(c.name) + "','" + c.slug + "','" + esc(c.desc) + "')",
        ]);
      }
      console.log("   Created 5 categories.");
      // Now re-read categories
      cats = await execute(["SELECT * FROM Category"]);
      rows = cats[0]?.response?.result?.rows || [];
    } else {
      console.log("2. " + rows.length + " categories exist, skipping.");
    }

    // Map category slugs to IDs
    const catMap = {};
    for (const row of rows) {
      const obj = {};
      cols.forEach((c, i) => (obj[c] = row[i].value));
      catMap[obj.slug] = obj.id;
    }

    console.log("   Category map:", JSON.stringify(catMap));

    // 3. Seed products
    const products = [
      { name: "Taylormade Stealth 2 開球木桿", slug: "taylormade-stealth-2-driver", desc: "碳纖維雙層桿面技術，60X Carbon Twist Face 絕佳能量傳遞。適合中低差點球友。", price: 18800, cmpPrice: 22800, stock: 15, featured: 1, cat: "golf-clubs", brand: "Taylormade", specs: '{"桿面角度":"9.0°, 10.5°","桿身":"Fujikura Ventus TR","硬度":"S, SR, R"}', tags: '["木桿","熱門"]' },
      { name: "Titleist Pro V1 高爾夫球 12入", slug: "titleist-pro-v1-12pack", desc: "巡迴賽最受信賴的三層高爾夫球。卓越距離、穩定飛行彈道、柔軟手感。", price: 1800, cmpPrice: 2100, stock: 50, featured: 1, cat: "golf-balls", brand: "Titleist", specs: '{"層數":"三層球","數量":"12顆/盒"}', tags: '["高爾夫球","熱門"]' },
      { name: "Ping Hoofer Lite 站立球袋", slug: "ping-hoofer-lite-stand-bag", desc: "經典輕量站立袋，僅重2.2公斤，4個分區，防水底座。", price: 8800, cmpPrice: null, stock: 20, featured: 1, cat: "golf-bags", brand: "Ping", specs: '{"重量":"2.2kg","分區":"4"}', tags: '["站立袋","輕量"]' },
      { name: "FootJoy WeatherSof 手套 2入", slug: "footjoy-weathersof-gloves", desc: "最暢銷款式，高級合成皮，透氣網眼設計，保持手部乾爽。", price: 1280, cmpPrice: 1580, stock: 40, featured: 1, cat: "golf-gloves", brand: "FootJoy", specs: '{"材質":"合成皮+透氣網眼","數量":"2隻"}', tags: '["手套","熱門"]' },
      { name: "Callaway Chrome Soft 高爾夫球 12入", slug: "callaway-chrome-soft", desc: "Graphene 雙核心技術，超軟手感與高彈道表現。", price: 1680, cmpPrice: null, stock: 35, featured: 0, cat: "golf-balls", brand: "Callaway", specs: '{"層數":"四層球"}', tags: '["高爾夫球"]' },
      { name: "Bushnell Tour V6 雷射測距儀", slug: "bushnell-tour-v6", desc: "6倍放大，斜坡補償，PinSeeker旗桿鎖定，測距5-1300碼。", price: 14800, cmpPrice: 16800, stock: 10, featured: 1, cat: "golf-accessories", brand: "Bushnell", specs: '{"倍率":"6x","精度":"±1碼"}', tags: '["測距儀","熱門"]' },
      { name: "Titleist Vokey SM10 挖起桿", slug: "titleist-vokey-sm10", desc: "巡迴賽最多選手使用的挖起桿，漸進式重心設計。", price: 6200, cmpPrice: null, stock: 25, featured: 0, cat: "golf-clubs", brand: "Titleist", specs: '{"角度":"48°-60°"}', tags: '["挖起桿"]' },
      { name: "TaylorMade TP5 高爾夫球 12入", slug: "taylormade-tp5", desc: "五層結構，漸進式壓縮核心，完整揮桿表現。", price: 1980, cmpPrice: 2200, stock: 30, featured: 0, cat: "golf-balls", brand: "TaylorMade", specs: '{"層數":"五層球"}', tags: '["高爾夫球"]' },
      { name: "Nike Golf Dri-FIT Polo衫", slug: "nike-dri-fit-polo", desc: "Dri-FIT 排汗科技，彈性面料，左胸刺繡Swoosh。", price: 1980, cmpPrice: 2480, stock: 45, featured: 1, cat: "golf-accessories", brand: "Nike Golf", specs: '{"顏色":"白/黑/深藍"}', tags: '["服飾","熱門"]' },
      { name: "Scotty Cameron Phantom X 推桿", slug: "scotty-cameron-phantom-x", desc: "多材質結構，鋁合金桿面嵌入不鏽鋼主體，絕佳手感。", price: 15800, cmpPrice: null, stock: 8, featured: 1, cat: "golf-clubs", brand: "Scotty Cameron", specs: '{"型號":"5.5-11.5"}', tags: '["推桿","熱門"]' },
    ];

    console.log("3. Inserting " + products.length + " products...");
    for (const p of products) {
      const id = crypto.randomUUID();
      const catId = catMap[p.cat];
      if (!catId) { console.log("   SKIP " + p.slug + " (no cat: " + p.cat + ")"); continue; }
      const cmp = p.cmpPrice !== null ? String(p.cmpPrice) : "NULL";
      const sql =
        "INSERT INTO Product(id,name,slug,description,specs,price,comparePrice,stock,isActive,isFeatured,images,categoryId,brand,tags) VALUES(" +
        "'" + id + "'," +
        "'" + esc(p.name) + "'," +
        "'" + p.slug + "'," +
        "'" + esc(p.desc) + "'," +
        "'" + esc(p.specs) + "'," +
        p.price + "," + cmp + "," + p.stock + ",1," + p.featured + ",'[]'," +
        "'" + catId + "'," +
        "'" + p.brand + "'," +
        "'" + esc(p.tags) + "')";
      await execute([sql]);
    }
    console.log("   Done!");

    // 4. Verify
    const check = await execute(["SELECT count(*) as cnt FROM Product"]);
    const count = check[0]?.response?.result?.rows?.[0]?.[0]?.value || 0;
    console.log("4. Final product count: " + count);
  } catch (e) {
    console.error("FATAL:", e.message || e);
  }
}

main();
