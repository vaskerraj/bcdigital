
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Provider } from 'react-redux';
import { createWrapper } from 'next-redux-wrapper';
import store from '../redux/store';
import ad_store from '../redux/ad_store';
import Wrapper from '../components/Wrapper';

import 'bootstrap/dist/css/bootstrap.css';
import '../styles/globals.css'
import FirebaseAuthState from '../components/FirebaseAuthState';
import FirebaseAdminAuthState from '../components/admin/FirebaseAdminAuthState';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    <>
      {
        (router.asPath.indexOf("admin") === 1)
          ?
          (
            <Provider store={ad_store}>
              <FirebaseAdminAuthState>
                <Component {...pageProps} />
              </FirebaseAdminAuthState>

            </Provider>
          )
          :
          (

            <Provider store={store}>
              <FirebaseAuthState>
                <Wrapper>
                  <Component {...pageProps} />
                </Wrapper>
              </FirebaseAuthState>
            </Provider>
          )
      }
    </ >
  )
}

const makeStore = () => store;
const wrapper = createWrapper(makeStore);

export default wrapper.withRedux(MyApp);
