# Authenticator for Token Pocket

This authenticator is meant to be used with [Universal Authenticator Library](https://github.com/EOSIO/universal-authenticator-library)

## Getting started

**Note:** be sure to read the [Warning and limitations](#warning-and-limitations) section below.

`yarn add @blockone/ual-token-pocket`

#### Dependencies

You must use one of the UAL renderers below.

React - `@blockone/universal-authenticator-library-react`

Vanillajs - `@blockone/universal-authenticator-library-js`


#### Basic Usage with React

```

import { TokenPocket } from '@blockone/ual-token-pocket'
import { UALProvider, withUAL } from '@blockone/universal-authenticator-library-react'

const exampleNet = {
  chainId: '',
  rpcEndpoints: [{
    protocol: '',
    host: '',
    port: '',
  }]
}

const App = (props) => <div>{JSON.stringify(props.ual)}</div>
const AppWithUAL = withUAL(App)

const tokenPocket = new TokenPocket([chain])

<UALProvider chains={[exampleNet]} authenticators={[tokenPocket]}>
  <AppWithUAL />
</UALProvider>
```

### Warning and Limitations
Using Token Pocket within your app is no different than using other authenticator plugins. However, if your application is being used from within the Token Pocket mobile app it is a bit sandboxed. The main restriction is that the Token Pocket mobile app (and consequently the authenticator) can **ONLY** communicate with EOS Mainnet. So when setting up UAL, if you specify other chains it will not work. This is also true if you specify additional chains along with Mainnet. This can make testing difficult if your application is using contracts that are not yet deployed to Mainnet.

### Testing on Mainnet
For a simple test to verify the authentication is working, you can stick with system contracts that are already present on Mainnet (e.g. transfer). In this case you can run a simple app locally fronted by ngrok. Token Pocket DOES have the ability to point to an app for testing wherever it lives. But the app must only use Mainnet. So basically:

* Start up your test application
* If running locally, forward it with ngrok
* In your mobile Token Pocket app
  - Login as usual
  - Navigate to the "Discover" tab
  - Enter the test URL in the top search bar or select the "Dapp Browser" app and enter the test URL

From this point on, the app should behave as expected.
