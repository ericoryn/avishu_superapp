export function SkeletonCard() {
  return (
    <div className="skeleton-card border border-current p-4 md:p-8 animate-skeleton-fade">
      <div className="skeleton-box h-40 md:h-64 mb-4 md:mb-6"></div>
      <div className="skeleton-box h-6 w-3/4 mb-3"></div>
      <div className="skeleton-box h-4 w-1/2 mb-4"></div>
      <div className="flex justify-between">
        <div className="skeleton-box h-5 w-1/3"></div>
        <div className="skeleton-box h-5 w-1/4"></div>
      </div>
    </div>
  );
}

export function SkeletonMetric() {
  return (
    <div className="skeleton-card border-2 border-current p-4 md:p-6 animate-skeleton-fade">
      <div className="skeleton-box h-4 w-1/2 mb-3"></div>
      <div className="skeleton-box h-8 w-2/3 mb-2"></div>
      <div className="skeleton-box h-3 w-1/3"></div>
    </div>
  );
}

export function SkeletonKanbanCard() {
  return (
    <div className="bg-white text-black p-3 md:p-4 animate-skeleton-fade">
      <div className="skeleton-box-light h-3 w-1/3 mb-2"></div>
      <div className="skeleton-box-light h-5 w-3/4 mb-2"></div>
      <div className="skeleton-box-light h-3 w-1/2 mb-4"></div>
      <div className="flex justify-between border-t border-gray-200 pt-2">
        <div className="skeleton-box-light h-4 w-1/3"></div>
        <div className="skeleton-box-light h-4 w-1/4"></div>
      </div>
    </div>
  );
}

export function SkeletonTaskCard() {
  return (
    <div className="border-2 md:border-4 border-gray-700 p-4 md:p-8 animate-skeleton-fade">
      <div className="skeleton-box-dark h-8 w-2/3 mb-4 md:mb-8"></div>
      <div className="grid grid-cols-2 gap-2 md:gap-4 mb-6 md:mb-16">
        <div className="skeleton-box-dark h-16 border border-gray-700"></div>
        <div className="skeleton-box-dark h-16 border border-gray-700"></div>
        <div className="skeleton-box-dark h-16 col-span-2 border border-gray-700"></div>
      </div>
      <div className="skeleton-box-dark h-14 md:h-20 w-full"></div>
    </div>
  );
}

export function SkeletonOrderCard() {
  return (
    <div className="border border-current p-6 animate-skeleton-fade">
      <div className="skeleton-box h-6 w-2/3 mb-3"></div>
      <div className="skeleton-box h-4 w-1/2 mb-4"></div>
      <div className="skeleton-box h-4 w-1/3 mb-8"></div>
      <div className="flex justify-between">
        {[1,2,3].map(i => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="skeleton-box w-4 h-4 rounded-full"></div>
            <div className="skeleton-box h-3 w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
