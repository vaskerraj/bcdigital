import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux'

import axios from 'axios';

import { listProducts } from '../redux/actions/productListAction';
import ImageCarousel from '../components/ImageCarousel';
import LastestProductSlider from '../components/helpers/LastestProductSlider';

const numberOfLatestProduct = 10;
const numberOfTrendingProduct = 10;

const Home = ({ banners, products }) => {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(listProducts());
  }, []);

  return (
    <div>
      <Head>
        <title>Home || BC Digital</title>
        <link rel="icon" href="/favicon.ico" />
        <script defer src="/js/solid.js"></script>
        <script defer src="/your-path-to-fontawesome/js/fontawesome.js"></script>
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
        <div className="container mt-5">
          <div className="text-center">
            <h2 className="text-capitalize" style={{ fontSize: '3rem' }}>Latest Products</h2>
          </div>
          <div className="d-block slide">
            <LastestProductSlider data={products} />
          </div>
        </div>
      </div>
    </div>
  )
}
export async function getServerSideProps(context) {
  try {
    const { data: bannerData } = await axios.get(`${process.env.api}/api/banner/position_home`);
    const { data: productData } = await axios.get(`${process.env.api}/api/products/number/${numberOfLatestProduct}`);
    return {
      props: {
        banners: bannerData,
        products: productData
      }
    }
  } catch (err) {
    return {
      props: {},
    };
  }
}

export default Home;