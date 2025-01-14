import { test, expect, jest, afterEach } from 'bun:test';
import { Web3Provider } from '@trustwallet/web3-provider-core';
import { SuiProvider } from '../SuiProvider';
import { AdapterStrategy } from '@trustwallet/web3-provider-core/adapter/Adapter';

let Sui = new SuiProvider();
const account = '0x0000000000000000000000000000000000000000';

afterEach(() => {
  Sui = new SuiProvider();
});

// Direct methods
test('Sui Awesome test', async () => {
  new Web3Provider({
    strategy: AdapterStrategy.PROMISES,
    handler: () => Promise.resolve([account]),
  }).registerProvider(Sui);

  const accounts = await Sui.request({ method: 'test_method' });
  expect(accounts).toEqual([account]);
});
