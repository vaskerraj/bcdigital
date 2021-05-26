import React from 'react';
import { Layout, Row, Col } from 'antd';
const { Header, Content, Footer } = Layout;

import MainHeadSection from './nav/MainHeadSection';

const Wrapper = ({ children }) => {
    return (
        <div className="main pb-5 pb-md-0">
            <MainHeadSection />
            <Content>
                {children}
            </Content>
            <Footer>

            </Footer>
        </div>
    );
}

export default Wrapper;
