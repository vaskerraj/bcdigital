import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { Upload, Modal, message } from 'antd';
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
const BrandModal = (props) => {
    const { title, visible, handleCancel, modalAction, brandsData } = props;
    const [visibled, setVisibled] = useState(false);

    // image upload states
    const [previewImage, setPreviewImage] = useState("");
    const [fileList, setFileList] = useState([]);

    const defaultValues = {
        name: modalAction === "edit_brand" ? brandsData.name : null,
    }
    const { register, handleSubmit, errors, reset } = useForm({
        defaultValues: defaultValues,
    });

    useEffect(() => {
        reset(defaultValues);
    }, [visible]);

    useEffect(() => {
        console.log(brandsData)
        if (brandsData && modalAction === "edit_brand") {
            const rerrangeBrandData =
            {
                uid: brandsData._id,
                name: brandsData.image,
                status: 'done',
                url: `${baseUrl}/uploads/brands/${brandsData.image}`,
            }
            setPreviewImage(`${baseUrl}/uploads/brands/${brandsData.image}`); setPreviewImage(`${baseUrl}/uploads/brands/${brandsData.image}`);
            setFileList([rerrangeBrandData]);
        }
    }, [brandsData]);

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
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    // on form submit
    const onModalSubmit = async (inputdata) => {

    }
    const onModalUpdate = async (inputdata) => {

    }
    const commonForm = () => (
        <>
            <div className="d-block">
                <label className="cat-label">Brand Name</label>
                <input type="text" className="form-control mt-1"
                    name="name"
                    autoComplete="off"
                    ref={register({
                        required: "Provide name of the brand"
                    })}
                />
                {errors.name && <p className="errorMsg">{errors.name.message}</p>}
            </div>
            <div className="d-block mt-4">
                <label className="cat-label">Brand Logo</label>
                <Upload
                    name="brandPicture"
                    listType="picture-card"
                    className="avatar-uploader"
                    showUploadList={false}
                    fileList={fileList}
                    onChange={handleUpload}
                    beforeUpload={() => false}
                    maxCount={1}
                >
                    {previewImage ? <img src={previewImage} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                </Upload>
                <input type="text" name="brandCheck"
                    value={fileList}
                    readOnly={true}
                    ref={register({
                        required: "Select brand image"
                    })}
                />
                {errors.brandCheck && <p className="errorMsg">{errors.brandCheck.message}</p>}
            </div>
            <div className="d-block border-top mt-5 text-right">
                <button type="button" onClick={handleCancel} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                    Cancel
                </button>
                {modalAction === 'add_brand' &&
                    <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                        ADD BRAND
                    </button>
                }
                {modalAction === 'edit_brand' &&
                    <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                        UPDATE BRAND
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
            {modalAction === 'edit_brand' &&
                <form onSubmit={handleSubmit(onModalUpdate)}>
                    {commonForm()}
                </form>
            }
            {modalAction === 'add_brand' &&
                <form onSubmit={handleSubmit(onModalSubmit)}>
                    {commonForm()}
                </form>
            }
        </Modal>
    );
}

export default BrandModal;

