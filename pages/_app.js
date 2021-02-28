
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
            <Wrapper>
              <Component {...pageProps} />
            </Wrapper>
          )
      }

    </Provider>
  )
}

const makeStore = () => store;
const wrapper = createWrapper(makeStore);

export default wrapper.withRedux(MyApp);
