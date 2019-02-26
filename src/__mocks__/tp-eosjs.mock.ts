import { authSignResponse, pushActionResponse, walletResponse } from './data.mock'

const tpEosjsMock = {
  isConnected: jest.fn().mockReturnValue(true),
  getCurrentWallet: jest.fn().mockReturnValue(walletResponse),
  pushEosAction: jest.fn().mockReturnValue(pushActionResponse),
  eosAuthSign: jest.fn().mockReturnValue(authSignResponse)
}

jest.mock('tp-eosjs', () => tpEosjsMock)
