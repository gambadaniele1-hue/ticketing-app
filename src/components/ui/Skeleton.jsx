export function Skeleton({ width = '100%', height = 16, style, count = 1, gap = 8 }) {
  const items = Array.from({ length: count })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {items.map((_, i) => (
        <div
          key={i}
          style={{
            width, height,
            borderRadius: 6,
            background: 'linear-gradient(90deg, rgba(124,58,237,0.06) 0%, rgba(124,58,237,0.16) 50%, rgba(124,58,237,0.06) 100%)',
            backgroundSize: '200% 100%',
            animation: 'skeletonShimmer 1.6s ease-in-out infinite',
            ...style,
          }}
        />
      ))}
    </div>
  )
}
