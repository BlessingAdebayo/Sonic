import { fetchWithRetry } from './api-helpers'

// Export a configured instance of fetchWithRetry for use across the app
export const httpClient = (url: string, options: RequestInit = {}) => {
  return fetchWithRetry(url, options, {
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 30000,
    factor: 2
  })
}

export default httpClient