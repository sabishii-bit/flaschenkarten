import { ref, computed } from 'vue'

const STORAGE_KEY = 'fk_admin_token'

function readToken(): string | null {
  try { return localStorage.getItem(STORAGE_KEY) } catch { return null }
}

function isExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)
  } catch { return true }
}

// Singleton ref — all callers share the same reactive state
const _token = ref<string | null>(readToken())

export function useAdminAuth() {
  const isAuthenticated = computed(
    () => _token.value !== null && !isExpired(_token.value),
  )

  function setToken(raw: string) {
    _token.value = raw
    try { localStorage.setItem(STORAGE_KEY, raw) } catch { /* storage blocked */ }
  }

  function clearToken() {
    _token.value = null
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }

  return { token: _token, isAuthenticated, setToken, clearToken }
}
