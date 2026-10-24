import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
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

    const order = await db.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNo,
          status: "pending",
          totalAmount,
          shippingFee: shippingFee || 0,
          discount: 0,
          recipientName,
          recipientPhone,
          recipientEmail: recipientEmail || null,
          shippingAddress,
          shippingMethod: shippingMethod || "home",
          paymentMethod: paymentMethod || "cod",
          paymentStatus: "unpaid",
          note: note || null,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      for (const item of items) {
        const p = await tx.product.findUnique({ where: { id: item.productId } });
        if (p) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: Math.max(0, p.stock - item.quantity) },
          });
        }
      }

      return created;
    });

    return NextResponse.json({ success: true, orderNo: order.orderNo, orderId: order.id });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ success: false, error: "結帳失敗" }, { status: 500 });
  }
}
