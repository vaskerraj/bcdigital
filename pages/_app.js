
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Provider } from 'react-redux';
import { createWrapper } from 'next-redux-wrapper';
import store from '../redux/store';
import Wrapper from '../components/Wrapper';

import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    <Provider store={store}>
      {
        (router.asPath.indexOf("admin") === 1)
          ?
          (
            <Component {...pageProps} />
          )
          :
          (
            <>
              <Head>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha2/css/bootstrap.min.css" integrity="sha384-DhY6onE6f3zzKbjUPRc2hOzGAdEf4/Dz+WJwBvEYL/lkkIsI3ihufq9hk9K4lVoK" crossOrigin="anonymous"></link>
              </Head>
              <Wrapper>
                <Component {...pageProps} />
              </Wrapper>
            </>
          )
      }

    </Provider>
  )
}

const makeStore = () => store;
const wrapper = createWrapper(makeStore);

export default wrapper.withRedux(MyApp);
