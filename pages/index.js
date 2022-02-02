import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux'

import axios from 'axios';
import axiosApi from '../helpers/api';

import { Phone, RotateCcw, Shield, Truck } from 'react-feather';
import { LoadingOutlined } from '@ant-design/icons';

import Wrapper from '../components/Wrapper';
import ImageCarousel from '../components/ImageCarousel';
import TrendingProductSlider from '../components/helpers/TrendingProductSlider';
import ProductCard from '../components/helpers/ProductCard';

const Home = ({ banners, trendings, products }) => {

  const [lastestProduct, setLastestProduct] = useState(products);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const trendingProducts = trendings.filter(item => item.products !== null);

  const loadMoreLatestProducts = async () => {
    setIsFetching(true);
    const { data } = await axiosApi.post("/api/products/latest", {
      page
    });
    if (data) {
      setLastestProduct((prevItems) => {
        return [...new Set([...prevItems, ...data])];
      });
      setHasMore(data.length > 0);
      setIsFetching(false);
    }
  }
  useEffect(() => {
    if (page !== 1) loadMoreLatestProducts();
  }, [page]);

  return (
    <Wrapper>
      <Head>
        <title>Home || BC Digital</title>
        <link rel="icon" href="/favicon.ico" />
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
            <h2 className="text-capitalize" style={{ fontSize: '3rem' }}>Trending Products</h2>
          </div>
          <div className="d-block slide">
            <TrendingProductSlider data={trendingProducts} />
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
              <h2 className="text-capitalize" style={{ fontSize: '3rem' }}>Lastest Products</h2>
            </div>
            <div className="d-block slide">
              <div className="d-flex flex-wrap">
                {lastestProduct.map(product => (
                  <div key={product._id} className="mt-3">
                    <ProductCard data={product} />
                  </div>
                ))}
              </div>
              {hasMore && lastestProduct < 20 && (
                <div className="d-block text-center mt-3">
                  <button type="button"
                    className="btn c-btn-primary"
                    onClick={() => setPage((prevPageNumber) => prevPageNumber + 1)}
                  >
                    {isFetching ? <LoadingOutlined className="pl-5 pr-5" /> : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div >
    </Wrapper >
  )
}
export async function getServerSideProps(context) {
  try {
    const { data: bannerData } = await axios.get(`${process.env.api}/api/banner/position_home`);
    const { data: trendingData } = await axios.get(`${process.env.api}/api/products/trending`);
    const { data: productData } = await axios.post(`${process.env.api}/api/products/latest`);
    return {
      props: {
        banners: bannerData,
        trendings: trendingData,
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