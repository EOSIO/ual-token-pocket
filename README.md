# UAL for Token Pocket Authenticator ![EOSIO Alpha](https://img.shields.io/badge/EOSIO-Alpha-blue.svg)

This authenticator is meant to be used with [Token Pocket](https://www.mytokenpocket.vip/en/) and the [Universal Authenticator Library](https://github.com/EOSIO/universal-authenticator-library).

## Supported Environments

* The Token Pocket Authenticator is only supported within the Token Pocket Mobile App Browser

## Getting started

**Note:** be sure to read the [Warning and Limitations](#warning-and-limitations) section below.

`yarn add ual-token-pocket`

#### Dependencies

You must use one of the UAL renderers below.

React - `ual-reactjs-renderer`

PlainJS - `ual-plainjs-renderer`

#### Basic Usage with React

```javascript
import { TokenPocket } from 'ual-token-pocket'
import { UALProvider, withUAL } from 'ual-reactjs-renderer'

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

### Warnings and Limitations

Using Token Pocket within your app is no different than using other authenticator plugins. However, if your application is being used from within the Token Pocket mobile app it is using an embedded browser to view the application. The main restriction is that the Token Pocket mobile app (and consequently the authenticator) can **ONLY** communicate with EOS Mainnet. So when setting up UAL, if you specify other chains it will not work. This is also true if you specify additional chains along with Mainnet. This can make testing difficult if your application is using contracts that are not yet deployed to Mainnet.

### Testing on Mainnet

For a simple test to verify that authentication is working, you can stick with system contracts that are already present on Mainnet (e.g. transfer). In this case you can run a simple app locally fronted by [ngrok](https://ngrok.com/). Token Pocket DOES have the ability to point to an app for testing wherever it is being hosted (i.e. the ngrok url), but the app must only use Mainnet. Below is a brief outline of how to test Token Pocket with a local instance of your app:

* Start up your test application
* If running locally, forward it with ngrok
* In your mobile Token Pocket app
  - Login as usual
  - Navigate to the "Discover" tab
  - Enter the test URL in the top search bar or select the "Dapp Browser" app and enter the test URL

From this point on, the app should behave as expected.

## Contribution
Check out the [Contributing](./CONTRIBUTING.md) guide and please adhere to the [Code of Conduct](./CONTRIBUTING.md#conduct)

## License
[MIT licensed](./LICENSE)

## Important

See LICENSE for copyright and license terms.  Block.one makes its contribution on a voluntary basis as a member of the EOSIO community and is not responsible for ensuring the overall performance of the software or any related applications.  We make no representation, warranty, guarantee or undertaking in respect of the software or any related documentation, whether expressed or implied, including but not limited to the warranties or merchantability, fitness for a particular purpose and noninfringement. In no event shall we be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or documentation or the use or other dealings in the software or documentation.  Any test results or performance figures are indicative and will not reflect performance under all conditions.  Any reference to any third party or third-party product, service or other resource is not an endorsement or recommendation by Block.one.  We are not responsible, and disclaim any and all responsibility and liability, for your use of or reliance on any of these resources. Third-party resources may be updated, changed or terminated at any time, so the information here may be out of date or inaccurate.
