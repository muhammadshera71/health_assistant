async function request(path, options = {}) {
  const { body, ...rest } = options
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...rest,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({ detail: res.statusText }))
  if (!res.ok) {
    const err = new Error(data.detail || 'Request failed')
    err.status = res.status
    throw err
  }
  return data
}

// ── Normalizers ───────────────────────────────────────────────────────────────

export function normalizeProduct(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    type: p.type,
    price: p.price,
    size: p.size,
    shortDesc: p.short_desc,
    description: p.description,
    skinTypes: p.skin_types || [],
    concerns: p.concerns || [],
    ingredients: p.ingredients || [],
    image: p.image,
    images: p.images?.length ? p.images : (p.image ? [p.image] : []),
    rating: p.rating || 0,
    reviewCount: p.review_count || 0,
    badge: p.badge,
    inStock: p.in_stock ?? true,
    featured: p.featured ?? false,
    howToUse: p.how_to_use,
    reviews: [],
  }
}

function normalizeCartItem(item) {
  const product = normalizeProduct(item.product)
  return {
    ...product,
    _serverId: item.id,
    quantity: item.quantity,
  }
}

function normalizeUser(u) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.first_name,
    lastName: u.last_name,
    isActive: u.is_active,
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const auth = {
  me: () => request('/api/auth/me').then(normalizeUser),
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: { email, password } }).then(normalizeUser),
  register: (first_name, last_name, email, password) =>
    request('/api/auth/register', { method: 'POST', body: { first_name, last_name, email, password } }).then(normalizeUser),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
}

// ── Products ──────────────────────────────────────────────────────────────────

export const products = {
  list: (params = {}) => {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => v != null && qs.append(k, String(v)))
    return request(`/api/products?${qs}`).then(data => ({
      products: data.products.map(normalizeProduct),
      total: data.total,
    }))
  },
  getBySlug: (slug) => request(`/api/products/${slug}`).then(normalizeProduct),
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export const cart = {
  get: () =>
    request('/api/cart').then(data => ({
      items: data.items.map(normalizeCartItem),
      subtotal: data.subtotal,
      itemCount: data.item_count,
    })),
  addItem: (product_id, quantity = 1) =>
    request('/api/cart/items', { method: 'POST', body: { product_id, quantity } }).then(normalizeCartItem),
  updateItem: (cartItemId, quantity) =>
    request(`/api/cart/items/${cartItemId}`, { method: 'PUT', body: { quantity } }).then(normalizeCartItem),
  removeItem: (cartItemId) =>
    request(`/api/cart/items/${cartItemId}`, { method: 'DELETE' }),
  clear: () => request('/api/cart', { method: 'DELETE' }),
}

// ── Product cache (for chat recommendations) ──────────────────────────────────

const _cache = new Map()

export async function fetchProductsByIds(ids) {
  if (!ids?.length) return []
  const missing = ids.filter(id => !_cache.has(id))
  if (missing.length) {
    try {
      const data = await products.list({ limit: 200 })
      data.products.forEach(p => _cache.set(p.id, p))
    } catch {}
  }
  return ids.map(id => _cache.get(id)).filter(Boolean)
}

// ── Orders ────────────────────────────────────────────────────────────────────

export const orders = {
  place: (body) => request('/api/orders', { method: 'POST', body }),
  list: () => request('/api/orders'),
  get: (id) => request(`/api/orders/${id}`),
}

// ── Users ─────────────────────────────────────────────────────────────────────

export const users = {
  getProfile: () => request('/api/users/profile'),
  updateProfile: (data) => request('/api/users/profile', { method: 'PUT', body: data }),
  getAddresses: () => request('/api/users/addresses'),
  addAddress: (data) => request('/api/users/addresses', { method: 'POST', body: data }),
  deleteAddress: (id) => request(`/api/users/addresses/${id}`, { method: 'DELETE' }),
}
