import { writeFileSync } from 'node:fs'
import {
	ACTIVE_USERS_API,
	BRIDGES_API,
	CHAINS_API,
	CHAINS_ASSETS,
	DIMENISIONS_OVERVIEW_API,
	FORK_API,
	HACKS_API,
	LIQUIDITY_API,
	NFT_MARKETPLACES_STATS_API,
	PROTOCOLS_API,
	PROTOCOLS_EXPENSES_API,
	PROTOCOLS_TREASURY,
	RAISES_API,
	YIELD_POOLS_API
} from '~/constants'
import { fetchOverCache } from '~/utils/perf'

// Utility function
export const slug = (tokenName = ''): string => tokenName?.toLowerCase().split(' ').join('-').split("'").join('')

// Define proper types
interface ProtocolMetadata {
	name: string
	tvl?: boolean
	yields?: boolean
	expenses?: boolean
	treasury?: boolean
	liquidity?: boolean
	hacks?: boolean
	nfts?: boolean
	raises?: boolean
	activeUsers?: boolean
	fees?: boolean
	revenue?: boolean
	dexs?: boolean
	perps?: boolean
	aggregator?: boolean
	options?: boolean
	perpsAggregators?: boolean
	bridgeAggregators?: boolean
	emissions?: boolean
	governance?: boolean
	forks?: boolean
}

interface ChainMetadata {
	name: string
	activeUsers?: boolean
	fees?: boolean
	dexs?: boolean
	derivatives?: boolean
	aggregators?: boolean
	options?: boolean
	'aggregator-derivatives'?: boolean
	'bridge-aggregators'?: boolean
	inflows?: boolean
	chainAssets?: boolean
	gecko_id?: string
	tokenSymbol?: string
}

const finalProtocols: Record<string, ProtocolMetadata> = {}
const finalChains: Record<string, ChainMetadata> = {}

// Fetch all data
const [
	tvlData,
	yieldsData,
	expensesData,
	treasuryData,
	liquidityData,
	hacksData,
	nftMarketplacesData,
	raisesData,
	activeUsersData,
	feesData,
	revenueData,
	volumeData,
	perpsData,
	aggregatorsData,
	optionsData,
	perpsAggregatorsData,
	bridgeAggregatorsData,
	emmissionsData,
	bridgesData,
	chainAssetsData,
	chainsData,
	forksData
] = await Promise.all([
	fetchOverCache(PROTOCOLS_API).then((res) => res.json()),
	fetchOverCache(YIELD_POOLS_API).then((res) => res.json()).then((res) => res.data ?? []),
	fetchOverCache(PROTOCOLS_EXPENSES_API).then((res) => res.json()),
	fetchOverCache(PROTOCOLS_TREASURY).then((res) => res.json()),
	fetchOverCache(LIQUIDITY_API).then((res) => res.json()),
	fetchOverCache(HACKS_API).then((res) => res.json()),
	fetchOverCache(NFT_MARKETPLACES_STATS_API).then((res) => res.json()),
	fetchOverCache(RAISES_API).then((res) => res.json()),
	fetchOverCache(ACTIVE_USERS_API).then((res) => res.json()).catch(() => ({})),
	fetchOverCache(`${DIMENISIONS_OVERVIEW_API}/fees?excludeTotalDataChartBreakdown=true&excludeTotalDataChart=true`)
		.then((res) => res.json()),
	fetchOverCache(
		`${DIMENISIONS_OVERVIEW_API}/fees?excludeTotalDataChartBreakdown=true&excludeTotalDataChart=true&dataType=dailyRevenue`
	).then((res) => res.json()),
	fetchOverCache(`${DIMENISIONS_OVERVIEW_API}/dexs?excludeTotalDataChartBreakdown=true&excludeTotalDataChart=true`)
		.then((res) => res.json()),
	fetchOverCache(
		`${DIMENISIONS_OVERVIEW_API}/derivatives?excludeTotalDataChartBreakdown=true&excludeTotalDataChart=true`
	).then((res) => res.json()),
	fetchOverCache(
		`${DIMENISIONS_OVERVIEW_API}/aggregators?excludeTotalDataChartBreakdown=true&excludeTotalDataChart=true`
	).then((res) => res.json()),
	fetchOverCache(
		`${DIMENISIONS_OVERVIEW_API}/options?excludeTotalDataChartBreakdown=true&excludeTotalDataChart=true`
	).then((res) => res.json()),
	fetchOverCache(
		`${DIMENISIONS_OVERVIEW_API}/aggregator-derivatives?excludeTotalDataChartBreakdown=true&excludeTotalDataChart=true`
	).then((res) => res.json()),
	fetchOverCache(
		`${DIMENISIONS_OVERVIEW_API}/bridge-aggregators?excludeTotalDataChartBreakdown=true&excludeTotalDataChart=true`
	).then((res) => res.json()),
	fetchOverCache(`https://defillama-datasets.llama.fi/emissionsProtocolsList`).then((res) => res.json()),
	fetchOverCache(`${BRIDGES_API}?includeChains=true`).then((res) => res.json()),
	fetchOverCache(CHAINS_ASSETS).then((res) => res.json()),
	fetchOverCache(CHAINS_API).then((res) => res.json()),
	fetchOverCache(FORK_API).then((res) => res.json())
])

