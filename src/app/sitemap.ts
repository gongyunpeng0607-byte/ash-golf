import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const staticUrls = [
    { url: SITE_URL, changeFrequency: "daily" as const, priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${SITE_URL}/cart`, changeFrequency: "weekly" as const, priority: 0.3 },
  ];

  return [...staticUrls, ...categoryUrls, ...productUrls];
}
