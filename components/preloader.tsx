export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 dark:bg-neutral-800 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-neutral-800 rounded"></div>
        </div>
        <div className="h-9 w-32 bg-gray-200 dark:bg-neutral-800 rounded"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border dark:border-neutral-800 rounded-lg p-4">
            <div className="h-8 w-8 bg-gray-200 dark:bg-neutral-800 rounded mx-auto mb-2"></div>
            <div className="h-6 w-12 bg-gray-200 dark:bg-neutral-800 rounded mx-auto mb-2"></div>
            <div className="h-3 w-20 bg-gray-200 dark:bg-neutral-800 rounded mx-auto"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border dark:border-neutral-800 rounded-lg p-4">
            <div className="h-8 w-8 bg-gray-200 dark:bg-neutral-800 rounded mx-auto mb-2"></div>
            <div className="h-6 w-12 bg-gray-200 dark:bg-neutral-800 rounded mx-auto mb-2"></div>
            <div className="h-3 w-20 bg-gray-200 dark:bg-neutral-800 rounded mx-auto"></div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border dark:border-neutral-800 rounded-lg p-6">
            <div className="h-5 w-32 bg-gray-200 dark:bg-neutral-800 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 dark:bg-neutral-800 rounded"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-neutral-800 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-neutral-800 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
