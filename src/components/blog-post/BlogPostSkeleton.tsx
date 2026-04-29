/**
 * Skeletal loaders for the article + comments. Hairlines pulsing at 0.4↔1.0
 * opacity over 1.6s. No spinners. Honors prefers-reduced-motion via the
 * .skeleton class defined in src/index.css.
 */

function Bar({ width = '100%', height = 1, marginTop = 0 }: { width?: string | number; height?: number; marginTop?: number }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, marginTop, background: 'var(--color-hair)' }}
    />
  )
}

export function BlogPostSkeleton() {
  return (
    <div style={{ padding: 'var(--space-9) 0' }}>
      {/* Kicker */}
      <Bar width={120} height={2} />
      {/* Title */}
      <Bar width="80%" height={56} marginTop={24} />
      <Bar width="60%" height={56} marginTop={8} />
      {/* Byline */}
      <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
        <Bar width={120} height={4} />
        <Bar width={80} height={4} />
        <Bar width={80} height={4} />
      </div>
      {/* Body */}
      <div style={{ marginTop: 72, maxWidth: 720 }}>
        <Bar height={4} marginTop={0} />
        <Bar height={4} marginTop={12} />
        <Bar width="92%" height={4} marginTop={12} />
        <Bar width="85%" height={4} marginTop={12} />
        <Bar height={4} marginTop={32} />
        <Bar height={4} marginTop={12} />
        <Bar width="78%" height={4} marginTop={12} />
      </div>
    </div>
  )
}

export function CommentSkeleton() {
  return (
    <div style={{ padding: 'var(--space-4) 0', borderTop: '1px solid var(--color-hair)' }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div className="skeleton" style={{ width: 28, height: 28, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Bar width={96} height={4} />
            <Bar width={48} height={4} />
          </div>
          <Bar height={4} marginTop={12} />
          <Bar width="70%" height={4} marginTop={6} />
        </div>
      </div>
    </div>
  )
}
