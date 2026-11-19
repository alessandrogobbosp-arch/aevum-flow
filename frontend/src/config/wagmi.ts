import { http, createConfig } from 'wagmi'
import { defineChain } from 'viem'

export const aevum = defineChain({
	id: 44005,
	name: 'Aevum Testnet',
	nativeCurrency: { name: 'tQDAY', symbol: 'tQDAY', decimals:18 },
	rpcUrls: {
	  default: { http: ['https://rpc-test.qday.info'] },
	},
	blockExplorers: {
	  default: { name: 'Aevum Explorer', url: 'https://explorer-test.qday.info'},
	},
      })

export const config = createConfig({
	chains: [aevum],
	transports: {
	  [aevum.id]: http(),
	},
})
