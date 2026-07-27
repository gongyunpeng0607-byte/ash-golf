import Link from "next/link";
import { getProducts, getCategories } from "@/lib/turso-db";
import { formatTWD } from "@/lib/format";
import { Plus, Pencil, Eye, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { RefreshButton } from "./RefreshButton";
import { JumpToPage } from "./JumpToPage";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || "1") || 1);

  const [{ products, total }, categories] = await Promise.all([
    getProducts({
      where: "1=1",
      orderBy: "createdAt DESC",
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      ttl: 0,
    }),
    getCategories(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const catMap = new Map(categories.map((c: any) => [c.id, c.name]));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">商品管理</h1>
          <p className="text-[13px] text-ash-gray-400 mt-0.5">
            {total} 件商品
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton />
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-ash-black text-white text-[11px] tracking-wider uppercase px-5 py-2.5 font-medium hover:bg-ash-gray-800 transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> 新增商品
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-ash-gray-50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-ash-gray-50">
                <th className="text-left px-5 py-3.5 text-[10px] font-medium text-ash-gray-400 uppercase tracking-wider">
                  商品
                </th>
                <th className="text-left px-5 py-3.5 text-[10px] font-medium text-ash-gray-400 uppercase tracking-wider">
                  分類
                </th>
                <th className="text-left px-5 py-3.5 text-[10px] font-medium text-ash-gray-400 uppercase tracking-wider">
                  價格
                </th>
                <th className="text-left px-5 py-3.5 text-[10px] font-medium text-ash-gray-400 uppercase tracking-wider">
                  庫存
                </th>
                <th className="text-left px-5 py-3.5 text-[10px] font-medium text-ash-gray-400 uppercase tracking-wider">
                  狀態
                </th>
                <th className="text-right px-5 py-3.5 text-[10px] font-medium text-ash-gray-400 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr
                  key={p.id}
                  className="border-b border-ash-gray-50 hover:bg-ash-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-ash-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {/* Use thumbnail API instead of parsing base64 */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/products/${p.id}/thumb`}
                          alt=""
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium truncate max-w-[200px]">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-ash-gray-400">
                          {p.brand || "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-ash-gray-600">
                    {catMap.get(p.categoryId) || "—"}
                  </td>
                  <td className="px-5 py-3 text-[13px] font-bold">
                    {formatTWD(Number(p.price))}
                  </td>
                  <td className="px-5 py-3 text-[13px]">
                    {Number(p.stock)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                        Number(p.isActive)
                          ? "bg-green-50 text-green-700"
                          : "bg-ash-gray-100 text-ash-gray-500"
                      }`}
                    >
                      {Number(p.isActive) ? "上架中" : "下架"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/products/${p.slug}`}
                        className="p-1.5 hover:bg-ash-gray-50 rounded-lg"
                      >
                        <Eye className="h-3.5 w-3.5 text-ash-gray-400" />
                      </Link>
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="p-1.5 hover:bg-ash-gray-50 rounded-lg"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <DeleteButton productId={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-20 text-center text-[13px] text-ash-gray-300"
                  >
                    尚無商品，
                    <Link
                      href="/admin/products/new"
                      className="text-ash-black underline"
                    >
                      新增第一件商品
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
          {page > 1 ? (
            <Link
              href="?page=1"
              className="px-2.5 py-1.5 text-[11px] border border-ash-gray-200 hover:border-ash-black transition-colors"
            >
              首頁
            </Link>
          ) : (
            <span className="px-2.5 py-1.5 text-[11px] border border-ash-gray-200 opacity-30 cursor-not-allowed">
              首頁
            </span>
          )}
          {page > 1 ? (
            <Link
              href={`?page=${page - 1}`}
              className="p-1.5 border border-ash-gray-200 hover:border-ash-black transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <span className="p-1.5 border border-ash-gray-200 opacity-30 cursor-not-allowed">
              <ChevronLeft className="h-3.5 w-3.5" />
            </span>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (pg) =>
                pg === 1 || pg === totalPages || Math.abs(pg - page) <= 2
            )
            .map((pg, idx, arr) => (
              <span key={pg}>
                {idx > 0 && arr[idx - 1] !== pg - 1 && (
                  <span className="text-ash-gray-300 px-1">...</span>
                )}
                <Link
                  href={`?page=${pg}`}
                  className={`w-9 h-9 text-[12px] border transition-colors inline-flex items-center justify-center ${
                    pg === page
                      ? "bg-ash-black text-white border-ash-black"
                      : "border-ash-gray-200 hover:border-ash-black"
                  }`}
                >
                  {pg}
                </Link>
              </span>
            ))}

          {page < totalPages ? (
            <Link
              href={`?page=${page + 1}`}
              className="p-1.5 border border-ash-gray-200 hover:border-ash-black transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <span className="p-1.5 border border-ash-gray-200 opacity-30 cursor-not-allowed">
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          )}
          {page < totalPages ? (
            <Link
              href={`?page=${totalPages}`}
              className="px-2.5 py-1.5 text-[11px] border border-ash-gray-200 hover:border-ash-black transition-colors"
            >
              末頁
            </Link>
          ) : (
            <span className="px-2.5 py-1.5 text-[11px] border border-ash-gray-200 opacity-30 cursor-not-allowed">
              末頁
            </span>
          )}

          {/* Jump to page - client component */}
          <JumpToPage currentPage={page} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
