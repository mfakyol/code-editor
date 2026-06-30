type SkeletonProps = {
  className?: string
}

// A single shimmering placeholder block.
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-neutral-800 ${className}`}
      aria-hidden="true"
    />
  )
}

// Placeholder grid matching the explore / profile gallery card layout.
export function GalleryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900"
        >
          <Skeleton className="h-40 rounded-none" />
          <div className="flex items-center justify-between gap-3 border-t border-neutral-800 px-4 py-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-8" />
          </div>
        </li>
      ))}
    </ul>
  )
}

// Placeholder rows matching the "my pens" list layout.
export function PenListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4"
        >
          <Skeleton className="h-9 w-9 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default Skeleton
