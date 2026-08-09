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
 * 格式化日期（仅日期）
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 格式化日期时间（精确到秒）
 */
export function formatDateTime(ts: Date | string): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${y}/${M}/${day} ${h}:${m}:${s}`;
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
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}
