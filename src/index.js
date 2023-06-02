// eslint-disable-next-line camelcase
import {
  encrypt,
  recoverPersonalSignature,
  recoverTypedSignatureLegacy,
  recoverTypedSignature,
  recoverTypedSignature_v4 as recoverTypedSignatureV4,
} from 'eth-sig-util';
import { BigNumber, ethers } from 'ethers';
import { toChecksumAddress } from 'ethereumjs-util';
import {
  hstBytecode,
  hstAbi,
  piggybankBytecode,
  piggybankAbi,
  collectiblesAbi,
  collectiblesBytecode,
  failingContractAbi,
  failingContractBytecode,
} from './assets/constants.json';
import _ERC20Abi from './assets/erc20.json';
import _ERC721Abi from './assets/erc721.json';
import _ERC1155Abi from './assets/erc1155.json';
import _LIFIAbi from './assets/lifi.json';
import _BitizenGateway from './assets/bitizengateway.json';
const ABI_LIST = {
  "ERC20": _ERC20Abi,
  "ERC721": _ERC721Abi,
  "ERC1155": _ERC1155Abi,
}
import WalletConnectProvider from "@walletconnect/web3-provider";
import BitizenConnectProvider from "@bitizenwallet/connector-web3-provider";

let walletConnectV1Provider = {
  connected: false,
  on: () => { },
};

let bitizenConnectV1Provider = {
  connected: false,
  on: () => { },
};

let ethersProvider;
let hstFactory;
let piggybankFactory;
let collectiblesFactory;
let failingContractFactory;

const isMetaMaskInstalled = () => window.ethereum != null;

let ether3um = window.ethereum;

const getFullNameFromAbi = (a) => a.name + '(' + a.inputs.map(item => item.type).join(',') + ')';

// Dapp Status Section
const networkDiv = document.getElementById('network');
const chainIdDiv = document.getElementById('chainId');
const accountsDiv = document.getElementById('accounts');
const warningDiv = document.getElementById('warning');
const currentBalanceDiv = document.getElementById('currentBalance');

// Basic Actions Section
const onboardButton = document.getElementById('connectButton');
const getAccountsButton = document.getElementById('getAccounts');
const getAccountsResults = document.getElementById('getAccountsResult');

// WalletConnect V1
const walletConnectV1ConnectButton = document.getElementById('walletConnectV1ConnectButton');
const walletConnectV1DisconnectButton = document.getElementById('walletConnectV1DisconnectButton');

// Bitizen Connect
const bitizenConnectV1ConnectButton = document.getElementById('bitizenConnectV1ConnectButton');
const bitizenConnectV1DisconnectButton = document.getElementById('bitizenConnectV1DisconnectButton');

// Multi Chain Actions Section
const onboardButtonMultiChain = document.getElementById('connectButtonMultiChain');
const selectChainsOptions = document.getElementById('selectChains');
const selectAccountsOptions = Array.prototype.slice.call(document.getElementsByClassName('bitizen-selectAccounts'));
const requestAccountsMultiChainButton = document.getElementById('requestAccountsMultiChain');
const balancesMultiChainDiv = document.getElementById('balancesMultiChain');

// Custom Contract Interaction Section
const customFormAction = document.getElementById('customFormAction');
const customContractInteractionStaff = document.getElementById('customContractInteractionStaff');
const customFormTxType = document.getElementById('customFormTxType');
const customFormGasPriceDiv = document.getElementById('customFormGasPriceDiv');
const customFormMaxFeeDiv = document.getElementById('customFormMaxFeeDiv');
const customFormMaxPriorityDiv = document.getElementById('customFormMaxPriorityDiv');
const customFormFrom = document.getElementById('customFormFrom');
const customFormGasPrice = document.getElementById('customFormGasPrice');
const customFormMaxFee = document.getElementById('customFormMaxFee');
const customFormMaxPriority = document.getElementById('customFormMaxPriority');
const customFormGasLimit = document.getElementById('customFormGasLimit');
const customFormValue = document.getElementById('customFormValue');
const customFormContract = document.getElementById('customFormContract');
const submitCustomFormButton = document.getElementById('submitCustomForm');

// Custom RPC Request Form
const customRpcRequestButton = document.getElementById('customRpcRequestButton');

// Permissions Actions Section
const requestPermissionsButton = document.getElementById('requestPermissions');
const getPermissionsButton = document.getElementById('getPermissions');
const permissionsResult = document.getElementById('permissionsResult');

// Contract Section
const deployButton = document.getElementById('deployButton');
const depositButton = document.getElementById('depositButton');
const withdrawButton = document.getElementById('withdrawButton');
const contractStatus = document.getElementById('contractStatus');
const deployFailingButton = document.getElementById('deployFailingButton');
const sendFailingButton = document.getElementById('sendFailingButton');
const failingContractStatus = document.getElementById('failingContractStatus');

// Collectibles Section
const deployCollectiblesButton = document.getElementById(
  'deployCollectiblesButton',
);
const mintButton = document.getElementById('mintButton');
const mintAmountInput = document.getElementById('mintAmountInput');
const collectiblesStatus = document.getElementById('collectiblesStatus');

// Send Eth Section
const sendButton = document.getElementById('sendButton');
const sendEIP1559Button = document.getElementById('sendEIP1559Button');

// Send Tokens Section
const tokenAddress = document.getElementById('tokenAddress');
const createToken = document.getElementById('createToken');
const watchAsset = document.getElementById('watchAsset');
const watchTBT = document.getElementById('watchTBT');
const transferTokens = document.getElementById('transferTokens');
const approveTokens = document.getElementById('approveTokens');
const transferTokensWithoutGas = document.getElementById(
  'transferTokensWithoutGas',
);
const approveTokensWithoutGas = document.getElementById(
  'approveTokensWithoutGas',
);

// Encrypt / Decrypt Section
const getEncryptionKeyButton = document.getElementById(
  'getEncryptionKeyButton',
);
const encryptMessageInput = document.getElementById('encryptMessageInput');
const encryptButton = document.getElementById('encryptButton');
const decryptButton = document.getElementById('decryptButton');
const encryptionKeyDisplay = document.getElementById('encryptionKeyDisplay');
const ciphertextDisplay = document.getElementById('ciphertextDisplay');
const cleartextDisplay = document.getElementById('cleartextDisplay');

