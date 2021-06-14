import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Search } from 'react-feather';

import Wrapper from '../components/Wrapper';

import useWindowDimensions from '../helpers/useWindowDimensions';

const nomatch = () => {

    const { height, width } = useWindowDimensions();
    const [mobileTabBarStatus, setMobileTabBarStatus] = useState("");

    useEffect(() => {
        if (width <= 576) {
            setMobileTabBarStatus("hide");
        } else {
            setMobileTabBarStatus("");
        }
    }, [width]);
    return (
        <Wrapper mobileTabBar={mobileTabBarStatus}>
            <Head>
                <title>No Match Product - Buy Online Product At Best Price In Nepal | BC Digital</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="container text-center" style={{ minHeight: '50vh' }}>
                <div className="row mt-5 mb-5 text-center">
                    <Search size={80} className="text-muted mt-5" />
                    <div className="mt-2" style={{ fontSize: '1.8rem' }}>No Match Products</div>
                </div>
            </div>
        </Wrapper>
    );
}

export default nomatch;
