

import { BaseProvider, IRequestArguments } from '@trustwallet/web3-provider-core';
import type { ITronProvider, ITronProviderConfig, ITronWeb, ITrx, SignedTransaction, TronAddress, TronNode } from './types/TronProvider';
import { fromHex, toHex } from 'tronweb/lib/esm/utils';

export class Trx implements ITrx {
  tronProveder: TronProvider;
  constructor(tronProveder: TronProvider) {
    this.tronProveder = tronProveder;
  }
  sign(transaction: any, privateKey: string): SignedTransaction {
    const data = {
      data: transaction
    }
    const promise = this.tronProveder.internalRequest<String>({
      method: "sign",
      params: data
    })
    var signedTransaction: any
    promise.then((signature) => {
      signedTransaction = { signature: signature, contract_address: "" }
      return signedTransaction
    })
    return signedTransaction
  }

}

export class TronWeb implements ITronWeb {
  defaultAddress: TronAddress;
  ready: boolean = true;
  fullNode: TronNode;
  solidityNode: TronNode;
  eventServer: TronNode;
  trx: ITrx;
  tronProveder: TronProvider;

  constructor(address: string, tronProveder: TronProvider, fullNode?: string, solidityNode?: string, eventServer?: string) {
    this.defaultAddress = {
      base58: address
    };
    this.fullNode = {
      host: fullNode
    };
    this.solidityNode = {
      host: solidityNode
    };
    this.eventServer = {
      host: eventServer
    };
    this.tronProveder = tronProveder;
    this.trx = new Trx(tronProveder);
  }
}

export class TronProvider
  extends BaseProvider
  implements ITronProvider {

  static NETWORK = 'Tron';

  tronWeb: ITronWeb;

  constructor(config?: ITronProviderConfig) {
    super();
    var configAddress: string = config?.address || '';
    this.tronWeb = new TronWeb("", this, "https://api.trongrid.io", "https://api.trongrid.io", "https://api.trongrid.io")
    const base58 = fromHex(configAddress);
    const hex = toHex(configAddress);
    const tokenAddress = { base58, hex }
    this.tronWeb.defaultAddress = tokenAddress
  }


  getNetwork(): string {
    return TronProvider.NETWORK;
  }

  request(args: IRequestArguments): Promise<any> {
    switch (args.method) {
      case "tron_requestAccounts":
        return this.requestAccount()
      default: throw new Error("unsupport");
    }
  }

  requestAccount(): Promise<TronAddress> {
    const addressPromise = this.internalRequest<TronAddress>({
      method: "requestAccounts",
      params: {}
    })
    addressPromise.then((address) => {
      this.tronWeb.defaultAddress = address
    })
    return addressPromise

  }

  internalRequest<T>(args: IRequestArguments): Promise<T> {
    return super.request<T>(args);
  }


}
