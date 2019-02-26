import './__mocks__/tp-eosjs.mock'
import { wallet, chain, authSignResponse, pushActionResponse } from './__mocks__/data.mock'

import { UALErrorType } from '@blockone/universal-authenticator-library'
import * as tp from 'tp-eosjs'

import { Name } from './interfaces'
import { TokenPocketUser } from './TokenPocketUser'
import { UALTokenPocketError } from './UALTokenPocketError'

describe('TokenPocketUser', () => {
  let user: TokenPocketUser

  beforeEach(() => {
    user = new TokenPocketUser(chain, wallet)
  })

  it('gets the account name', async () => {
    const accountName = await user.getAccountName()
    expect(accountName).toEqual(wallet.name)
  })

  it('get the keys', async () => {
    const keys = await user.getKeys()
    expect(keys).toEqual([wallet.address])
  })

  it('gets the chain ID', async () => {
    const chainId = await user.getChainId()
    expect(chainId).toEqual(chain.chainId)
  })

  describe('signArbitrary', () => {
    const publicKey = 'testPublicKey'
    const data = 'testSignData'
    const helpText = 'test help text'

    beforeEach(() => {
      tp.eosAuthSign.mockReturnValue(authSignResponse)
    })

    it('signs arbitrary data', async () => {
      const signature = await user.signArbitrary(publicKey, data, helpText)

      expect(signature).toEqual(authSignResponse.data.signature)
      expect(tp.eosAuthSign).toHaveBeenCalledWith(
        { from: wallet.name, publicKey, signdata: data }
      )
    })

    it('throws UALError on api error', async () => {
      const errorMsg = 'Unable to sign'
      tp.eosAuthSign.mockImplementation(() => {
        throw new Error(errorMsg)
      })
      let didThrow = true

      try {
        await user.signArbitrary(publicKey, data, helpText)
        didThrow = false
      } catch (e) {
        const ex = e as UALTokenPocketError
        expect(ex.message).toEqual('Unable to sign arbitrary string')
        expect(ex.source).toEqual(Name)
        expect(ex.type).toEqual(UALErrorType.Signing)
        expect(ex.cause).toEqual(new Error(errorMsg))
      }

      expect(didThrow).toBe(true)
    })

    it('throws UALError if result is not set', async () => {
      tp.eosAuthSign.mockReturnValue({
        result: false,
        data: {},
        msg: 'test'
      })
      let didThrow = true

      try {
        await user.signArbitrary(publicKey, data, helpText)
        didThrow = false
      } catch (e) {
        const ex = e as UALTokenPocketError
        expect(ex.message).toEqual('Unable to sign arbitrary string')
        expect(ex.source).toEqual(Name)
        expect(ex.type).toEqual(UALErrorType.Signing)
        expect(ex.cause).toEqual(new Error('No result returned'))
      }

      expect(didThrow).toBe(true)
    })
  })

  describe('signTransaction', () => {
    const transaction = { test: 'test' }

    beforeEach(() => {
      tp.pushEosAction.mockReturnValue(pushActionResponse)
    })

    it('signs the transaction', async () => {
      const result = await user.signTransaction(transaction, {})
      expect(result).toEqual({
        transaction,
        wasBroadcast: true,
        transactionId: pushActionResponse.data.transactionId
      })
      expect(tp.pushEosAction).toHaveBeenCalledWith(
        { test: 'test', account: wallet.name, address: wallet.address}
      )
    })

    it('throws UALError on failed signTransaction', async () => {
      tp.pushEosAction.mockImplementation(() => {
        throw new Error('Unable to transact')
      })
      let didThrow = true

      try {
        await user.signTransaction(transaction, {})
        didThrow = false
      } catch (e) {
        const ex = e as UALTokenPocketError
        expect(ex.source).toEqual(Name)
        expect(ex.type).toEqual(UALErrorType.Signing)
        expect(ex.cause).not.toBeNull()
      }

      expect(didThrow).toBe(true)
    })
  })
})
