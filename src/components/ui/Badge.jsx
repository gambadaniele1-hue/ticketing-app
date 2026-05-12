import { tokens } from '../../lib/tokens'

const colors = {
  default: { bg: 'rgba(139,139,158,0.15)', fg: tokens.textMuted },
  purple: { bg: 'rgba(124,58,237,0.15)', fg: tokens.accent },
  green: { bg: 'rgba(16,185,129,0.15)', fg: tokens.success },
  yellow: { bg: 'rgba(245,158,11,0.15)', fg: '#FBBF24' },
  red: { bg: 'rgba(239,68,68,0.15)', fg: tokens.error },
  blue: { bg: 'rgba(59,130,246,0.15)', fg: '#60A5FA' },
  orange: { bg: 'rgba(249,115,22,0.15)', fg: '#FB923C' },
  gray: { bg: 'rgba(148,163,184,0.15)', fg: '#94A3B8' },
}

export function Badge({ children, color = 'default', style }) {
  const c = colors[color] || colors.default
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999,
      background: c.bg, color: c.fg,
      fontSize: 12, fontWeight: 600, lineHeight: 1.4,
      ...style,
    }}>
      {children}
    </span>
  )
}
