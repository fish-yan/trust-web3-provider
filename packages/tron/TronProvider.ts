

import { BaseProvider, IRequestArguments } from '@trustwallet/web3-provider-core';
import type { ITronProvider, ITronProviderConfig } from './types/TronProvider';
import { TronWeb } from 'tronweb';
import { SignedTransaction, DefaultAddress } from 'tronweb/lib/esm/types';

export class TronProvider
  extends BaseProvider
  implements ITronProvider {

  static NETWORK = 'tron';

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
        method: "signTransaction",
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

  async requestAccount(){
    const address = await this.internalRequest<string>({
      method: "requestAccounts",
      params: {}
    })
    this.tronWeb.defaultAddress = {
      base58: address,
      hex: false
    }
    return this.tronWeb.defaultAddress

  }

  internalRequest<T>(args: IRequestArguments): Promise<T> {
    return super.request<T>(args);
  }


}
