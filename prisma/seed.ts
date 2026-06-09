import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 開始填充種子資料...");

  // 刪除舊資料
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 分類
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "高爾夫球桿",
        slug: "golf-clubs",
        description: "木桿、鐵桿、推桿、挖起桿等各類高爾夫球桿",
        image: "/images/categories/clubs.jpg",
      },
    }),
    prisma.category.create({
      data: {
        name: "高爾夫球",
        slug: "golf-balls",
        description: "各品牌高爾夫球，提供不同距離與手感",
        image: "/images/categories/balls.jpg",
      },
    }),
    prisma.category.create({
      data: {
        name: "球袋",
        slug: "golf-bags",
        description: "站立袋、腳架袋、旅行袋等",
        image: "/images/categories/bags.jpg",
      },
    }),
    prisma.category.create({
      data: {
        name: "手套",
        slug: "golf-gloves",
        description: "真皮與合成皮高爾夫手套",
        image: "/images/categories/gloves.jpg",
      },
    }),
    prisma.category.create({
      data: {
        name: "配件",
        slug: "golf-accessories",
        description: "球Tee、測距儀、帽子、雨傘等周邊配件",
        image: "/images/categories/accessories.jpg",
      },
    }),
  ]);

  const [clubs, balls, bags, gloves, accessories] = categories;

  // 商品
  const products = [
    {
      name: "Taylormade Stealth 2 開球木桿",
      slug: "taylormade-stealth-2-driver",
      description:
        "搭載碳纖維雙層桿面技術，提升球速與容錯率。60X Carbon Twist Face 提供絕佳能量傳遞，讓每一擊都充滿力量。適合中低差點球友。",
      specs: JSON.stringify({
        桿面角度: "9.0°, 10.5°",
        桿身: "Fujikura Ventus TR 紅桿身",
        硬度: "S, SR, R",
        長度: "45.75吋",
      }),
      price: 18800,
      comparePrice: 22800,
      stock: 15,
      isFeatured: true,
      images: JSON.stringify([
        "/images/products/stealth2-driver-1.jpg",
        "/images/products/stealth2-driver-2.jpg",
      ]),
      categoryId: clubs.id,
      brand: "Taylormade",
      tags: JSON.stringify(["木桿", "開球木桿", "熱門"]),
    },
    {
      name: "Titleist Pro V1 高爾夫球 (12入)",
      slug: "titleist-pro-v1-12pack",
      description:
        "巡迴賽最受信賴的高爾夫球。Pro V1 提供卓越的距離表現、穩定的飛行彈道以及柔軟的擊球手感。適合追求極致表現的球友。",
      specs: JSON.stringify({
        層數: "三層球",
        數量: "12顆/盒",
        凹洞數: "388個",
      }),
      price: 1800,
      comparePrice: 2100,
      stock: 50,
      isFeatured: true,
      images: JSON.stringify([
        "/images/products/prov1-1.jpg",
        "/images/products/prov1-2.jpg",
      ]),
      categoryId: balls.id,
      brand: "Titleist",
      tags: JSON.stringify(["高爾夫球", "三層球", "熱門"]),
    },
    {
      name: "Ping Hoofer Lite 站立球袋",
      slug: "ping-hoofer-lite-stand-bag",
      description:
        "經典輕量站立袋，僅重 2.2 公斤。配備 4 個分區、多個收納口袋及舒適雙肩背帶，適合走路打球。防水底座設計，保護球具不受潮。",
      specs: JSON.stringify({
        重量: "2.2 kg",
        分區: "4個",
        顏色: "黑/灰、藍/白、紅/黑",
        材質: "高密度尼龍",
      }),
      price: 8800,
      comparePrice: null,
      stock: 20,
      isFeatured: true,
      images: JSON.stringify([
        "/images/products/hoofer-lite-1.jpg",
      ]),
      categoryId: bags.id,
      brand: "Ping",
      tags: JSON.stringify(["站立袋", "輕量", "熱門"]),
    },
    {
      name: "FootJoy WeatherSof 高爾夫手套 (2入)",
      slug: "footjoy-weathersof-gloves-2pack",
      description:
        "FootJoy 最暢銷的手套款式。WeatherSof 採用高級合成皮，提供優異的握感與耐用度。透氣網眼設計，保持手部乾爽舒適。",
      specs: JSON.stringify({
        尺寸: "S, M, ML, L, XL",
        材質: "合成皮 + 透氣網眼",
        數量: "2隻/包",
        左右手: "左手（右撇子用）",
      }),
      price: 1280,
      comparePrice: 1580,
      stock: 40,
      isFeatured: true,
      images: JSON.stringify([
        "/images/products/weathersof-1.jpg",
      ]),
      categoryId: gloves.id,
      brand: "FootJoy",
      tags: JSON.stringify(["手套", "熱門"]),
    },
    {
      name: "Callaway Chrome Soft 高爾夫球 (12入)",
      slug: "callaway-chrome-soft-12pack",
      description:
        "搭載 Graphene 雙核心技術，結合超軟手感與高彈道表現。適合追求柔軟手感與長距離的球友。",
      specs: JSON.stringify({
        層數: "四層球",
        數量: "12顆/盒",
        特色: "石墨烯雙核心",
      }),
      price: 1680,
      comparePrice: null,
      stock: 35,
      isFeatured: false,
      images: JSON.stringify(["/images/products/chrome-soft-1.jpg"]),
      categoryId: balls.id,
      brand: "Callaway",
      tags: JSON.stringify(["高爾夫球", "四層球"]),
    },
    {
      name: "Bushnell Tour V6 雷射測距儀",
      slug: "bushnell-tour-v6-rangefinder",
      description:
        "專業級雷射測距儀，配備斜坡補償功能與 PinSeeker 旗桿鎖定技術。6倍放大，測距範圍 5-1300 碼，精準度 ±1 碼。",
      specs: JSON.stringify({
        倍率: "6x",
        測距範圍: "5-1300碼",
        精度: "±1碼",
        功能: "斜坡補償、PinSeeker旗桿鎖定",
        防水: "IPX4",
      }),
      price: 14800,
      comparePrice: 16800,
      stock: 10,
      isFeatured: true,
      images: JSON.stringify([
        "/images/products/bushnell-v6-1.jpg",
      ]),
      categoryId: accessories.id,
      brand: "Bushnell",
      tags: JSON.stringify(["測距儀", "配件", "熱門"]),
    },
    {
      name: "Titleist Vokey SM10 挖起桿",
      slug: "titleist-vokey-sm10-wedge",
      description:
        "巡迴賽最多選手使用的挖起桿。SM10 採用漸進式重心設計，提供精準的距離控制與旋轉表現。多種研磨選項，滿足不同打法需求。",
      specs: JSON.stringify({
        角度: "48°, 52°, 56°, 58°, 60°",
        研磨: "F, M, S, D, K, T",
        桿身: "True Temper Dynamic Gold",
        硬度: "S200, S400",
      }),
      price: 6200,
      comparePrice: null,
      stock: 25,
      isFeatured: false,
      images: JSON.stringify([
        "/images/products/vokey-sm10-1.jpg",
      ]),
      categoryId: clubs.id,
      brand: "Titleist",
      tags: JSON.stringify(["挖起桿", "鐵桿"]),
    },
    {
      name: "TaylorMade TP5 高爾夫球 (12入)",
      slug: "taylormade-tp5-12pack",
      description:
        "五層結構設計，每層都有特定功能。TP5 提供完整的揮桿表現：開球高彈道低後旋，短桿絕佳控球力。",
      specs: JSON.stringify({
        層數: "五層球",
        數量: "12顆/盒",
        特色: "漸進式壓縮核心",
      }),
      price: 1980,
      comparePrice: 2200,
      stock: 30,
      isFeatured: false,
      images: JSON.stringify(["/images/products/tp5-1.jpg"]),
      categoryId: balls.id,
      brand: "TaylorMade",
      tags: JSON.stringify(["高爾夫球", "五層球"]),
    },
    {
      name: "Nike Golf Dri-FIT 高爾夫Polo衫",
      slug: "nike-dri-fit-golf-polo",
      description:
        "經典 Dri-FIT 排汗科技，保持乾爽舒適。彈性面料提供完整揮桿活動範圍。左胸刺繡 Swoosh 標誌，簡約時尚。",
      specs: JSON.stringify({
        尺寸: "M, L, XL, 2XL",
        顏色: "白、黑、深藍、灰",
        材質: "88%聚酯纖維, 12%彈性纖維",
      }),
      price: 1980,
      comparePrice: 2480,
      stock: 45,
      isFeatured: true,
      images: JSON.stringify([
        "/images/products/nike-polo-1.jpg",
      ]),
      categoryId: accessories.id,
      brand: "Nike Golf",
      tags: JSON.stringify(["服飾", "Polo衫", "熱門"]),
    },
    {
      name: "Scotty Cameron Phantom X 推桿",
      slug: "scotty-cameron-phantom-x-putter",
      description:
        "精準研磨的推桿傑作。Phantom X 系列採用多材質結構，鋁合金桿面嵌入不鏽鋼主體，提供絕佳的手感與穩定性。",
      specs: JSON.stringify({
        型號: "5.5, 7.5, 9.5, 11.5",
        桿身: "Stepless Steel",
        長度: "33\", 34\", 35\"",
        頸部: "單彎、中彎、直頸",
      }),
      price: 15800,
      comparePrice: null,
      stock: 8,
      isFeatured: true,
      images: JSON.stringify([
        "/images/products/phantom-x-1.jpg",
      ]),
      categoryId: clubs.id,
      brand: "Scotty Cameron",
      tags: JSON.stringify(["推桿", "熱門"]),
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log("✅ 種子資料填充完成！");
  console.log(`   - ${categories.length} 個分類`);
  console.log(`   - ${products.length} 個商品`);
}

main()
  .catch((e) => {
    console.error("❌ 種子資料填充失敗:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
