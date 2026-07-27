"use client";

import { useRouter } from "next/navigation";

export function JumpToPage({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const input = (e.target as HTMLFormElement).pg as HTMLInputElement;
        const n = parseInt(input.value);
        if (n >= 1 && n <= totalPages) {
          router.push(`?page=${n}`);
        }
      }}
      className="flex items-center gap-1 ml-3"
    >
      <span className="text-[11px] text-ash-gray-400">跳至</span>
      <input
        name="pg"
        type="number"
        min={1}
        max={totalPages}
        placeholder={String(currentPage)}
        className="w-12 text-center border border-ash-gray-200 px-1.5 py-1.5 text-[12px] outline-none focus:border-ash-black"
      />
      <span className="text-[11px] text-ash-gray-400">頁</span>
    </form>
  );
}
