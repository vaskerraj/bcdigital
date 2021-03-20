import React from 'react';
import Head from 'next/head';
import { Layout, Card } from 'antd';
const { Content } = Layout;
import UserSidebarNav from '../../components/nav/UserSidebarNav';

const Profile = () => {
    return (
        <div>
            <Head>
                <title>Manage My Account</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="container mt-5">
                <Layout>
                    <UserSidebarNav onActive="orders" />
                    <Layout className="site-layout">
                        <Content
                            style={{
                                margin: '0 0 0 15px'
                            }}>
                            <Card style={{
                                minHeight: '60vh'
                            }}>
                                Order Page
                            </Card>
                        </Content>
                    </Layout>
                </Layout>
            </div>
        </div >
    );
}

export default Profile;
