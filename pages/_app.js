import { Provider } from 'react-redux';
import { useStore } from '../redux/store'
import Wrapper from '../components/Wrapper';

import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  const store = useStore(pageProps.initialReduxState)
  return (
    <Provider store={store}>
      <Wrapper>
        <Component {...pageProps} />
      </Wrapper>
    </Provider>
  )
}

export default MyApp
