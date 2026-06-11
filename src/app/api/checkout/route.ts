import { NextRequest, NextResponse } from "next/server";
import { generateOrderNo } from "@/lib/format";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, totalAmount, shippingFee, recipientName, recipientPhone, recipientEmail, shippingAddress, shippingMethod, paymentMethod, note } = body;

    if (!recipientName || !recipientPhone || !shippingAddress) {
      return NextResponse.json({ success: false, error: "請填寫完整收件資訊" }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: "購物車是空的" }, { status: 400 });
    }

    const orderNo = generateOrderNo();

    // Try Turso first
    const tursoUrl = process.env.TURSO_DB_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (tursoUrl && tursoToken) {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const email = recipientEmail || null;
      const noteStr = note || null;

      const stmts = [
        `INSERT INTO "Order"(id,orderNo,status,totalAmount,shippingFee,discount,recipientName,recipientPhone,recipientEmail,shippingAddress,shippingMethod,paymentMethod,paymentStatus,note,createdAt,updatedAt) VALUES('${id}','${orderNo}','pending',${totalAmount},${shippingFee||0},0,'${(recipientName||"").replace(/'/g,"''")}','${(recipientPhone||"").replace(/'/g,"''")}',${email?`'${email.replace(/'/g,"''")}'`:"NULL"},'${(shippingAddress||"").replace(/'/g,"''")}','${shippingMethod||"home"}','${paymentMethod||"cod"}','unpaid',${noteStr?`'${noteStr.replace(/'/g,"''")}'`:"NULL"},'${now}','${now}')`,
      ];

      for (const item of items) {
        const itemId = crypto.randomUUID();
        stmts.push(`INSERT INTO OrderItem(id,orderId,productId,quantity,price) VALUES('${itemId}','${id}','${item.productId}',${item.quantity},${item.price})`);
        stmts.push(`UPDATE Product SET stock = MAX(0, stock - ${item.quantity}) WHERE id = '${item.productId}'`);
      }

      await fetch(`${tursoUrl}/v2/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tursoToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ requests: stmts.map(sql => ({ type: "execute", stmt: { sql } })) }),
      });

      return NextResponse.json({ success: true, orderNo, orderId: id });
    }

    // Fallback to local Prisma
    const { db } = await import("@/lib/db");
    const order = await db.order.create({
      data: {
        orderNo, status: "pending", totalAmount, shippingFee: shippingFee || 0, discount: 0,
        recipientName, recipientPhone, recipientEmail: recipientEmail || null,
        shippingAddress, shippingMethod: shippingMethod || "home", paymentMethod: paymentMethod || "cod",
        paymentStatus: "unpaid", note: note || null,
        items: { create: items.map((item: any) => ({ productId: item.productId, quantity: item.quantity, price: item.price })) },
      },
    });

    for (const item of items) {
      const p = await db.product.findUnique({ where: { id: item.productId } });
      if (p) await db.product.update({ where: { id: item.productId }, data: { stock: Math.max(0, p.stock - item.quantity) } });
    }

    return NextResponse.json({ success: true, orderNo: order.orderNo, orderId: order.id });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ success: false, error: "結帳失敗" }, { status: 500 });
  }
}
