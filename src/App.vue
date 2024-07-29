<script setup lang="ts">
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/vue'
import { BrowserProvider } from 'ethers';
import { mainnet, bsc, avalanche, base, polygon, optimism, arbitrum, zkSync } from 'viem/chains'
import { ref } from 'vue';

const projectId = 'fe525a3fb7824f87c529d0935853cc2d'

const metadata = {
  name: 'My Dapp',
  description: 'My Dapp Description',
  url: 'mydapp.com',
  icons: ['https://mydapp-logo.png']
}

const ethersConfig = defaultConfig({
  metadata,
  auth: {
    email: false
  }
})

const toWCChainInfo = (chain: any) => {
  return {
    chainId: chain.id,
    name: chain.name,
    nativeCurrency: chain.nativeCurrency.name,
    explorerUrl: chain.blockExplorers.default.url,
    rpcUrl: chain.rpcUrls.default.http[0],
  }
}

const chains = [toWCChainInfo(mainnet), toWCChainInfo(bsc), toWCChainInfo(avalanche),
toWCChainInfo(base), toWCChainInfo(polygon), toWCChainInfo(optimism), toWCChainInfo(arbitrum), toWCChainInfo(zkSync)] as any

console.log(chains);

const modal = createWeb3Modal({
  ethersConfig,
  projectId,
  chains,
  enableAnalytics: false, // Optional - defaults to your Cloud configuration  
})

let ethersProvider: any
let chainId = ref('--')

const tx = ref({
  to: '',
  value: '',
  data: '0x',
  gasPrice: ''
})

const getSigner = async () => {
  const walletProvider = modal.getWalletProvider()
  ethersProvider = new BrowserProvider(walletProvider as any)
  const network = await ethersProvider.getNetwork()
  chainId.value = network.chainId
  const signer = await ethersProvider.getSigner()
  alert(signer?.address)
}

const sendTransaction = async () => {
  try {
    const txSend = {
      "to": tx.value.to,
      "value": tx.value.value,
      "data": tx.value.data,
      "gasPrice": tx.value.gasPrice
    } as any
    if (!txSend["gasPrice"]) {
      delete txSend["gasPrice"]
    }
    console.log('sendTransaction', txSend);
    const signer = await ethersProvider.getSigner()
    const transaction = await signer.sendTransaction(txSend)
    alert(transaction.hash)
  } catch (error) {
    console.error('sendTransaction', JSON.stringify(tx.value), error);
  }
}

</script>

<template>
  <main>
    <button @click="modal.open()">Open Modal</button>&nbsp;
    <button @click="modal.open({ view: 'Networks' })">Open Networks</button>&nbsp;
    <button @click="getSigner()">Open Wallets</button>&nbsp;
    <p>
      ChainId: {{ chainId }} <br>
      To: <input type="text" v-model="tx.to"> <br>
      Value: <input type="text" v-model="tx.value"> <br>
      Data: <input type="text" v-model="tx.data"> <br>
      GasPrice: <input type="text" v-model="tx.gasPrice"> <br>
      <button @click="sendTransaction()">Send Transaction</button>
    </p>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
