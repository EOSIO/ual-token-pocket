export const Name: string = 'Token Pocket'

export interface Wallet {
  name: string,
  address: string,
  blockchain_id: number,
  permissions: any[]
}

export interface PushEosActionResponse {
  result: boolean,
  data: {
    transactionId: string
  }
}
