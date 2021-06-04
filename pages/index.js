import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux'

import axios from 'axios';

import { Phone, RotateCcw, Shield, Truck } from 'react-feather';
import { HistoryOutlined } from '@ant-design/icons'

import Wrapper from '../components/Wrapper';
import { listProducts } from '../redux/actions/productListAction';
import ImageCarousel from '../components/ImageCarousel';
import LastestProductSlider from '../components/helpers/LastestProductSlider';

const numberOfLatestProduct = 20;
const numberOfTrendingProduct = 10;

const Home = ({ banners, products }) => {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(listProducts());
  }, []);

  return (
    <Wrapper>
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
          imgWidth={'1188px'}
          imgHeight={'350px'}
          imgQuality={60}
        />
        <div className="container mt-5">
          <div className="text-center">
            <h2 className="text-capitalize" style={{ fontSize: '3rem' }}>Latest Products</h2>
          </div>
          <div className="d-block slide">
            <LastestProductSlider data={products} />
          </div>
          <div className="col mt-5">
            <div className="row services bg-white border pt-4 pb-4">
              <div className="col-sm-3 mt-2 mt-sm-0">
                <div className="d-flex">
                  <Shield size={38} color="#eb1c25" className="icon mr-1" />
                  <div>
                    <b>100% Secured Payments</b>
                    <div className="d-block">Your Payment Are Safe With Us.</div>
                  </div>
                </div>
              </div>
              <div className="col-sm-3 mt-2 mt-sm-0 border-left">
                <div className="d-flex">
                  <RotateCcw size={38} className="icon mr-1 text-primary" />
                  <div>
                    <b>Free Returns</b>
                    <div className="d-block">9 Days To Change Your Mind</div>
                  </div>
                </div>
              </div>
              <div className="col-sm-3 mt-2 mt-sm-0 border-left">
                <div className="d-flex">
                  <Phone size={38} className="icon mr-1 text-success" />
                  <div>
                    <b>Support 24/7</b>
                    <div className="d-block">
                      Contact Us 24 hours A Day
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-sm-3 mt-2 mt-sm-0 border-left">
                <div className="d-flex">
                  <Truck size={38} className="icon mr-1 text-info" />
                  <div>
                    <b>Home Delivery</b>
                    <div className="d-block">Home Delivery To Your City</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="d-block mt-5">
            <div className="text-center">
              <h2 className="text-capitalize" style={{ fontSize: '3rem' }}>Trending Products</h2>
            </div>
            <div className="d-block slide">

            </div>
          </div>
        </div>
      </div >
    </Wrapper>
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