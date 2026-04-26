const DMS_PATTERN =
  /(\d{1,3})[^\dNSWE]+(\d{1,2})[^\dNSWE]+(\d{1,2}(?:\.\d+)?)[^\dNSWE]*([NS])(?:\s|,|;)+(\d{1,3})[^\dNSWE]+(\d{1,2})[^\dNSWE]+(\d{1,2}(?:\.\d+)?)[^\dNSWE]*([EW])/i
const DECIMAL_PAIR_PATTERN = /(-?\d{1,3}(?:\.\d+)?)\s*[,;/]\s*(-?\d{1,3}(?:\.\d+)?)/i
const GOOGLE_AT_PATTERN = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i
const OPENSTREETMAP_HASH_PATTERN = /map=\d+\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)/i

function isValidCoordinatePair(latitude, longitude) {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
}

export function formatCoordinateValue(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return ''
  const normalized = numeric.toFixed(6).replace(/\.?0+$/, '')
  return normalized === '-0' ? '0' : normalized
}

export function parseCoordinateValue(value, axis = null) {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return null
  if (axis === 'lat' && (parsed < -90 || parsed > 90)) return null
  if (axis === 'lng' && (parsed < -180 || parsed > 180)) return null
  return parsed
}

function parseDmsPair(rawValue) {
  const match = String(rawValue ?? '').trim().match(DMS_PATTERN)
  if (!match) return null

  const latitude =
    Number(match[1]) + Number(match[2]) / 60 + Number(match[3]) / 3600
  const longitude =
    Number(match[5]) + Number(match[6]) / 60 + Number(match[7]) / 3600

  const normalizedLatitude = match[4].toUpperCase() === 'S' ? -latitude : latitude
  const normalizedLongitude = match[8].toUpperCase() === 'W' ? -longitude : longitude

  if (!isValidCoordinatePair(normalizedLatitude, normalizedLongitude)) {
    return null
  }

  return {
    latitude: normalizedLatitude,
    longitude: normalizedLongitude,
  }
}

function parseDecimalPair(rawValue) {
  const text = String(rawValue ?? '').trim()
  if (!text) return null

  const directMatch = text.match(DECIMAL_PAIR_PATTERN)
  if (directMatch) {
    const latitude = Number(directMatch[1])
    const longitude = Number(directMatch[2])
    if (isValidCoordinatePair(latitude, longitude)) {
      return { latitude, longitude }
    }
  }

  const numericMatches = text.match(/-?\d+(?:\.\d+)?/g) || []
  if (numericMatches.length !== 2) {
    return null
  }

  const latitude = Number(numericMatches[0])
  const longitude = Number(numericMatches[1])
  if (!isValidCoordinatePair(latitude, longitude)) {
    return null
  }

  return { latitude, longitude }
}

function extractGoogleCoordinates(parsedUrl, rawValue) {
  for (const key of ['q', 'query', 'll', 'center', 'destination']) {
    const candidate = parsedUrl.searchParams.get(key)
    const parsedPair = extractCoordinatesFromMapInput(candidate)
    if (parsedPair) {
      return parsedPair
    }
  }

  const markerMatch = String(rawValue ?? '').match(GOOGLE_AT_PATTERN)
  if (!markerMatch) {
    return null
  }

  const latitude = Number(markerMatch[1])
  const longitude = Number(markerMatch[2])
  if (!isValidCoordinatePair(latitude, longitude)) {
    return null
  }

  return { latitude, longitude }
}

function extractOpenStreetMapCoordinates(parsedUrl) {
  const markerValue = parsedUrl.searchParams.get('marker')
  const markerPair = parseDecimalPair(markerValue)
  if (markerPair) {
    return markerPair
  }

  const latitude = parsedUrl.searchParams.get('mlat')
  const longitude = parsedUrl.searchParams.get('mlon')
  const markerLatLng = parseDecimalPair(
    latitude && longitude ? `${latitude},${longitude}` : '',
  )
  if (markerLatLng) {
    return markerLatLng
  }

  const hashMatch = String(parsedUrl.hash ?? '').match(OPENSTREETMAP_HASH_PATTERN)
  if (!hashMatch) {
    return null
  }

  const parsedLatitude = Number(hashMatch[1])
  const parsedLongitude = Number(hashMatch[2])
  if (!isValidCoordinatePair(parsedLatitude, parsedLongitude)) {
    return null
  }

  return {
    latitude: parsedLatitude,
    longitude: parsedLongitude,
  }
}

export function extractCoordinatesFromMapInput(rawValue) {
  const text = String(rawValue ?? '').trim()
  if (!text) return null

  const dmsPair = parseDmsPair(text)
  if (dmsPair) {
    return dmsPair
  }

  try {
    const parsedUrl = new URL(text)
    const hostname = parsedUrl.hostname.toLowerCase()

    if (hostname.includes('google.') || hostname.includes('goo.gl')) {
      const googlePair = extractGoogleCoordinates(parsedUrl, text)
      if (googlePair) {
        return googlePair
      }
    }

    if (hostname.includes('openstreetmap.')) {
      const osmPair = extractOpenStreetMapCoordinates(parsedUrl)
      if (osmPair) {
        return osmPair
      }
    }
  } catch {
    // Fall through to raw text parsing.
  }

  return parseDecimalPair(text)
}

export function buildGoogleMapsQueryUrl(latitude, longitude) {
  const lat = formatCoordinateValue(latitude)
  const lng = formatCoordinateValue(longitude)
  return lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : ''
}

export function buildGoogleMapsEmbedUrl(latitude, longitude, options = {}) {
  const lat = formatCoordinateValue(latitude)
  const lng = formatCoordinateValue(longitude)
  const language = String(options.language || 'vi').trim() || 'vi'
  const zoom = Number(options.zoom)
  const normalizedZoom = Number.isFinite(zoom) ? zoom : 16
  return lat && lng
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&hl=${encodeURIComponent(language)}&z=${normalizedZoom}&output=embed`
    : ''
}

export function normalizeGoogleMapUrl(mapUrl, options = {}) {
  const rawValue = String(mapUrl ?? '').trim()
  if (!rawValue) {
    return ''
  }

  const extractedCoordinates = extractCoordinatesFromMapInput(rawValue)
  if (extractedCoordinates) {
    return buildGoogleMapsEmbedUrl(
      extractedCoordinates.latitude,
      extractedCoordinates.longitude,
      options,
    )
  }

  try {
    const parsedUrl = new URL(rawValue)
    const hostname = parsedUrl.hostname.toLowerCase()
    const pathname = parsedUrl.pathname.toLowerCase()

    if (!hostname.includes('google.') && !hostname.includes('goo.gl')) {
      return ''
    }

    if (pathname.includes('/maps/embed')) {
      return rawValue
    }

    const queryCandidate =
      parsedUrl.searchParams.get('q') ||
      parsedUrl.searchParams.get('query') ||
      parsedUrl.searchParams.get('destination')

    if (queryCandidate) {
      const language = String(options.language || 'vi').trim() || 'vi'
      const zoom = Number(options.zoom)
      const normalizedZoom = Number.isFinite(zoom) ? zoom : 16
      return `https://www.google.com/maps?q=${encodeURIComponent(queryCandidate)}&hl=${encodeURIComponent(language)}&z=${normalizedZoom}&output=embed`
    }

    return rawValue
  } catch {
    return ''
  }
}
