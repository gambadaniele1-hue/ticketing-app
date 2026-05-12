import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuthState] = useState({
    user: null, tenant: null, role: null,
    permissions: [], authChecked: false,
  })
  const [tenantInfo, setTenantInfo] = useState(null)

  const setAuth = (data) => setAuthState({
    user: data.user,
    tenant: data.tenant,
    role: data.role,
    permissions: (data.permissions || []).map((p) => p.slug),
    authChecked: true,
  })

  const markAuthChecked = () =>
    setAuthState((prev) => ({ ...prev, authChecked: true }))

  const clearAuth = () =>
    setAuthState({ user: null, tenant: null, role: null, permissions: [], authChecked: false })

  return (
    <AuthContext.Provider value={{ ...auth, tenantInfo, setTenantInfo, setAuth, markAuthChecked, clearAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
