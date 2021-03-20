import React from 'react';
import Head from 'next/head';
import { Layout, Card } from 'antd';
const { Content } = Layout;
import UserSidebarNav from '../../components/nav/UserSidebarNav';

const Profile = () => {
    return (
        <div>
            <Head>
                <title>Profile</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="container mt-5">
                <Layout className="mt-5">
                    <UserSidebarNav onActive="profile" />
                    <Layout className="site-layout">
                        <Content
                            style={{
                                margin: '0 0 0 15px'
                            }}
                        >
                            <Card style={{
                                minHeight: '60vh'
                            }}>

                            </Card>
                        </Content>
                    </Layout>
                </Layout>
            </div>
        </div >
    );
}

export default Profile;
