export function useApi() {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
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
