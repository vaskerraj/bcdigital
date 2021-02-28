import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import Head from 'next/head';
import { listProducts } from '../redux/actions/productListAction';

const Home = () => {

  return (
    <>
      <Head>
        <title>Home || BC Digital</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://unpkg.com/bootstrap-material-design@4.1.1/dist/css/bootstrap-material-design.min.css" integrity="sha384-wXznGJNEXNG1NFsbm0ugrLFMQPWswR3lds2VeinahP8N0zJw9VWSopbjv2x7WCvX" crossorigin="anonymous"></link>
      </Head>
    </>
  )
}

export default Home;