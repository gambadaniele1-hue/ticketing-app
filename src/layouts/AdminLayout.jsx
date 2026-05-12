import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BrandMark } from '../components/BrandMark'
import { Badge } from '../components/ui/Badge'
import { tokens } from '../lib/tokens'

const NAV_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/users', label: 'Utenti', icon: '👥' },
  { path: '/admin/teams', label: 'Team', icon: '🏢' },
  { path: '/admin/categories', label: 'Categorie', icon: '🏷️' },
  { path: '/admin/sla', label: 'SLA', icon: '⏱️' },
  { path: '/admin/macros', label: 'Macro', icon: '📝' },
]

const PAGE_TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'Gestione utenti',
  '/admin/teams': 'Team',
  '/admin/categories': 'Categorie',
  '/admin/sla': 'Service Level Agreements',
  '/admin/macros': 'Macro',
}

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, tenant } = useAuth()

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: tokens.sidebar,
      borderRight: `1px solid ${tokens.borderSoft}`,
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      <div style={{
        padding: '22px 20px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid ${tokens.borderSoft}`,
      }}>
        <BrandMark size={26} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>Ticketing</span>
          <span style={{ fontSize: 11, color: tokens.textMuted, fontWeight: 500 }}>Admin Panel</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 8,
                background: active ? 'rgba(124, 58, 237, 0.18)' : 'transparent',
                border: 'none',
                color: active ? tokens.text : tokens.textMuted,
                fontSize: 14, fontWeight: active ? 600 : 500,
                cursor: 'pointer', fontFamily: 'inherit',
                textAlign: 'left',
                transition: 'background 200ms ease, color 200ms ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = tokens.text }
              }}
              onMouseLeave={(e) => {
                if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = tokens.textMuted }
              }}
            >
              {active && <span style={{
                position: 'absolute', left: 0, top: 8, bottom: 8, width: 3,
                background: tokens.primary, borderRadius: '0 3px 3px 0',
              }} />}
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      <div style={{
        padding: 12, margin: 12,
        borderRadius: 10,
        background: 'rgba(124, 58, 237, 0.06)',
        border: `1px solid ${tokens.borderSoft}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 14,
        }}>{(user?.name || '?').charAt(0)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name || '—'}
          </div>
          <div style={{ fontSize: 11, color: tokens.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {tenant?.name || '—'}
          </div>
        </div>
      </div>
    </aside>
  )
}

export function AdminLayout() {
  const location = useLocation()
  const { tenant } = useAuth()
  const title = PAGE_TITLES[location.pathname] || 'Admin'
  const subdomain = window.location.hostname.split('.')[0]

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: tokens.bg, color: tokens.text,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          padding: '20px 32px',
          borderBottom: `1px solid ${tokens.borderSoft}`,
          background: 'rgba(18, 18, 26, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>{title}</h1>
          <Badge color="purple">{subdomain}.localhost</Badge>
        </header>
        <div style={{ padding: 32, flex: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
