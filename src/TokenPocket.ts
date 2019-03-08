import {
  Authenticator,
  ButtonStyle,
  Chain,
  UALError,
  UALErrorType,
  User
} from '@blockone/universal-authenticator-library'
import tp from 'tp-eosjs'

import { Name, WalletResponse } from './interfaces'
import { tokenPocketLogo } from './tokenPocketLogo'
import { TokenPocketUser } from './TokenPocketUser'
import { UALTokenPocketError } from './UALTokenPocketError'

export class TokenPocket extends Authenticator {
  // Interval to test for whether the Token Pocket API is connected
  private static API_LOADED_CHECK_INTERVAL = 500
  // Number of times to look for the Token Pocket API before giving up
  private static NUM_CHECKS = 10
  private users: TokenPocketUser[] = []
  private tokenPocketIsLoading: boolean = true
  private initError: UALError | null = null

  private readonly supportedChains = {
    // Token Pocket only supports mainnet
    aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906: {},
  }

  /**
   * TokenPocket Constructor.
   * @param chains
   */
  constructor(chains: Chain[]) {
    super(chains)
  }

  private isTokenPocketReady(): Promise<boolean> {
    return new Promise((resolve) => {
      let checkCount = TokenPocket.NUM_CHECKS
      const checkInterval = setInterval(() => {
        if (tp.isConnected() || checkCount === 0) {
          clearInterval(checkInterval)
          resolve(tp.isConnected())
        }
        checkCount--
      }, TokenPocket.API_LOADED_CHECK_INTERVAL)
    })
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

  public isMobile(): boolean {
    const userAgent = window.navigator.userAgent
    const isIOS = userAgent.includes('iPhone') || userAgent.includes('iPad')
    const isMobile = userAgent.includes('Mobile')
    const isAndroid = userAgent.includes('Android')

    return isIOS || isMobile || isAndroid
  }

  /**
   * TokenPocket injects into the app from its internal browser, because of that we check on a
   * configured interval, allowing up to 5 seconds for TokenPocket to become available before
   * throwing an initialization error.
   */
  public async init(): Promise<void> {
    this.tokenPocketIsLoading = true
    try {
      if (!await this.isTokenPocketReady()) {
        this.initError = new UALTokenPocketError('Error occurred while connecting',
          UALErrorType.Initialization,
          null
        )
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
    // tslint:disable-next-line:no-floating-promises
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
    if (this.supportsAllChains() && this.isMobile()) {
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
}
