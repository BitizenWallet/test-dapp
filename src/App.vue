<script setup lang="ts">
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/vue'
const projectId = 'b011808e8bd2a2dfda13334db8afab70'

const metadata = {
  name: 'My Dapp',
  description: 'My Dapp Description',
  url: 'mydapp.com',
  icons: ['https://mydapp-logo.png']
}

const ethersConfig = defaultConfig({
  metadata,
})

const modal = createWeb3Modal({
  ethersConfig,
  projectId,
  enableAnalytics: true // Optional - defaults to your Cloud configuration  
})
</script>

<template>
  <main>
    <button @click="modal.open()">Open Modal</button>
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
