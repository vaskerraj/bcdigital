import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'react-feather';
import { parseCookies } from 'nookies';

import axios from 'axios';

import { Layout, Card, Affix, Steps, Button } from 'antd';
const { Content } = Layout;
const { Step } = Steps;
import { ShoppingOutlined, PrinterOutlined, EnvironmentOutlined } from '@ant-design/icons';

import useWindowDimensions from '../../../helpers/useWindowDimensions';
import UserSidebarNav from '../../../components/nav/UserSidebarNav';
import Wrapper from '../../../components/Wrapper';
import { customImageLoader } from '../../../helpers/functions';

const ReturnResult = ({ packages }) => {

    const [onlyMobile, setOnlyMoble] = useState(false);

    const productLength = packages.products.length;
    const { width } = useWindowDimensions();

    useEffect(() => {
        if (width <= 576) {
            setOnlyMoble(true);
        } else {
            setOnlyMoble(false);
        }
    }, [width]);

    const router = useRouter();

    const { pId, trackingId } = router.query;

    const handleReturnLabel = () => {
        return router.push(`/user/return/print/${pId}?trackingId=${trackingId}`)
    }

    return (
        <Wrapper>
            <Head>
                <title>Request Result | BC Digital</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {onlyMobile &&
                <Affix offsetTop={70}>
                    <div className="row bg-white backNav-container border-top p-2">
                        <div className="d-flex align-items-center mb-2">
                            <ArrowLeft className="mr-3" onClick={() => router.back()} />
                            Request Result
                        </div>
                    </div>
                </Affix>
            }
            <div className="container mt-4">
                <Layout>
                    {!onlyMobile &&
                        <UserSidebarNav onActive="orders" />
                    }
                    <Layout className="site-layout">
                        <Content
                            style={{
                                margin: onlyMobile ? '0' : '0 0 0 15px'
                            }}>
                            <Card style={{
                                minHeight: '60vh'
                            }}>
                                <div className="d-block page-header justify-content-between">
                                    <h1>Request Result</h1>
                                </div>
                                {productLength !== 0 && productLength !== undefined
                                    ?
                                    <>
                                        <div className="d-block text-center text-success mt-3" style={{ fontSize: '2rem' }}>
                                            Your return request was successfully submitted. You need to do some other step for return.
                                        </div>
                                        <div className="d-block mt-4">
                                            <Steps direction="vertical" size="small" current={6}>
                                                <Step title="Pack return items"
                                                    icon={<ShoppingOutlined style={{ color: '#6f7a7f' }} />}
                                                    description="Pack returns items with invoice, user guide and manual."
                                                />
                                                <Step title="Print Return Label"
                                                    icon={<PrinterOutlined style={{ color: '#6f7a7f' }} />}
                                                    description={
                                                        <>
                                                            Print return label with return tracking number <span className="text-dark">`{trackingId}`</span> and return items.
                                                            <Button size="small" danger className="d-block" onClick={handleReturnLabel}>Print Return Label</Button>
                                                        </>
                                                    }
                                                />
                                                <Step title="Visit Nearby Courier Office"
                                                    icon={<EnvironmentOutlined style={{ color: '#6f7a7f' }} />}
                                                    description={
                                                        <>
                                                            Please visit nearby courier office and handover packed items with return label in it. Shipping cost is absolutely free and cover by BC Digital.
                                                            <Button size="small" priamry className="d-block" onClick={handleReturnLabel}>View Courier Office</Button>
                                                        </>
                                                    }
                                                />
                                            </Steps>
                                        </div>

                                        <div className="d-block mt-4 border-top">
                                            <div className="d-flex mt-4 justify-content-between">
                                                <div className="font16 text-success">Returns Items</div>
                                                <Link href={`/user/return/print/${pId}?trackingId=${trackingId}`}>
                                                    <Button size="small" type="primary">View Return Detail</Button>
                                                </Link>
                                            </div>
                                            {
                                                packages.products.map(item => (
                                                    <>
                                                        <div key={item.products[0]._id} className="pt-3 pb-3">
                                                            <div className="row">
                                                                <div className="col-12 col-sm-7 col-md-7">
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
                                                                                {onlyMobile &&
                                                                                    <div className="text-right">
                                                                                        <div className="d-flex mt-2">
                                                                                            <div className="pt-1">Qty:</div>
                                                                                            <div className="mt-1">{item.productQty}</div>
                                                                                        </div>
                                                                                    </div>
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="d-none d-sm-block col-sm-2 col-md-2">
                                                                    <div className="d-flex mt-2">
                                                                        <div className="pt-1">Qty:</div>
                                                                        <div className="mt-1">{item.productQty}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                ))
                                            }
                                        </div>
                                    </>
                                    :
                                    <div className="text-center text-muted mt-5 font16">No Return Results Found</div>
                                }
                            </Card>
                        </Content>
                    </Layout>
                </Layout>
            </div>
        </Wrapper >
    )
}

export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { pId, trackingId } = context.query;
        const { data } = await axios.get(`${process.env.api}/api/returnresult/${pId}/${trackingId}`, {
            headers: {
                token: cookies.token,
            },
        });
        return {
            props: {
                packages: data
            }
        }
    } catch (err) {
        console.log(err)
        return {
            redirect: {
                destination: '../../login',
                permanent: false,
            },
            props: {},
        };
    }
}

export default ReturnResult;
