import React from 'react';
import Head from 'next/head';
import { parseCookies } from 'nookies';
import axios from 'axios';

import { Layout, Card } from 'antd';
const { Content } = Layout;
import UserSidebarNav from '../../components/nav/UserSidebarNav';

const Profile = ({ profile }) => {
    console.log(profile);
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
                                <div className="clearfix">
                                    <div className="d-flex page-header justify-content-between">
                                        <h1>Profile</h1>
                                        <div className="">
                                            Edit Profile
                                        </div>
                                    </div>
                                    <div className="d-block mt-5">
                                        <div className="row">
                                            <div className="col-12 col-sm-6">
                                                <div className="d-block">
                                                    <strong className="font16">Full name</strong>
                                                    <div>
                                                        {profile.name}
                                                    </div>
                                                </div>
                                                <div className="d-block mt-3">
                                                    <div className="d-block">
                                                        <strong className="font16">Mobile Number</strong>
                                                    </div>
                                                    <div>
                                                        {profile.mobile}
                                                    </div>
                                                </div>
                                                <div className="d-block mt-3">
                                                    <div className="d-block">
                                                        <strong className="font16">Email Id</strong>
                                                        <span className="ml-2">| <span className="text-info">Add</span></span>
                                                    </div>
                                                    <div>
                                                        {profile.email}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* /.col */}
                                            <div className="profile-chnage_psd col-12 col-sm-6 pl-sm-4 pl-1 mt-sm-0 mt-5">
                                                <div className="font-weight-bold font13">
                                                    Want to change your password?
                                                </div>
                                                <div className="d-block mt-3">
                                                    <button type="button" className="btn btn-lg c-btn-primary font16">
                                                        CHANGE PASSWORD
                                                    </button>
                                                </div>
                                            </div>
                                            {/* /.col */}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Content>
                    </Layout>
                </Layout>
            </div>
        </div >
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/profile`, {
            headers: {
                token: cookies.token,
            },
        });
        return {
            props: {
                profile: data
            }
        }
    } catch (err) {
        console.log(err);
        return {
            redirect: {
                destination: '../login',
                permanent: false,
            },
            props: {},
        };
    }
}

export default Profile;
