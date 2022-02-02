import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../../helpers/api';

import { Tooltip, message, Upload, Button } from 'antd';
import {
    InfoOutlined,
    UploadOutlined,
    DeleteOutlined
} from '@ant-design/icons';


import { useForm } from "react-hook-form";

import StartStep from '../../../../components/seller/Step';

const BankDetails = () => {

    // image upload states
    const [fileName, setFileName] = useState(false);
    const [fileList, setFileList] = useState([]);

    const { register, handleSubmit, errors, setValue } = useForm();

    useEffect(() => {
        register({ name: "copyofcheque" });
    }, [register]);

    const router = useRouter();
    const { sellerAuth } = useSelector(state => state.sellerAuth);


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
        formData.append('title', inputdata.title);
        formData.append('number', inputdata.number);
        formData.append('bankName', inputdata.bankname);
        formData.append('bankBranch', inputdata.bankbranch);
        formData.append('copyofcheque', inputdata.copyofcheque);

        try {
            const { data } = await axiosApi.post('/api/seller/start/bank', formData,
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
                            Bank Information succssfully added.
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.push('./complete');
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
            <div className="container">
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
                            <input name="number" type="text" className="form-control ml-2"
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
            </div>
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
                        source: '/seller/mobile/',
                        destination: '/seller/mobile/',
                        permanent: false,
                    }
                }
            } else {
                if (data.step === 'company') {
                    return {
                        redirect: {
                            source: '/seller/mobile/start/addresses',
                            destination: '/seller/mobile/start/addresses',
                            permanent: false,
                        }
                    }
                }
            }
        } else {
            return {
                redirect: {
                    source: '/seller/mobile/start/company',
                    destination: '/seller/mobile/start/company',
                    permanent: false,
                }
            }
        }
        return {
            props: {}
        }
    } catch (err) {
        return {
            redirect: {
                source: '/seller/mobile/login',
                destination: '/seller/mobile/login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}

export default BankDetails;