// Ethereum Signature Section
const ethSign = document.getElementById('ethSign');
const ethSignResult = document.getElementById('ethSignResult');
const personalSign = document.getElementById('personalSign');
const personalSignResult = document.getElementById('personalSignResult');
const personalSignVerify = document.getElementById('personalSignVerify');
const personalSignVerifySigUtilResult = document.getElementById(
  'personalSignVerifySigUtilResult',
);
const personalSignVerifyECRecoverResult = document.getElementById(
  'personalSignVerifyECRecoverResult',
);
const signTypedData = document.getElementById('signTypedData');
const signTypedDataResult = document.getElementById('signTypedDataResult');
const signTypedDataVerify = document.getElementById('signTypedDataVerify');
const signTypedDataVerifyResult = document.getElementById(
  'signTypedDataVerifyResult',
);
const signTypedDataV3 = document.getElementById('signTypedDataV3');
const signTypedDataV3Result = document.getElementById('signTypedDataV3Result');
const signTypedDataV3Verify = document.getElementById('signTypedDataV3Verify');
const signTypedDataV3VerifyResult = document.getElementById(
  'signTypedDataV3VerifyResult',
);
const signTypedDataV4 = document.getElementById('signTypedDataV4');
const signTypedDataV4Result = document.getElementById('signTypedDataV4Result');
const signTypedDataV4Verify = document.getElementById('signTypedDataV4Verify');
const signTypedDataV4VerifyResult = document.getElementById(
  'signTypedDataV4VerifyResult',
);
const signPermit = document.getElementById('signPermit');
const signPermitResult = document.getElementById('signPermitResult');

// Send form section
const fromDiv = document.getElementById('fromInput');
const toDiv = document.getElementById('toInput');
const type = document.getElementById('typeInput');
const amount = document.getElementById('amountInput');
const gasPrice = document.getElementById('gasInput');
const maxFee = document.getElementById('maxFeeInput');
const maxPriority = document.getElementById('maxPriorityFeeInput');
const data = document.getElementById('dataInput');
const gasPriceDiv = document.getElementById('gasPriceDiv');
const maxFeeDiv = document.getElementById('maxFeeDiv');
const maxPriorityDiv = document.getElementById('maxPriorityDiv');
const submitFormButton = document.getElementById('submitForm');

// Miscellaneous
const addEthereumChain = document.getElementById('addEthereumChain');
const switchEthereumChain = document.getElementById('switchEthereumChain');

// Deep Linking Test
const dlTestUri = document.getElementById('dlTestUri');
const dlTestButton = document.getElementById('dlTestButton');
const ulTestButton = document.getElementById('ulTestButton');
const wclTestButton = document.getElementById('wclTestButton');

// Bitizen Gateway
const wrapToBitizenGateway = document.getElementById('wrapToBitizenGateway');
const bitizenGatewayRawTransacion = document.getElementById('bitizenGatewayRawTransacion');

const copyObjectWithoutNumberKeys = (obj) => {
  if (obj instanceof Array && Object.keys(obj).filter((key) => !isNaN(key)).length === 1) {
    return obj.map((o) => copyObjectWithoutNumberKeys(o));
  }
  if (obj instanceof BigNumber || !obj || typeof obj !== 'object') {
    return obj;
  }
  const newObj = {};
  for (const key in obj) {
    if (isNaN(key)) {
      newObj[key] = copyObjectWithoutNumberKeys(obj[key]);
    }
  }
  return newObj;
};

dlTestButton.onclick = () => {
  window.open("bitizen://wallet/wc?uri=" + dlTestUri.value);
}

ulTestButton.onclick = () => {
  window.open("https://bitizen.org/wallet/wc?uri=" + dlTestUri.value);
}

wclTestButton.onclick = () => {
  window.open(dlTestUri.value);
}

function initEthers() {
  try {
    // We must specify the network as 'any' for ethers to allow network changes
    ethersProvider = new ethers.providers.Web3Provider(ether3um, 'any');
    hstFactory = new ethers.ContractFactory(
      hstAbi,
      hstBytecode,
      ethersProvider.getSigner(),
    );
    piggybankFactory = new ethers.ContractFactory(
      piggybankAbi,
      piggybankBytecode,
      ethersProvider.getSigner(),
    );
    collectiblesFactory = new ethers.ContractFactory(
      collectiblesAbi,
      collectiblesBytecode,
      ethersProvider.getSigner(),
    );
    failingContractFactory = new ethers.ContractFactory(
      failingContractAbi,
      failingContractBytecode,
      ethersProvider.getSigner(),
    );
  } catch (error) {
    console.error('initEthers', error);
  }
}

