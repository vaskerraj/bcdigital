import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { Upload, Progress, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useForm } from 'react-hook-form';

import axiosApi from '../../helpers/api';
import baseUrl from '../../helpers/baseUrl';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}
const OwnShopModal = (props) => {
    const { title, visible, handleCancel, modalAction, ownshopData } = props;
    const [visibled, setVisibled] = useState(false);

    // image upload states
    const [previewImage, setPreviewImage] = useState("");
    const [fileList, setFileList] = useState([]);
    const [progress, setProgress] = useState(0);

    const defaultValues = {
        shopname: modalAction === "edit_own" ? ownshopData.name : null,
        shopemail: modalAction === "edit_own" ? ownshopData.email : null,
    }
    const { register, handleSubmit, errors, reset, setValue } = useForm({
        defaultValues: defaultValues,
    });

    useEffect(() => {
        reset(defaultValues);
    }, [visible]);

    useEffect(() => {
        register({ name: "image" });
    }, [register]);

    useEffect(() => {
        if (ownshopData && modalAction === "edit_own") {
            const rerrangeOwnShopData =
            {
                uid: ownshopData._id,
                name: ownshopData.picture,
                status: 'done',
                url: `${baseUrl}/uploads/sellers/${ownshopData.picture}`,
            };

            setPreviewImage(`${baseUrl}/uploads/sellers/${ownshopData.picture}`);
            setFileList([rerrangeOwnShopData]);
        }

        if (modalAction === "add_own") {
            setPreviewImage("");
            setFileList([]);
        }
    }, [ownshopData, modalAction]);

    const router = useRouter();

    const { adminAuth } = useSelector(state => state.adminAuth);

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

    const onModalSubmit = async (inputdata) => {
        const formData = new FormData();
        formData.append('sellerPicture', inputdata.image);
        formData.append('name', inputdata.shopname);
        formData.append('mobile', inputdata.shopmobile);
        formData.append('email', inputdata.shopemail);
        formData.append('password', inputdata.password);
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
                setVisibled(false);
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Brand succssfully added
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
                        {error.response ? error.response.data.error : error.message}
                    </div>
                ),
                className: 'message-warning',
            });
        }
    }

    const onModalUpdate = async (inputdata) => {
        const formUpdData = new FormData();
        formUpdData.append('sellerId', inputdata.shopId);
        formUpdData.append('sellerPicture', inputdata.image);
        formUpdData.append('name', inputdata.shopname);
        formUpdData.append('email', inputdata.shopemail);
        try {
            const { data } = await axiosApi.put("/api/ownseller", formUpdData,
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
                            Shop succssfully updated
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
                        {error.response ? error.response.data.error : error.message}
                    </div>
                ),
                className: 'message-warning',
            });
        }
    }
    const commonForm = () => (
        <>
            <div className="d-block">
                <label className="cat-label">Name</label>
                <input type="text" className="form-control mt-1"
                    name="shopname"
                    autoComplete="off"
                    ref={register({
                        required: "Provide name"
                    })}
                />
                {errors.shopname && <p className="errorMsg">{errors.shopname.message}</p>}
            </div>
            {modalAction === "add_own" &&
                <>
                    <div className="d-block mt-2">
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
                    <div className="d-block mt-2">
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
                </>
            }
            <div className="d-block mt-3">
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

            <div className="d-block mt-2">
                <div className="d-block" style={{ width: '12.8rem' }}>
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
                </div>
                <input type="hidden" name="shopCheck"
                    value={fileList}
                    readOnly={true}
                    ref={register({
                        required: "Select shop image"
                    })}
                />
                {errors.shopCheck && <p className="errorMsg">{errors.shopCheck.message}</p>}

                {modalAction === "edit_own" &&
                    <input type="hidden" name="shopId"
                        value={ownshopData._id}
                        readOnly={true}
                        ref={register}
                    />
                }
            </div>
            <div className="d-block border-top mt-5 text-right">
                <button type="button" onClick={handleCancel} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                    Cancel
                </button>
                {modalAction === 'add_own' &&
                    <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                        ADD SHOP
                    </button>
                }
                {modalAction === 'edit_own' &&
                    <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                        UPDATE SHOP
                    </button>
                }
            </div>
        </>
    )

    return (
        <Modal
            title={title}
            visible={visible || visibled}
            footer={null}
            closable={false}
            destroyOnClose={true}
        >
            {modalAction === 'edit_own' &&
                <form onSubmit={handleSubmit(onModalUpdate)}>
                    {commonForm()}
                </form>
            }
            {modalAction === 'add_own' &&
                <form onSubmit={handleSubmit(onModalSubmit)}>
                    {commonForm()}
                </form>
            }
        </Modal>
    );
}

export default OwnShopModal;

