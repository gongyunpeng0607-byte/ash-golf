// 复用 Prisma 生成的模型类型，避免重复定义
export type { Product, Category } from "@/generated/prisma/client";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

// 前台列表卡片所需的最小商品数据（不含整段 base64 图片数组，仅封面图）
export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  brand: string | null;
  cover: string;
}

export type ShippingMethod = "home" | "7-11" | "family-mart";
export type PaymentMethod = "credit" | "atm" | "cvs" | "linepay";

export interface CheckoutFormData {
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  shippingAddress: string;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  note?: string;
}
