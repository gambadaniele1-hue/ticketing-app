import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Landing } from './pages/Landing'
import { TenantLogin } from './pages/TenantLogin'
import { TenantRegister } from './pages/TenantRegister'
import { CustomerDashboard } from './pages/CustomerDashboard'
import { AgentDashboard } from './pages/AgentDashboard'
import { Pending } from './pages/Pending'
import { Banned } from './pages/Banned'
import { NoAccess } from './pages/NoAccess'
import { NotFound } from './pages/NotFound'
import { AdminLayout } from './layouts/AdminLayout'
import { Dashboard } from './pages/admin/Dashboard'
import { Users } from './pages/admin/Users'
import { Teams } from './pages/admin/Teams'
import { Categories } from './pages/admin/Categories'
import { SLA } from './pages/admin/SLA'
import { Macros } from './pages/admin/Macros'
import { api } from './lib/api'
import { tokens } from './lib/tokens'

const _parts = window.location.hostname.split('.')
const isTenantDomain = _parts.length > 1 && _parts[0] !== 'www'

// Module-level guards: survive React Strict Mode's fake unmount/remount cycle.
// useRef resets when a component mounts late (after an async parent resolves);
// module-level vars are safe for singleton, page-lifetime concerns like these.
let _tenantFetched = false
let _authInitialized = false

function Spinner() {
  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(124,58,237,0.2)', borderTopColor: '#7C3AED', animation: 'tkSpin 800ms linear infinite' }} />
    </div>
  )
}

function TenantGate({ children }) {
  const subdomain = isTenantDomain ? _parts[0] : null
  const { setTenantInfo } = useAuth()
  const [status, setStatus] = useState(subdomain ? 'loading' : 'ok')

  useEffect(() => {
    if (!subdomain) return
    if (_tenantFetched) return
    _tenantFetched = true
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000')
      .replace('localhost', `${subdomain}.localhost`)
    fetch(`${apiBase}/api/v1/tenant/info`, { credentials: 'include' })
      .then(async (res) => {
        if (res.status === 404) { setStatus('not-found'); return }
        if (!res.ok) throw new Error()
        const json = await res.json()
        setTenantInfo(json.data)
        setStatus('ok')
      })
      .catch(() => setStatus('not-found'))
  }, [subdomain])

  if (status === 'loading') return <Spinner />

  if (status === 'not-found') {
    const homeUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173'
    return (
      <div style={{ minHeight: '100vh', background: tokens.bg, color: tokens.text, fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 72, marginBottom: 16, lineHeight: 1 }}>👻</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.02em' }}>Non stiamo ancora servendo questa azienda</h1>
          <p style={{ color: tokens.textMuted, fontSize: 14, margin: '0 0 28px' }}>{window.location.hostname}</p>
          <button
            onClick={() => { window.location.href = homeUrl }}
            style={{ padding: '12px 28px', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          >Vai alla home</button>
        </div>
      </div>
    )
  }

  return children
}

function AuthInitializer({ children }) {
  const { authChecked, setAuth, markAuthChecked } = useAuth()

  useEffect(() => {
    if (_authInitialized) return
    _authInitialized = true
    if (!isTenantDomain) { markAuthChecked(); return }
    api.getMe()
      .then((r) => setAuth(r.data))
      .catch(() =>
        api.refresh()
          .then(() => api.getMe())
          .then((r) => setAuth(r.data))
          .catch(() => markAuthChecked())
      )
  }, [])

  if (isTenantDomain && !authChecked) return <Spinner />

  return children
}

function AdminGuard({ children }) {
  const { user, role } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role?.name !== 'Admin') return <Navigate to="/login" replace />
  return children
}

function CustomerGuard({ children }) {
  const { user, role } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role?.name !== 'Customer') return <Navigate to="/login" replace />
  return children
}

function AgentGuard({ children }) {
  const { user, role } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!['Agent', 'Team Lead'].includes(role?.name)) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<TenantLogin />} />
      <Route path="/register" element={<TenantRegister />} />
      <Route path="/customer/dashboard" element={<CustomerGuard><CustomerDashboard /></CustomerGuard>} />
      <Route path="/agent/dashboard" element={<AgentGuard><AgentDashboard /></AgentGuard>} />
      <Route path="/pending" element={<Pending />} />
      <Route path="/banned" element={<Banned />} />
      <Route path="/no-access" element={<NoAccess />} />
      <Route path="/not-found" element={<NotFound />} />
      <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="teams" element={<Teams />} />
        <Route path="categories" element={<Categories />} />
        <Route path="sla" element={<SLA />} />
        <Route path="macros" element={<Macros />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TenantGate>
          <AuthInitializer>
            <AppRoutes />
          </AuthInitializer>
        </TenantGate>
      </BrowserRouter>
    </AuthProvider>
  )
}
