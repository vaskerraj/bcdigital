import React from 'react';
import { Layout, Row, Col } from 'antd';
const { Content } = Layout;

import MainHeadSection from './nav/MainHeadSection';
import Footer from './nav/Footer';

const Wrapper = ({ children }) => {
    return (
        <div className="main pb-5 pb-md-0">
            <MainHeadSection />
            <Content>
                {children}
            </Content>
            <Footer />
        </div>
    );
}

export default Wrapper;
