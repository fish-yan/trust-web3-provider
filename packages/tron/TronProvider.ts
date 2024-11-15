

import { BaseProvider, IRequestArguments } from '@trustwallet/web3-provider-core';
import type { ITronProvider, ITronProviderConfig } from './types/TronProvider';
import { TronWeb, Trx } from 'tronweb';
import { SignedTransaction, DefaultAddress } from 'tronweb/lib/esm/types';

export class TronProvider
  extends BaseProvider
  implements ITronProvider {

  static NETWORK = 'tron';

  public tronWeb: TronWeb & { ready?: boolean };

  getNetwork(): string {
    return TronProvider.NETWORK;
  }

  constructor(config?: ITronProviderConfig) {
    super();
    this.tronWeb = new TronWeb("https://api.trongrid.io", "https://api.trongrid.io", "https://api.trongrid.io")
    this.tronWeb.ready = true
    const base58 = config?.address ?? ""
    this.tronWeb.setAddress(base58)
    const that = this
    // @ts-ignore
    this.tronWeb.trx.sign = async function (transaction, privateKey, useTronHeader, multisig) {
      if (typeof transaction === 'string') {
        const signatureMessage = await that.internalRequest<string>({
          method: "signMessage",
          params: {transaction}
        })
        return signatureMessage;
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

  async requestAccount() {
    const address = await this.internalRequest<string>({
      method: "requestAccounts",
      params: {}
    })
    this.tronWeb.setAddress(address)
    return this.tronWeb.defaultAddress

  }

  internalRequest<T>(args: IRequestArguments): Promise<T> {
    return super.request<T>(args);
  }


}
