import { tokens } from '../../lib/tokens'

const variants = {
  primary: {
    background: tokens.primary,
    color: '#fff',
    border: 'none',
    hoverBg: tokens.primaryHover,
  },
  secondary: {
    background: 'transparent',
    color: tokens.accent,
    border: `1px solid ${tokens.border}`,
    hoverBg: 'rgba(124,58,237,0.08)',
  },
  ghost: {
    background: 'transparent',
    color: tokens.textMuted,
    border: 'none',
    hoverBg: 'rgba(255,255,255,0.05)',
  },
  danger: {
    background: 'rgba(239,68,68,0.15)',
    color: tokens.error,
    border: `1px solid rgba(239,68,68,0.3)`,
    hoverBg: 'rgba(239,68,68,0.25)',
  },
  success: {
    background: 'rgba(16,185,129,0.15)',
    color: tokens.success,
    border: `1px solid rgba(16,185,129,0.3)`,
    hoverBg: 'rgba(16,185,129,0.25)',
  },
}

const sizes = {
  sm: { padding: '6px 12px', fontSize: 13 },
  md: { padding: '10px 18px', fontSize: 14 },
  lg: { padding: '14px 28px', fontSize: 16 },
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  style,
}) {
  const v = variants[variant] || variants.primary
  const s = sizes[size] || sizes.md

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...s,
        background: v.background,
        color: v.color,
        border: v.border || 'none',
        borderRadius: 8,
        fontFamily: 'inherit',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 200ms ease',
        whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) e.currentTarget.style.background = v.hoverBg
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) e.currentTarget.style.background = v.background
      }}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}

function Spinner() {
  return (
    <div
      style={{
        width: 14,
        height: 14,
        borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.25)',
        borderTopColor: '#fff',
        animation: 'tkSpin 800ms linear infinite',
      }}
    />
  )
}
