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

import Wrapper from '../../../components/seller/Wrapper';
import StartStep from '../../../components/seller/Step';

const CompanyDetails = () => {
    // image upload states
    const [fileName, setFileName] = useState(false);
    const [fileList, setFileList] = useState([]);

    const { register, handleSubmit, errors, setValue } = useForm();

    useEffect(() => {
        register({ name: "docFile" });
    }, [register]);

    const router = useRouter();
    const { sellerAuth } = useSelector(state => state.sellerAuth);


    const handleUpload = ({ fileList }) => {
        setFileList(fileList);
        setFileName(fileList[0].name);
        // setValue method of react hook form for image upload via ant design
        setValue("docFile", fileList[0].originFileObj);
    };

    const deleteUploadHandler = () => {
        setFileName(false);
        setFileList([]);
    }

    const onSubmit = async (inputdata) => {
        const formData = new FormData();
        formData.append('legalName', inputdata.legalName);
        formData.append('regType', inputdata.regType);
        formData.append('regNumber', inputdata.regNumber);
        formData.append('docFile', inputdata.docFile);

        try {
            const { data } = await axiosApi.post('/api/seller/start/company', formData,
                {
                    headers: {
                        token: sellerAuth.token
                    }
                });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Company Information succssfully added.
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.push('./addresses');
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
                <title>BC Digital Seller Center</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Wrapper planView={true}>
                <StartStep activeStep={0} />
                <div className="col-12 col-sm-6 col-md-4 mt-5">
                    <form autoComplete="new password" onSubmit={handleSubmit(onSubmit)}>
                        <div className="d-block">
                            <label htmlFor="legalName">
                                Legal Name/Business Owner Name
                                <Tooltip title="Legal name mention at PAN/VAT certificate." color={'#fff'} overlayInnerStyle={{ color: '#000' }}>
                                    <InfoOutlined size={10} className="text-primary" />
                                </Tooltip>
                            </label>
                            <input name="legalName" className="form-control"
                                id="legalName"
                                ref={register({
                                    required: "Provide"
                                })}
                            />
                            {errors.legalName && <p className="errorMsg">{errors.legalName.message}</p>}
                        </div>
                        <div className="d-block mt-4">
                            <label>
                                Business Registration Number
                            </label>
                            <div className="d-flex justify-content-around">
                                <div style={{ width: '100%' }}>
                                    <select name="regType" className="form-control"
                                        ref={register({
                                            required: "Provide"
                                        })}
                                    >
                                        <option value="">---Select---</option>
                                        <option>PAN</option>
                                        <option>VAT</option>
                                    </select>
                                    {errors.regType && <p className="errorMsg">{errors.regType.message}</p>}
                                </div>
                                <div className="ml-3">
                                    <input name="regNumber" className="form-control"
                                        ref={register({
                                            required: "Provide"
                                        })}
                                    />
                                    {errors.regNumber && <p className="errorMsg">{errors.regNumber.message}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="d-block mt-4">
                            <label>
                                Business Document
                                <Tooltip title="Allow Image files and PDF." color={'#fff'} overlayInnerStyle={{ color: '#000' }}>
                                    <InfoOutlined size={10} className="text-primary" />
                                </Tooltip>
                            </label>
                            <div className="d-inline ml-3">
                                {!fileName ?
                                    <Upload
                                        name="docFile"
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
                                <input type="hidden" name="uploadCheck"
                                    value={fileList}
                                    readOnly={true}
                                    ref={register({
                                        required: "Provide"
                                    })}
                                />
                                {errors.uploadCheck && <p className="errorMsg">{errors.uploadCheck.message}</p>}
                            </div>
                        </div>
                        <div className="d-block mt-5 mb-2 text-right">
                            <button type="submit" className="ant-btn ant-btn-danger ant-btn-lg ml-3">
                                SAVE & CONTINUE
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
        const { data } = await axios.get(`${process.env.api}/api/isseller`, {
            headers: {
                token: cookies.sell_token,
            },
        });
        if (data) {
            if (data.stepComplete) {
                return {
                    redirect: {
                        source: '/seller/',
                        destination: '/seller/',
                        permanent: false,
                    }
                }
            } else {
                if (data.step === 'company') {
                    return {
                        redirect: {
                            source: '/seller/start/addresses',
                            destination: '/seller/start/addresses',
                            permanent: false,
                        }
                    }
                } else if (data.step === 'addresses') {
                    return {
                        redirect: {
                            source: '/seller/start/bank',
                            destination: '/seller/start/bank',
                            permanent: false,
                        }
                    }
                }
            }
        }
        return {
            props: {}
        }
    } catch (err) {
        return {
            redirect: {
                source: '/seller/login',
                destination: '/seller/login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}

export default CompanyDetails;