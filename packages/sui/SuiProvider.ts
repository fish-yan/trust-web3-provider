

import { BaseProvider, IRequestArguments } from '@trustwallet/web3-provider-core';
import type { ISuiProviderConfig } from './types/SuiProvider';
import {
  IdentifierArray,
  StandardConnectFeature,
  StandardEventsFeature,
  SUI_DEVNET_CHAIN,
  SuiFeatures,
  Wallet,
  SuiSignPersonalMessageMethod,
  SuiSignTransactionMethod,
  SuiSignAndExecuteTransactionMethod,
  StandardEventsOnMethod,
  StandardConnectMethod,
  ReadonlyWalletAccount,
  SuiSignPersonalMessageOutput,
  SignedTransaction,
  SuiSignAndExecuteTransactionOutput,
  registerWallet,
  StandardEventsNames,
  StandardEventsListeners,
  SUI_MAINNET_CHAIN,
  WalletIcon,
  SuiSignMessageMethod,
  SuiSignMessageOutput,
  SuiSignTransactionBlockMethod,
  SuiSignTransactionBlockOutput,
  SuiSignAndExecuteTransactionBlockMethod,
  SuiSignAndExecuteTransactionBlockOutput,
} from '@mysten/wallet-standard';

export class SuiProvider
  extends BaseProvider
  implements Wallet {
  static NETWORK = 'sui';

  static decodeUTF8(buffer: Buffer) {
      return new TextDecoder('utf8', { fatal: true }).decode(buffer);
  }

  static bufferToHex(buffer: Buffer | Uint8Array | string) {
    return '0x' + Buffer.from(buffer).toString('hex');
  }

  static messageToBuffer(message: string | Buffer) {
    let buffer = Buffer.from([]);
    try {
      if (typeof message === 'string') {
        buffer = Buffer.from(message.replace('0x', ''), 'hex');
      } else {
        buffer = Buffer.from(message);
      }
    } catch (err) {
      console.log(`messageToBuffer error: ${err}`);
    }

    return buffer;
  }

  constructor(config?: ISuiProviderConfig) {
    super();
    
    if (config?.isOnto == false) {
      this.name = "Sui Wallet";
      this.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAIVBMVEUAAAD////////9/f39/f3+/v7x+Pz///95wfGj1PXI5fgEMJeQAAAAB3RSTlMAECNgmNr40ET05wAAAOBJREFUeNplUksOgjAQbYw38LdloQdw5VZJDGuNiWtXdGvUFjlAtT2AVC4AekrLvKKYvoTMm5fpfGGswWCdit2cfTFNZYO49YfSYwW/t2+FS0TCTH6x/Q/wISPZwcYJSVc4uxdg1wI2Yn0QbmCXbAKin7AHtiCbq6wicvI5syK/+azowlZSoxNGc4l7IWswhqKlagtD4Kl9CAWBAmspbGHwhJK+HDMlkiaIcJ9BWWqMu64yhcbGVMU5nKoc/XC2fGs/HMbPra78+MGCwhUGSw7OEB4qOKU7Nrki/p2/8zt8ABpiv63tyiOHAAAAAElFTkSuQmCC";
    }
    registerWallet(this);    
  }

  readonly version = '1.0.0';
  name: string = "ONTO";
  icon: WalletIcon = 'data:image/png;base64,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';
  readonly chains: IdentifierArray = [SUI_MAINNET_CHAIN];
  accounts: ReadonlyWalletAccount[] = [];
  id?: string | undefined;

  getNetwork(): string {
    return SuiProvider.NETWORK;
  }

  get features(): StandardConnectFeature & StandardEventsFeature & SuiFeatures {
    return {
      "standard:connect": {
        version: "1.0.0",
        connect: this.#connect.bind(this),
      },
      "standard:events": {
        version: "1.0.0",
        on: this.#on.bind(this),
      },
      "sui:signMessage": {
        version: "1.0.0",
        signMessage: this.#signMessage.bind(this),
      },
      "sui:signPersonalMessage": {
        version: "1.0.0",
        signPersonalMessage: this.#signPersonalMessage.bind(this),
      },
      "sui:signTransaction": {
        version: "2.0.0",
        signTransaction: this.#signTransaction.bind(this),
      },
      "sui:signTransactionBlock": {
        version: "1.0.0",
        signTransactionBlock: this.#signTransactionBlock.bind(this),
      },
      "sui:signAndExecuteTransactionBlock": {
        version: "1.0.0",
        signAndExecuteTransactionBlock: this.#signAndExecuteTransactionBlock.bind(this),
      },
      "sui:signAndExecuteTransaction": {
        version: "2.0.0",
        signAndExecuteTransaction: this.#signAndExecuteTransaction.bind(this),
      }
    }
  }

  #off: <E extends StandardEventsNames>(
    event: E,
    listener: StandardEventsListeners[E]
  ) => void = (event, listener) => {
    return this.off(event, listener);
  }

  #on: StandardEventsOnMethod = (event, listener) => {
    this.on(event, listener);
    return () => this.#off(event, listener);
  }

  #connect: StandardConnectMethod = async (input) => {
    const address = await this.internalRequest<string>({
      method: 'requestAccounts',
      params: {},
    });
    this.accounts = [
      new ReadonlyWalletAccount({
        address: address,
        publicKey: new Uint8Array(),
        chains: this.chains,
        features: [
          "standard:connect",
          "standard:events",
          "sui:signMessage",
          "sui:signPersonalMessage",
          "sui:signTransactionBlock",
          "sui:signTransaction",
          "sui:signAndExecuteTransactionBlock",
          "sui:signAndExecuteTransaction",
        ],
      })
    ]
    return { accounts: this.accounts };
  }

  #signMessage: SuiSignMessageMethod = async (input) => {
    const result = this.internalRequest<SuiSignMessageOutput>({
      method: 'signMessage',
      params: {
        data: SuiProvider.bufferToHex(input.message),
        raw: SuiProvider.decodeUTF8(Buffer.from(input.message)),
        address: input.account.address,
      },
    });
    return result;
  }

  #signPersonalMessage: SuiSignPersonalMessageMethod = async (input) => {
    const result = this.internalRequest<SuiSignPersonalMessageOutput>({
      method: 'signPersonalMessage',
      params: {
        data: SuiProvider.bufferToHex(input.message),
        raw: SuiProvider.decodeUTF8(Buffer.from(input.message)),
        address: input.account.address,
      },
    });
    return result;
  }

  #signTransactionBlock: SuiSignTransactionBlockMethod = async (input) => {
    const result = await this.internalRequest<SignedTransaction>({
      method: 'signTransaction',
      params: {
        transactionSerialized: await input.transactionBlock.toJSON()
      },
    });
    return {
      transactionBlockBytes: result.bytes,
      signature: result.signature
  };
  }

  #signTransaction: SuiSignTransactionMethod = async (input) => {
    const result = await this.internalRequest<SignedTransaction>({
      method: 'signTransaction',
      params: {
        transactionSerialized: await input.transaction.toJSON(),
        signal: input.signal
      },
    });
    return result;
  }

  #signAndExecuteTransactionBlock: SuiSignAndExecuteTransactionBlockMethod = async (input) => {
    const result = await this.internalRequest<SuiSignAndExecuteTransactionBlockOutput>({
      method: 'sendTransaction',
      params: {
        transactionSerialized: await input.transactionBlock.toJSON(),
        options: {
          showRawEffects: true,
          showRawInput: true,
        },
      },
    });
    return result;
  }

  #signAndExecuteTransaction: SuiSignAndExecuteTransactionMethod = async (input) => {
    const result = await this.internalRequest<SuiSignAndExecuteTransactionOutput>({
      method: 'sendTransaction',
      params: {
        transactionSerialized: await input.transaction.toJSON(),
        signal: input.signal,
        options: {
          showRawEffects: true,
          showRawInput: true,
        },
      },
    });
    return result;
  }

  internalRequest<T>(args: IRequestArguments): Promise<T> {
    return super.request<T>(args);
  }
}
