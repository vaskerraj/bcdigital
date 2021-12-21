import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { Tooltip, message, Upload, Button } from 'antd';
import {
    InfoOutlined,
    UploadOutlined,
    DeleteOutlined
} from '@ant-design/icons';


import { useForm } from "react-hook-form";

import Wrapper from '../../../components/admin/Wrapper';
import StartStep from '../../../components/seller/Step';

const OwnShopBankDetails = ({ sellerId }) => {

    // image upload states
    const [fileName, setFileName] = useState(false);
    const [fileList, setFileList] = useState([]);

    const { register, handleSubmit, errors, setValue } = useForm();

    useEffect(() => {
        register({ name: "copyofcheque" });
    }, [register]);

    const router = useRouter();
    const { adminAuth } = useSelector(state => state.adminAuth);


    const handleUpload = ({ fileList }) => {
        setFileList(fileList);
        setFileName(fileList[0].name);
        // setValue method of react hook form for image upload via ant design
        setValue("copyofcheque", fileList[0].originFileObj);
    };

    const deleteUploadHandler = () => {
        setFileName(false);
        setFileList([]);
    }

    const onSubmit = async (inputdata) => {
        const formData = new FormData();
        formData.append('id', sellerId);
        formData.append('title', inputdata.title);
        formData.append('number', inputdata.number);
        formData.append('bankName', inputdata.bankname);
        formData.append('bankBranch', inputdata.bankbranch);
        formData.append('copyofcheque', inputdata.copyofcheque);

        try {
            const { data } = await axiosApi.put('/api/ownshop/step/bank', formData,
                {
                    headers: {
                        token: adminAuth.token
                    }
                });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Bank Information succssfully added.
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.push('./');
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
    }

    return (
        <>
            <Head>
                <title>BC Digital Admin Center</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Wrapper onActive="ownShop" breadcrumb={["Own Seller"]}>
                <StartStep activeStep={2} />
                <div className="col-12 col-sm-6 col-md-4 mt-5">
                    <form autoComplete="new password" onSubmit={handleSubmit(onSubmit)}>
                        <div className="d-block">
                            <label>
                                Account Title
                            </label>
                            <input name="title" className="form-control"
                                ref={register({
                                    required: "Provide"
                                })}
                            />
                            {errors.title && <p className="errorMsg">{errors.title.message}</p>}
                        </div>
                        <div className="d-block mt-4">
                            <label>
                                Account Number
                            </label>
                            <input name="number" className="form-control ml-2"
                                ref={register({
                                    required: "Provide"
                                })}
                            />
                            {errors.number && <p className="errorMsg">{errors.number.message}</p>}
                        </div>

                        <div className="d-block mt-4">
                            <label>
                                Bank Name
                            </label>

                            <input name="bankname" className="form-control ml-2"
                                ref={register({
                                    required: "Provide"
                                })}
                            />
                            {errors.bankname && <p className="errorMsg">{errors.bankname.message}</p>}
                        </div>
                        <div className="d-block mt-4">
                            <label>
                                Bank Branch
                            </label>

                            <input name="bankbranch" className="form-control ml-2" ref={register()} />
                        </div>
                        <div className="d-block mt-4">
                            <label>
                                Copy Of Cheque
                                <Tooltip title="Allow Image files and PDF." color={'#fff'} overlayInnerStyle={{ color: '#000' }}>
                                    <InfoOutlined size={10} className="text-primary" />
                                </Tooltip>
                            </label>
                            <div className="d-inline ml-3">
                                {!fileName ?
                                    <Upload
                                        name="copyOfCheque"
                                        className="avatar-uploader"
                                        accept=".png, .jpg, .jpeg .pdf"
                                        showUploadList={false}
                                        fileList={fileList}
                                        onChange={handleUpload}
                                        beforeUpload={() => false}
                                        maxCount={1}
                                    >
                                        <Button icon={<UploadOutlined />}>Upload</Button>
                                    </Upload>
                                    :
                                    <Button onClick={deleteUploadHandler}>
                                        {fileName}
                                        <DeleteOutlined className="text-danger" />
                                    </Button>
                                }
                                <input type="hidden" name="copyOfChequeCheck"
                                    value={fileList}
                                    readOnly={true}
                                    ref={register({
                                        required: "Provide"
                                    })}
                                />
                                {errors.copyOfChequeCheck && <p className="errorMsg">{errors.copyOfChequeCheck.message}</p>}
                            </div>
                        </div>
                        <div className="d-block mt-5 mb-2 text-right">
                            <button type="submit" className="ant-btn ant-btn-danger ant-btn-lg ml-3">
                                SAVE & FINISH
                            </button>
                        </div>
                    </form>
                </div>
            </Wrapper>
        </>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/admingetseller`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        if (data) {
            if (data.details?.stepComplete) {
                return {
                    redirect: {
                        source: '/admin/own-shop/',
                        destination: '/admin/own-shop/',
                        permanent: false,
                    }
                }
            } else {
                if (data.seller === null) {
                    return {
                        redirect: {
                            source: '/admin/own-shop/initial',
                            destination: '/admin/own-shop/initial',
                            permanent: false,
                        }
                    }
                }
                else if (data.details === null) {
                    return {
                        redirect: {
                            source: '/admin/own-shop/company',
                            destination: '/admin/own-shop/company',
                            permanent: false,
                        }
                    }
                }
                else if (data.details?.step === 'company') {
                    return {
                        redirect: {
                            source: '/admin/own-shop/addresses',
                            destination: '/admin/own-shop/addresses',
                            permanent: false,
                        }
                    }
                }
            }
        }
        return {
            props: {
                sellerId: data.seller._id,
            }
        }
    } catch (err) {
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

export default OwnShopBankDetails;