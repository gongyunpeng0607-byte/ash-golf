/**
 * 格式化新台幣價格
 */
export function formatTWD(amount: number): string {
  return `NT$${amount.toLocaleString("zh-TW")}`;
}

/**
 * 生成訂單編號
 */
export function generateOrderNo(): string {
  const now = new Date();
  const dateStr = [
    now.getFullYear().toString(),
    (now.getMonth() + 1).toString().padStart(2, "0"),
    now.getDate().toString().padStart(2, "0"),
  ].join("");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${dateStr}-${random}`;
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Slugify
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}
