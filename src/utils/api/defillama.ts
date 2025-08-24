import { sleep } from '../async'

const DEFAULT_CONFIG = {
  maxRetries: 25,
  initialDelay: 60000,
  maxDelay: 900000,
  factor: 6
}

import { rateLimiter } from './rate-limiter'
import { safeParseJSON } from './safe-json'

export async function fetchDefillamaApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  let delay = DEFAULT_CONFIG.initialDelay
  let lastError: Error

  for (let i = 0; i < DEFAULT_CONFIG.maxRetries; i++) {
    try {
      const response = await rateLimiter.add(() => fetch(url, options))
      
      // Handle rate limiting, non-JSON responses, and other error cases
      if (response.status === 429 || response.status >= 500 || !response.headers.get('content-type')?.includes('application/json')) {
        const retryAfter = response.headers.get('retry-after')
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay
        
        console.warn('Rate limited by DefiLlama API, waiting:', waitTime)
        await sleep(waitTime + Math.random() * 1000) // Add jitter to avoid thundering herd
        delay = Math.min(delay * DEFAULT_CONFIG.factor, DEFAULT_CONFIG.maxDelay)
        
        // Increase rate limiter interval temporarily
        rateLimiter.minInterval = Math.min(rateLimiter.minInterval * 1.5, 5000)
        continue
      }
      
      // Validate JSON response
      const text = await response.text()
      let data
      try {
        data = safeParseJSON(text)
      } catch (e) {
        console.warn('Invalid JSON response from DefiLlama API, retrying...')
        await sleep(delay)
        delay = Math.min(delay * DEFAULT_CONFIG.factor, DEFAULT_CONFIG.maxDelay)
        continue
      }

      // Safety check for empty, invalid, or error data
      if (!data || data.error) {
        console.warn('Empty response from DefiLlama API, retrying...')
        await sleep(delay)
        delay = Math.min(delay * DEFAULT_CONFIG.factor, DEFAULT_CONFIG.maxDelay)
        continue
      }

      // Handle other error responses
      if (!response.ok) {
        const text = await response.text()
        console.warn('Rate limited by DefiLlama API:', text)
        await sleep(delay)
        delay = Math.min(delay * DEFAULT_CONFIG.factor, DEFAULT_CONFIG.maxDelay)
        continue
      }

      try {
        const data = await response.json()
        return data as T
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError)
        if (i === DEFAULT_CONFIG.maxRetries - 1) {
          throw parseError
        }
        await sleep(delay)
        delay = Math.min(delay * DEFAULT_CONFIG.factor, DEFAULT_CONFIG.maxDelay)
        continue
      }
    } catch (error) {
      lastError = error as Error
      await sleep(delay)
      delay = Math.min(delay * DEFAULT_CONFIG.factor, DEFAULT_CONFIG.maxDelay)
    }
  }

  throw lastError
}

export async function fetchWithFallback<T>(urls: string[], options: RequestInit = {}): Promise<T> {
  let lastError: Error
  
  for (const url of urls) {
    try {
      return await fetchDefillamaApi<T>(url, options)
    } catch (error) {
      lastError = error as Error
      continue
    }
  }

  throw lastError
}