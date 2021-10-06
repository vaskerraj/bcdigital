import React, { useState } from 'react';
import { parseCookies } from 'nookies';
import axios from 'axios';
import baseUrl from '../../helpers/baseUrl';

import { Upload } from 'antd';
import {
    PlusOutlined
} from '@ant-design/icons';

import Wrapper from '../../components/seller/Wrapper';

const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}

const SellerLogo = ({ sellerId, sellerLogo }) => {
    const [previewImage, setPreviewImage] = useState("");


    const imageValidation = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
    }

    const handleUpload = ({ fileList }) => {
        imageValidation(fileList[0]);

        getBase64(fileList[0].originFileObj, imageUrl =>
            setPreviewImage(imageUrl)
        );
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );
    return (
        <Wrapper onActive="" breadcrumb={["Home", "Logo"]}>
            <div className="d-flex seller-logo">
                <Upload
                    name="file"
                    accept=".png, .jpg, .jpeg"
                    multiple={false}
                    showUploadList={false}
                    action={`${baseUrl}/api/seller/logo?id=${sellerId}`}
                    listType="picture-card"
                    onChange={handleUpload}
                    maxCount={1}
                >
                    {uploadButton}
                </Upload>
                {previewImage &&
                    <div style={{ width: '10.4rem' }}>
                        <div className="ant-upload ant-upload-select ant-upload-select-picture-card position-relative">
                            <img src={previewImage} alt="avatar" style={{ width: '100%' }} />
                        </div>
                    </div>
                }
                {sellerLogo && previewImage === "" &&
                    <div style={{ width: '10.4rem' }}>
                        <div className="ant-upload ant-upload-select ant-upload-select-picture-card position-relative">
                            <img src={`/uploads/sellers/${sellerLogo}`} alt="avatar" style={{ width: '100%' }} />
                        </div>
                    </div>
                }
            </div>
        </Wrapper >
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
            console.log(data)
            if (data.stepComplete) {
                return {
                    props: {
                        sellerId: data.userId._id,
                        sellerLogo: data.userId.picture
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
        } else {
            return {
                redirect: {
                    source: '/seller/start/company',
                    destination: '/seller/start/company',
                    permanent: false,
                }
            }
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

export default SellerLogo;