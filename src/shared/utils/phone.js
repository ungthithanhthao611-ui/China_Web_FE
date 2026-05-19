/**
 * Phone helpers — chuẩn hoá hiển thị số điện thoại.
 *
 * Chấp nhận:
 *  - 1 SĐT đơn:   "0982818273"     -> "0982 818 273"
 *  - Nhiều SĐT:   "0982818273 / 0968297104" hoặc "0982818273, 0968297104"
 *                 -> "0982 818 273 / 0968 297 104"
 *  - Có dấu chấm: "0982.818.273"   -> "0982 818 273"
 */

/**
 * Format 1 chuỗi chỉ chứa duy nhất 1 SĐT (đã loại bỏ separator).
 * @param {string} raw
 * @returns {string}
 */
function formatSinglePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return ''

  // SĐT di động VN 10 số: 4-3-3   (0982 818 273)
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }

  // SĐT 11 số: 4-4-3
  if (digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`
  }

  // Hotline 1900/1800 (8-10 số): chia 4-4 hoặc 4-3
  if (digits.length === 8) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`
  }

  // Fallback: trả lại nguyên digits (không format)
  return digits
}

/**
 * Format chuỗi chứa 1 hoặc nhiều SĐT, tách bởi "/", ",", ";" hoặc "|".
 * @param {string} value
 * @param {string} separator - separator dùng để ghép kết quả (mặc định " / ")
 * @returns {string}
 */
export function formatPhone(value, separator = ' / ') {
  if (!value) return ''

  return String(value)
    .split(/[/,;|]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map(formatSinglePhone)
    .filter(Boolean)
    .join(separator)
}

/**
 * Lấy SĐT đầu tiên (digits-only) để dùng cho href="tel:..."
 * @param {string} value
 * @returns {string}
 */
export function toTelHref(value) {
  if (!value) return ''
  const first = String(value).split(/[/,;|]+/)[0] || ''
  const digits = first.replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : ''
}
