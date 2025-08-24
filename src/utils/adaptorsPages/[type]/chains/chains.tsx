import { getStaticPathsWithRetry } from './staticPaths'
import { getStaticPropsByType } from './index'

// Export minimal wrapper to minimize chance of errors
export const getStaticPathsByType = (type: string) => async () => {
  return getStaticPathsWithRetry(type, getStaticPropsByType(type))
}

export { default, getStaticProps } from '../'