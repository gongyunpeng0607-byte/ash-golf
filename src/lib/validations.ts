import { z } from "zod";

export const checkoutSchema = z.object({
  recipientName: z.string().min(1, "請輸入收件人姓名"),
  recipientPhone: z.string().min(6, "請輸入手機號碼").max(15),
  recipientEmail: z.string().optional().nullable().or(z.literal("")),
  shippingAddress: z.string().min(2, "請輸入收件地址"),
  shippingMethod: z.string().default("home"),
  paymentMethod: z.string().default("cod"),
  note: z.string().optional().nullable(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const productSchema = z.object({
  name: z.string().min(1, "請輸入商品名稱"),
  slug: z.string().min(1, "請輸入商品網址標識"),
  description: z.string().min(1, "請輸入商品描述"),
  specs: z.string().optional(),
  price: z.number().int().min(1, "請輸入價格"),
  comparePrice: z.number().int().optional().nullable(),
  stock: z.number().int().min(0, "庫存不能為負數").default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.string().default("[]"),
  categoryId: z.string().min(1, "請選擇分類"),
  brand: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
});

export type ProductInput = z.infer<typeof productSchema>;
