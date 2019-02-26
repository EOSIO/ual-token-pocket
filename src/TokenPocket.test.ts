import './__mocks__/tp-eosjs.mock'
import { walletResponse } from './__mocks__/data.mock'

import { Chain, RpcEndpoint, UALErrorType } from '@blockone/universal-authenticator-library'
import * as tp from 'tp-eosjs'

import { Name } from './interfaces'
import { TokenPocket } from './TokenPocket'
import { UALTokenPocketError } from './UALTokenPocketError'

jest.useFakeTimers()


describe('TokenPocket', () => {

  describe('init', () => {
    it('loading should be false if TokenPocket is not loaded', () => {
      const tokenPocket = new TokenPocket([] as Chain[])
      tp.isConnected.mockReturnValue(false)
      tokenPocket.init()
      .then(() => {
        // Make the API available after 0.5 sec
        jest.advanceTimersByTime(500)
        tp.isConnected.mockReturnValue(true)
        // Run timers to completion
        jest.runAllTimers()
        expect(tokenPocket.isLoading()).toBe(false)
      })
    })

    it('loading should be true if TokenPocket is not loaded', () => {
      const tokenPocket = new TokenPocket([] as Chain[])
      tokenPocket.init()
      jest.runAllTimers()
      expect(tokenPocket.isLoading()).toBe(true)
    })
  })

  describe('shouldRender', () => {
    it('should return false if a given chain is not supported', () => {
      const chains = [
        {
          chainId: '687fa513e18843ad3e820744f4ffcf93k1354036d80737db8dc444fe4m15ad17',
          rpcEndpoints: [] as RpcEndpoint[]
        },
        {
          chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
          rpcEndpoints: [] as RpcEndpoint[]
        }
      ]
      const tokenPocket = new TokenPocket(chains)
      const shouldRender = tokenPocket.shouldRender()
      jest.runAllTimers()
      expect(shouldRender).toBe(false)
    })

    it('should return true if all given chains are supported', () => {
      const chains = [
        {
          chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
          rpcEndpoints: [] as RpcEndpoint[]
        }
      ]
      const tokenPocket = new TokenPocket(chains)
      const shouldRender = tokenPocket.shouldRender()
      jest.runAllTimers()
      expect(shouldRender).toBe(true)
    })
  })

  describe('login', () => {
    it('should get the accounts', async () => {
      const tokenPocket = new TokenPocket([] as Chain[])
      const accounts = await tokenPocket.login()
      expect(accounts.length).toBe(1)
      const accountName = await accounts[0].getAccountName()
      expect(accountName).toBe(walletResponse.data.name)
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

  describe('isLoading', () => {
    it('defaults to true when the authenticator is not initialized', () => {
      const tokenPocket = new TokenPocket([] as Chain[])
      expect(tokenPocket.isLoading()).toBe(true)
    })

    it('is true while authenticator is initializing, and transitions when done', () => {
      const tokenPocket = new TokenPocket([] as Chain[])
      tokenPocket.init()
      .then(() => {
        // Make the API available after 0.5 sec
        jest.advanceTimersByTime(500)
        tp.isConnected.mockReturnValue(true)
        // Run timers to completion
        jest.runAllTimers()
        expect(tokenPocket.isLoading()).toBe(false)
      })
    })
  })
})
