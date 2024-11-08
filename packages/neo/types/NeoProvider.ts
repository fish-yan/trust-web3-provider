import { IRequestArguments } from "@trustwallet/web3-provider-core";

export interface NeoAccount {
  address: string;
  publicKey: string;
}

export interface INeoProviderConfig {
  isTrust?: boolean;
  address: string;
  label: string;
  publicKey: string;
}

export default interface INeoProvider {
  request(data: IRequestArguments): Promise<any>
}