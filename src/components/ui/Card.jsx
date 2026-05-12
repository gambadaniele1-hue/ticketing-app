import { tokens } from '../../lib/tokens'

export function Card({ children, hoverable = false, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: tokens.surface,
        border: `1px solid ${tokens.borderSoft}`,
        borderRadius: 12,
        padding: 24,
        boxShadow: tokens.cardShadow,
        transition: hoverable ? 'transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease' : undefined,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      onMouseEnter={hoverable ? (e) => {
        e.currentTarget.style.transform = 'scale(1.02)'
        e.currentTarget.style.borderColor = tokens.border
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.14)'
      } : undefined}
      onMouseLeave={hoverable ? (e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.borderColor = tokens.borderSoft
        e.currentTarget.style.boxShadow = tokens.cardShadow
      } : undefined}
    >
      {children}
    </div>
  )
}
