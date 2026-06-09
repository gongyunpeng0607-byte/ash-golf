export const SITE_NAME = "高爾夫球具裝備商城";
export const SITE_DESCRIPTION = "專業高爾夫球具裝備，提供高爾夫球桿、球袋、高爾夫球及配件，全台配送，品質保證。";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const CATEGORIES = [
  { name: "高爾夫球桿", slug: "golf-clubs", description: "木桿、鐵桿、推桿、挖起桿" },
  { name: "高爾夫球", slug: "golf-balls", description: "各品牌高爾夫球" },
  { name: "球袋", slug: "golf-bags", description: "站立袋、腳架袋、旅行袋" },
  { name: "手套", slug: "golf-gloves", description: "真皮手套、合成皮手套" },
  { name: "配件", slug: "golf-accessories", description: "球Tee、測距儀、帽子等周邊" },
];

export const SHIPPING_METHODS = [
  { value: "home", label: "宅配到府", fee: 100 },
  { value: "7-11", label: "7-11 取貨", fee: 60 },
  { value: "family-mart", label: "全家取貨", fee: 60 },
];

export const PAYMENT_METHODS = [
  { value: "credit", label: "信用卡" },
  { value: "atm", label: "ATM 轉帳" },
  { value: "cvs", label: "超商代碼繳費" },
  { value: "linepay", label: "LINE Pay" },
];

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "待付款",
  paid: "已付款",
  processing: "處理中",
  shipped: "已出貨",
  delivered: "已送達",
  cancelled: "已取消",
};
