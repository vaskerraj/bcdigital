import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux'

import axios from 'axios';

import { listProducts } from '../redux/actions/productListAction';
import ImageCarousel from '../components/ImageCarousel';

const Home = ({ banners }) => {

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
      <div>
        <ImageCarousel
          data={banners}
          autoplay={true}
          autoplaySpeed={5000}
          imgWidth={'1250px'}
          imgHeight={'410px'}
          imgQuality={60}
        />
      </div>
    </div>
  )
}
export async function getServerSideProps(context) {
  try {
    const { data: bannerData } = await axios.get(`${process.env.api}/api/banner/position_home`);
    return {
      props: {
        banners: bannerData
      }
    }
  } catch (err) {
    return {
      props: {},
    };
  }
}

export default Home;