import {
  Chain,
  SignTransactionConfig,
  SignTransactionResponse,
  UALErrorType,
  User
} from '@blockone/universal-authenticator-library'
import tp from 'tp-eosjs'
import { PushEosActionResponse, Wallet } from './interfaces'
import { UALTokenPocketError } from './UALTokenPocketError'

export class TokenPocketUser extends User {
  private account: Wallet
  private keys: string[] = []
  private chainId = ''

  constructor(
    chain: Chain | null,
    accountObj: Wallet
  ) {
    super()
    this.account = accountObj

    if (chain && chain.chainId) {
      this.chainId = chain.chainId
    }
  }

  public async signTransaction(
    transaction: any,
    // tslint:disable-next-line:variable-name
    _config: SignTransactionConfig
  ): Promise<SignTransactionResponse> {
    let response: PushEosActionResponse

    try {
      response = await tp.pushEosAction({ ...transaction, account: this.account.name, address: this.account.address})
      if (response.result) {
        return {
          wasBroadcast: true,
          transactionId: response.data.transactionId,
          transaction,
        }
      } else {
        throw new Error('No result returned')
      }
    } catch (e) {
      throw new UALTokenPocketError(
        'Unable to sign the given transaction',
        UALErrorType.Signing,
        e)
    }
  }

  public async signArbitrary(
    publicKey: string,
    data: string,
    // tslint:disable-next-line:variable-name
    _helpText: string): Promise<string> {
    try {
      return tp.eosAuthSign({ from: this.account.name, publicKey, signdata: data })
    } catch (e) {
      throw new UALTokenPocketError(
        'Unable to sign arbitrary string',
        UALErrorType.Signing,
        e
      )
    }
  }

  public async verifyKeyOwnership(_: string): Promise<boolean> {
    throw new Error('Token Pocket does not currently support verifyKeyOwnership')
  }

  public async getAccountName(): Promise<string> {
    return this.account.name
  }

  public async getChainId(): Promise<string> {
    return this.chainId
  }

  public async getKeys(): Promise<string[]> {
    if (this.keys.length === 0) {
      this.keys.push(this.account.address)
    }

    return this.keys
  }
}
