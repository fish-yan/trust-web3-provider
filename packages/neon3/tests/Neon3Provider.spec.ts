import { test, expect, jest, afterEach } from 'bun:test';
import { Web3Provider } from '@trustwallet/web3-provider-core';
import { Neon3Provider } from '../Neon3Provider';
import { AdapterStrategy } from '@trustwallet/web3-provider-core/adapter/Adapter';

let Neon3 = new Neon3Provider();
const account = '0x0000000000000000000000000000000000000000';

afterEach(() => {
  Neon3 = new Neon3Provider();
});

// Direct methods
test('Neon3 Awesome test', async () => {
  new Web3Provider({
    strategy: AdapterStrategy.PROMISES,
    handler: () => Promise.resolve([account]),
  }).registerProvider(Neon3);

  const accounts = await Neon3.request({ method: 'test_method' });
  expect(accounts).toEqual([account]);
});
