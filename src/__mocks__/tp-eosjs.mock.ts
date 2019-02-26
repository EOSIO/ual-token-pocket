const tpEosjsMock = {
  isConnected: jest.fn(),
  getCurrentWallet: jest.fn(),
  pushEosAction: jest.fn(),
  eosAuthSign: jest.fn(),
}

jest.mock('tp-eosjs', () => tpEosjsMock)
