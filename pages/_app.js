import { useRouter } from 'next/router'
import { Provider } from 'react-redux';
import { createWrapper } from 'next-redux-wrapper';

import 'bootstrap/dist/css/bootstrap.css';
import '../styles/globals.css'
import FirebaseAuthState from '../components/FirebaseAuthState';
import FirebaseAdminAuthState from '../components/admin/FirebaseAdminAuthState';
import FirebaseSellerAuthState from '../components/seller/FirebaseSellerAuthState';

import store from '../redux/store';
import ad_store from '../redux/ad_store';
import sell_store from '../redux/sell_store';
import Wrapper from '../components/Wrapper';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  if (router.asPath.indexOf("admin") === 1) {
    return (
      <Provider store={ad_store}>
        <FirebaseAdminAuthState>
          <Component {...pageProps} />
        </FirebaseAdminAuthState>
      </Provider>
    )
  } else if (router.asPath.indexOf("seller") === 1) {
    return (
      <Provider store={sell_store}>
        <FirebaseSellerAuthState>
          <Component {...pageProps} />
        </FirebaseSellerAuthState>
      </Provider>
    )
  } else {
    return (
      <Provider store={store}>
        <FirebaseAuthState>
          <Component {...pageProps} />
        </FirebaseAuthState>
      </Provider>
    )
  }
}

const makeStore = () => store;
const wrapper = createWrapper(makeStore);

export default wrapper.withRedux(MyApp);
