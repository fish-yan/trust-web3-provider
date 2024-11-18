import IEthereumProvider from "@trustwallet/web3-provider-ethereum/types/EthereumProvider";
import { IWalletConfig } from ".";
import ISolanaProvider from "@trustwallet/web3-provider-solana/types/SolanaProvider";
import IAptosProvider from "@trustwallet/web3-provider-aptos/types/AptosProvider";
import ITonProvider from "@trustwallet/web3-provider-ton/types/TonProvider";
import INeoProvider from "@trustwallet/web3-provider-neo/types/NeoProvider";
import ITronProvider from "@trustwallet/web3-provider-tron/types/TronProvider";

declare global {
  interface Window {
    trustwallet: any;
    webkit: any;
    ethereum: IEthereumProvider;
    onto: any;
    walletOnto: any;
    tonkeeper: any;
    phantom: any;
    solana: ISolanaProvider;
    aptos: IAptosProvider;
    martian: IAptosProvider;
    pontem: IAptosProvider;
    ton: ITonProvider;
    neo: INeoProvider;
    OneGate: INeoProvider;
    Vital: INeoProvider;
    tron: ITronProvider;
    tronWeb: TronWeb;
    _tw_: any;
    setConfig: (config: IWalletConfig) => void;
  }
}

export {};
