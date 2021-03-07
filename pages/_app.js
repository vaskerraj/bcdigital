
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Provider } from 'react-redux';
import { createWrapper } from 'next-redux-wrapper';
import store from '../redux/store';
import Wrapper from '../components/Wrapper';

import 'bootstrap/dist/css/bootstrap.css';
import '../styles/globals.css'
import FirebaseAuthState from '../components/FirebaseAuthState';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    <Provider store={store}>
      <FirebaseAuthState>
        {
          (router.asPath.indexOf("admin") === 1)
            ?
            (
              <Component {...pageProps} />
            )
            :
            (
              <Wrapper>
                <Component {...pageProps} />
              </Wrapper>
            )
        }
      </FirebaseAuthState>
    </Provider>
  )
}

const makeStore = () => store;
const wrapper = createWrapper(makeStore);

export default wrapper.withRedux(MyApp);
