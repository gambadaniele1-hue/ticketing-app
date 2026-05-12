const _base = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const _parts = window.location.hostname.split('.')
const BASE = (_parts.length > 1 && _parts[0] !== 'www')
  ? _base.replace('localhost', `${_parts[0]}.localhost`)
  : _base
const API = `${BASE}/api/v1`

async function req(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`)
    err.status = res.status
    try { err.data = await res.json() } catch (_) {}
    throw err
  }
  return res.json()
}

export const api = {
  // Central
  getPlans: () => req('GET', '/plans'),
  registerTenant: (body) => req('POST', '/register-tenant', body),
  verifyRegistrationOtp: (email, code) => req('POST', '/auth/otp/verify', { email, code }),
  resendVerificationEmail: (email) => req('POST', '/auth/resend-verification', { email }),
  requestOtp: (email) => req('POST', '/auth/global-login/request-otp', { email }),
  verifyOtp: (email, code) => req('POST', '/auth/otp/verify', { email, code }),
  getTenants: (identityToken) =>
    fetch(`${API}/auth/global-login/tenants`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${identityToken}` },
    }).then(async (r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() }),
  selectTenant: (tenant_id, identity_token) =>
    fetch(`${API}/auth/global-login/select-tenant`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${identity_token}`,
      },
      body: JSON.stringify({ tenant_id }),
    }).then((r) => r.json()),

  // Tenant
  getTenantInfo: () => req('GET', '/tenant/info'),
  register: (name, email, password) => req('POST', '/auth/register', { name, email, password }),
  login: (email, password) => req('POST', '/auth/login', { email, password }),
  getMe: () => req('GET', '/auth/me'),
  refresh: () => req('POST', '/auth/refresh'),

  // Admin
  getAdminStats: () => req('GET', '/admin/stats'),
  getAdminUsers: () => req('GET', '/admin/users'),
  approveUser: (id) => req('PATCH', `/admin/users/${id}/approve`),
  rejectUser: (id) => req('PATCH', `/admin/users/${id}/reject`),
  banUser: (id) => req('PATCH', `/admin/users/${id}/ban`),
  suspendUser: (id) => req('PATCH', `/admin/users/${id}/suspend`),
  reactivateUser: (id) => req('PATCH', `/admin/users/${id}/reactivate`),
  updateUserRole: (id, role) => req('PATCH', `/admin/users/${id}/role`, { role }),

  getAdminTeams: () => req('GET', '/admin/teams'),
  createTeam: (name) => req('POST', '/admin/teams', { name }),
  getTeamMembers: (teamId) => req('GET', `/admin/teams/${teamId}/members`),
  addTeamMember: (teamId, user_id) => req('POST', `/admin/teams/${teamId}/members`, { user_id }),
  removeTeamMember: (teamId, userId) => req('DELETE', `/admin/teams/${teamId}/members/${userId}`),
  updateTeamMemberRole: (teamId, userId, role) =>
    req('PATCH', `/admin/teams/${teamId}/members/${userId}`, { role }),

  getAdminCategories: () => req('GET', '/admin/categories'),
  createCategory: (body) => req('POST', '/admin/categories', body),
  updateCategory: (id, body) => req('PATCH', `/admin/categories/${id}`, body),
  deleteCategory: (id) => req('DELETE', `/admin/categories/${id}`),

  getAdminSla: () => req('GET', '/admin/sla'),
  createSla: (body) => req('POST', '/admin/sla', body),
  updateSla: (id, body) => req('PATCH', `/admin/sla/${id}`, body),
  deleteSla: (id) => req('DELETE', `/admin/sla/${id}`),

  getAdminMacros: () => req('GET', '/admin/macros'),
}
