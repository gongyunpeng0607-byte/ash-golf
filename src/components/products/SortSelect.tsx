"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "newest";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <select
      value={currentSort}
      onChange={handleChange}
      className="w-full bg-transparent border-b border-ash-gray-300 pb-2.5 text-xs outline-none focus:border-ash-black transition-colors cursor-pointer"
    >
      <option value="newest">最新上架</option>
      <option value="price-asc">價格由低到高</option>
      <option value="price-desc">價格由高到低</option>
    </select>
  );
}
