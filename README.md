# UAL for Token Pocket Authenticator

This authenticator is meant to be used with [Token Pocket](https://www.mytokenpocket.vip/en/) and the [Universal Authenticator Library](https://github.com/EOSIO/universal-authenticator-library).

![EOSIO Labs](https://img.shields.io/badge/EOSIO-Labs-5cb3ff.svg)

# About EOSIO Labs

EOSIO Labs repositories are experimental.  Developers in the community are encouraged to use EOSIO Labs repositories as the basis for code and concepts to incorporate into their applications. Community members are also welcome to contribute and further develop these repositories. Since these repositories are not supported by Block.one, we may not provide responses to issue reports, pull requests, updates to functionality, or other requests from the community, and we encourage the community to take responsibility for these.

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

See [LICENSE](./LICENSE) for copyright and license terms.

All repositories and other materials are provided subject to the terms of this [IMPORTANT](./IMPORTANT.md) notice and you must familiarize yourself with its terms.  The notice contains important information, limitations and restrictions relating to our software, publications, trademarks, third-party resources, and forward-looking statements.  By accessing any of our repositories and other materials, you accept and agree to the terms of the notice.
