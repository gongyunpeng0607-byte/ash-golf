import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { ProductCardData } from "@/types";

/**
 * 统一数据访问层 —— 取代原先手写 Turso SQL 的 turso-db.ts。
 * 本地开发与生产（Turso）共用同一套 Prisma 查询，仅靠 env 切换连接目标。
 */

// ============ Products ============

export async function getProducts(opts: {
  where?: Prisma.ProductWhereInput;
  orderBy?: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[];
  skip?: number;
  take?: number;
}) {
  const { where, orderBy = { createdAt: "desc" }, skip = 0, take = 24 } = opts;
  const [products, total] = await Promise.all([
    db.product.findMany({ where, orderBy, skip, take }),
    db.product.count({ where }),
  ]);
  return { products, total };
}

function extractCover(images: string): string {
  if (!images || images === "[]") return "";
  try {
    const arr = JSON.parse(images);
    if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === "string") return arr[0];
  } catch {
    const m = images.match(/data:image\/[^"]+/);
    if (m) return m[0];
  }
  return "";
}

// 前台列表专用：只取轻量字段 + 封面图，避免把整段 base64 图片数组发到浏览器
export async function getProductCards(opts: {
  where?: Prisma.ProductWhereInput;
  orderBy?: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[];
  skip?: number;
  take?: number;
}) {
  const { where, orderBy = { createdAt: "desc" }, skip = 0, take = 24 } = opts;
  const [rows, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip,
      take,
      select: { id: true, name: true, slug: true, price: true, comparePrice: true, stock: true, brand: true, images: true },
    }),
    db.product.count({ where }),
  ]);
  const products: ProductCardData[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    comparePrice: p.comparePrice,
    stock: p.stock,
    brand: p.brand,
    cover: extractCover(p.images),
  }));
  return { products, total };
}

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({
    where: { slug, isActive: true },
    include: { category: true },
  });
}

export async function getProductById(id: string) {
  return db.product.findUnique({
    where: { id },
    include: { category: true },
  });
}

export async function getCategories() {
  return db.category.findMany({ orderBy: { name: "asc" } });
}

export async function getCategoryBySlug(slug: string) {
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) return null;
  const rows = await db.product.findMany({
    where: { categoryId: category.id, isActive: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, name: true, slug: true, price: true, comparePrice: true, stock: true, brand: true, images: true },
  });
  const products: ProductCardData[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    comparePrice: p.comparePrice,
    stock: p.stock,
    brand: p.brand,
    cover: extractCover(p.images),
  }));
  return { ...category, products };
}

// ============ Orders ============

export async function getOrders(page = 1, pageSize = 20) {
  const [orders, total] = await Promise.all([
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.order.count(),
  ]);
  return { orders, total };
}

export async function getOrderById(id: string) {
  return db.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
}

// ============ Shipments ============

export async function getShipmentOrders() {
  return db.order.findMany({
    where: { isDropship: true },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
    take: 200,
  });
}

export async function updateShipmentStatus(
  id: string,
  data: {
    purchaseStatus?: string;
    arrivedCount?: number;
    itemCount?: number;
    purchaseOrderNo?: string;
    trackingNo?: string;
    isDropship?: boolean;
  },
) {
  await db.order.update({ where: { id }, data });
}

// ============ AdminUser ============

export function parsePermissions(raw: unknown): string[] {
  if (!raw || raw === "[]") return [];
  if (Array.isArray(raw)) return raw as string[];
  try {
    const v = JSON.parse(String(raw));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export async function getAdminUser(username: string) {
  return db.adminUser.findUnique({ where: { username } });
}

export async function listAdminUsers() {
  const users = await db.adminUser.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, username: true, name: true, role: true, permissions: true, createdAt: true },
  });
  return users.map((u) => ({ ...u, permissions: parsePermissions(u.permissions) }));
}

export async function createAdminUser(data: {
  username: string;
  password: string;
  name?: string;
  role?: string;
  permissions?: string[];
}) {
  return db.adminUser.create({
    data: {
      username: data.username,
      password: data.password,
      name: data.name,
      role: data.role || "admin",
      permissions: JSON.stringify(data.permissions || []),
    },
  });
}

export async function updateAdminUserPassword(id: string, hashedPassword: string) {
  await db.adminUser.update({ where: { id }, data: { password: hashedPassword } });
}

export async function deleteAdminUser(id: string) {
  await db.adminUser.delete({ where: { id } });
}

export async function updateAdminUserPermissions(id: string, permissions: string[]) {
  await db.adminUser.update({ where: { id }, data: { permissions: JSON.stringify(permissions) } });
}

export async function countAdminUsers() {
  return db.adminUser.count();
}
