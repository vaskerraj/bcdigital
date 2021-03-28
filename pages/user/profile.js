import React, { useState } from 'react';
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
import ProfileModal from '../../components/user/ProfileModal';

const Profile = ({ profile }) => {
    const [editProfile, setEditProfile] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [visible, setVisible] = useState(false);

    const router = useRouter();

    const initInputValue = {
        fullname: profile.name,
        mobile: profile.mobile,
        email: profile.email
    }
    const { register, handleSubmit, errors } = useForm({
        defaultValues: initInputValue
    });

    const EditProfileHandler = () => {
        setEditProfile(true);
    }

    const { userInfo } = useSelector(state => state.userAuth);

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
                        {error.response.data ? error.response.data.error : error.message}
                    </div>
                ),
                className: 'message-warning',
            });
        }
    }

    const onClickHandler = (title) => {
        setModalTitle(title);
        setVisible(true);
    };

    const handleCancel = () => {
        setVisible(false);
    };

    const onModalSubmit = async (modaldata) => {
        var updateField = null
        if (modaldata.mobile) {
            updateField = 'mobile';
        } else {
            updateField = 'email';
        }
        try {
            const { data } = await axiosApi.post('/api/updContact', {
                updateField: updateField === 'mobile' ? 'mobile' : 'email',
                updateValue: updateField === 'mobile' ? modaldata.mobile : modaldata.email
            }, {
                headers: {
                    token: userInfo.token
                }
            });
            if (data.msg === 'success') {
                setVisible(false);
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Changed succesffuly saved.
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.reload();
                }, 2000);
            }
        } catch (error) {
            message.warning({
                content: (
                    <div>
                        <div className="font-weight-bold">Error</div>
                        {error.response.data ? error.response.data.error : error.message}
                    </div>
                ),
                className: 'message-warning',
            });
        }

    };
    return (
        <div>
            <Head>
                <title>Profile</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="container mt-5">
                <ProfileModal
                    title={modalTitle}
                    visible={visible}
                    handleCancel={handleCancel}
                    formRegister={register}
                    handleSubmit={handleSubmit(onModalSubmit)}
                    errors={errors}
                />
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
                                                        <strong className="font14">Full name</strong>
                                                        <div>
                                                            {profile.name}
                                                        </div>
                                                    </div>
                                                    <div className="d-block mt-3">
                                                        <div className="d-block">
                                                            <strong className="font14">Mobile Number</strong>
                                                            {profile.method !== 'custom' &&
                                                                <span className="ml-2">|
                                                                <span className="text-info ml-1 cp">
                                                                        {profile.mobile ?
                                                                            <span onClick={() => onClickHandler('Edit Mobile Number')}>Edit</span>
                                                                            : <span onClick={() => onClickHandler('Add Mobile Number')}>Add</span>
                                                                        }
                                                                    </span>
                                                                </span>
                                                            }
                                                        </div>
                                                        <div>
                                                            {profile.mobile}
                                                        </div>
                                                    </div>
                                                    <div className="d-block mt-3">
                                                        <div className="d-block">
                                                            <strong className="font14">Email Id</strong>
                                                            {profile.method === 'custom' &&
                                                                <span className="ml-2">|
                                                                <span className="text-info ml-1 cp">
                                                                        {profile.email ?
                                                                            <span onClick={() => onClickHandler('Edit Email Address')}>Edit</span>
                                                                            : <span onClick={() => onClickHandler('Add Email Address')}>Add</span>
                                                                        }
                                                                    </span>
                                                                </span>
                                                            }
                                                        </div>
                                                        <div>
                                                            {profile.email}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* /.col */}
                                                {profile.method === 'custom' &&
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
                                                }
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
                                                            {profile.method !== 'custom' &&
                                                                <span className="ml-2">|
                                                                <span className="text-info ml-1 cp">
                                                                        {profile.mobile ?
                                                                            <span onClick={() => onClickHandler('Edit Mobile Number')}>Edit</span>
                                                                            : <span onClick={() => onClickHandler('Add Mobile Number')}>Add</span>
                                                                        }
                                                                    </span>
                                                                </span>
                                                            }
                                                        </div>
                                                        <div>
                                                            {profile.mobile}
                                                        </div>
                                                    </div>
                                                    <div className="d-block mt-3 mb-5">
                                                        <div className="d-block">
                                                            <strong className="font16">Email Id</strong>
                                                            {profile.method === 'custom' &&
                                                                <span className="ml-2">|
                                                                <span className="text-info ml-1 cp">
                                                                        {profile.email ?
                                                                            <span onClick={() => onClickHandler('Edit Email Address')}>Edit</span>
                                                                            : <span onClick={() => onClickHandler('Add Email Address')}>Add</span>
                                                                        }
                                                                    </span>
                                                                </span>
                                                            }
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
