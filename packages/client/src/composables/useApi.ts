import { useAdminAuth } from './useAdminAuth.ts'

const BASE = import.meta.env.VITE_API_URL ?? ''

export function useApi() {
  const { token } = useAdminAuth()

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const adminHeaders: Record<string, string> = token.value
      ? { 'Authorization': `Bearer ${token.value}` }
      : {}

    const res = await fetch(`${BASE}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': import.meta.env.VITE_API_KEY ?? '',
        ...adminHeaders,
        ...init.headers,
      },
    })

    let body: { data: T; error?: string } | undefined
    try {
      body = await res.json()
    } catch {
      throw new Error(`Server error ${res.status}: empty or invalid response`)
    }

    if (!res.ok) throw new Error(body?.error ?? `Request failed: ${res.status}`)
    return body!.data
  }

  function get<T>(path: string) {
    return request<T>(path)
  }

  function post<T>(path: string, data: unknown, method: 'POST' | 'PUT' = 'POST') {
    return request<T>(path, { method, body: JSON.stringify(data) })
  }

  function del<T>(path: string) {
    return request<T>(path, { method: 'DELETE' })
  }

  return { get, post, del }
}
