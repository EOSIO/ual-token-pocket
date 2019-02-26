import { Chain, RpcEndpoint } from '@blockone/universal-authenticator-library'
import { Wallet, WalletResponse, PushEosActionResponse, EosAuthSignResponse } from '../interfaces'

export const wallet: Wallet = {
  name: 'testAccount',
  address: 'testKey',
  blockchain_id: 4,
  permissions: ['active']
}

export const walletResponse: WalletResponse = {
  result: true,
  data: wallet,
  msg: 'test'
}

export const pushActionResponse: PushEosActionResponse = {
  result: true,
  data: {
    transactionId: 'transactionID'
  }
}

export const authSignResponse: EosAuthSignResponse = {
  result: true,
  data: {
    signature: 'testSignature',
    ref: 'TokenPocket',
    signdata: 'testSignData',
    timestamp: 'testTimestamp',
    wallet: 'testAccount'
  },
  msg: 'test'
}

export const endpoint: RpcEndpoint = {
  protocol: 'https',
  host: 'example.com',
  port: 443,
}

export const chain: Chain = {
  chainId: '1234567890',
  rpcEndpoints: [endpoint]
}
