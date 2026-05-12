export function BrandMark({ size = 24 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 4,
      background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: size * 0.55,
      boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
      flexShrink: 0,
    }}>T</div>
  )
}
