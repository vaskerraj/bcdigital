import { Provider } from 'react-redux';
import { useRouter } from 'next/router'
import { useStore } from '../redux/store'
import Wrapper from '../components/Wrapper';

import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  const store = useStore(pageProps.initialReduxState);
  const router = useRouter();

  return (
    <Provider store={store}>
      {
        (router.asPath.indexOf("admin") === 1)
          ?
          (<Component {...pageProps} />)
          :
          (
            <Wrapper>
              <Component {...pageProps} />
            </Wrapper>
          )
      }

    </Provider>
  )
}

export default MyApp
