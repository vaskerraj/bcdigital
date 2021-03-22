import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import axios from 'axios';

import { useForm } from 'react-hook-form';

import axiosApi from '../../helpers/api';

import { Layout, Card, message } from 'antd';
const { Content } = Layout;
import UserSidebarNav from '../../components/nav/UserSidebarNav';

const Profile = ({ profile }) => {
    const [editProfile, setEditProfile] = useState(false);

    const router = useRouter();

    const initInputValue = {
        fullname: profile.name
    }
    const { register, handleSubmit, errors } = useForm({
        defaultValues: initInputValue
    });

    const EditProfileHandler = () => {
        setEditProfile(true);
    }

    const { loading, userInfo, error } = useSelector(state => state.userAuth);

    const onSubmit = async (inputdata) => {
        try {
            const { data } = await axiosApi.post('/api/edituser', { name: inputdata.fullname }, {
                headers: {
                    token: userInfo.token
                }
            });
            setEditProfile(false);
            router.reload();
        } catch (error) {
            message.warning({
                content: (
                    <div>
                        <div className="font-weight-bold">Error</div>
                        {error.error}
                    </div>
                ),
                className: 'message-warning',
            });
        }
    }
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
                                        <div onClick={EditProfileHandler} className="text-info" style={{ cursor: 'pointer' }}>
                                            Edit Profile
                                        </div>
                                    </div>
                                    <div className="d-block mt-5">
                                        {!editProfile &&
                                            <div className="row profile">
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
                                                            <span className="ml-2">|
                                                            <span className="text-info ml-1">
                                                                    {profile.email ? 'Change' : 'Add'}
                                                                </span>
                                                            </span>
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
                                                        <button type="button" onClick={() => router.push('/user/change-password')} className="btn btn-lg c-btn-primary font16">
                                                            CHANGE PASSWORD
                                                    </button>
                                                    </div>
                                                </div>
                                                {/* /.col */}
                                            </div>
                                        }
                                        {editProfile &&
                                            <div className="clearfix">
                                                <form onSubmit={handleSubmit(onSubmit)}>
                                                    <div className="d-block">
                                                        <strong className="font16">Full name</strong>
                                                        <div className="form-group col-12 col-sm-4 mt-sm-1">
                                                            <input name="fullname"
                                                                className="form-control"
                                                                ref={register({
                                                                    required: true
                                                                })}
                                                            />
                                                            {errors.fullname && errors.fullname.type === "required" && (
                                                                <p className="errorMsg">Provide your fullname</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="d-block mt-4">
                                                        <div className="d-block">
                                                            <strong className="font16">Mobile Number</strong>
                                                        </div>
                                                        <div>
                                                            {profile.mobile}
                                                        </div>
                                                    </div>
                                                    <div className="d-block mt-3 mb-5">
                                                        <div className="d-block">
                                                            <strong className="font16">Email Id</strong>
                                                            <span className="ml-2">|
                                                            <span className="text-info">
                                                                    {profile.email ? 'Change' : 'Add'}
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <div>
                                                            {profile.email}
                                                        </div>
                                                    </div>
                                                    <div className="d-block mt-5">
                                                        <button type="submit" className="btn btn-lg c-btn-primary font16">
                                                            UPDATE CHANGES
                                                    </button>
                                                    </div>
                                                </form>
                                            </div>
                                        }
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
