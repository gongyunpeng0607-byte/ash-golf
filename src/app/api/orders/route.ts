import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/turso-db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
    const { orders, total } = await getOrders(page, pageSize);
    return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / pageSize) });
  } catch {
    return NextResponse.json({ orders: [], total: 0 });
  }
}
