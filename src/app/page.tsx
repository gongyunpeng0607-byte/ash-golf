import { Suspense } from "react";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BrandStory } from "@/components/home/BrandStory";

function FeaturedSkeleton() {
  return (
    <section className="max-w-[1440px] mx-auto px-6 lg:px-10 py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="h-3 w-20 bg-ash-gray-200 mb-3" />
          <div className="h-8 w-32 bg-ash-gray-200" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] bg-ash-gray-100 animate-pulse mb-4" />
            <div className="space-y-2">
              <div className="h-2.5 w-16 bg-ash-gray-100 rounded" />
              <div className="h-3.5 w-full bg-ash-gray-100 rounded" />
              <div className="h-3.5 w-12 bg-ash-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div>
      <HeroBanner />
      <CategoryGrid />
      <Suspense fallback={<FeaturedSkeleton />}>
        <FeaturedProducts />
      </Suspense>
      <BrandStory />
    </div>
  );
}