const initialize = async () => {

  initEthers()

  let chainInfos = {};
  let accounts;
  let multiChainAccounts;
  let accountButtonsInitialized = false;
  fetch("https://chainid.network/chains.json").then(response => response.json()).then(data => {
    data.forEach(chain => {
      chainInfos[chain.chainId] = chain.name;
    })
  })

  // initialize the custom contract interaction
  const onCustonFormActionsChanged = (contractType, newAction) => {
    customContractInteractionStaff.innerHTML = '';
    ABI_LIST[contractType].filter(a => getFullNameFromAbi(a) == newAction && a.stateMutability !== 'view' && a.type === 'function')[0].inputs.forEach((field, index) => {
      customContractInteractionStaff.innerHTML += `
        <div class="form-group">
          <label>`+ field.name + ` (` + field.type + `)</label>
          <input class="form-control border-primary" type="text"id="ca-`+ newAction + `-` + index + `"/>
        </div>
      `;
    })
  }

  customFormAction.addEventListener('change', async (ev) => {
    const [contractType, newAction] = ev.target.value.split("#")
    onCustonFormActionsChanged(contractType, newAction);
  })

  customFormAction.innerHTML = '';
  for (const key in ABI_LIST) {
    if (Object.hasOwnProperty.call(ABI_LIST, key)) {
      ABI_LIST[key].filter(a => a.name && a.stateMutability !== 'view' && a.type === 'function').forEach(a => {
        const aNameFull = getFullNameFromAbi(a);
        if (!customFormAction.value) {
          customFormAction.value = aNameFull
          onCustonFormActionsChanged(key, aNameFull)
        }
        customFormAction.innerHTML += '<option value="' + key + '#' + aNameFull + '">' + key + '#' + aNameFull + '</option>';
      })
    }
  }

  selectChainsOptions.addEventListener('change', (event) => {
    ether3um.chainId = event.target.value;
    handleNewAccountsMultiChain(multiChainAccounts, Object.keys(multiChainAccounts).findIndex((chainId) => '0x' + parseInt(chainId).toString(16) == ether3um.chainId));
  });

  selectAccountsOptions.forEach(sel => sel.addEventListener('change', (event) => {
    const a = accounts[0];
    accounts[accounts.findIndex((account) => account == event.target.value)] = a;
    accounts[0] = event.target.value;
    multiChainAccounts[parseInt(ether3um.chainId, 16)] = accounts;
    handleNewAccountsMultiChain(multiChainAccounts, Object.keys(multiChainAccounts).findIndex((chainId) => '0x' + parseInt(chainId).toString(16) == ether3um.chainId));
  }))

  requestAccountsMultiChainButton.onclick = () => onClickConnectMultiChain();

  const accountButtons = [
    deployButton,
    depositButton,
    withdrawButton,
    deployCollectiblesButton,
    mintButton,
    mintAmountInput,
    deployFailingButton,
    sendFailingButton,
    sendButton,
    createToken,
    watchAsset,
    transferTokens,
    approveTokens,
    transferTokensWithoutGas,
    approveTokensWithoutGas,
    getEncryptionKeyButton,
    encryptMessageInput,
    encryptButton,
    decryptButton,
    ethSign,
    personalSign,
    personalSignVerify,
    signTypedData,
    signTypedDataVerify,
    signTypedDataV3,
    signTypedDataV3Verify,
    signTypedDataV4,
    signTypedDataV4Verify,
    signPermit,
  ];

  const isMetaMaskConnected = () => accounts && accounts.length > 0;

  const onClickConnectMultiChain = async () => {
    try {
      const newAccounts = await window.ethereum.request({
        method: 'eth_requestAccountsMultiChain',
      });
      ether3um = window.ethereum;
      initEthers()
      // const newAccounts = {
      //   1: ['0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000001'],
      //   42: ['0x0000000000000000000000000000000000000002', '0x0000000000000000000000000000000000000003'],
      //   128: ['0x0000000000000000000000000000000000000004', '0x0000000000000000000000000000000000000005'],
      // }
      handleNewAccountsMultiChain(newAccounts);
    } catch (error) {
      console.error(error);
    }
  }

  const onClickWCV1Connect = async () => {
    try {
      walletConnectV1Provider = new WalletConnectProvider({
        rpc: { 1: 'https://cloudflare-eth.com/' },
      });
      const newAccounts = await walletConnectV1Provider.enable()
      console.log('onClickWCV1Connect', newAccounts);
      ether3um = walletConnectV1Provider
      initEthers()
      handleNewAccounts(newAccounts)
      getNetworkAndChainId()
    } catch (error) {
      console.error(error);
    }
  }

  const onClickBZCV1Connect = async () => {
    try {
      bitizenConnectV1Provider = new BitizenConnectProvider({
        rpc: { 1: 'https://cloudflare-eth.com/' }
      });
      const newAccounts = await bitizenConnectV1Provider.enable()
      console.log('onClickBZCV1Connect', newAccounts);
      ether3um = bitizenConnectV1Provider
      initEthers()
      handleNewAccounts(newAccounts)
      getNetworkAndChainId()
    } catch (error) {
      console.error(error);
    }
  }

  const onClickConnect = async () => {
    try {
      const newAccounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      ether3um = window.ethereum;
      initEthers()
      handleNewAccounts(newAccounts)
      getNetworkAndChainId()
    } catch (error) {
      console.error(error);
    }
  };

  const clearTextDisplays = () => {
    encryptionKeyDisplay.innerText = '';
    encryptMessageInput.value = '';
    ciphertextDisplay.innerText = '';
    cleartextDisplay.innerText = '';
  };

  const updateButtons = () => {
    const accountButtonsDisabled =
      !isMetaMaskConnected();
    if (accountButtonsDisabled) {
      for (const button of accountButtons) {
        button.disabled = true;
      }
      clearTextDisplays();
    } else {
      deployButton.disabled = false;
      deployCollectiblesButton.disabled = false;
      sendButton.disabled = false;
      deployFailingButton.disabled = false;
      createToken.disabled = false;
      personalSign.disabled = false;
      signTypedData.disabled = false;
      getEncryptionKeyButton.disabled = false;
      ethSign.disabled = false;
      personalSign.disabled = false;
      signTypedData.disabled = false;
      signTypedDataV3.disabled = false;
      signTypedDataV4.disabled = false;
      signPermit.disabled = false;
    }

    addEthereumChain.disabled = false;
    switchEthereumChain.disabled = false;
    watchTBT.disabled = false;

    if (walletConnectV1Provider.connected) {
      walletConnectV1DisconnectButton.style.display = 'block';
      walletConnectV1DisconnectButton.onclick = async () => {
        console.log("walletConnectV1DisconnectButton.onclick");
        await walletConnectV1Provider.disconnect()
        window.location.reload()
      };
      walletConnectV1ConnectButton.style.display = 'none';
      return;
    } else {
      walletConnectV1DisconnectButton.style.display = 'none';
      walletConnectV1ConnectButton.innerText = 'Connect (WalletConnectV1)';
      walletConnectV1ConnectButton.disabled = false;
      walletConnectV1ConnectButton.onclick = onClickWCV1Connect;
    }

    if (bitizenConnectV1Provider.connected) {
      bitizenConnectV1DisconnectButton.style.display = 'block';
      bitizenConnectV1DisconnectButton.onclick = async () => {
        console.log("bitizenConnectV1DisconnectButton.onclick");
        await bitizenConnectV1Provider.disconnect()
        window.location.reload()
      };
      bitizenConnectV1ConnectButton.style.display = 'none';
      return;
    } else {
      bitizenConnectV1DisconnectButton.style.display = 'none';
      bitizenConnectV1ConnectButton.innerText = 'Connect (Bitzen)';
      bitizenConnectV1ConnectButton.disabled = false;
      bitizenConnectV1ConnectButton.onclick = onClickBZCV1Connect;
    }

    if (isMetaMaskConnected()) {
      onboardButton.innerText = 'Connected (injectWeb3)';
      onboardButton.disabled = true;
      if (ether3um && ether3um.isBitizen) {
        onboardButtonMultiChain.innerText = 'Connected';
        onboardButtonMultiChain.disabled = true;
      }
    } else {
      onboardButton.innerText = 'Connect (injectWeb3)';
      onboardButton.onclick = onClickConnect;
      onboardButton.disabled = false;
      if (ether3um && ether3um.isBitizen) {
        onboardButtonMultiChain.innerText = 'Connect';
        onboardButtonMultiChain.onclick = onClickConnectMultiChain;
        onboardButtonMultiChain.disabled = false;
      }
    }
  };

  addEthereumChain.onclick = async () => {
    await ether3um.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x2AC2',
          rpcUrls: ["https://rpc.quadrans.io",
            "https://rpcna.quadrans.io",
            "https://rpceu.quadrans.io"],
          chainName: 'Quadrans Blockchain',
          nativeCurrency: { name: 'Quadrans Coin', decimals: 18, symbol: 'QDC' },
          blockExplorerUrls: ['https://explorer.quadrans.io'],
        },
      ],
    });
  };

  switchEthereumChain.onclick = async () => {
    await ether3um.request({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: '0x2AC2',
        },
      ],
    });
  };

  const initializeAccountButtons = () => {
    if (accountButtonsInitialized) {
      return;
    }
    accountButtonsInitialized = true;

    /**
     * Contract Interactions
     */

    deployButton.onclick = async () => {
      let contract;
      contractStatus.innerHTML = 'Deploying';

      try {
        contract = await piggybankFactory.deploy();
        await contract.deployTransaction.wait();
      } catch (error) {
        contractStatus.innerHTML = 'Deployment Failed';
        throw error;
      }

      if (contract.address === undefined) {
        return;
      }

      console.log(
        `Contract mined! address: ${contract.address} transactionHash: ${contract.transactionHash}`,
      );
      contractStatus.innerHTML = 'Deployed';
      depositButton.disabled = false;
      withdrawButton.disabled = false;

      depositButton.onclick = async () => {
        contractStatus.innerHTML = 'Deposit initiated';
        const result = await contract.deposit({
          from: accounts[0],
          value: '0x3782dace9d900000',
        });
        console.log(result);
        const receipt = await result.wait();
        console.log(receipt);
        contractStatus.innerHTML = 'Deposit completed';
      };

      withdrawButton.onclick = async () => {
        const result = await contract.withdraw('0xde0b6b3a7640000', {
          from: accounts[0],
        });
        console.log(result);
        const receipt = await result.wait();
        console.log(receipt);
        contractStatus.innerHTML = 'Withdrawn';
      };

      console.log(contract);
    };

    deployFailingButton.disabled = false;

    deployFailingButton.onclick = async () => {
      let failingContractDeployed;
      failingContractStatus.innerHTML = 'Deploying';

      try {
        failingContractDeployed = await failingContractFactory.deploy();
        await failingContractDeployed.deployTransaction.wait();
      } catch (error) {
        failingContractStatus.innerHTML = 'Deployment Failed';
        throw error;
      }

      if (failingContractDeployed.address === undefined) {
        return;
      }

      console.log(
        `Contract mined! address: ${failingContractDeployed.address} transactionHash: ${failingContractDeployed.transactionHash}`,
      );
      failingContractStatus.innerHTML = 'Deployed';

      sendFailingButton.disabled = false;

      sendFailingButton.onclick = async () => {
        try {
          const result = await ether3um.request({
            method: 'eth_sendTransaction',
            params: [
              {
                from: accounts[0],
                to: failingContractDeployed.address,
                value: '0x0',
                gasLimit: '0x5028',
                maxFeePerGas: '0x2540be400',
                maxPriorityFeePerGas: '0x3b9aca00',
              },
            ],
          });
          failingContractStatus.innerHTML =
            'Failed transaction process completed as expected.';
          console.log('send failing contract result', result);
        } catch (error) {
          console.log('error', error);
          throw error;
        }
      };
    };

    /**
     * ERC721 Token
     */

    deployCollectiblesButton.onclick = async () => {
      let contract;
      collectiblesStatus.innerHTML = 'Deploying';

      try {
        contract = await collectiblesFactory.deploy();
        await contract.deployTransaction.wait();
      } catch (error) {
        collectiblesStatus.innerHTML = 'Deployment Failed';
        throw error;
      }

      if (contract.address === undefined) {
        return;
      }

      console.log(
        `Contract mined! address: ${contract.address} transactionHash: ${contract.transactionHash}`,
      );
      collectiblesStatus.innerHTML = 'Deployed';
      mintButton.disabled = false;
      mintAmountInput.disabled = false;

      mintButton.onclick = async () => {
        collectiblesStatus.innerHTML = 'Mint initiated';
        let result = await contract.mintCollectibles(mintAmountInput.value, {
          from: accounts[0],
        });
        result = await result.wait();
        console.log(result);
        collectiblesStatus.innerHTML = 'Mint completed';
      };

      console.log(contract);
    };

    /**
     * Sending ETH
     */

    sendButton.onclick = async () => {
      const result = await ether3um.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: accounts[0],
            to: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
            value: '0x0',
            gasLimit: '0x5028',
            gasPrice: '0x2540be400',
            type: '0x0',
          },
        ],
      });
      console.log(result);
    };

    sendEIP1559Button.onclick = async () => {
      const result = await ether3um.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: accounts[0],
            to: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
            value: '0x0',
            gasLimit: '0x5028',
            maxFeePerGas: '0x2540be400',
            maxPriorityFeePerGas: '0x3b9aca00',
          },
        ],
      });
      console.log(result);
    };

    watchTBT.onclick = async () => {
      const result = await ether3um.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: '0xce5b0b1748d6bb4897ba00e41ebc17b00b980f4d',
            symbol: 'TBT',
            decimals: 18,
            image: 'https://metamask.github.io/test-dapp/metamask-fox.svg',
          },
        },
      });
      console.log('result', result);
    };

    /**
     * ERC20 Token
     */

    createToken.onclick = async () => {
      const _initialAmount = 100;
      const _tokenName = 'TST';
      const _decimalUnits = 4;
      const _tokenSymbol = 'TST';

      try {
        const contract = await hstFactory.deploy(
          _initialAmount,
          _tokenName,
          _decimalUnits,
          _tokenSymbol,
        );
        await contract.deployTransaction.wait();
        if (contract.address === undefined) {
          return undefined;
        }

        console.log(
          `Contract mined! address: ${contract.address} transactionHash: ${contract.transactionHash}`,
        );
        tokenAddress.innerHTML = contract.address;
        watchAsset.disabled = false;
        transferTokens.disabled = false;
        approveTokens.disabled = false;
        transferTokensWithoutGas.disabled = false;
        approveTokensWithoutGas.disabled = false;

        watchAsset.onclick = async () => {
          const result = await ether3um.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20',
              options: {
                address: contract.address,
                symbol: _tokenSymbol,
                decimals: _decimalUnits,
                image: 'https://metamask.github.io/test-dapp/metamask-fox.svg',
              },
            },
          });
          console.log('result', result);
        };

        transferTokens.onclick = async () => {
          const result = await contract.transfer(
            '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
            '15000',
            {
              from: accounts[0],
              gasLimit: 60000,
              gasPrice: '20000000000',
            },
          );
          console.log('result', result);
        };

        approveTokens.onclick = async () => {
          const result = await contract.approve(
            '0x9bc5baF874d2DA8D216aE9f137804184EE5AfEF4',
            '70000',
            {
              from: accounts[0],
              gasLimit: 60000,
              gasPrice: '20000000000',
            },
          );
          console.log(result);
        };

        transferTokensWithoutGas.onclick = async () => {
          const result = await contract.transfer(
            '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
            '15000',
            {
              gasPrice: '20000000000',
            },
          );
          console.log('result', result);
        };

        approveTokensWithoutGas.onclick = async () => {
          const result = await contract.approve(
            '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
            '70000',
            {
              gasPrice: '20000000000',
            },
          );
          console.log(result);
        };

        return contract;
      } catch (error) {
        tokenAddress.innerHTML = 'Creation Failed';
        throw error;
      }
    };

    /**
     * Permissions
     */

    requestPermissionsButton.onclick = async () => {
      try {
        const permissionsArray = await ether3um.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
        permissionsResult.innerHTML =
          getPermissionsDisplayString(permissionsArray);
      } catch (err) {
        console.error(err);
        permissionsResult.innerHTML = `Error: ${err.message}`;
      }
    };

    getPermissionsButton.onclick = async () => {
      try {
        const permissionsArray = await ether3um.request({
          method: 'wallet_getPermissions',
        });
        permissionsResult.innerHTML =
          getPermissionsDisplayString(permissionsArray);
      } catch (err) {
        console.error(err);
        permissionsResult.innerHTML = `Error: ${err.message}`;
      }
    };

    getAccountsButton.onclick = async () => {
      try {
        const _accounts = await ether3um.request({
          method: 'eth_accounts',
        });
        getAccountsResults.innerHTML =
          _accounts[0] || 'Not able to get accounts';
      } catch (err) {
        console.error(err);
        getAccountsResults.innerHTML = `Error: ${err.message}`;
      }
    };

    /**
     * Encrypt / Decrypt
     */

    getEncryptionKeyButton.onclick = async () => {
      try {
        encryptionKeyDisplay.innerText = await ether3um.request({
          method: 'eth_getEncryptionPublicKey',
          params: [accounts[0]],
        });
        encryptMessageInput.disabled = false;
      } catch (error) {
        encryptionKeyDisplay.innerText = `Error: ${error.message}`;
        encryptMessageInput.disabled = true;
        encryptButton.disabled = true;
        decryptButton.disabled = true;
      }
    };

    encryptMessageInput.onkeyup = () => {
      if (
        !getEncryptionKeyButton.disabled &&
        encryptMessageInput.value.length > 0
      ) {
        if (encryptButton.disabled) {
          encryptButton.disabled = false;
        }
      } else if (!encryptButton.disabled) {
        encryptButton.disabled = true;
      }
    };

    encryptButton.onclick = () => {
      try {
        ciphertextDisplay.innerText = stringifiableToHex(
          encrypt(
            encryptionKeyDisplay.innerText,
            { data: encryptMessageInput.value },
            'x25519-xsalsa20-poly1305',
          ),
        );
        decryptButton.disabled = false;
      } catch (error) {
        ciphertextDisplay.innerText = `Error: ${error.message}`;
        decryptButton.disabled = true;
      }
    };

    decryptButton.onclick = async () => {
      try {
        cleartextDisplay.innerText = await ether3um.request({
          method: 'eth_decrypt',
          params: [ciphertextDisplay.innerText, ether3um.selectedAddress],
        });
      } catch (error) {
        cleartextDisplay.innerText = `Error: ${error.message}`;
      }
    };
  };

  customFormTxType.onchange = async () => {
    if (customFormTxType.value === '0x0') {
      customFormGasPriceDiv.style.display = 'block';
      customFormMaxFeeDiv.style.display = 'none';
      customFormMaxPriorityDiv.style.display = 'none';
    } else {
      customFormGasPriceDiv.style.display = 'none';
      customFormMaxFeeDiv.style.display = 'block';
      customFormMaxPriorityDiv.style.display = 'block';
    }
  };

  type.onchange = async () => {
    if (type.value === '0x0') {
      gasPriceDiv.style.display = 'block';
      maxFeeDiv.style.display = 'none';
      maxPriorityDiv.style.display = 'none';
    } else {
      gasPriceDiv.style.display = 'none';
      maxFeeDiv.style.display = 'block';
      maxPriorityDiv.style.display = 'block';
    }
  };

  customRpcRequestButton.onclick = async () => {
    await ether3um.request(JSON.parse(document.getElementById('customRpcRequestPayload').value.replace(/(\r\n|\n|\r)/gm, "")));
  }

  submitCustomFormButton.onclick = async () => {
    let params;
    let [contractType, actionName] = customFormAction.value.split('#')
    let iface = new ethers.utils.Interface(ABI_LIST[contractType]);
    let inputs = [];
    customContractInteractionStaff.querySelectorAll("input").forEach(input => {
      inputs.push((input.value.startsWith("[") && input.value.endsWith("]")) ? JSON.parse(input.value.replace(/(\r\n|\n|\r)/gm, "")) : input.value);
    })
    if (customFormTxType.value === '0x0') {
      params = [
        {
          from: customFormFrom.value,
          to: customFormContract.value,
          gasPrice: customFormGasPrice.value,
          value: customFormValue.value,
          gasLimit: customFormGasLimit.value,
          data: iface.encodeFunctionData(actionName, inputs),
          type: customFormTxType.value,
        },
      ];
    } else {
      params = [
        {
          from: customFormFrom.value,
          to: customFormContract.value,
          maxFeePerGas: customFormMaxFee.value,
          maxPriorityFeePerGas: customFormMaxPriority.value,
          value: customFormValue.value,
          gasLimit: customFormGasLimit.value,
          data: iface.encodeFunctionData(actionName, inputs),
          type: customFormTxType.value,
        },
      ];
    }
    const result = await ether3um.request({
      method: 'eth_sendTransaction',
      params,
    });
    console.log(result);
  };

  submitFormButton.onclick = async () => {
    let params;
    if (type.value === '0x0') {
      params = [
        {
          from: accounts[0],
          to: toDiv.value,
          value: amount.value,
          gasPrice: gasPrice.value,
          type: type.value,
          data: data.value,
        },
      ];
    } else {
      params = [
        {
          from: accounts[0],
          to: toDiv.value,
          value: amount.value,
          maxFeePerGas: maxFee.value,
          maxPriorityFeePerGas: maxPriority.value,
          type: type.value,
          data: data.value,
        },
      ];
    }
    const result = await ether3um.request({
      method: 'eth_sendTransaction',
      params,
    });
    console.log(result);
  };

  /**
   * eth_sign
   */
  ethSign.onclick = async () => {
    try {
      // const msg = 'Sample message to hash for signature'
      // const msgHash = keccak256(msg)
      const msg =
        '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0';
      const ethResult = await ether3um.request({
        method: 'eth_sign',
        params: [accounts[0], msg],
      });
      ethSignResult.innerHTML = JSON.stringify(ethResult);
    } catch (err) {
      console.error(err);
      ethSign.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Personal Sign
   */
  personalSign.onclick = async () => {
    const exampleMessage = 'Example `personal_sign` message';
    try {
      const from = accounts[0];
      const msg = `0x${Buffer.from(exampleMessage, 'utf8').toString('hex')}`;
      const sign = await ether3um.request({
        method: 'personal_sign',
        params: [msg, from, 'Example password'],
      });
      personalSignResult.innerHTML = sign;
      personalSignVerify.disabled = false;
    } catch (err) {
      console.error(err);
      personalSign.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Personal Sign Verify
   */
  personalSignVerify.onclick = async () => {
    const exampleMessage = 'Example `personal_sign` message';
    try {
      const from = accounts[0];
      const msg = `0x${Buffer.from(exampleMessage, 'utf8').toString('hex')}`;
      const sign = personalSignResult.innerHTML;
      const recoveredAddr = recoverPersonalSignature({
        data: msg,
        sig: sign,
      });
      if (recoveredAddr.toLowerCase() === from.toLowerCase()) {
        console.log(`SigUtil Successfully verified signer as ${recoveredAddr}`);
        personalSignVerifySigUtilResult.innerHTML = recoveredAddr;
      } else {
        console.log(
          `SigUtil Failed to verify signer when comparing ${recoveredAddr} to ${from}`,
        );
        console.log(`Failed comparing ${recoveredAddr} to ${from}`);
      }
      const ecRecoverAddr = await ether3um.request({
        method: 'personal_ecRecover',
        params: [msg, sign],
      });
      if (ecRecoverAddr.toLowerCase() === from.toLowerCase()) {
        console.log(`Successfully ecRecovered signer as ${ecRecoverAddr}`);
        personalSignVerifyECRecoverResult.innerHTML = ecRecoverAddr;
      } else {
        console.log(
          `Failed to verify signer when comparing ${ecRecoverAddr} to ${from}`,
        );
      }
    } catch (err) {
      console.error(err);
      personalSignVerifySigUtilResult.innerHTML = `Error: ${err.message}`;
      personalSignVerifyECRecoverResult.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Sign Typed Data Test
   */
  signTypedData.onclick = async () => {
    const msgParams = [
      {
        type: 'string',
        name: 'Message',
        value: 'Hi, Alice!',
      },
      {
        type: 'uint32',
        name: 'A number',
        value: '1337',
      },
    ];
    try {
      const from = accounts[0];
      const sign = await ether3um.request({
        method: 'eth_signTypedData',
        params: [JSON.stringify(msgParams), from],
      });
      signTypedDataResult.innerHTML = sign;
      signTypedDataVerify.disabled = false;
    } catch (err) {
      console.error(err);
      signTypedDataResult.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Sign Typed Data Verification
   */
  signTypedDataVerify.onclick = async () => {
    const msgParams = [
      {
        type: 'string',
        name: 'Message',
        value: 'Hi, Alice!',
      },
      {
        type: 'uint32',
        name: 'A number',
        value: '1337',
      },
    ];
    try {
      const from = accounts[0];
      const sign = signTypedDataResult.innerHTML;
      const recoveredAddr = await recoverTypedSignatureLegacy({
        data: msgParams,
        sig: sign,
      });
      if (toChecksumAddress(recoveredAddr) === toChecksumAddress(from)) {
        console.log(`Successfully verified signer as ${recoveredAddr}`);
        signTypedDataVerifyResult.innerHTML = recoveredAddr;
      } else {
        console.log(
          `Failed to verify signer when comparing ${recoveredAddr} to ${from}`,
        );
      }
    } catch (err) {
      console.error(err);
      signTypedDataV3VerifyResult.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Sign Typed Data Version 3 Test
   */
  signTypedDataV3.onclick = async () => {
    const networkId = parseInt(networkDiv.innerHTML, 10);
    const chainId = parseInt(chainIdDiv.innerHTML, 16) || networkId;

    const msgParams = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      primaryType: 'Mail',
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      message: {
        from: {
          name: 'Cow',
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        to: {
          name: 'Bob',
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: 'Hello, Bob!',
      },
    };
    try {
      const from = accounts[0];
      const sign = await ether3um.request({
        method: 'eth_signTypedData_v3',
        params: [from, JSON.stringify(msgParams)],
      });
      signTypedDataV3Result.innerHTML = sign;
      signTypedDataV3Verify.disabled = false;
    } catch (err) {
      console.error(err);
      signTypedDataV3Result.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Sign Typed Data V3 Verification
   */
  signTypedDataV3Verify.onclick = async () => {
    const networkId = parseInt(networkDiv.innerHTML, 10);
    const chainId = parseInt(chainIdDiv.innerHTML, 16) || networkId;

    const msgParams = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      primaryType: 'Mail',
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      message: {
        from: {
          name: 'Cow',
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        to: {
          name: 'Bob',
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: 'Hello, Bob!',
      },
    };
    try {
      const from = accounts[0];
      const sign = signTypedDataV3Result.innerHTML;
      const recoveredAddr = await recoverTypedSignature({
        data: msgParams,
        sig: sign,
      });
      if (toChecksumAddress(recoveredAddr) === toChecksumAddress(from)) {
        console.log(`Successfully verified signer as ${recoveredAddr}`);
        signTypedDataV3VerifyResult.innerHTML = recoveredAddr;
      } else {
        console.log(
          `Failed to verify signer when comparing ${recoveredAddr} to ${from}`,
        );
      }
    } catch (err) {
      console.error(err);
      signTypedDataV3VerifyResult.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Sign Typed Data V4
   */
  signTypedDataV4.onclick = async () => {
    const networkId = parseInt(networkDiv.innerHTML, 10);
    const chainId = parseInt(chainIdDiv.innerHTML, 16) || networkId;
    const msgParams = {
      domain: {
        name: 'Ether Mail',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        version: '1',
        chainId,
      },
      message: {
        contents: 'Hello, Bob!',
        from: {
          name: 'Cow',
          wallets: [
            '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
            '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
          ],
        },
        to: [
          {
            name: 'Bob',
            wallets: [
              '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
              '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
              '0xB0B0b0b0b0b0B000000000000000000000000000',
            ],
          },
        ],
      },
      primaryType: 'Mail',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Group: [
          { name: 'name', type: 'string' },
          { name: 'members', type: 'Person[]' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person[]' },
          { name: 'contents', type: 'string' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallets', type: 'address[]' },
        ],
      },
    };
    try {
      const from = accounts[0];
      const sign = await ether3um.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(msgParams)],
      });
      signTypedDataV4Result.innerHTML = sign;
      signTypedDataV4Verify.disabled = false;
    } catch (err) {
      console.error(err);
      signTypedDataV4Result.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   *  Sign Typed Data V4 Verification
   */
  signTypedDataV4Verify.onclick = async () => {
    const networkId = parseInt(networkDiv.innerHTML, 10);
    const chainId = parseInt(chainIdDiv.innerHTML, 16) || networkId;
    const msgParams = {
      domain: {
        chainId,
        name: 'Ether Mail',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        version: '1',
      },
      message: {
        contents: 'Hello, Bob!',
        from: {
          name: 'Cow',
          wallets: [
            '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
            '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
          ],
        },
        to: [
          {
            name: 'Bob',
            wallets: [
              '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
              '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
              '0xB0B0b0b0b0b0B000000000000000000000000000',
            ],
          },
        ],
      },
      primaryType: 'Mail',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Group: [
          { name: 'name', type: 'string' },
          { name: 'members', type: 'Person[]' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person[]' },
          { name: 'contents', type: 'string' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallets', type: 'address[]' },
        ],
      },
    };
    try {
      const from = accounts[0];
      const sign = signTypedDataV4Result.innerHTML;
      const recoveredAddr = recoverTypedSignatureV4({
        data: msgParams,
        sig: sign,
      });
      if (toChecksumAddress(recoveredAddr) === toChecksumAddress(from)) {
        console.log(`Successfully verified signer as ${recoveredAddr}`);
        signTypedDataV4VerifyResult.innerHTML = recoveredAddr;
      } else {
        console.log(
          `Failed to verify signer when comparing ${recoveredAddr} to ${from}`,
        );
      }
    } catch (err) {
      console.error(err);
      signTypedDataV4VerifyResult.innerHTML = `Error: ${err.message}`;
    }
  };

  signPermit.onclick = async () => {
    const networkId = parseInt(networkDiv.innerHTML, 10);
    const chainId = parseInt(chainIdDiv.innerHTML, 16) || networkId;
    const from = accounts[0];

    const domain = {
      name: 'MyToken',
      version: '1',
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      chainId,
    };

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'chainId', type: 'uint256' },
    ];

    const permit = {
      owner: from,
      spender: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
      value: 3000,
      nonce: 0,
      deadline: 50000000000,
    };

    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ];

    const msgParams = {
      types: {
        EIP712Domain,
        Permit,
      },
      primaryType: 'Permit',
      domain,
      message: permit,
    };

    try {
      const sign = await ether3um.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(msgParams)],
      });
      signPermitResult.innerHTML = sign;
    } catch (err) {
      console.error(err);
      signPermitResult.innerHTML = `Error: ${err.message}`;
    }
  }

  wrapToBitizenGateway.onclick = async () => {
    const rawTx = bitizenGatewayRawTransacion.value.trim();
    if (!rawTx) {
      alert('Please enter a raw transaction');
      return;
    }
    let iface = new ethers.utils.Interface(_LIFIAbi);
    const signer = ethersProvider.getSigner();
    console.log('signer', signer);
    const bitizenGateway = new ethers.Contract("0xB3284b4Dd4f0E62f5597b79D1137460538fcD4dA", _BitizenGateway, signer);
    console.log('bitizenGateway', bitizenGateway);

    try {
      const res = copyObjectWithoutNumberKeys(iface.decodeFunctionData('swapTokensGeneric', rawTx));
      console.log('swapTokensGeneric', res);
      bitizenGateway.swapTokensGeneric(res._transactionId, res._minAmount, "test-dapp", res._swapData, {
        from: accounts[0],
        value: res._swapData[0].fromAmount.mul(ethers.BigNumber.from(12)).div(ethers.BigNumber.from(10))
      });
      return;
    } catch (error) {
    }

    try {
      let res = copyObjectWithoutNumberKeys(iface.decodeFunctionData('swapAndStartBridgeTokensViaAmarok', rawTx));
      res._bridgeData.integrator = 'bitizen';
      res._bridgeData.referrer = '0xDadada681e6270E1D0181442220A2e5608B11d21';
      console.log('swapAndStartBridgeTokensViaAmarok', res);
      console.log(bitizenGateway, 'params', res._bridgeData, res._swapData, res._amarokData, {
        from: accounts[0],
        value: res._swapData[0].fromAmount.add(res._amarokData.relayerFee).mul(ethers.BigNumber.from(12)).div(ethers.BigNumber.from(10))
      });
      bitizenGateway.swapAndStartBridgeTokensViaAmarok(res._bridgeData, res._swapData, res._amarokData, {
        from: accounts[0],
        value: res._swapData[0].fromAmount.add(res._amarokData.relayerFee).mul(ethers.BigNumber.from(12)).div(ethers.BigNumber.from(10))
      }).catch((e) => console.log(e));
      return;
    } catch (error) {
    }

    alert('Requires a token swap same chain or swap and bridge via amarok')
  }

  function handleNewAccounts(newAccounts) {
    accounts = newAccounts;
    accountsDiv.innerHTML = accounts[0] || '';
    fromDiv.value = accounts[0] || '';
    ether3um.request({ 'method': 'eth_getBalance', 'params': [accounts[0], 'latest'] }).then(resp => currentBalanceDiv.innerHTML = parseInt(resp, 16) / 1e18);
    gasPriceDiv.style.display = 'block';
    maxFeeDiv.style.display = 'none';
    maxPriorityDiv.style.display = 'none';
    if (isMetaMaskConnected()) {
      initializeAccountButtons();
    }
    updateButtons();
    handleAccountsChanged();
  }

  async function updateMultiChainAccountBalances() {
    let innerHTML = '';
    const chainIds = Object.keys(multiChainAccounts);
    for (let i = 0; i < chainIds.length; i++) {
      const chainId = chainIds[i];
      const chainName = chainInfos[chainId];
      innerHTML += '<p class="info-text alert alert-secondary">' + chainName + ':<br>';
      for (let j = 0; j < multiChainAccounts[chainId].length; j++) {
        const account = multiChainAccounts[chainId][j];
        try {
          const resp = await ether3um.request({ 'method': 'eth_getBalance', 'chainId': '0x' + parseInt(chainId).toString(16), 'params': [account, 'latest'] });
          innerHTML += account + ': ' + (parseInt(resp, 16) / 1e18) + '<br>'
        } catch (error) {
          innerHTML += account + ': failed ' + JSON.stringify(error) + '<br>'
        }
      }
      innerHTML += '</p>';
    }
    balancesMultiChainDiv.innerHTML = innerHTML;
  }

  function handleNewAccountsMultiChain(newAccounts, newChainIndex = 0) {
    multiChainAccounts = newAccounts;
    updateMultiChainAccountBalances();

    ether3um.chainId = '0x' + parseInt(Object.keys(newAccounts)[newChainIndex]).toString(16);
    handleNewChain(ether3um.chainId)
    onNetworkChanged(Object.keys(newAccounts)[newChainIndex])
    accounts = newAccounts[Object.keys(newAccounts)[newChainIndex]];
    accountsDiv.innerHTML = accounts[0] || '';
    fromDiv.value = accounts[0] || '';
    ether3um.request({ 'method': 'eth_getBalance', 'params': [accounts[0], 'latest'] }).then(resp => currentBalanceDiv.innerHTML = parseInt(resp, 16) / 1e18);
    gasPriceDiv.style.display = 'block';
    maxFeeDiv.style.display = 'none';
    maxPriorityDiv.style.display = 'none';

    let selectChainsOptionsInnerHtml = '';
    Object.keys(newAccounts).forEach(chainId => {
      selectChainsOptionsInnerHtml += `<option value="0x${parseInt(chainId).toString(16)}" ` + (ether3um.chainId == '0x' + parseInt(chainId).toString(16) ? 'selected' : '') + `>${chainInfos[chainId]}(${chainId})</option>`;
    })
    selectChainsOptions.innerHTML = selectChainsOptionsInnerHtml;

    handleAccountsChanged()
    if (isMetaMaskConnected()) {
      initializeAccountButtons();
    }
    updateButtons();
  }

  function handleAccountsChanged() {
    let selectAccountsOptionsInnerHtml = '';
    for (let i = 0; i < accounts.length; i++) {
      const a = accounts[i];
      selectAccountsOptionsInnerHtml += `<option value="` + a + `" ` + (i == 0 ? 'selected' : '') + `>${a}</option>`
    }
    selectAccountsOptions.forEach(sel => sel.innerHTML = selectAccountsOptionsInnerHtml);
  }

  function handleNewChain(chainId) {
    chainIdDiv.innerHTML = chainId;

    if (chainId === '0x1') {
      warningDiv.classList.remove('warning-invisible');
    } else {
      warningDiv.classList.add('warning-invisible');
    }
  }

  function handleEIP1559Support(supported) {
    if (supported && Array.isArray(accounts) && accounts.length >= 1) {
      sendEIP1559Button.disabled = false;
      sendEIP1559Button.hidden = false;
      sendButton.innerText = 'Send Legacy Transaction';
    } else {
      sendEIP1559Button.disabled = true;
      sendEIP1559Button.hidden = true;
      sendButton.innerText = 'Send';
    }
  }

  function onChainChanged(chain) {
    console.log('onChainChanged', chain);
    handleNewChain(chain);
    ether3um
      .request({
        method: 'eth_getBlockByNumber',
        params: ['latest', false],
      })
      .then((block) => {
        handleEIP1559Support(block.baseFeePerGas !== undefined);
      });
  }

  function onNetworkChanged(networkId) {
    console.log('onNetworkChanged', networkId);
    networkDiv.innerHTML = networkId;
  }

  function onAccountChanged(newAccounts) {
    console.log('onAccountChanged', newAccounts);
    ether3um
      .request({
        method: 'eth_getBlockByNumber',
        params: ['latest', false],
      })
      .then((block) => {
        handleEIP1559Support(block.baseFeePerGas !== undefined);
      });
    handleNewAccounts(newAccounts);
  }

  const initWcV1Provider = () => {
    walletConnectV1Provider.on('disconnect', () => {
      console.log('wcv1 disconnect');
      onAccountChanged([])
      onChainChanged('')
      onNetworkChanged('')
      updateButtons()
    });
    return;
  }

  const initBzcV1Provider = () => {
    bitizenConnectV1Provider.on('disconnect', () => {
      console.log('bitizenConnectV1Provider disconnect');
      onAccountChanged([])
      onChainChanged('')
      onNetworkChanged('')
      updateButtons()
    });
    return;
  }

  async function getNetworkAndChainId() {
    try {
      const chainId = await ether3um.request({
        method: 'eth_chainId',
      });
      handleNewChain(chainId);

      const networkId = await ether3um.request({
        method: 'net_version',
      });
      onNetworkChanged(networkId);

      const block = await ether3um.request({
        method: 'eth_getBlockByNumber',
        params: ['latest', false],
      });

      handleEIP1559Support(block.baseFeePerGas !== undefined);
    } catch (err) {
      console.error(err);
    }
  }

  updateButtons();

  if (isMetaMaskInstalled()) {
    ether3um.autoRefreshOnNetworkChange = false;
    getNetworkAndChainId();

    ether3um.autoRefreshOnNetworkChange = false;
    getNetworkAndChainId();

    ether3um.on('chainChanged', onChainChanged);
    ether3um.on('networkChanged', onNetworkChanged);
    ether3um.on('accountsChanged', onAccountChanged);

    initWcV1Provider()
    initBzcV1Provider()

    try {
      const newAccounts = await ether3um.request({
        method: 'eth_accounts',
      });
      handleNewAccounts(newAccounts);
    } catch (err) {
      console.error('Error on init when getting accounts', err);
    }
  }
};

window.addEventListener('load', initialize);

// utils

function getPermissionsDisplayString(permissionsArray) {
  if (permissionsArray.length === 0) {
    return 'No permissions found.';
  }
  const permissionNames = permissionsArray.map((perm) => perm.parentCapability);
  return permissionNames
    .reduce((acc, name) => `${acc}${name}, `, '')
    .replace(/, $/u, '');
}

function stringifiableToHex(value) {
  return ethers.utils.hexlify(Buffer.from(JSON.stringify(value)));
}
