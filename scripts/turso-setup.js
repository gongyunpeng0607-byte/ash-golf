// 一次性脚本：在 Turso 创建表 + 填充种子数据
const URL = "https://ash-golf-gongyunpeng0607-byte.aws-ap-northeast-1.turso.io";
const TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODExOTM5NTgsImlkIjoiMDE5ZWI3NmItYjAwMS03OGZlLWJlMzItOGVjM2FlZDg1NzYyIiwicmlkIjoiMDZiYTI1MzctNzcyOS00YTkwLWJkOGItYzFiMTI1ZTdkODkxIn0._4siyzgGgmvzUQAr4XLNS4r2t0pPwgkGwvhCWzBvEHzjNUFL35go3gm8VgP2E05j6-pfijbuJZAxENrdv8CwCA";

async function execute(stmts) {
  const res = await fetch(`${URL}/v2/pipeline`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: stmts.map(s => ({ type: "execute", stmt: { sql: s } })) }),
  });
  const data = await res.json();
  if (!res.ok) { console.error(data); process.exit(1); }
  return data;
}

async function main() {
  // 删除旧表
  await execute(["DROP TABLE IF EXISTS OrderItem", "DROP TABLE IF EXISTS CartItem", "DROP TABLE IF EXISTS \"Order\"", "DROP TABLE IF EXISTS Product", "DROP TABLE IF EXISTS Category"]);
  console.log("✓ 旧表已删除");

  // 创建表
  await execute([`
    CREATE TABLE Category (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      description TEXT, image TEXT, parentId TEXT, createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    )`]);
  await execute([`
    CREATE TABLE Product (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL, specs TEXT, price INTEGER NOT NULL,
      comparePrice INTEGER, stock INTEGER DEFAULT 0, isActive INTEGER DEFAULT 1,
      isFeatured INTEGER DEFAULT 0, images TEXT DEFAULT '[]', categoryId TEXT NOT NULL REFERENCES Category(id),
      brand TEXT, tags TEXT, createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    )`]);
  await execute([`
    CREATE TABLE "Order" (
      id TEXT PRIMARY KEY, orderNo TEXT UNIQUE NOT NULL, userId TEXT, status TEXT DEFAULT 'pending',
      totalAmount INTEGER NOT NULL, shippingFee INTEGER DEFAULT 0, discount INTEGER DEFAULT 0,
      recipientName TEXT NOT NULL, recipientPhone TEXT NOT NULL, recipientEmail TEXT,
      shippingAddress TEXT NOT NULL, shippingMethod TEXT DEFAULT 'home', paymentMethod TEXT NOT NULL,
      paymentStatus TEXT DEFAULT 'unpaid', note TEXT,
      createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now'))
    )`]);
  await execute([`
    CREATE TABLE OrderItem (
      id TEXT PRIMARY KEY, orderId TEXT NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
      productId TEXT NOT NULL REFERENCES Product(id), quantity INTEGER NOT NULL, price INTEGER NOT NULL
    )`]);
  await execute([`
    CREATE TABLE CartItem (
      id TEXT PRIMARY KEY, quantity INTEGER DEFAULT 1, productId TEXT NOT NULL REFERENCES Product(id) ON DELETE CASCADE,
      userId TEXT, sessionId TEXT, createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    )`]);
  await execute([`CREATE TABLE IF NOT EXISTS AdminUser (id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT, createdAt TEXT DEFAULT (datetime('now')))`]);
  console.log("✓ 表已创建");

  // 种子数据
  const catIds = { clubs: crypto.randomUUID(), balls: crypto.randomUUID(), bags: crypto.randomUUID(), gloves: crypto.randomUUID(), acc: crypto.randomUUID() };
  const cats = [
    { id: catIds.clubs, name: "高爾夫球桿", slug: "golf-clubs", description: "木桿、鐵桿、推桿、挖起桿" },
    { id: catIds.balls, name: "高爾夫球", slug: "golf-balls", description: "各品牌高爾夫球" },
    { id: catIds.bags, name: "球袋", slug: "golf-bags", description: "站立袋、腳架袋、旅行袋" },
    { id: catIds.gloves, name: "手套", slug: "golf-gloves", description: "真皮與合成皮手套" },
    { id: catIds.acc, name: "配件", slug: "golf-accessories", description: "球Tee、測距儀、帽子等" },
  ];
  for (const c of cats) await execute([`INSERT INTO Category(id,name,slug,description) VALUES('${c.id}','${c.name}','${c.slug}','${c.description}')`]);

  const products = [
    { name:"Taylormade Stealth 2 開球木桿",slug:"taylormade-stealth-2-driver",desc:"碳纖維雙層桿面技術，60X Carbon Twist Face 絕佳能量傳遞。",price:18800,cmpPrice:22800,stock:15,featured:1,cat:catIds.clubs,brand:"Taylormade",specs:'{"桿面角度":"9.0°, 10.5°","桿身":"Fujikura Ventus TR","硬度":"S, SR, R"}',tags:'["木桿","熱門"]' },
    { name:"Titleist Pro V1 高爾夫球 12入",slug:"titleist-pro-v1-12pack",desc:"巡迴賽最受信賴的三層高爾夫球。",price:1800,cmpPrice:2100,stock:50,featured:1,cat:catIds.balls,brand:"Titleist",specs:'{"層數":"三層球","數量":"12顆/盒"}',tags:'["高爾夫球","熱門"]' },
    { name:"Ping Hoofer Lite 站立球袋",slug:"ping-hoofer-lite-stand-bag",desc:"經典輕量站立袋，僅重2.2公斤，4個分區。",price:8800,cmpPrice:null,stock:20,featured:1,cat:catIds.bags,brand:"Ping",specs:'{"重量":"2.2kg","分區":"4"}',tags:'["站立袋","輕量"]' },
    { name:"FootJoy WeatherSof 手套 2入",slug:"footjoy-weathersof-gloves",desc:"最暢銷款式，高級合成皮，透氣網眼設計。",price:1280,cmpPrice:1580,stock:40,featured:1,cat:catIds.gloves,brand:"FootJoy",specs:'{"材質":"合成皮+透氣網眼","數量":"2隻"}',tags:'["手套","熱門"]' },
    { name:"Callaway Chrome Soft 高爾夫球 12入",slug:"callaway-chrome-soft",desc:"Graphene 雙核心技術，超軟手感。",price:1680,cmpPrice:null,stock:35,featured:0,cat:catIds.balls,brand:"Callaway",specs:'{"層數":"四層球"}',tags:'["高爾夫球","四層球"]' },
    { name:"Bushnell Tour V6 雷射測距儀",slug:"bushnell-tour-v6",desc:"6倍放大，斜坡補償，PinSeeker旗桿鎖定。",price:14800,cmpPrice:16800,stock:10,featured:1,cat:catIds.acc,brand:"Bushnell",specs:'{"倍率":"6x","精度":"±1碼"}',tags:'["測距儀","熱門"]' },
    { name:"Titleist Vokey SM10 挖起桿",slug:"titleist-vokey-sm10",desc:"巡迴賽最多選手使用的挖起桿。",price:6200,cmpPrice:null,stock:25,featured:0,cat:catIds.clubs,brand:"Titleist",specs:'{"角度":"48°-60°"}',tags:'["挖起桿"]' },
    { name:"TaylorMade TP5 高爾夫球 12入",slug:"taylormade-tp5",desc:"五層結構，漸進式壓縮核心。",price:1980,cmpPrice:2200,stock:30,featured:0,cat:catIds.balls,brand:"TaylorMade",specs:'{"層數":"五層球"}',tags:'["高爾夫球"]' },
    { name:"Nike Golf Dri-FIT Polo衫",slug:"nike-dri-fit-polo",desc:"Dri-FIT 排汗科技，彈性面料。",price:1980,cmpPrice:2480,stock:45,featured:1,cat:catIds.acc,brand:"Nike Golf",specs:'{"顏色":"白/黑/深藍"}',tags:'["服飾","熱門"]' },
    { name:"Scotty Cameron Phantom X 推桿",slug:"scotty-cameron-phantom-x",desc:"多材質結構，鋁合金桿面嵌入不鏽鋼主體。",price:15800,cmpPrice:null,stock:8,featured:1,cat:catIds.clubs,brand:"Scotty Cameron",specs:'{"型號":"5.5-11.5","長度":"33-35\""}',tags:'["推桿","熱門"]' },
  ];

  for (const p of products) {
    const id = crypto.randomUUID();
    const cmp = p.cmpPrice ?? "NULL";
    await execute([`INSERT INTO Product(id,name,slug,description,specs,price,comparePrice,stock,isActive,isFeatured,images,categoryId,brand,tags) VALUES('${id}','${p.name.replace(/'/g,"''")}','${p.slug}','${p.desc.replace(/'/g,"''")}','${p.specs.replace(/'/g,"''")}',${p.price},${cmp},${p.stock},1,${p.featured},'[]','${p.cat}','${p.brand}','${p.tags}')`]);
  }
  console.log("✓ 種子資料已填充");
}

main().catch(console.error);
