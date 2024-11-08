import { IRequestArguments } from "@trustwallet/web3-provider-core";

export interface ITronProviderConfig {
  isTrust?: boolean;
  address?: string
}

export interface TronAddress {
  base58?: string;
  hex?: string;
}

export interface TronNode {
  host?: string;
}

export interface SignedTransaction {
  signature: string;
  contract_address?: string;
}

export interface ITrx {
  sign(transaction: any, privateKey: string): SignedTransaction
}

export interface ITronWeb {
  defaultAddress: TronAddress;
  ready: boolean;
  fullNode: TronNode;
  solidityNode: TronNode;
  eventServer: TronNode;
  trx: ITrx;
}

export interface ITronProvider {
  tronWeb: ITronWeb;
  request(args: IRequestArguments): Promise<any>
}
