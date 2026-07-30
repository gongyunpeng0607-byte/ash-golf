export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 标题区 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-6 w-32 bg-ash-gray-200 rounded mb-2" />
          <div className="h-3.5 w-20 bg-ash-gray-100 rounded" />
        </div>
        <div className="h-9 w-28 bg-ash-gray-200 rounded" />
      </div>

      {/* 卡片骨架 */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white border border-ash-gray-50 p-6 rounded-lg">
            <div className="w-10 h-10 bg-ash-gray-100 rounded-lg mb-4" />
            <div className="h-2.5 w-14 bg-ash-gray-100 rounded mb-2" />
            <div className="h-5 w-20 bg-ash-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* 表格骨架 */}
      <div className="bg-white border border-ash-gray-50 rounded-lg p-6">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-ash-gray-50 last:border-0">
            <div className="w-10 h-10 bg-ash-gray-100 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-32 bg-ash-gray-200 rounded" />
              <div className="h-2.5 w-16 bg-ash-gray-100 rounded" />
            </div>
            <div className="h-3 w-14 bg-ash-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
