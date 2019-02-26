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

  constructor(chains: Chain[]) {
    super(chains)
  }

  private isTokenPocketReady(): Promise<boolean> {
    return new Promise((resolve) => {
      let checkCount = TokenPocket.NUM_CHECKS
      const checkInterval = setInterval(() => {
        if (!!tp.isConnected() || checkCount === 0) {
          clearInterval(checkInterval)
          resolve(!!tp.isConnected())
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

  public async init(): Promise<void> {
    this.tokenPocketIsLoading = true
    try {
      await this.isTokenPocketReady()
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
    this.init().catch((e) => {
      throw new UALTokenPocketError(
        'Unable to get the current account during login',
        UALErrorType.Login,
        e)
    })
  }

  public getStyle(): ButtonStyle {
    return {
      icon: tokenPocketLogo,
      text: Name,
      textColor: '#222222',
      background: '#F5FAFE'
    }
  }

  public shouldRender(): boolean {
    // TODO: determine if in env where token pocket is available
    if (this.supportsAllChains()) {
      return true
    }

    return false
  }

  public shouldAutoLogin(): boolean {
    // Always autologin if should render, since that should only be inside the Token Pocket browser
    return this.shouldRender()
  }

  public async login(_?: string): Promise<User[]> {
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

  // Token Pocket doesn't really have a "logout" concept
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
}
