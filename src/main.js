import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5'

const ethersConfig = defaultConfig({
  metadata: {
    name: 'My Dapp',
    description: 'My Dapp Description',
    url: 'mydapp.com',
    icons: ['https://mydapp-logo.png']
  },
})

// 3. Create modal
const modal = createWeb3Modal({
  ethersConfig: { ...ethersConfig, email: true },
  projectId: 'b011808e8bd2a2dfda13334db8afab70',
  themeMode: 'light'
})

// 4. Trigger modal programaticaly
const openConnectModalBtn = document.getElementById('open-connect-modal')
const openNetworkModalBtn = document.getElementById('open-network-modal')

openConnectModalBtn.addEventListener('click', () => modal.open())
openNetworkModalBtn.addEventListener('click', () => modal.open({ view: 'Networks' }))

get_signer.addEventListener('click', async () => {
  const walletProvider = modal.getWalletProvider()
  const ethersProvider = new BrowserProvider(walletProvider)
  const ret = await ethersProvider.getSigner()
  console.log(ret)
  signer.value = ret.address
})

