

import { BaseProvider, IRequestArguments } from '@trustwallet/web3-provider-core';
import type { ITronProvider, ITronProviderConfig } from './types/TronProvider';
import { TronWeb } from 'tronweb';
import { SignedTransaction, DefaultAddress } from 'tronweb/lib/esm/types';

export class TronProvider
  extends BaseProvider
  implements ITronProvider {

  static NETWORK = 'Tron';

  public tronWeb: TronWeb & {ready?: boolean};

  getNetwork(): string {
    return TronProvider.NETWORK;
  }

  constructor(config?: ITronProviderConfig) {
    super();
    var configAddress: string = config?.address || '';
    this.tronWeb = new TronWeb("https://api.trongrid.io", "https://api.trongrid.io", "https://api.trongrid.io")
    this.tronWeb.ready = true
    this.tronWeb.defaultAddress = {
      base58: configAddress,
      hex: false
    }
    const that = this
    // @ts-ignore
    this.tronWeb.trx.sign = async function (transaction, privateKey, useTronHeader, multisig) {
      if (typeof transaction === 'string') {
        throw new Error("unsupport");
      }
      const signature = await that.internalRequest<string>({
        method: "sign",
        params: transaction
      })
      const signedTransaction = transaction as SignedTransaction
      signedTransaction.signature = [signature];
      return transaction;
    }
  }

  request(args: IRequestArguments): Promise<any> {
    switch (args.method) {
      case "tron_requestAccounts":
        return this.requestAccount()
      default: throw new Error("unsupport");
    }
  }

  requestAccount(): Promise<DefaultAddress> {
    const addressPromise = this.internalRequest<DefaultAddress>({
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
