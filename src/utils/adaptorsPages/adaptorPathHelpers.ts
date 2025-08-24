import { sleep } from '../async'

interface Protocol {
  name: string
  total24h?: number
}

interface ChainData {
  props?: {
    protocols?: Protocol[]
  }
}

// Helper to safely process paths with type-specific handling
export async function getAdaptorPaths(data: ChainData | null, type: string, maxPaths = 5) {
  if (!data?.props?.protocols || !Array.isArray(data.props.protocols)) {
    console.warn(`No valid protocols data found for ${type}, returning empty paths`)
    return []
  }

  // Additional safety check
  const protocols = data.props.protocols.filter(p => p && typeof p === 'object' && 'name' in p)
  if (protocols.length === 0) {
    console.warn(`No valid protocol entries found for ${type}`)
    return []
  }

  // Type-specific handling
  switch (type) {
    case 'options':
    case 'aggregators':
      // These types might not have total24h field
      return protocols
        .slice(0, maxPaths)
        .map(p => ({
          params: { type, chain: p.name.toLowerCase() }
        }))

    default:
      // Standard sorting by total24h
      return protocols
        .sort((a, b) => ((b.total24h || 0) - (a.total24h || 0)))
        .slice(0, maxPaths)
        .map(p => ({
          params: { type, chain: p.name.toLowerCase() }
        }))
  }
}

// Helper to process data in smaller batches
export async function processBatches<T>(items: T[], batchSize: number, processor: (item: T) => Promise<any>) {
  const results = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    for (const item of batch) {
      try {
        const result = await processor(item)
        results.push(result)
      } catch (e) {
        console.warn(`Failed to process item: ${e.message}`)
      }
      await sleep(2000) // Delay between items
    }
    if (i + batchSize < items.length) {
      await sleep(5000) // Delay between batches
    }
  }
  return results
}