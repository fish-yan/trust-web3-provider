

import { BaseProvider } from '@trustwallet/web3-provider-core';
import type INeon3Provider from './types/Neon3Provider';
import type { INeon3ProviderConfig } from './types/Neon3Provider';

export class Neon3Provider
  extends BaseProvider
  implements INeon3Provider
{
  static NETWORK = 'Neon3';

  constructor(config?: INeon3ProviderConfig) {
    super();
    // Your constructor logic here for setting config
  }

  getNetwork(): string {
    return Neon3Provider.NETWORK;
  }
}
