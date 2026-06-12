// 不用 crypto.randomUUID()，Vercel 某些运行时可能不可用
export function uuid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // 手写 UUID v4
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
