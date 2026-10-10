import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div
      className="container-page py-10"
      role="status"
      aria-label="Memuat halaman"
    >
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-4 sm:gap-x-5">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
