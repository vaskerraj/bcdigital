import React from 'react';
import Link from 'next/link';
import { Layout, Row, Col } from 'antd';
const { Header, Content, Footer } = Layout;


const Wrapper = ({ children }) => {
    return (
        <Layout className="layout" style={{ backgroundColor: '#fff' }}>
            <Row>
                <Col xs={{ span: 8, offset: 1 }} lg={{ span: 6, offset: 2 }}>
                    <Link href="/">
                        <img src="/logo192.png" height="53px" />
                    </Link>
                </Col>
                <Col xs={{ span: 11 }} lg={{ span: 6, offset: 2 }}>
                    Col
                </Col>
                <Col xs={{ span: 5, offset: 1 }} lg={{ span: 6, offset: 2 }}>
                    Col
                </Col>
            </Row>
            <Content>
                {children}
            </Content>
            <Footer>

            </Footer>
        </Layout>
    );
}

export default Wrapper;
