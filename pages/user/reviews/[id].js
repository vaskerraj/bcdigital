import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useSelector } from 'react-redux';

import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { useForm } from 'react-hook-form';

import { Layout, Card, message, Rate, Affix } from 'antd';
const { Content } = Layout;
import { ArrowLeft } from 'react-feather';

import useWindowDimensions from '../../../helpers/useWindowDimensions';
import UserSidebarNav from '../../../components/nav/UserSidebarNav';
import Wrapper from '../../../components/Wrapper';
import { customImageLoader } from '../../../helpers/functions';

// config antdesign message
message.config({
    top: '25vh',
    maxCount: 1,
    duration: 3,
});

const ReviewDetails = ({ product, review }) => {
    console.log(review)
    const { width } = useWindowDimensions();
    const [onlyMobile, setOnlyMoble] = useState(false);

    useEffect(() => {
        if (width <= 576) {
            setOnlyMoble(true);
        } else {
            setOnlyMoble(false);
        }
    }, [width])

    const [rating, setRating] = useState(review ? review.rating : 5);
    const ratingTooltip = ['Very Poor', 'Poor', 'Normal', 'Good', 'Wonderful'];

    const router = useRouter();
    const { userInfo } = useSelector(state => state.userAuth);

    const { handleSubmit, register } = useForm();

    const onSubmit = async (formdata) => {
        try {
            const { data } = await axiosApi.put(`/api/review`, {
                productId: product._id,
                rating,
                review: formdata.review
            }, {
                headers: {
                    token: userInfo.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Review successfully submitted. Thank you for your feedback!
                        </div>
                    ),
                    className: 'message-success',
                });
                router.push('/user/reviews');
            }
        } catch (error) {
            message.warning({
                content: (
                    <div>
                        <div className="font-weight-bold">Error</div>
                        {error.response ? error.response.data.error : error.message}
                    </div>
                ),
                className: 'message-warning',
            });
        }
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
                                    <div className="clearfix">
                                        <div className="page-header">
                                            <h1>Give rating and review this product</h1>
                                        </div>
                                        <form onSubmit={handleSubmit(onSubmit)}>
                                            <div className="d-flex mt-5">
                                                <Image src={`/uploads/products/${product.colour[0].images[0]}`}
                                                    layout="fixed"
                                                    width="100"
                                                    height="100"
                                                    objectFit="cover"
                                                    objectPosition="top center"
                                                    quality="50"
                                                    loader={customImageLoader}
                                                />
                                                <div className="product-detail ml-3" style={{ width: '100%' }}>
                                                    <div className="product-name">{product.name}</div>
                                                    <div className="mt-2">
                                                        <Rate tooltips={ratingTooltip}
                                                            onChange={(value) => setRating(value)}
                                                            value={rating}
                                                            className="custom-rating-star"
                                                        />
                                                        {rating ?
                                                            <span className="ant-rate-text">
                                                                {ratingTooltip[rating - 1]}
                                                            </span>
                                                            :
                                                            ''
                                                        }
                                                    </div>
                                                    <div className="mt-2">
                                                        <div>Your Review/Feedback</div>
                                                        <textarea
                                                            defaultValue={review && review.review[0].review}
                                                            className="form-control mt-1" name="review" ref={register()}>
                                                        </textarea>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-block text-right mt-3">
                                                <button className="btn c-btn-primary">
                                                    SUBMIT
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </Card>
                            </Content>
                        </Layout>
                    </Layout>
                </div>
            </Wrapper>
        </>
    )
}
export async function getServerSideProps(context) {
    try {
        const { id } = context.params;
        console.log(id)
        const { token } = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/reviews/${id}`, {
            headers: {
                token,
            },
        });
        console.log(data)
        return {
            props: {
                product: data.product,
                review: data.review || null
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

export default ReviewDetails;