

import { BaseProvider, IRequestArguments } from '@trustwallet/web3-provider-core';
import type INeoProvider from './types/NeoProvider';
import type { INeoProviderConfig, NeoAccount } from './types/NeoProvider';
import { rpc } from "@cityofzion/neon-core";

export class NeoProvider
  extends BaseProvider
  implements INeoProvider
{
  static NETWORK = 'neo';

  rpcUrl = "https://n3seed1.ngd.network:10332/"

  magicNumber = 860833102

  address?: string

  label?: string

  publicKey?: string

  rpcClient: rpc.RPCClient

  constructor(config?: INeoProviderConfig) {
    super();
    this.address = config?.address;
    this.label = config?.label;
    this.publicKey = config?.publicKey;
    this.rpcClient = new rpc.RPCClient(this.rpcUrl);
  }

  getNetwork(): string {
    return NeoProvider.NETWORK;
  }

  _getProvider() {
    return new Promise(function (resolve, reject) {
      resolve({
        name: "ONTO",
        website: "https://onto.app/",
        version: "1.0.0",
        compatibility: [],
        extra: {}
      })
    })
  }

  async _getAccount() {
    return await this.internalRequest<NeoAccount>({
      method: "requestAccounts",
      params: {}
    })
  }

  _getNetworks() {
    return new Promise(function (resolve, reject) {
      resolve({
        networks: ["MainNet"],
        defaultNetwork: "MainNet",
        chainId: 3
      })
    });
  }

  _getBlockCount() {
    let that = this
    return new Promise(function (resolve, reject) {
      that.rpcClient.getBlockCount()
        .then(count => {
          resolve(count)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  _getBlock(params: any) {
    let that = this
    return new Promise(function (resolve, reject) {
      that.rpcClient.getBlock(params.blockIndex)
        .then(count => {
          resolve(count)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  _getBalance() {
    let that = this;
    return new Promise(function (resolve, reject) {
      that.rpcClient.getNep17Balances(that.address!)
        .then(result => {
          var data = new Array();
          result.balance.forEach(element => {
            let map = {
              assetHash: element.assethash,
              amount: element.amount,
            }
            data.push(map);
          });
          resolve(data);
        })
        .catch(error => {
          reject(error);
        })
    })
  }

  async getTransaction(params: any) {
    return new Promise((resolve, reject) => {
      this.rpcClient.getRawTransaction(params.txid)
        .then(result => {
          resolve(result)
        })
        .catch(error => {
          reject({
            type: 'RPC_ERROR',
            description: 'An RPC error occured when submitting the request',
            data: null
          })
        })
    })
  }

  async _getApplicationLog(params: any) {
    return new Promise((resolve, reject) => {
      this.rpcClient.getApplicationLog(params.txid)
        .then(result => {
          const executions = result.executions.map(ele => {
            return {
              trigger: ele.trigger,
              vmState: ele.vmstate,
              gasConsumed: ele.gasconsumed,
              stack: ele.stack,
              notifications: ele.notifications
            }
          })
          resolve({
            txid: result.txid,
            executions: executions
          })
        })
        .catch(error => {
          reject({
            type: 'RPC_ERROR',
            description: 'An RPC error occured when submitting the request',
            data: null
          })
        })
    })
  }

  internalRequest<T>(args: IRequestArguments): Promise<T> {
    return super.request<T>(args);
  }

  request(args: IRequestArguments): Promise<any> {
    switch (args.method) {
      case "getProvider":
        return this._getProvider();
      case "getAccount":
        return this._getAccount();
      case "getNetworks":
        return this._getNetworks();
      case "getBlockCount":
        return this._getBlockCount();
      case "getBlock":
        return this._getBlock(args.params)
      case "getNep17Balances":
        return this._getBalance();
      case "getApplicationLog":
        return this._getApplicationLog(args.params)
      case "invokeMulti":
      case "invoke":
      case "signMessage":
      case "signTransaction":
        return this.internalRequest(args);
      default:
        return this.internalRequest(args);
    }
  }
}

