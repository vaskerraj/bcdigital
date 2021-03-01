import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import Head from 'next/head';
import { listProducts } from '../redux/actions/productListAction';

const Home = () => {
  const dispatch = useDispatch();
  const productList = useSelector(state => state.productList);
  const { loading, products, error } = productList;
  useEffect(() => {
    dispatch(listProducts());
  }, []);
  return (
    <div>
      <Head>
        <title>Home || BC Digital</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div></div>
    </div>
  )
}

export default Home;