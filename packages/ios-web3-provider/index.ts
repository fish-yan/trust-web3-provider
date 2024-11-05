import { EthereumProvider } from '@trustwallet/web3-provider-ethereum';
import { SolanaProvider } from '@trustwallet/web3-provider-solana';
import { Web3Provider } from '@trustwallet/web3-provider-core';
import { AptosProvider } from '@trustwallet/web3-provider-aptos';
import { TonBridge, TonProvider } from '@trustwallet/web3-provider-ton';
import { ISolanaProviderConfig } from '@trustwallet/web3-provider-solana/types/SolanaProvider';
import { IEthereumProviderConfig } from '@trustwallet/web3-provider-ethereum/types/EthereumProvider';
import { IAptosProviderConfig } from '@trustwallet/web3-provider-aptos/types/AptosProvider';
import { ITonProviderConfig } from '@trustwallet/web3-provider-ton/types/TonProvider';
import { DeviceInfo, WalletInfo } from '@trustwallet/web3-provider-ton/dist/types/types/TonBridge';

export interface IWalletConfig {
  ethereum: IEthereumProviderConfig;
  solana: ISolanaProviderConfig;
  aptos: IAptosProviderConfig;
  ton: ITonProviderConfig;
}

window.trustwallet = {};

function setConfig(config: IWalletConfig) {

  const strategy = 'CALLBACK';

  try {
    const core = new Web3Provider({
      strategy,
      handler: (params) => {
        // Disabled methods
        if (params.name === 'wallet_requestPermissions') {
          core.sendResponse(params.id ?? 0, null);
          return;
        }
        if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
          window.webkit.messageHandlers._tw_.postMessage(params);
        } else {
          window._tw_.postMessage(JSON.stringify(params));
        }
      }
    });

    // Generate instances
    const ethereum = new EthereumProvider(config.ethereum);
    const solana = new SolanaProvider(config.solana);
    const aptos = new AptosProvider(config.aptos);
    const ton = new TonProvider(config.ton);

    const bridgeConfig: {
      isWalletBrowser: boolean;
      walletInfo: WalletInfo;
      deviceInfo: DeviceInfo;
    } = {
      isWalletBrowser: true,
      walletInfo: {
        name: "ONTO",
        app_name: "ONTO",
        image: "https://app.ont.io/ontoMsgPic/onto.png",
        tondns: "onto.app",
        about_url: "https://onto.app",
        platforms: ['ios', 'android']
      },
      deviceInfo: {
        platform: /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent) ? "iphone" : "android",
        appName: "ONTO",
        appVersion: "4.8.2",
        maxProtocolVersion: 2,
        features: [ 'SendTransaction', { name: 'SendTransaction', maxMessages: 255 }, { name: 'SignData' }]
      }
    };
    
    const bridge = new TonBridge(bridgeConfig, ton);

    ethereum.providers = [ethereum];

    core.registerProviders([ethereum, solana, aptos, ton].map(provider => {
      provider.sendResponse = core.sendResponse.bind(core);
      provider.sendError = core.sendError.bind(core);
      return provider;
    }));

    // Attach to window
    window.ethereum = ethereum;
    window.phantom = {
      solana: solana
    }
    window.solana = solana
    window.aptos = aptos
    window.tonkeeper = {
      tonconnect: bridge
    }

    window.trustwallet = {
      ethereum: ethereum,
      onto: ethereum,
    }
    window.onto = {
      ethereum: ethereum,
      solana: solana,
      aptos: aptos,
      tonconnect: bridge,
      ton: ton
    }

    Object.assign(window.trustwallet, {
      isOnto: true,
      request: ethereum.request.bind(ethereum),
      send: ethereum.send.bind(ethereum),
      on: (...params: any) => window.trustwallet.ethereum.on(...params),
      off: (...params: any) => window.trustwallet.ethereum.off(...params),
    });

    const EIP6963Icon =
      'data:image/png;base64,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';
  
    const info = {
      uuid: crypto.randomUUID?.() || Math.random(),
      name: 'ONTO Wallet',
      icon: EIP6963Icon,
      rdns: 'app.onto',
    };

    const announceEvent = new CustomEvent('eip6963:announceProvider', {
      detail: Object.freeze({ info, provider: ethereum }),
    });

    window.dispatchEvent(announceEvent);

    window.addEventListener('eip6963:requestProvider', () => {
      window.dispatchEvent(announceEvent);
    });
    
    // 伪装 MetaMask 6963
    const metaMaskEIP6963Icon = "data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjMzIiB2aWV3Qm94PSIwIDAgMzUgMzMiIHdpZHRoPSIzNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iLjI1Ij48cGF0aCBkPSJtMzIuOTU4MiAxLTEzLjEzNDEgOS43MTgzIDIuNDQyNC01LjcyNzMxeiIgZmlsbD0iI2UxNzcyNiIgc3Ryb2tlPSIjZTE3NzI2Ii8+PGcgZmlsbD0iI2UyNzYyNSIgc3Ryb2tlPSIjZTI3NjI1Ij48cGF0aCBkPSJtMi42NjI5NiAxIDEzLjAxNzE0IDkuODA5LTIuMzI1NC01LjgxODAyeiIvPjxwYXRoIGQ9Im0yOC4yMjk1IDIzLjUzMzUtMy40OTQ3IDUuMzM4NiA3LjQ4MjkgMi4wNjAzIDIuMTQzNi03LjI4MjN6Ii8+PHBhdGggZD0ibTEuMjcyODEgMjMuNjUwMSAyLjEzMDU1IDcuMjgyMyA3LjQ2OTk0LTIuMDYwMy0zLjQ4MTY2LTUuMzM4NnoiLz48cGF0aCBkPSJtMTAuNDcwNiAxNC41MTQ5LTIuMDc4NiAzLjEzNTggNy40MDUuMzM2OS0uMjQ2OS03Ljk2OXoiLz48cGF0aCBkPSJtMjUuMTUwNSAxNC41MTQ5LTUuMTU3NS00LjU4NzA0LS4xNjg4IDguMDU5NzQgNy40MDQ5LS4zMzY5eiIvPjxwYXRoIGQ9Im0xMC44NzMzIDI4Ljg3MjEgNC40ODE5LTIuMTYzOS0zLjg1ODMtMy4wMDYyeiIvPjxwYXRoIGQ9Im0yMC4yNjU5IDI2LjcwODIgNC40Njg5IDIuMTYzOS0uNjEwNS01LjE3MDF6Ii8+PC9nPjxwYXRoIGQ9Im0yNC43MzQ4IDI4Ljg3MjEtNC40NjktMi4xNjM5LjM2MzggMi45MDI1LS4wMzkgMS4yMzF6IiBmaWxsPSIjZDViZmIyIiBzdHJva2U9IiNkNWJmYjIiLz48cGF0aCBkPSJtMTAuODczMiAyOC44NzIxIDQuMTU3MiAxLjk2OTYtLjAyNi0xLjIzMS4zNTA4LTIuOTAyNXoiIGZpbGw9IiNkNWJmYjIiIHN0cm9rZT0iI2Q1YmZiMiIvPjxwYXRoIGQ9Im0xNS4xMDg0IDIxLjc4NDItMy43MTU1LTEuMDg4NCAyLjYyNDMtMS4yMDUxeiIgZmlsbD0iIzIzMzQ0NyIgc3Ryb2tlPSIjMjMzNDQ3Ii8+PHBhdGggZD0ibTIwLjUxMjYgMjEuNzg0MiAxLjA5MTMtMi4yOTM1IDIuNjM3MiAxLjIwNTF6IiBmaWxsPSIjMjMzNDQ3IiBzdHJva2U9IiMyMzM0NDciLz48cGF0aCBkPSJtMTAuODczMyAyOC44NzIxLjY0OTUtNS4zMzg2LTQuMTMxMTcuMTE2N3oiIGZpbGw9IiNjYzYyMjgiIHN0cm9rZT0iI2NjNjIyOCIvPjxwYXRoIGQ9Im0yNC4wOTgyIDIzLjUzMzUuNjM2NiA1LjMzODYgMy40OTQ2LTUuMjIxOXoiIGZpbGw9IiNjYzYyMjgiIHN0cm9rZT0iI2NjNjIyOCIvPjxwYXRoIGQ9Im0yNy4yMjkxIDE3LjY1MDctNy40MDUuMzM2OS42ODg1IDMuNzk2NiAxLjA5MTMtMi4yOTM1IDIuNjM3MiAxLjIwNTF6IiBmaWxsPSIjY2M2MjI4IiBzdHJva2U9IiNjYzYyMjgiLz48cGF0aCBkPSJtMTEuMzkyOSAyMC42OTU4IDIuNjI0Mi0xLjIwNTEgMS4wOTEzIDIuMjkzNS42ODg1LTMuNzk2Ni03LjQwNDk1LS4zMzY5eiIgZmlsbD0iI2NjNjIyOCIgc3Ryb2tlPSIjY2M2MjI4Ii8+PHBhdGggZD0ibTguMzkyIDE3LjY1MDcgMy4xMDQ5IDYuMDUxMy0uMTAzOS0zLjAwNjJ6IiBmaWxsPSIjZTI3NTI1IiBzdHJva2U9IiNlMjc1MjUiLz48cGF0aCBkPSJtMjQuMjQxMiAyMC42OTU4LS4xMTY5IDMuMDA2MiAzLjEwNDktNi4wNTEzeiIgZmlsbD0iI2UyNzUyNSIgc3Ryb2tlPSIjZTI3NTI1Ii8+PHBhdGggZD0ibTE1Ljc5NyAxNy45ODc2LS42ODg2IDMuNzk2Ny44NzA0IDQuNDgzMy4xOTQ5LTUuOTA4N3oiIGZpbGw9IiNlMjc1MjUiIHN0cm9rZT0iI2UyNzUyNSIvPjxwYXRoIGQ9Im0xOS44MjQyIDE3Ljk4NzYtLjM2MzggMi4zNTg0LjE4MTkgNS45MjE2Ljg3MDQtNC40ODMzeiIgZmlsbD0iI2UyNzUyNSIgc3Ryb2tlPSIjZTI3NTI1Ii8+PHBhdGggZD0ibTIwLjUxMjcgMjEuNzg0Mi0uODcwNCA0LjQ4MzQuNjIzNi40NDA2IDMuODU4NC0zLjAwNjIuMTE2OS0zLjAwNjJ6IiBmaWxsPSIjZjU4NDFmIiBzdHJva2U9IiNmNTg0MWYiLz48cGF0aCBkPSJtMTEuMzkyOSAyMC42OTU4LjEwNCAzLjAwNjIgMy44NTgzIDMuMDA2Mi42MjM2LS40NDA2LS44NzA0LTQuNDgzNHoiIGZpbGw9IiNmNTg0MWYiIHN0cm9rZT0iI2Y1ODQxZiIvPjxwYXRoIGQ9Im0yMC41OTA2IDMwLjg0MTcuMDM5LTEuMjMxLS4zMzc4LS4yODUxaC00Ljk2MjZsLS4zMjQ4LjI4NTEuMDI2IDEuMjMxLTQuMTU3Mi0xLjk2OTYgMS40NTUxIDEuMTkyMSAyLjk0ODkgMi4wMzQ0aDUuMDUzNmwyLjk2Mi0yLjAzNDQgMS40NDItMS4xOTIxeiIgZmlsbD0iI2MwYWM5ZCIgc3Ryb2tlPSIjYzBhYzlkIi8+PHBhdGggZD0ibTIwLjI2NTkgMjYuNzA4Mi0uNjIzNi0uNDQwNmgtMy42NjM1bC0uNjIzNi40NDA2LS4zNTA4IDIuOTAyNS4zMjQ4LS4yODUxaDQuOTYyNmwuMzM3OC4yODUxeiIgZmlsbD0iIzE2MTYxNiIgc3Ryb2tlPSIjMTYxNjE2Ii8+PHBhdGggZD0ibTMzLjUxNjggMTEuMzUzMiAxLjEwNDMtNS4zNjQ0Ny0xLjY2MjktNC45ODg3My0xMi42OTIzIDkuMzk0NCA0Ljg4NDYgNC4xMjA1IDYuODk4MyAyLjAwODUgMS41Mi0xLjc3NTItLjY2MjYtLjQ3OTUgMS4wNTIzLS45NTg4LS44MDU0LS42MjIgMS4wNTIzLS44MDM0eiIgZmlsbD0iIzc2M2UxYSIgc3Ryb2tlPSIjNzYzZTFhIi8+PHBhdGggZD0ibTEgNS45ODg3MyAxLjExNzI0IDUuMzY0NDctLjcxNDUxLjUzMTMgMS4wNjUyNy44MDM0LS44MDU0NS42MjIgMS4wNTIyOC45NTg4LS42NjI1NS40Nzk1IDEuNTE5OTcgMS43NzUyIDYuODk4MzUtMi4wMDg1IDQuODg0Ni00LjEyMDUtMTIuNjkyMzMtOS4zOTQ0eiIgZmlsbD0iIzc2M2UxYSIgc3Ryb2tlPSIjNzYzZTFhIi8+PHBhdGggZD0ibTMyLjA0ODkgMTYuNTIzNC02Ljg5ODMtMi4wMDg1IDIuMDc4NiAzLjEzNTgtMy4xMDQ5IDYuMDUxMyA0LjEwNTItLjA1MTloNi4xMzE4eiIgZmlsbD0iI2Y1ODQxZiIgc3Ryb2tlPSIjZjU4NDFmIi8+PHBhdGggZD0ibTEwLjQ3MDUgMTQuNTE0OS02Ljg5ODI4IDIuMDA4NS0yLjI5OTQ0IDcuMTI2N2g2LjExODgzbDQuMTA1MTkuMDUxOS0zLjEwNDg3LTYuMDUxM3oiIGZpbGw9IiNmNTg0MWYiIHN0cm9rZT0iI2Y1ODQxZiIvPjxwYXRoIGQ9Im0xOS44MjQxIDE3Ljk4NzYuNDQxNy03LjU5MzIgMi4wMDA3LTUuNDAzNGgtOC45MTE5bDIuMDAwNiA1LjQwMzQuNDQxNyA3LjU5MzIuMTY4OSAyLjM4NDIuMDEzIDUuODk1OGgzLjY2MzVsLjAxMy01Ljg5NTh6IiBmaWxsPSIjZjU4NDFmIiBzdHJva2U9IiNmNTg0MWYiLz48L2c+PC9zdmc+"
    const metaMaskInfo = {
      uuid: crypto.randomUUID?.() || Math.random(),
      name: "MetaMask",
      icon: metaMaskEIP6963Icon,
      rdns: "io.metamask",
    };

    const metaMaskAnnounceEvent = new CustomEvent('eip6963:announceProvider', {
      detail: Object.freeze({ info: metaMaskInfo, provider: ethereum }),
    });

    window.dispatchEvent(metaMaskAnnounceEvent);

    window.addEventListener('eip6963:requestProvider', () => {
      window.dispatchEvent(announceEvent);
      window.dispatchEvent(metaMaskAnnounceEvent);
    });
  } catch (e) {
    console.error(e)
  }
}

window.setConfig = setConfig