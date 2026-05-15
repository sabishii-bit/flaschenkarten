export function useApi() {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    })

    const body = await res.json()
    if (!res.ok) throw new Error(body.error ?? `Request failed: ${res.status}`)
    return body.data as T
  }

  function get<T>(path: string) {
    return request<T>(path)
  }

  function post<T>(path: string, data: unknown) {
    return request<T>(path, { method: 'POST', body: JSON.stringify(data) })
  }

  return { get, post }
}
