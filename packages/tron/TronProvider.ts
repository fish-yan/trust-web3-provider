

import { BaseProvider } from '@trustwallet/web3-provider-core';
import type ITronProvider from './types/TronProvider';
import type { ITronProviderConfig } from './types/TronProvider';

export class TronProvider
  extends BaseProvider
  implements ITronProvider
{
  static NETWORK = 'Tron';

  constructor(config?: ITronProviderConfig) {
    super();
    // Your constructor logic here for setting config
  }

  getNetwork(): string {
    return TronProvider.NETWORK;
  }
}
