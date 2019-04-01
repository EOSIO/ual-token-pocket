import './__mocks__/tp-eosjs.mock'
import { walletResponse } from './__mocks__/data.mock'

import { Chain, RpcEndpoint, UALErrorType } from 'universal-authenticator-library'
import * as tp from 'tp-eosjs'

import { Name } from './interfaces'
import { TokenPocket } from './TokenPocket'
import { UALTokenPocketError } from './UALTokenPocketError'

describe('TokenPocket', () => {
  describe('init', () => {
    beforeEach(() => {
      tp.isConnected.mockReturnValue(true)
    })

    it('loading should be false if Token Pocket is connected', async () => {
      const tokenPocket = new TokenPocket([] as Chain[])
      await tokenPocket.init()

      expect(tokenPocket.isLoading()).toBe(false)
      expect(tp.isConnected).toHaveBeenCalled()
    })

    it('loading should be false if Token Pocket is not connected', async () => {
      tp.isConnected.mockReturnValue(false)
      const tokenPocket = new TokenPocket([] as Chain[])
      await tokenPocket.init()

      expect(tokenPocket.isLoading()).toBe(false)
      expect(tp.isConnected).toHaveBeenCalled()
    })

    it('sets initError if it cant connect to Token Pocket', async () => {
      tp.isConnected.mockReturnValue(false)
      const tokenPocket = new TokenPocket([] as Chain[])
      await tokenPocket.init()

      const error = tokenPocket.getError() as UALTokenPocketError
      expect(error.source).toEqual(Name)
      expect(error.message).toEqual('Error occurred during autologin')
      expect(error.type).toEqual(UALErrorType.Initialization)
      expect(error.cause).toEqual(new Error('Unable to connect'))
    })
  })

  describe('shouldRender', () => {
    const chains = [
      {
        chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
        rpcEndpoints: [] as RpcEndpoint[]
      }
    ]

    beforeEach(() => {
      tp.isConnected.mockReturnValue(true)
    })

    it('should return true if all given chains are supported and Token Pocket is connected', () => {
      const tokenPocket = new TokenPocket(chains)
      const shouldRender = tokenPocket.shouldRender()
      expect(shouldRender).toBe(true)
    })

    it('should return false if a given chain is not supported', () => {
      const chainsWithUnsupportedChain = [
        {
          chainId: 'testChain',
          rpcEndpoints: [] as RpcEndpoint[]
        },
        {
          chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
          rpcEndpoints: [] as RpcEndpoint[]
        }
      ]
      const tokenPocket = new TokenPocket(chainsWithUnsupportedChain)
      const shouldRender = tokenPocket.shouldRender()
      expect(shouldRender).toBe(false)
    })

    it('returns false if Token Pocket is not connected', async () => {
      tp.isConnected.mockReturnValue(false)
      const tokenPocket = new TokenPocket(chains)
      const shouldRender = tokenPocket.shouldRender()
      expect(shouldRender).toBe(false)
    })

    it('should return false if a given chain is not supported and Token Pocket is not connected', () => {
      const chainsWithUnsupportedChain = [
        {
          chainId: 'testChain',
          rpcEndpoints: [] as RpcEndpoint[]
        },
        {
          chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
          rpcEndpoints: [] as RpcEndpoint[]
        }
      ]
      tp.isConnected.mockReturnValue(false)
      const tokenPocket = new TokenPocket(chainsWithUnsupportedChain)
      const shouldRender = tokenPocket.shouldRender()
      expect(shouldRender).toBe(false)
    })
  })

  describe('login', () => {
    beforeEach(() => {
      tp.getCurrentWallet.mockReturnValue(walletResponse)
    })

    it('should get the accounts', async () => {
      const tokenPocket = new TokenPocket([] as Chain[])
      const accounts = await tokenPocket.login()
      expect(accounts.length).toBe(1)
      expect(tp.getCurrentWallet).toHaveBeenCalled()
    })

    it('should get the accounts names', async () => {
      const tokenPocket = new TokenPocket([] as Chain[])
      const accounts = await tokenPocket.login()
      const accountName = await accounts[0].getAccountName()
      expect(accountName).toBe(walletResponse.data.name)
      expect(tp.getCurrentWallet).toHaveBeenCalled()
    })

    it('throws UALError if result is not set', async () => {
      tp.getCurrentWallet.mockReturnValue({
        result: false,
        data: {},
        msg: 'test'
      })

      const tokenPocket = new TokenPocket([] as Chain[])
      let didThrow = true

      try {
        await tokenPocket.login()
        didThrow = false
      } catch (e) {
        const ex = e as UALTokenPocketError
        expect(ex.source).toEqual(Name)
        expect(ex.type).toEqual(UALErrorType.Login)
        expect(ex.cause).toEqual(new Error('No result returned'))
      }

      expect(didThrow).toBe(true)
    })

    it('throws UALError on api error', async () => {
      const errorMsg = 'Unable to login'
      tp.getCurrentWallet.mockImplementation(() => {
        throw new Error(errorMsg)
      })

      const tokenPocket = new TokenPocket([] as Chain[])
      let didThrow = true

      try {
        await tokenPocket.login()
        didThrow = false
      } catch (e) {
        const ex = e as UALTokenPocketError
        expect(ex.source).toEqual(Name)
        expect(ex.type).toEqual(UALErrorType.Login)
        expect(ex.cause).toEqual(new Error(errorMsg))
      }

      expect(didThrow).toBe(true)
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})
