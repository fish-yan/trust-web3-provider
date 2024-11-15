import { IRequestArguments } from "@trustwallet/web3-provider-core";
import { TronWeb } from "tronweb";

export interface ITronProviderConfig {
  isTrust?: boolean;
  address?: string
}

export interface ITronProvider {
  tronWeb: TronWeb;
  request(args: IRequestArguments): Promise<any>
}
