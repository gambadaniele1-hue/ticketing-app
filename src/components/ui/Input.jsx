import { tokens } from '../../lib/tokens'

export function Input({ label, error, suffix, style, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, color: tokens.textMuted, fontWeight: 500 }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          {...props}
          style={{
            width: '100%',
            background: tokens.inputBg,
            border: `1px solid ${error ? tokens.error : tokens.border}`,
            borderRadius: 8,
            padding: suffix ? '10px 80px 10px 12px' : '10px 12px',
            color: tokens.text,
            fontSize: 14,
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 200ms ease',
            ...style,
          }}
          onFocus={(e) => { e.target.style.borderColor = tokens.primary; props.onFocus?.(e) }}
          onBlur={(e) => { e.target.style.borderColor = error ? tokens.error : tokens.border; props.onBlur?.(e) }}
        />
        {suffix && (
          <span style={{
            position: 'absolute', right: 12,
            color: tokens.textMuted, fontSize: 13, fontWeight: 500,
            pointerEvents: 'none',
          }}>
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <span style={{ fontSize: 12, color: tokens.error }}>{error}</span>
      )}
    </div>
  )
}

export function Select({ label, options = [], style, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, color: tokens.textMuted, fontWeight: 500 }}>
          {label}
        </label>
      )}
      <select
        {...props}
        style={{
          width: '100%',
          background: tokens.inputBg,
          border: `1px solid ${tokens.border}`,
          borderRadius: 8,
          padding: '10px 32px 10px 12px',
          color: tokens.text,
          fontSize: 14,
          fontFamily: 'inherit',
          outline: 'none',
          appearance: 'none',
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238b8b9e' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          cursor: 'pointer',
          transition: 'border-color 200ms ease',
          ...style,
        }}
        onFocus={(e) => { e.target.style.borderColor = tokens.primary }}
        onBlur={(e) => { e.target.style.borderColor = tokens.border }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
