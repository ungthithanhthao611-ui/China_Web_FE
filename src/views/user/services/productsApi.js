import { fetchJson } from '@/shared/lib/http'

// ─── Product Categories ───────────────────────────────────────────────────────

/**
 * GET /public/product-categories
 * Returns { items: ProductCategory[], pagination: { total: number } }
 */
export function listProductCategories() {
  return fetchJson('/public/product-categories')
}

// ─── Products ─────────────────────────────────────────────────────────────────

/**
 * GET /public/products
 * Params: category_slug?, skip?, limit?
 * Returns { items: Product[], pagination: { skip, limit, total } }
 */
export function listProducts({ categorySlug = '', skip = 0, limit = 12 } = {}) {
  const query = { skip, limit }
  if (categorySlug) query.category_slug = categorySlug
  return fetchJson('/public/products', { query })
}

/**
 * GET /public/products/:slug
 * Returns Product + related_products[]
 */
export function getProduct(slug) {
  return fetchJson(`/public/products/${slug}`)
}

// ─── Inquiry ──────────────────────────────────────────────────────────────────

/**
 * POST /public/inquiries
 * Body: { full_name, email, phone?, company?, subject?, message, source_page?, product_id? }
 * Returns { success: true, id, message }
 */
export function submitInquiry(payload) {
  return fetchJson('/public/inquiries', {
    method: 'POST',
    body: payload,
  })
}
