import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { useForm } from 'react-hook-form';

import { Upload, Progress, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import Wrapper from '../../../components/admin/Wrapper';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
})
const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}
const OwnShopInitial = () => {
    // image upload states
    const [previewImage, setPreviewImage] = useState("");
    const [fileList, setFileList] = useState([]);
    const [progress, setProgress] = useState(0);

    const router = useRouter();

    const { adminAuth } = useSelector(state => state.adminAuth);

    const { register, handleSubmit, errors, setValue, reset } = useForm();

    useEffect(() => {
        register({ name: "image" });
    }, [register]);


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

        setFileList(fileList);
        // setValue method of react hook form for image upload via ant design
        setValue("image", fileList[0].originFileObj);
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    const handleSubmitInital = async (inputdata) => {
        const formData = new FormData();
        formData.append('name', inputdata.shopname);
        formData.append('mobile', inputdata.shopmobile);
        formData.append('password', inputdata.password);
        formData.append('email', inputdata.shopemail);
        formData.append('shopLogo', inputdata.image);
        try {

            const data = await axiosApi.post("/api/ownseller", formData,
                {
                    headers: {
                        token: adminAuth.token
                    }
                },
                {
                    onUploadProgress: ProgressEvent => {
                        const percent = Math.floor((ProgressEvent.loaded / ProgressEvent.total) * 100);
                        setProgress(percent);
                        if (percent === 100) {
                            setTimeout(() => setProgress(0), 1000);
                        }
                    }
                });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Own Shop created successfully.
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.push('./company');
                }, 2000);
            }
        } catch (error) {
            console.log(error)
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
        <Wrapper onActive="ownShop" breadcrumb={["Own Seller"]}>
            <form onSubmit={handleSubmit(handleSubmitInital)}>
                <div className="d-block">
                    <div className="col-sm-8 col-md-5">
                        <div className="d-block">
                            <label className="cat-label">Name</label>
                            <input type="text" className="form-control disabled mt-1"
                                name="shopname"
                                value="Bc Shop"
                                autoComplete="off"
                                ref={register({
                                    required: "Provide name"
                                })}
                            />
                            {errors.shopname && <p className="errorMsg">{errors.shopname.message}</p>}
                        </div>
                        <div className="d-block mt-4">
                            <label className="cat-label">
                                Mobile No.
                                <span className="text-muted">(as username)</span>
                            </label>
                            <input type="number" className="form-control mt-1"
                                name="shopmobile"
                                autoComplete="none"
                                ref={register({
                                    required: "Provide mobile number",
                                    minLength: {
                                        value: 10,
                                        message: "Invalid mobile number",
                                    },
                                    maxLength: {
                                        value: 10,
                                        message: "Invalid mobile number",
                                    }
                                })}
                            />
                            {errors.shopmobile && <p className="errorMsg">{errors.shopmobile.message}</p>}
                        </div>
                        <div className="d-block mt-4">
                            <label className="cat-label">Password</label>
                            <input type="text" className="form-control mt-1"
                                name="password"
                                autoComplete="none"
                                ref={register({
                                    required: "Provide password",
                                    pattern: {
                                        value: /^(?=.*\d)(?=.*[a-z])(?=.*[a-zA-Z]).{5,}$/i,
                                        message: "Password should contain letter and number"
                                    },
                                    minLength: {
                                        value: 5,
                                        message: "Password must be atleast 5 characters"
                                    }

                                })}
                            />
                            {errors.password && <p className="errorMsg">{errors.password.message}</p>}
                        </div>
                        <div className="d-block mt-4">
                            <label className="cat-label">Email</label>
                            <input type="email" className="form-control mt-1"
                                name="shopemail"
                                autoComplete="none"
                                ref={register({
                                    required: "Provide email",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                            />
                            {errors.shopemail && <p className="errorMsg">{errors.shopemail.message}</p>}
                        </div>
                        <div className="d-block mt-4">
                            <label className="cat-label">Shop Logo</label>
                            <Upload
                                name="sellerPicture"
                                listType="picture-card"
                                className="avatar-uploader"
                                accept="image/*"
                                showUploadList={false}
                                fileList={fileList}
                                onChange={handleUpload}
                                beforeUpload={() => false}
                                maxCount={1}
                            >
                                {previewImage ? <img src={previewImage} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                            </Upload>
                            {progress > 0 ? <Progress percent={progress} /> : null}
                            <input type="hidden" name="shopCheck"
                                value={fileList}
                                readOnly={true}
                                ref={register({
                                    required: "Select shop logo"
                                })}
                            />
                            {errors.shopCheck && <p className="errorMsg">{errors.shopCheck.message}</p>}
                        </div>
                        <div className="d-block mt-5 mb-2 text-right">
                            <button type="submit" className="ant-btn ant-btn-danger ant-btn-lg ml-3">
                                SAVE & CONTINUE
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </Wrapper>
    )
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
                if (data.seller) {
                    return {
                        redirect: {
                            source: '/admin/own-shop/company',
                            destination: '/admin/own-shop/company',
                            permanent: false,
                        }
                    }
                }
                else if (data?.details?.step === 'company') {
                    return {
                        redirect: {
                            source: '/admin/own-shop/addresses',
                            destination: '/admin/own-shop/addresses',
                            permanent: false,
                        }
                    }
                } else if (data?.details?.step === 'addresses') {
                    return {
                        redirect: {
                            source: '/admin/own-shop/bank',
                            destination: '/admin/own-shop/bank',
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
        console.log(err)
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

export default OwnShopInitial


