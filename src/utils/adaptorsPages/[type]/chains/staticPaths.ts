import { sleep } from '~/utils/async'
import { setPageBuildTimes } from '~/utils/cache-client'
import { postRuntimeLogs } from '~/utils/async'
import { FALLBACK_DATA, isSpecialType } from './specialTypes'

const MAX_PATHS = 1 // Absolute minimum - only generate one path per type
const RATE_LIMITED_TYPES = ['options', 'aggregators', 'forks', 'bridges', 'chains']
const SEQUENTIAL_TYPES = ['options', 'aggregators'] // Types that need sequential processing
const TYPE_DELAYS = {
  options: 300000,     // 5 minutes for options
  forks: 300000,       // 5 minutes for forks
  aggregators: 300000, // 5 minutes for aggregators
  bridges: 300000,     // 5 minutes for bridges
  chains: 300000,      // 5 minutes for chains
  default: 180000      // 3 minutes for others
}
const MAX_RETRIES = 3 // Reduce retries since we have better fallbacks now
const USE_FALLBACK_ONLY = true // Force use of fallback data to prevent API rate limits
const CONCURRENT_REQUESTS = 1 // Only allow 1 concurrent request

export async function getStaticPathsWithRetry(type: string, dataFetcher: Function) {
  // Skip in preview environments
  if (process.env.SKIP_BUILD_STATIC_GENERATION) {
    return {
      paths: [],
      fallback: 'blocking'
    }
  }

  const start = Date.now()

  try {
    // Add type-specific delay
    const delay = TYPE_DELAYS[type] || TYPE_DELAYS.default
    await sleep(delay)

    // Special handling for options and forks
    if (type === 'options' || type === 'forks') {
      await sleep(30000) // Extra delay
    }

    // Initialize with safe empty values
    // Always try to use fallback data first if available
    let data = FALLBACK_DATA[type] || { props: { protocols: [] } }
    let retryCount = 0
    
    // Only try API if we don't have fallback data and aren't in fallback-only mode
    if (!FALLBACK_DATA[type] && !USE_FALLBACK_ONLY) {
      while (retryCount < MAX_RETRIES) {
        try {
          await sleep(TYPE_DELAYS.default * Math.pow(2, retryCount)) // Exponential backoff
          const result = await dataFetcher({ params: { type } })
          
          if (result?.props?.protocols && Array.isArray(result.props.protocols)) {
            data = result
            break
          }
          
          console.warn(`Invalid data format for ${type} (attempt ${retryCount + 1})`)
        } catch (e) {
          console.warn(`Error fetching data for ${type} (attempt ${retryCount + 1}):`, e)
        }
        
        retryCount++
        await sleep(60000) // Additional delay between retries
      }
    }
    
    // Aggregators-specific safety check
    if (type === 'aggregators' && (!data?.props?.protocols || !Array.isArray(data.props.protocols))) {
      console.warn(`No valid aggregator protocols found, returning empty paths`)
      return { paths: [], fallback: 'blocking' }
    }

    // Validate response data
    if (!data?.props?.protocols || !Array.isArray(data.props.protocols)) {
      console.warn(`Invalid or missing protocols data for ${type}, returning empty paths`)
      return { paths: [], fallback: 'blocking' }
    }

    // Filter out invalid protocols and ensure required fields exist
    const validProtocols = (data.props.protocols || [])
      .filter(p => p && typeof p === 'object' && p.name)
      .filter(p => {
        if (type === 'options') {
          return p.name && typeof p.name === 'string'
        }
        return true
      })

    if (!validProtocols || validProtocols.length === 0) {
      console.warn(`No valid protocols found for ${type}`)
      return { paths: [], fallback: 'blocking' }
    }

    // Add delay between processing
    await sleep(5000)

    // Handle different types appropriately
    let protocols = []
    
    try {
      // Safer array operations with explicit undefined checks
      const safeSort = (arr) => {
        try {
          return [...arr].sort((a, b) => ((b?.total24h || 0) - (a?.total24h || 0)))
        } catch (e) {
          console.warn('Sort failed, returning unsorted array:', e)
          return arr
        }
      }

      // Process based on type with safety checks
      if (['aggregators', 'options', 'forks'].includes(type)) {
        protocols = validProtocols.slice(0, MAX_PATHS)
      } else {
        protocols = safeSort(validProtocols).slice(0, MAX_PATHS)
      }

      // Final safety check
      if (!protocols || !Array.isArray(protocols)) {
        console.warn(`Invalid protocols array for ${type}, using fallback`)
        protocols = validProtocols.slice(0, MAX_PATHS)
      }
    } catch (e) {
      console.warn(`Error processing protocols for ${type}, using fallback:`, e)
      protocols = validProtocols.slice(0, MAX_PATHS)
    }

    // Generate paths
    const paths = protocols
      .slice(0, MAX_PATHS)
      .map(protocol => ({
        params: { 
        type, 
        chain: (protocol.name || 'default').toString().toLowerCase() 
      }
      }))
      .filter(Boolean)

    const end = Date.now()
    if (end - start > 10_000) {
      await setPageBuildTimes(`adaptorPages:${type}:chains`, [end, `${(end - start).toFixed(0)}ms`])
      postRuntimeLogs(`[PREPARED] [${(end - start).toFixed(0)}ms] <adaptorPages:${type}:chains>`)
    }

    return {
      paths,
      fallback: 'blocking'
    }

  } catch (error) {
    console.warn(`Error generating static paths for ${type}:`, error)
    return {
      paths: [],
      fallback: 'blocking'
    }
  }
}