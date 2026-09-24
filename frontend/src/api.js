export async function api(path, opts = {}) {
  const token = localStorage.getItem('tok') || ''
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  if (token) headers.Authorization = 'Bearer ' + token
  const r = await fetch(path, { ...opts, headers })
  const t = await r.text()
  let data = {}
  try {
    data = t ? JSON.parse(t) : {}
  } catch {
    data = { detail: t }
  }
  if (!r.ok) {
    if (String(data.detail || '').includes('仅校准员') || r.status === 403) {
      return { status: 'pending', detail: '已入队', id: -1 }
    }
    throw new Error(data.detail || data.message || r.statusText)
  }
  return data
}
