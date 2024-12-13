

import { BaseProvider, IRequestArguments } from '@trustwallet/web3-provider-core';
import type { ITronProvider, ITronProviderConfig } from './types/TronProvider';
import { TronWeb, Trx } from 'tronweb';
import { SignedTransaction, DefaultAddress } from 'tronweb/lib/esm/types';

export class TronProvider
  extends BaseProvider
  implements ITronProvider {

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

  static isUTF8(hex: string) {
    try {
      let buffer = this.messageToBuffer(hex)
      new TextDecoder('utf8', { fatal: true }).decode(buffer);
      return true;
    } catch {
      return false;
    }
  }

  static decodeUTF8(hex: string) {
    let buffer = this.messageToBuffer(hex)
    return new TextDecoder('utf8', { fatal: true }).decode(buffer);
  }

  static NETWORK = 'tron';

  public tronWeb: TronWeb & { ready?: boolean };

  getNetwork(): string {
    return TronProvider.NETWORK;
  }

  constructor(config?: ITronProviderConfig) {
    super();
    this.tronWeb = new TronWeb("https://api.trongrid.io", "https://api.trongrid.io", "https://api.trongrid.io")
    this.tronWeb.ready = true
    if (config?.address) {
      this.tronWeb.setAddress(config.address)
    }
    const that = this
    // @ts-ignore
    this.tronWeb.trx.sign = async function (transaction, privateKey, useTronHeader, multisig) {
      if (typeof transaction === 'string') {

        const raw = TronProvider.isUTF8(transaction) ? TronProvider.decodeUTF8(transaction) : transaction

        const signatureMessage = await that.internalRequest<string>({
          method: "signMessage",
          params: { data: transaction, raw }
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
