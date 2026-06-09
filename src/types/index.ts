export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  specs: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  images: string; // JSON array string
  categoryId: string;
  category?: Category;
  brand: string | null;
  tags: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  children?: Category[];
  products?: Product[];
}

export interface ProductWithCategory extends Product {
  category: Category;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
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
