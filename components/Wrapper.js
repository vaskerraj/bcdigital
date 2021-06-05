import React from 'react';
import { Layout, Row, Col } from 'antd';
const { Content } = Layout;

import MainHeadSection from './nav/MainHeadSection';
import Footer from './nav/Footer';


const Wrapper = ({ children, mobileTabBar }) => {
    return (
        <div className="main pb-5 pb-sm-0">
            <MainHeadSection mobileTabBar={mobileTabBar} />
            <Content>
                {children}
            </Content>
            <Footer />
        </div>
    );
}

export default Wrapper;
