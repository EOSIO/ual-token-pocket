import {
  Chain,
  SignTransactionConfig,
  SignTransactionResponse,
  UALErrorType,
  User
} from '@blockone/universal-authenticator-library'
import tp from 'tp-eosjs'
import { EosAuthSignResponse, PushEosActionResponse, Wallet } from './interfaces'
import { UALTokenPocketError } from './UALTokenPocketError'

export class TokenPocketUser extends User {
  private wallet: Wallet
  private keys: string[] = []
  private chainId = ''

  constructor(
    chain: Chain | null,
    wallet: Wallet
  ) {
    super()
    this.wallet = wallet

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
      response = await tp.pushEosAction({ ...transaction, account: this.wallet.name, address: this.wallet.address})
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
    _helpText: string
    ): Promise<string> {
    let response: EosAuthSignResponse

    try {
      response = await tp.eosAuthSign({ from: this.wallet.name, publicKey, signdata: data })
      if (response.result) {
        return response.data.signature
      } else {
        throw new Error('No result returned')
      }
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
    return this.wallet.name
  }

  public async getChainId(): Promise<string> {
    return this.chainId
  }

  public async getKeys(): Promise<string[]> {
    if (this.keys.length === 0) {
      this.keys.push(this.wallet.address)
    }

    return this.keys
  }
}
