import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useSelector } from 'react-redux';

import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { Layout, Card, Rate, Affix } from 'antd';
const { Content } = Layout;
import { ArrowLeft } from 'react-feather';

import useWindowDimensions from '../../../helpers/useWindowDimensions';
import UserSidebarNav from '../../../components/nav/UserSidebarNav';
import Wrapper from '../../../components/Wrapper';
import { customImageLoader } from '../../../helpers/functions';

const Reviews = ({ reviews }) => {
    console.log(reviews)
    const { width } = useWindowDimensions();
    const [onlyMobile, setOnlyMoble] = useState(false);

    useEffect(() => {
        if (width <= 576) {
            setOnlyMoble(true);
        } else {
            setOnlyMoble(false);
        }
    }, [width]);


    const ratingTooltip = ['Very Poor', 'Poor', 'Normal', 'Good', 'Wonderful'];

    const productWithReview = (item, orderedBy) => {
        const checkReviewed = item.review.find(ele => ele.postedBy === orderedBy);
        return (
            <ul className="list-unstyled">
                <li key={item._id}>
                    <div className="row">
                        <div className={`${checkReviewed === undefined ? 'col-12 col-sm-7 col-md-8' : 'col-12'}`}>
                            <div className="d-flex">
                                <Image src={`/uploads/products/${item.colour[0].images[0]}`}
                                    layout="fixed"
                                    width="100"
                                    height="100"
                                    objectFit="cover"
                                    objectPosition="top center"
                                    quality="50"
                                    loader={customImageLoader}
                                />
                                <div className="product-detail ml-3" style={{ width: '100%' }}>
                                    <div className="product-name">{item.name}</div>
                                    <div className="d-flex justify-content-between align-items-center mt-1">
                                        <div>
                                            <div className="">
                                                {item.products[0].size !== 'nosize' ? `Size : ${item.products[0].size} ` : ''}
                                            </div>
                                        </div>
                                        {onlyMobile && checkReviewed === undefined &&
                                            <Link href={`/user/reviews/${item.productId}`}>
                                                <div className="d-block text-right mt-1">
                                                    <button className="btn btn-success btn-sm">Write a Review</button>
                                                </div>
                                            </Link>
                                        }
                                    </div>
                                    {checkReviewed !== undefined &&
                                        <Link href={`/user/reviews/${item.productId}`}>
                                            <div className="d-block cp">
                                                <div className="">
                                                    <Rate
                                                        value={checkReviewed.rating}
                                                        className="custom-rating-star"
                                                        disabled={true}
                                                    />
                                                    {checkReviewed.rating ?
                                                        <span className="ant-rate-text">
                                                            {ratingTooltip[checkReviewed.rating - 1]}
                                                        </span>
                                                        :
                                                        ''
                                                    }
                                                </div>
                                                <div className="mt-1">
                                                    <div>Your Review/Feedback</div>
                                                    <div className="review-container">
                                                        {checkReviewed.review}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className={`${checkReviewed === undefined ? 'd-none d-sm-block col-sm-5 col-md-4 text-right' : 'd-none'}`}>
                            {checkReviewed === undefined &&
                                <Link href={`/user/reviews/${item.productId}`}>
                                    <button className="btn c-btn-primary">Write a Review</button>
                                </Link>
                            }
                        </div>
                    </div>
                    <div className="d-block">

                    </div>
                </li>
            </ul >
        )
    }
    return (
        <>
            <Wrapper>
                <Head>
                    <title>Reviews | BC Digital</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                {onlyMobile &&
                    <Affix offsetTop={70}>
                        <div className="row bg-white backNav-container border-top p-2">
                            <div className="d-flex align-items-center mb-2">
                                <ArrowLeft className="mr-3" onClick={() => router.back()} />
                                Reviews
                            </div>
                        </div>
                    </Affix>
                }
                <div className="container mt-4">
                    <Layout>
                        {!onlyMobile &&
                            <UserSidebarNav onActive="reviews" />
                        }
                        <Layout className="site-layout">
                            <Content
                                style={{
                                    margin: onlyMobile ? '0' : '0 0 0 15px'
                                }}>
                                <Card style={{
                                    minHeight: '60vh'
                                }}>
                                    <div className="page-header">
                                        <h1>Reviews</h1>
                                    </div>
                                    <div className="d-block mt-5">
                                        <ul className="review-products list-unstyled">
                                            {reviews && reviews.map(review => (
                                                <li key={review._id}>
                                                    {review.products.map(product => (
                                                        productWithReview(product, review.orderedBy)
                                                    ))
                                                    }
                                                </li>
                                            ))
                                            }
                                        </ul>
                                    </div>
                                </Card>
                            </Content>
                        </Layout>
                    </Layout>
                </div>
            </Wrapper>
        </>
    );
}
export async function getServerSideProps(context) {
    try {
        const { token } = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/reviews`, {
            headers: {
                token,
            },
        });
        return {
            props: {
                reviews: data
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/login?redirect=/user/account',
                destination: '/login?redirect=/user/account',
                permanent: false,
            },
            props: {},
        };
    }
}

export default Reviews;
