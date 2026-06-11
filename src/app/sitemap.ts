import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls = [
    { url: SITE_URL, changeFrequency: "daily" as const, priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${SITE_URL}/cart`, changeFrequency: "weekly" as const, priority: 0.3 },
    { url: `${SITE_URL}/collections/new`, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${SITE_URL}/collections/brands`, changeFrequency: "weekly" as const, priority: 0.7 },
  ];

  // 动态数据：构建失败时跳过
  try {
    const { db } = await import("@/lib/db");
    const [products, categories] = await Promise.all([
      db.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      db.category.findMany({ select: { slug: true, updatedAt: true } }),
    ]);

    const productUrls = products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    const categoryUrls = categories.map((c) => ({
      url: `${SITE_URL}/categories/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    return [...staticUrls, ...categoryUrls, ...productUrls];
  } catch {
    return staticUrls;
  }
}
