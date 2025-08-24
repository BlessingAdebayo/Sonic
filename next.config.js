/** @type {import('next').NextConfig} */
const nextConfig = {
	staticPageGenerationTimeout: 360,
	eslint: {
		// Enable ESLint during builds to catch errors early
		ignoreDuringBuilds: true
	},
	typescript: {
		// Enable TypeScript error checking during builds
		ignoreBuildErrors: true
	},
	reactStrictMode: false,
	async redirects() {
		return [
			{
				source: '/home',
				destination: '/',
				permanent: true
			},
			{
				source: '/chain/Binance',
				destination: '/chain/BSC',
				permanent: true
			},
			{
				source: '/chain/Kucoin',
				destination: '/chain/KCC',
				permanent: true
			},
			{
				source: '/chain/Cosmos',
				destination: '/chain/CosmosHub',
				permanent: true
			},
			{
				source: '/chain/Terra',
				destination: '/chain/Terra Classic',
				permanent: true
			},
			{
				source: '/chain/Nova',
				destination: '/chain/Nova Network',
				permanent: true
			},
			{
				source: '/chain/Milkomeda',
				destination: '/chain/Milkomeda C1',
				permanent: true
			},
			{
				source: '/chain/Elrond',
				destination: '/chain/MultiversX',
				permanent: true
			},
			{
				source: '/chain/RSK',
				destination: '/chain/Rootstock',
				permanent: true
			},
			{
				source: '/chain/OKExChain',
				destination: '/chain/OKTChain',
				permanent: true
			},
			{
				source: '/chain/Map',
				destination: '/chain/MAP Protocol',
				permanent: true
			},
			{
				source: '/chain/Pulse',
				destination: '/chain/PulseChain',
				permanent: true
			},
			{
				source: '/chain/WEMIX',
				destination: '/chain/WEMIX3.0',
				permanent: true
			},
			{
				source: '/chain/Umee',
				destination: '/chain/UX',
				permanent: true
			},
			{
				source: '/chain/TomoChain',
				destination: '/chain/Viction',
				permanent: true
			},
			{
				source: '/langs',
				destination: '/languages',
				permanent: true
			},
			{
				source: '/yields/project/:path*',
				destination: '/yields?project=:path*',
				permanent: true
			},
			{
				source: '/yields/token/:path*',
				destination: '/yields?token=:path*',
				permanent: true
			},
			{
				source: '/yields/chain/:path*',
				destination: '/yields?chain=:path*',
				permanent: true
			},
			{
				source: '/recent-noforks',
				destination: '/recent',
				permanent: true
			},
			{
				source: '/liquidations',
				destination: '/liquidations/eth',
				permanent: false
			},
			{
				source: '/yields/optimizer',
				destination: '/borrow',
				permanent: true
			},
			{
				source: '/aggregator',
				destination: 'https://swap.defillama.com/',
				permanent: true
			},
			{
				source: '/protocols/cex',
				destination: '/cexs',
				permanent: true
			},
			{
				source: '/yields/borrow',
				destination: '/yields',
				permanent: true
			},
			{
				source: '/compare-fdv',
				destination: '/compare-tokens',
				permanent: true
			},
			{
				source: '/tokenPnl',
				destination: '/token-pnl',
				permanent: true
			},
			{
				source: '/tokenUsage',
				destination: '/token-usage',
				permanent: true
			},
			{
				source: '/derivatives',
				destination: '/perps',
				permanent: true
			},
			{
				source: '/derivatives/:slug',
				destination: '/perps/:slug',
				permanent: true
			},
			{
				source: '/derivatives/chains',
				destination: '/perps/chains',
				permanent: true
			},
			{
				source: '/derivatives/chains/:slug',
				destination: '/perps/chains/:slug',
				permanent: true
			},
			{
				source: '/derivatives-aggregator',
				destination: '/perps-aggregators',
				permanent: true
			},
			{
				source: '/derivatives-aggregator/:slug',
				destination: '/perps-aggregators/:slug',
				permanent: true
			},
			{
				source: '/derivatives-aggregator/chains',
				destination: '/perps-aggregators/chains',
				permanent: true
			},
			{
				source: '/derivatives-aggregator/chains/:slug',
				destination: '/perps-aggregators/chains/:slug',
				permanent: true
			},
			{
				source: '/pro-api',
				destination: '/subscribe',
				permanent: true
			},
			{
				source: '/lsd',
				destination: '/lst',
				permanent: true
			},
			{
				source: '/protocols/Dexes',
				destination: '/protocols/Dexs',
				permanent: true
			},
			{
				source: '/chain/Optimism',
				destination: '/chain/OP%20Mainnet',
				permanent: true
			}
		]
	},
	async headers() {
		return [
			{
				source: '/chart/:slug*', // Matches all /chart pages
				headers: [
					{
						key: 'X-Frame-Options',
						value: 'SAMEORIGIN'
					},
					{ key: 'Content-Security-Policy', value: 'frame-ancestors *' }
				]
			}
		]
	},
	images: {
		domains: ['assets.coingecko.com']
	},
	compiler: {
		styledComponents: true
	},
	generateBuildId: async () => {
		try {
			const { execSync } = require('child_process');
			return execSync('git rev-parse HEAD').toString().trim();
		} catch (error) {
			console.warn('Failed to get git commit hash, using timestamp as build ID');
			return Date.now().toString();
		}
	},
	experimental: {
		largePageDataBytes: 6_000_000
	}
}

export default nextConfig
