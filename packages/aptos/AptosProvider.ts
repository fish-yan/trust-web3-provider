import {
  BaseProvider,
  IRequestArguments,
} from '@trustwallet/web3-provider-core';
import type IAptosProvider from './types/AptosProvider';
import type {
  IAptosProviderConfig,
  ISignMessagePayload,
} from './types/AptosProvider';
import {
  APTOS_CHAINS,
  AptosFeatures,
  AptosWallet,
  registerWallet,
  UserResponseStatus,
  WalletAccount,
} from '@aptos-labs/wallet-standard';
import {
  Deserializer,
  RawTransaction,
  Serializer,
  SimpleTransaction,
} from '@aptos-labs/ts-sdk';

export class AptosProvider extends BaseProvider implements AptosWallet {
  static NETWORK = 'aptos';

  private _isConnected = false;

  private _network;

  public chainId: string | null = null;

  public address: string | null = null;

  readonly url: string = 'https://ont.io/';
  readonly version = '1.0.0';
  readonly name: string = 'ONTO';
  readonly icon =
    'data:image/png;base64,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';
  chains = APTOS_CHAINS;

  get features(): any {
    return {
      'aptos:connect': {
        version: '1.0.0',
        connect: this.connect.bind(this),
      },
      'aptos:network': {
        version: '1.0.0',
        network: this.network.bind(this),
      },
      'aptos:disconnect': {
        version: '1.0.0',
        disconnect: this.disconnect.bind(this),
      },
      'aptos:signTransaction': {
        version: '1.0.0',
        signTransaction: this.signTransaction.bind(this),
      },
      'aptos:signAndSubmitTransaction': {
        version: '1.0.0',
        signAndSubmitTransaction: this.signAndSubmitTransaction.bind(this),
      },
      'aptos:onAccountChange': {
        version: '1.0.0',
        onAccountChange: this.onAccountChange.bind(this),
      },
      'aptos:onNetworkChange': {
        version: '1.0.0',
        onNetworkChange: this.onNetworkChange.bind(this),
      },
      'aptos:signMessage': {
        version: '1.0.0',
        signMessage: this.signMessage.bind(this),
      },
      'aptos:account': {
        version: '1.0.0',
        account: this.account.bind(this),
      },
    };
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

  constructor(config?: IAptosProviderConfig) {
    super();

    if (config) {
      if (config.network) {
        this._network = config.network;

        if (config.chainId) {
          this.chainId = config.chainId;
        }
      }
    }
    if (typeof window === 'undefined') return;
    registerWallet(this);
  }
  readonly accounts: WalletAccount[] = [];

  setConfig(config: { network: string; address: string; chainId: string }) {
    this._network = config.network;
    this.address = config.address;
    this.chainId = config.chainId;
  }

  async connect() {
    const accountInfo = await this.account();
    this._isConnected = true;
    this.emit('connect');
    return accountInfo;
  }

  disconnect() {
    this._isConnected = false;
    this.emit('disconnect');
  }

  isConnected() {
    return this._isConnected;
  }

  async account() {
    const address = await this.internalRequest<string>({
      method: 'requestAccounts',
      params: {},
    });
    return {
      status: UserResponseStatus.APPROVED,
      args: { address: address, publicKey: '' },
    };
  }

  network = async (): Promise<any> => {
    return {
      name: 'Mainnet',
      chainId: '1',
      url: 'https://fullnode.devnet.aptoslabs.com/v1',
    };
  };

  getNetwork(): string {
    return AptosProvider.NETWORK;
  }

  async generateTransaction(
    address: string,
    data: any,
    options?: any,
  ): Promise<any> {
    // const txnRequest = await this.aptosclient.generateTransaction(address, data);
    return data;
  }

  async signMessage(payload: ISignMessagePayload) {
    const prefix = 'APTOS';
    const address = (await this.account()).args.address;

    let fullMessage = prefix;

    const application =
      window.location.protocol + '//' + window.location.hostname;

    if (payload.address) {
      fullMessage += '\naddress: ' + address;
    }

    if (payload.application) {
      fullMessage += '\napplication: ' + application;
    }

    if (payload.chainId) {
      fullMessage += '\nchainId: ' + this.chainId;
    }

    fullMessage += '\nmessage: ' + payload.message;
    fullMessage += '\nnonce: ' + payload.nonce;

    const buffer = Buffer.from(fullMessage);
    const hex = AptosProvider.bufferToHex(buffer);

    return await this.internalRequest({
      method: 'signMessage',
      params: { data: hex },
    }).then((signature) => {
      return {
        address: address,
        application: application,
        chainId: this.chainId,
        fullMessage: fullMessage,
        message: payload.message,
        nonce: payload.nonce,
        prefix: prefix,
        signature: signature,
      };
    });
  }

  // async signAndSubmitTransaction(tx: any) {
  //   const obj: Record<string, any> = {};
  //   Object.entries(tx.rawTransaction).forEach(([key, v]) => {
  //     obj[key] = typeof v === "bigint" ? v.toString() : v
  //   });
  //   tx.rawTransaction = obj;
  //   const hex = await this.internalRequest<string>({
  //     method: 'sendTransaction',
  //     params: { tx: tx },
  //   });
  //   return hex;
  // }

  async signAndSubmitTransaction(tx: SimpleTransaction) {
    var serialize = new Serializer();
    tx.serialize(serialize);
    const bytes = serialize.toUint8Array();
    const txHex = AptosProvider.bufferToHex(bytes);
    const hex = await this.internalRequest<string>({
      method: 'sendTransaction',
      params: { tx: txHex },
    });
    return {
      status: UserResponseStatus.APPROVED,
      args: { hash: hex },
    };
  }

  async signTransaction(tx: string) {
    const signTx = await this.internalRequest<string>({
      method: 'signTransaction',
      params: { tx: tx },
    });
    let buffer = AptosProvider.messageToBuffer(signTx);
    const uint8Array: Uint8Array = new Uint8Array(buffer);
    const des = new Deserializer(uint8Array);
    const senderAuthenticator = SimpleTransaction.deserialize(des);
    return {
      status: UserResponseStatus.APPROVED,
      args: senderAuthenticator,
    };
  }
  onNetworkChange = async (): Promise<void> => {
    return Promise.resolve();
  };
  onAccountChange = async (): Promise<void> => {
    return Promise.resolve();
  };

  internalRequest<T>(args: IRequestArguments): Promise<T> {
    return super.request<T>(args);
  }
}
