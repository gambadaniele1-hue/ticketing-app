import { useRef } from 'react'
import { tokens } from '../../lib/tokens'

export function OtpInput({ length = 6, value = '', onChange }) {
  const inputs = useRef([])
  const chars = value.split('').concat(Array(length).fill('')).slice(0, length)

  const handleChange = (idx, ch) => {
    const v = ch.replace(/\D/g, '').slice(-1)
    const next = chars.slice()
    next[idx] = v
    onChange(next.join('').slice(0, length))
    if (v && idx < length - 1) inputs.current[idx + 1]?.focus()
  }

  const handleKey = (idx, e) => {
    if (e.key === 'Backspace' && !chars[idx] && idx > 0) inputs.current[idx - 1]?.focus()
    if (e.key === 'ArrowLeft' && idx > 0) inputs.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < length - 1) inputs.current[idx + 1]?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted) {
      e.preventDefault()
      onChange(pasted)
      inputs.current[Math.min(pasted.length, length - 1)]?.focus()
    }
  }

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          value={chars[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          inputMode="numeric"
          maxLength={1}
          style={{
            width: 48, height: 56,
            textAlign: 'center', fontSize: 24, fontWeight: 600,
            background: tokens.inputBg,
            border: `1px solid ${chars[i] ? tokens.primary : tokens.border}`,
            borderRadius: 10,
            color: tokens.text, outline: 'none',
            transition: 'all 200ms ease',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => (e.target.style.borderColor = tokens.primary)}
          onBlur={(e) => (e.target.style.borderColor = chars[i] ? tokens.primary : tokens.border)}
        />
      ))}
    </div>
  )
}
