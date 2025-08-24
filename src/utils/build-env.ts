// Helper to detect if code is running during build
export const isBuildTime = () => {
  return process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build'
}