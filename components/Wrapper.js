import React from 'react';
import { Layout, Row, Col } from 'antd';
const { Header, Content, Footer } = Layout;

import MainHeadSection from './nav/MainHeadSection';
import HeaderMenu from './nav/HeaderMenu';


const Wrapper = ({ children }) => {
    return (
        <div className="main">
            <MainHeadSection />
            <HeaderMenu />
            <Content>
                {children}
            </Content>
            <Footer>

            </Footer>
        </div>
    );
}

export default Wrapper;
