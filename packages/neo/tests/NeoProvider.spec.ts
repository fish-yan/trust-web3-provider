import { test, expect, jest, afterEach } from 'bun:test';
import { Web3Provider } from '@trustwallet/web3-provider-core';
import { NeoProvider } from '../NeoProvider';
import { AdapterStrategy } from '@trustwallet/web3-provider-core/adapter/Adapter';

let Neo = new NeoProvider();
const account = '0x0000000000000000000000000000000000000000';

afterEach(() => {
  Neo = new NeoProvider();
});

// Direct methods
test('Neo Awesome test', async () => {
  new Web3Provider({
    strategy: AdapterStrategy.PROMISES,
    handler: () => Promise.resolve([account]),
  }).registerProvider(Neo);

  const accounts = await Neo.request({ method: 'test_method' });
  expect(accounts).toEqual([account]);
});
