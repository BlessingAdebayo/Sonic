import { useFilterSonicOnly } from '~/hooks/useFilterSonicOnly'
import { IResponseCGMarketsAPI } from '~/api/types'

export const useSonicCoins = (coinsData: IResponseCGMarketsAPI[]) => {
  return useFilterSonicOnly(coinsData)
}