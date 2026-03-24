import { Skeleton } from '@/components/ui/skeleton';

export default function AgendaSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="card-elevated p-3">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="card-elevated p-4 space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 h-[52px]">
            <Skeleton className="w-14 h-4" />
            <Skeleton className="flex-1 h-10 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