// --- Build finalChains from tvlData ---
for (const chain of tvlData.chains) {
	const key = slug(chain)
	finalChains[key] = { name: chain }
}

// --- Build finalProtocols and nameToId ---
const nameToId: Record<string, string> = {}
const parentToChildProtocols: Record<string, string[]> = {}

for (const protocol of tvlData.protocols) {
	const defillamaId = protocol.defillamaId
	const name = slug(protocol.name)

	nameToId[defillamaId] = protocol.name

	// Initialize protocol entry
	finalProtocols[defillamaId] = {
		name,
		tvl: !!protocol.tvl,
		yields: yieldsData.some((pool: { project: string }) => pool.project === name),
		...(protocol.governanceID && { governance: true }),
		...(forksData.forks?.[protocol.name] && { forks: true })
	} as ProtocolMetadata

	if (protocol.parentProtocol) {
		if (!parentToChildProtocols[protocol.parentProtocol]) {
			parentToChildProtocols[protocol.parentProtocol] = []
		}
		parentToChildProtocols[protocol.parentProtocol].push(name)

		// Mark parent as having TVL if any child has TVL
		if (protocol.tvl) {
			finalProtocols[protocol.parentProtocol] = {
				...finalProtocols[protocol.parentProtocol],
				tvl: true
			}
		}
	}
}

// Handle parent protocols
for (const protocol of tvlData.parentProtocols) {
	const id = protocol.id
	const name = slug(protocol.name)

	nameToId[id] = protocol.name

	finalProtocols[id] = {
		...finalProtocols[id],
		name,
		yields: yieldsData.some(
			(pool: any) => pool.project === name || parentToChildProtocols[id]?.includes(pool.project)
		),
		...(protocol.governanceID && { governance: true }),
		...(forksData.forks?.[protocol.name] && { forks: true })
	}
}

// Add features from other datasets
for (const protocol of expensesData) {
	if (!finalProtocols[protocol.protocolId]) continue
	finalProtocols[protocol.protocolId] = { ...finalProtocols[protocol.protocolId], expenses: true }
}

for (const protocol of treasuryData) {
	const id = protocol.id.split('-treasury')[0]
	if (!finalProtocols[id]) continue
	finalProtocols[id] = { ...finalProtocols[id], treasury: true }
}

for (const protocol of liquidityData) {
	if (!finalProtocols[protocol.id]) continue
	finalProtocols[protocol.id] = { ...finalProtocols[protocol.id], liquidity: true }
}

for (const protocol of hacksData) {
	if (!protocol.defillamaId) continue
	const id = protocol.defillamaId.toString()
	if (!finalProtocols[id]) continue
	finalProtocols[id] = { ...finalProtocols[id], hacks: true }
}

for (const market of nftMarketplacesData) {
	const marketSlug = slug(market.exchangeName)
	const entry = Object.entries(nameToId).find(
		([_, name]) => slug(name as string) === marketSlug
	)
	if (entry) {
		const id = entry[0]
		if (finalProtocols[id]) {
			finalProtocols[id] = { ...finalProtocols[id], nfts: true }
		}
	}
}

for (const raise of raisesData.raises) {
	if (!raise.defillamaId || raise.defillamaId.startsWith('chain')) continue
	if (!finalProtocols[raise.defillamaId]) continue
	finalProtocols[raise.defillamaId] = { ...finalProtocols[raise.defillamaId], raises: true }
}

// Active Users
for (const key in activeUsersData) {
	if (Object.prototype.hasOwnProperty.call(activeUsersData, key)) {
		if (key.startsWith('chain#')) {
			const chainSlug = key.slice(6).toLowerCase()
			const chainEntry = Object.entries(finalChains).find(([k]) => k === chainSlug)
			if (chainEntry) {
				const [k] = chainEntry
				finalChains[k] = { ...(finalChains[k] ?? { name: k }), activeUsers: true }
			}
		} else {
			if (finalProtocols[key]) {
				finalProtocols[key] = { ...finalProtocols[key], activeUsers: true }
			}
		}
	}
}

