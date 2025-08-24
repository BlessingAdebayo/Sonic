/**
 * Safely parse JSON with better error handling for rate limit responses
 */
export function safeParseJSON(text: string) {
  try {
    // Handle common rate limit messages that aren't valid JSON
    if (text.includes('Please reduce your request rate')) {
      throw new Error('Rate limit exceeded')
    }
    if (text.includes('Please rea')) {
      throw new Error('Rate limit exceeded (truncated)')
    }
    return JSON.parse(text)
  } catch (e) {
    if (text.length > 100) {
      text = text.slice(0, 100) + '...' // Truncate long error messages
    }
    throw new Error(`Failed to parse JSON: ${text}`)
  }
}