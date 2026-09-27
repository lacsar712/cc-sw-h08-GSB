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
    // 非 2xx 一律按失败抛出真实原因，绝不把拒绝载荷改写成成功结构。
    throw new Error(data.detail || data.message || r.statusText)
  }
  return data
}
