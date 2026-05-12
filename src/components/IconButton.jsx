import { useState } from 'react'
import { tokens } from '../lib/tokens'

export function IconButton({ children, onClick, title, danger }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 30, height: 30, borderRadius: 7,
        background: hover ? (danger ? 'rgba(239,68,68,0.12)' : 'rgba(124,58,237,0.12)') : 'transparent',
        border: 'none',
        color: hover ? (danger ? tokens.error : tokens.accent) : tokens.textMuted,
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 180ms ease',
      }}
    >
      {children}
    </button>
  )
}
