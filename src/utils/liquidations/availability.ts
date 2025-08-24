import { DEFAULT_FALLBACK_DATA, FALLBACK_AVAILABILITY } from '~/constants/build-defaults'
import { fetchWithRetry } from '../api-helpers'

const DEFAULT_CONFIG = {
  maxRetries: 5,
  initialDelay: 5000,
  maxDelay: 30000,
  factor: 2
}

export async function getAvailability() {
  try {
    const response = await fetchWithRetry('https://defillama-datasets.llama.fi/liqs/availability.json', {}, DEFAULT_CONFIG)
    
    // Handle rate limits
    if (response.status === 429) {
      console.warn('Rate limited by API, using fallback data')
      return DEFAULT_FALLBACK_DATA
    }

    if (!response.ok) {
      console.warn('API returned error:', response.status)
      return DEFAULT_FALLBACK_DATA
    }

    const text = await response.text()
    try {
      const data = JSON.parse(text)
      return {
        availability: data.availability || DEFAULT_FALLBACK_DATA.availability,
        time: data.time || Date.now() / 1000
      }
    } catch (err) {
      console.warn('Failed to parse response:', err)
      return DEFAULT_FALLBACK_DATA
    }
  } catch (error) {
    console.error('Failed to fetch availability:', error)
    return DEFAULT_FALLBACK_DATA
  }
}