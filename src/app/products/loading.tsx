export default function ProductsLoading() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
      <div className="mb-10"><div className="h-3 w-20 bg-ash-gray-100 mb-3" /><div className="h-8 w-32 bg-ash-gray-100" /></div>
      <div className="flex gap-10">
        <div className="w-[200px] shrink-0 hidden lg:block space-y-4">
          <div className="h-4 w-16 bg-ash-gray-100" />
          <div className="space-y-2">{[1,2,3,4,5].map(i=><div key={i} className="h-3 w-24 bg-ash-gray-50" />)}</div>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">
            {Array.from({length:12}).map((_,i)=><div key={i}><div className="aspect-[3/4] bg-ash-gray-100 animate-pulse mb-4" /><div className="space-y-2"><div className="h-2 w-12 bg-ash-gray-100" /><div className="h-3 w-full bg-ash-gray-50" /><div className="h-3 w-16 bg-ash-gray-50" /></div></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
