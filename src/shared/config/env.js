const FALLBACK_LOCAL_API_BASE_URL = 'http://127.0.0.1:8000/api/v1'
const FALLBACK_LANGUAGE_CODE = 'en'
const FALLBACK_HTTP_TIMEOUT_MS = 15000
const FALLBACK_LOCAL_ONLYOFFICE_DOCS_URL = 'http://127.0.0.1:8082'
const FALLBACK_LOCAL_ONLYOFFICE_CALLBACK_PROXY_URL = 'http://127.0.0.1:8000'

function normalizeRequiredBaseUrl(value, fallback = '') {
  const normalized = String(value || fallback).trim().replace(/\/+$/, '')
  return normalized
}

function normalizeOptionalBaseUrl(value, fallback = '') {
  const normalized = String(value || fallback).trim().replace(/\/+$/, '')
  return normalized || ''
}

function parseTimeout(value) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : FALLBACK_HTTP_TIMEOUT_MS
}

const isDev = import.meta.env.DEV

export const env = {
  apiBaseUrl: normalizeRequiredBaseUrl(import.meta.env.VITE_API_BASE_URL, isDev ? FALLBACK_LOCAL_API_BASE_URL : ''),
  languageCode: String(import.meta.env.VITE_LANGUAGE_CODE || FALLBACK_LANGUAGE_CODE),
  httpTimeoutMs: parseTimeout(import.meta.env.VITE_HTTP_TIMEOUT_MS),
  onlyOfficeDocsUrl: normalizeOptionalBaseUrl(
    import.meta.env.VITE_ONLYOFFICE_DOCS_URL,
    isDev ? FALLBACK_LOCAL_ONLYOFFICE_DOCS_URL : ''
  ),
  onlyOfficeCallbackProxyUrl: normalizeOptionalBaseUrl(
    import.meta.env.VITE_ONLYOFFICE_CALLBACK_PROXY_URL,
    isDev ? FALLBACK_LOCAL_ONLYOFFICE_CALLBACK_PROXY_URL : ''
  ),
  isDev,
}
