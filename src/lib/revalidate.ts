import { revalidatePath } from "next/cache";

/** 当产品变更时，刷新所有相关页面的 ISR 缓存 */
export async function revalidateProductCache(params?: {
  productSlug?: string;
  categorySlug?: string;
}) {
  // 首页（精选商品）
  revalidatePath("/", "page");

  // 全部商品列表页
  revalidatePath("/products", "page");

  // 新品 / 品牌 集合页
  revalidatePath("/collections/new", "page");
  revalidatePath("/collections/brands", "page");

  // 具体产品详情页
  if (params?.productSlug) {
    revalidatePath(`/products/${params.productSlug}`, "page");
  }

  // 该产品所属分类页
  if (params?.categorySlug) {
    revalidatePath(`/categories/${params.categorySlug}`, "page");
  }

  // 如果只能批量刷新所有分类：
  // 实际上 revalidatePath 不支持 glob，不过分类页 ISR 300s 足够快
}
