import tp from 'tp-eosjs'
import {
  Authenticator,
  ButtonStyle,
  Chain,
  UALError,
  UALErrorType,
  User
} from 'universal-authenticator-library'

import { Name, WalletResponse } from './interfaces'
import { tokenPocketLogo } from './tokenPocketLogo'
import { TokenPocketUser } from './TokenPocketUser'
import { UALTokenPocketError } from './UALTokenPocketError'

export class TokenPocket extends Authenticator {
  private users: TokenPocketUser[] = []
  private tokenPocketIsLoading: boolean = true
  private initError: UALError | null = null

  private readonly supportedChains = {
    // Token Pocket only supports mainnet
    aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906: {},
  }

  /**
   * TokenPocket Constructor.
   *
   * @param chains
   */
  constructor(chains: Chain[]) {
    super(chains)
  }

  private isTokenPocketReady(): boolean {
    return tp.isConnected()
  }

  private supportsAllChains(): boolean {
    if (this.chains.length < 1) {
      return false
    }

    for (const chain of this.chains) {
      if (!this.supportedChains.hasOwnProperty(chain.chainId)) {
        return false
      }
    }

    return true
  }

  /**
   * TokenPocket injects into the app from its internal browser, because of that we check on a
   * configured interval, allowing up to 5 seconds for TokenPocket to become available before
   * throwing an initialization error.
   */
  public async init(): Promise<void> {
    this.tokenPocketIsLoading = true
    try {
      if (!this.isTokenPocketReady()) {
        throw new Error('Unable to connect')
      }
    } catch (e) {
      this.initError = new UALTokenPocketError(
        'Error occurred during autologin',
        UALErrorType.Initialization,
        e)
    } finally {
      this.tokenPocketIsLoading = false
    }
  }

  public reset(): void {
    this.initError = null
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.init()
  }

  public getStyle(): ButtonStyle {
    return {
      icon: tokenPocketLogo,
      text: Name,
      textColor: 'white',
      background: '#347CEE'
    }
  }

  /**
   * The TokenPocket authenticator is chain and environment specific, it will only load
   * within the Token Pocket browser provided all chains are supported.
   */
  public shouldRender(): boolean {
    if (this.supportsAllChains() && this.isTokenPocketReady()) {
      return true
    }

    return false
  }

  public shouldAutoLogin(): boolean {
    // Always autologin if should render, since that should only be inside the Token Pocket browser
    return this.shouldRender()
  }

  /**
   * Requests the currently active account from Token Pocket, will throw a Login error if Token Pocket
   * does not respond or errors out
   */
  public async login(): Promise<User[]> {
    if (this.users.length === 0) {
      try {
        const response: WalletResponse = await tp.getCurrentWallet()
        if (response.result) {
          this.users.push(new TokenPocketUser(this.chains[0], response.data))
        } else {
          throw new Error('No result returned')
        }
      } catch (e) {
        throw new UALTokenPocketError(
          'Unable to get the current account during login',
          UALErrorType.Login,
          e)
      }
    }

    return this.users
  }

  /**
   * Clears the array of authenticated users
   * Note: The name - logout - is slightly misleading in this particular case
   * as calling this method will not log a user out of the Token Pocket app but rather
   * refresh the user list on the authenticator
   */
  public async logout(): Promise<void> {
    this.users = []
  }

  public async shouldRequestAccountName(): Promise<boolean> {
    return false
  }

  public isLoading(): boolean {
    return this.tokenPocketIsLoading
  }

  public isErrored(): boolean {
    return !!this.initError
  }

  public getError(): UALError | null {
    return this.initError
  }

  public getOnboardingLink(): string {
    return 'https://www.mytokenpocket.vip/en/'
  }

  public requiresGetKeyConfirmation(): boolean {
    return false
  }

  public getName(): string {
    return Name
  }
}
