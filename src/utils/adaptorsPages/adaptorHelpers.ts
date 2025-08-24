import { sleep } from '../async'

// Common helper to standardize handling of paths across different adaptor types
export async function getStandardizedPaths(data: any, type: string, maxPaths = 5) {
  if (!data?.props?.protocols || !Array.isArray(data.props.protocols)) {
    console.warn(`Invalid or missing protocols data for ${type}, returning empty paths`)
    return []
  }

  // For aggregators, handle special mapping
  if (type === 'aggregators') {
    return data.props.protocols
      .filter(p => p?.name)
      .slice(0, maxPaths)
      .map(protocol => ({
        params: { type, chain: protocol.name.toLowerCase() }
      }))
  }

  // Standard sorting and processing for other types
  return data.props.protocols
    .sort((a, b) => ((b.total24h || 0) - (a.total24h || 0)))
    .slice(0, maxPaths)
    .map(protocol => {
      if (!protocol?.name) return null
      return {
        params: { type, chain: protocol.name.toLowerCase() }
      }
    })
    .filter(Boolean)
}