// Fees, Revenue, Volume, Perps, Aggregators etc.
const updateProtocolAndParent = (
	protocol: { defillamaId: string; parentProtocol?: string },
	field: keyof ProtocolMetadata
) => {
	if (finalProtocols[protocol.defillamaId]) {
		finalProtocols[protocol.defillamaId] = { ...finalProtocols[protocol.defillamaId], [field]: true }
	}
	if (protocol.parentProtocol && finalProtocols[protocol.parentProtocol]) {
		finalProtocols[protocol.parentProtocol] = { ...finalProtocols[protocol.parentProtocol], [field]: true }
	}
}

const updateChain = (chain: string, field: keyof ChainMetadata) => {
	const key = slug(chain)
	if (finalChains[key]) {
		finalChains[key] = { ...(finalChains[key] ?? { name: chain }), [field]: true }
	}
}

// Apply updates
for (const protocol of feesData.protocols) updateProtocolAndParent(protocol, 'fees')
for (const chain of feesData.allChains ?? []) updateChain(chain, 'fees')

for (const protocol of revenueData.protocols) updateProtocolAndParent(protocol, 'revenue')

for (const protocol of volumeData.protocols) updateProtocolAndParent(protocol, 'dexs')
for (const chain of volumeData.allChains ?? []) updateChain(chain, 'dexs')

for (const protocol of perpsData.protocols) updateProtocolAndParent(protocol, 'perps')
for (const chain of perpsData.allChains ?? []) updateChain(chain, 'derivatives')

for (const protocol of aggregatorsData.protocols) updateProtocolAndParent(protocol, 'aggregator')
for (const chain of aggregatorsData.allChains ?? []) updateChain(chain, 'aggregators')

for (const protocol of optionsData.protocols) updateProtocolAndParent(protocol, 'options')
for (const chain of optionsData.allChains ?? []) updateChain(chain, 'options')

for (const protocol of perpsAggregatorsData.protocols)
	updateProtocolAndParent(protocol, 'perpsAggregators')
for (const chain of perpsAggregatorsData.allChains ?? [])
	updateChain(chain, 'aggregator-derivatives')

for (const protocol of bridgeAggregatorsData.protocols)
	updateProtocolAndParent(protocol, 'bridgeAggregators')
for (const chain of bridgeAggregatorsData.allChains ?? [])
	updateChain(chain, 'bridge-aggregators')

// Emissions
for (const [id, name] of Object.entries(nameToId)) {
	if (emmissionsData.includes(slug(name))) {
		if (finalProtocols[id]) {
			finalProtocols[id] = { ...finalProtocols[id], emissions: true }
		}
	}
}

// Bridges inflows
for (const chain of bridgesData.chains) {
	const key = slug(chain.name)
	if (finalChains[key]) {
		finalChains[key] = { ...(finalChains[key] ?? { name: chain.name }), inflows: true }
	}
}

// Chain assets
for (const chain in chainAssetsData) {
	if (Object.prototype.hasOwnProperty.call(chainAssetsData, chain)) {
		const key = slug(chain)
		if (finalChains[key]) {
			finalChains[key] = { ...(finalChains[key] ?? { name: chain }), chainAssets: true }
		}
	}
}

// Gecko IDs
for (const chain of chainsData) {
	const key = slug(chain.name)
	if (finalChains[key] && chain.gecko_id) {
		finalChains[key] = {
			...(finalChains[key] ?? { name: chain.name }),
			gecko_id: chain.gecko_id,
			tokenSymbol: chain.tokenSymbol
		}
	}
}

// Write output
writeFileSync(
	'./metadata/protocols.json',
	JSON.stringify(
		Object.keys(finalProtocols)
			.sort()
			.reduce((acc, key) => {
				acc[key] = finalProtocols[key]
				return acc
			}, {} as Record<string, ProtocolMetadata>),
		null,
		4
	),
	'utf8'
)

writeFileSync(
	'./metadata/chains.json',
	JSON.stringify(
		Object.keys(finalChains)
			.sort()
			.reduce((acc, key) => {
				acc[key] = finalChains[key]
				return acc
			}, {} as Record<string, ChainMetadata>),
		null,
		4
	),
	'utf8'
)

console.log('finished building metadata')
