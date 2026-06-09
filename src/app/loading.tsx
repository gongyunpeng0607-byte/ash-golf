export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-2 border-ash-gray-200 rounded-full" />
          <div className="absolute inset-0 border-2 border-ash-black rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-ash-gray-400">LOADING</p>
      </div>
    </div>
  );
}
