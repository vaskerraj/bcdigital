import React from 'react'
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { parseCookies } from 'nookies';
import { useForm } from "react-hook-form";
import { message } from 'antd';

import axiosApi from '../../../helpers/api';

import Wrapper from '../../../components/admin/Wrapper';
import SettingTab from '../../../components/admin/SettingTab'

const CommonSetting = ({ common }) => {
    console.log(common)

    const router =  useRouter();

    const { adminAuth } = useSelector(state => state.adminAuth);

    const defaultValues = {
        contactNumber: common?.contactNumber,
        facebookLink: common?.facebookLink,
        twitterLink: common?.twitterLink,
        androidLink: common?.androidLink,
        iosLink: common?.iosLink,
    }

    const { register, handleSubmit, errors, setValue } = useForm({
        defaultValues: defaultValues
    });

    const onSubmit = async (inputdata) => {
        try {
            const { data } = await axiosApi.put('/api/common/setting', {
                contactNumber: inputdata.contactNumber,
                facebookLink: inputdata.facebookLink,
                twitterLink: inputdata.twitterLink,
                androidLink: inputdata.androidLink,
                iosLink: inputdata.iosLink,
            }, {
                headers: {
                    token: adminAuth.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Succssfully saved and updated.
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.push('/admin/setting/');
                }, 2000);
            }
        } catch (error) {
            message.warning({
                content: (
                    <div>
                        <div className="font-weight-bold">Error</div>
                        {error.response ? error.response.data.error : error.message}
                    </div>
                ),
                className: 'message-warning',
            });
        }
    };
    console.log(common)
    return (
        <Wrapper onActive="setting" breadcrumb={["Setting"]}>
            <SettingTab />
            <div className="row">
                <div className="col-12 col-sm-6 col-md-4 mt-5">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="d-block">
                            <label htmlFor="contactNumber">
                                Contact Number
                            </label>
                            <input name="contactNumber" className="form-control"
                                type="type"
                                id="contactNumber"
                                ref={register({
                                    required: "Provide"
                                })}
                            />
                            {errors.contactNumber && <p className="errorMsg">{errors.contactNumber.message}</p>}
                        </div>
                        <div className="d-block mt-4">
                            <label htmlFor='facebookLink'>
                                Facebook Link
                            </label>
                            <input name="facebookLink" className="form-control"
                                id="facebookLink"
                                ref={register()}
                            />
                            {errors.facebookLink && <p className="errorMsg">{errors.facebookLink.message}</p>}
                        </div>
                        <div className="d-block mt-4">
                            <label htmlFor='twitterLink'>
                                Twitter Link
                            </label>
                            <input name="twitterLink" className="form-control"
                                id="twitterLink"
                                ref={register()}
                            />
                            {errors.twitterLink && <p className="errorMsg">{errors.twitterLink.message}</p>}
                        </div>
                        <div className="d-block mt-4">
                            <label htmlFor='androidLink'>
                                Android Link
                            </label>
                            <input name="androidLink" className="form-control"
                                id="androidLink"
                                ref={register()}
                            />
                            {errors.androidLink && <p className="errorMsg">{errors.androidLink.message}</p>}
                        </div>
                        <div className="d-block mt-4">
                            <label htmlFor='iosLink'>
                                IOS Link
                            </label>
                            <input name="iosLink" className="form-control"
                                id="iosLink"
                                ref={register()}
                            />
                            {errors.iosLink && <p className="errorMsg">{errors.iosLink.message}</p>}
                        </div>
                        <div className="d-block mt-5 mb-2 text-right">
                            <button type="submit" className="ant-btn ant-btn-danger ant-btn-lg ml-3">
                                SAVE & UPDATE
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </Wrapper>

    )
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/common/setting`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                common: data
            }
        }
    } catch (err) {
        console.log(err);
        return {
            redirect: {
                source: '/admin/login',
                destination: '/admin/login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}
export default CommonSetting;

