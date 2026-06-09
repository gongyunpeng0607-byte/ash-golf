import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateOrderNo } from "@/lib/format";
import { checkoutSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = checkoutSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "請填寫完整的收件資訊" },
        { status: 400 }
      );
    }

    const { items, totalAmount, shippingFee, ...shippingInfo } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "購物車是空的" },
        { status: 400 }
      );
    }

    // Create order
    const order = await db.order.create({
      data: {
        orderNo: generateOrderNo(),
        status: "pending",
        totalAmount,
        shippingFee: shippingFee || 0,
        discount: 0,
        recipientName: shippingInfo.recipientName,
        recipientPhone: shippingInfo.recipientPhone,
        recipientEmail: shippingInfo.recipientEmail || null,
        shippingAddress: shippingInfo.shippingAddress,
        shippingMethod: shippingInfo.shippingMethod,
        paymentMethod: shippingInfo.paymentMethod,
        paymentStatus: "unpaid",
        note: shippingInfo.note || null,
        items: {
          create: items.map((item: { productId: string; quantity: number; price: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    // Update stock (prevent negative)
    for (const item of items) {
      const p = await db.product.findUnique({ where: { id: item.productId } });
      if (p) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: Math.max(0, p.stock - item.quantity) },
        });
      }
    }

    return NextResponse.json({
      success: true,
      orderNo: order.orderNo,
      orderId: order.id,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { success: false, error: "結帳失敗，請稍後再試" },
      { status: 500 }
    );
  }
}
