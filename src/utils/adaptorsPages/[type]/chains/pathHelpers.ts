import { getAdaptorPaths } from '~/utils/adaptorsPages/adaptorPathHelpers'
import { sleep } from '~/utils/async'

export async function safeGetStaticPaths(type: string, dataFetcher: Function) {
  if (process.env.SKIP_BUILD_STATIC_GENERATION) {
    return {
      paths: [],
      fallback: 'blocking'
    }
  }

  try {
    const data = await dataFetcher({ params: { type } })
    const paths = await getAdaptorPaths(data, type, 5)
    
    return {
      paths,
      fallback: 'blocking'
    }
  } catch (e) {
    console.warn(`Failed to get static paths for ${type}: ${e.message}`)
    return {
      paths: [],
      fallback: 'blocking'
    }
  }
}