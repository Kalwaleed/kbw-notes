function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] rounded ${className}`}
      style={{ animation: 'shimmer 1.5s infinite' }}
    />
  )
}

export function BlogPostSkeleton() {
  return (
    <div className="min-h-screen bg-slate-300 dark:bg-slate-900 py-8 sm:py-12 md:py-16 px-4 sm:px-6">
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Article card skeleton */}
      <article className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-400/30 dark:shadow-slate-950/50 overflow-hidden">
        {/* Decorative top gradient bar */}
        <div className="h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-600" />

        <div className="p-8 sm:p-12 md:p-16 lg:p-20">
          {/* Tags skeleton */}
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            <Shimmer className="h-6 w-24" />
            <Shimmer className="h-6 w-20" />
            <Shimmer className="h-6 w-28" />
          </div>

          {/* Headline skeleton */}
          <Shimmer className="h-10 sm:h-12 w-full mb-3" />
          <Shimmer className="h-10 sm:h-12 w-3/4 mb-4" />

          {/* Subheader skeleton */}
          <Shimmer className="h-6 w-full mb-2" />
          <Shimmer className="h-6 w-5/6" />

          {/* Author and meta info skeleton */}
          <div className="mt-8 sm:mt-10 pb-6 sm:pb-8 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-4">
              <Shimmer className="h-4 w-32" />
              <Shimmer className="h-4 w-28" />
              <Shimmer className="h-4 w-20" />
            </div>

            {/* Share buttons skeleton */}
            <div className="flex items-center gap-1 mt-4">
              <Shimmer className="h-8 w-8 rounded-lg" />
              <Shimmer className="h-8 w-8 rounded-lg" />
              <Shimmer className="h-8 w-8 rounded-lg" />
            </div>
          </div>

          {/* Article body skeleton */}
          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Shimmer className="h-5 w-full" />
              <Shimmer className="h-5 w-full" />
              <Shimmer className="h-5 w-4/5" />
            </div>

            <div className="space-y-2">
              <Shimmer className="h-5 w-full" />
              <Shimmer className="h-5 w-full" />
              <Shimmer className="h-5 w-3/4" />
            </div>

            {/* Heading skeleton */}
            <Shimmer className="h-7 w-1/2 mt-8" />

            <div className="space-y-2">
              <Shimmer className="h-5 w-full" />
              <Shimmer className="h-5 w-full" />
              <Shimmer className="h-5 w-5/6" />
            </div>

            <div className="space-y-2">
              <Shimmer className="h-5 w-full" />
              <Shimmer className="h-5 w-2/3" />
            </div>
          </div>

          {/* Share CTA skeleton */}
          <div className="mt-10 sm:mt-12 p-4 sm:p-6 rounded-xl bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/50">
            <Shimmer className="h-5 w-64 mb-3" />
            <div className="flex items-center gap-2">
              <Shimmer className="h-10 w-24 rounded-lg" />
              <Shimmer className="h-10 w-24 rounded-lg" />
              <Shimmer className="h-10 w-28 rounded-lg" />
            </div>
          </div>
        </div>
      </article>

      {/* Comments section skeleton */}
      <section className="max-w-3xl mx-auto mt-8 sm:mt-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-400/30 dark:shadow-slate-950/50 overflow-hidden">
        <div className="p-8 sm:p-12 md:p-16 lg:p-20">
          {/* Header skeleton */}
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <Shimmer className="h-6 w-6 rounded" />
            <Shimmer className="h-6 w-32" />
          </div>

          {/* Comment form skeleton */}
          <Shimmer className="h-14 w-full rounded-xl mb-8" />

          {/* Comments skeleton */}
          <div className="space-y-6">
            <CommentSkeleton />
            <CommentSkeleton hasReplies />
            <CommentSkeleton />
          </div>
        </div>
      </section>
    </div>
  )
}

export function CommentSkeleton({ hasReplies = false }: { hasReplies?: boolean }) {
  return (
    <div className="py-4">
      <div className="flex gap-3">
        {/* Avatar skeleton */}
        <Shimmer className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0" />

        <div className="flex-1 min-w-0">
          {/* Header skeleton */}
          <div className="flex items-center gap-2 mb-2">
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-4 w-16" />
          </div>

          {/* Content skeleton */}
          <div className="space-y-1.5 mb-3">
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-3/4" />
          </div>

          {/* Actions skeleton */}
          <div className="flex items-center gap-2">
            <Shimmer className="h-6 w-12 rounded" />
            <Shimmer className="h-6 w-14 rounded" />
            <Shimmer className="h-6 w-12 rounded" />
          </div>

          {/* Reply skeleton */}
          {hasReplies && (
            <div className="mt-4 ml-4 sm:ml-6 pl-4 border-l-2 border-slate-100 dark:border-slate-700">
              <div className="flex gap-3 py-3">
                <Shimmer className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shimmer className="h-3.5 w-20" />
                    <Shimmer className="h-3.5 w-14" />
                  </div>
                  <Shimmer className="h-4 w-5/6 mb-2" />
                  <div className="flex items-center gap-2">
                    <Shimmer className="h-5 w-10 rounded" />
                    <Shimmer className="h-5 w-12 rounded" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
