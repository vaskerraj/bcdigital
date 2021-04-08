import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import { Upload, Progress, DatePicker, Select, Button, message } from 'antd';
const { Option, OptGroup } = Select;
const { RangePicker } = DatePicker;
import { UploadOutlined } from '@ant-design/icons';

import { useForm } from 'react-hook-form';

import axiosApi from '../../helpers/api';
import baseUrl from '../../helpers/baseUrl';

import ChooseCategory from '../ChooseCategory';

import { allSellers } from '../../redux/actions/sellerAction';
import { allCategories } from '../../redux/actions/categoryAction';

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

const BannerForm = (props) => {
    const [bannerPostionValue, setBannerPostionValue] = useState('');
    const [fieldCategory, setFieldCategory] = useState(false);

    const [fieldBannerFor, setFieldBannerFor] = useState(false);
    const [bannerForValue, setBannerForValue] = useState('');

    const [optionSellerPage, setOptionSellerPage] = useState(true);
    const [fieldSellerList, setFieldSellerList] = useState(false);
    const [fieldProduct, setFieldProduct] = useState(false);

    const [filedValidityDate, setFiledValidityDate] = useState(false);


    // image upload states
    const [webPreviewImage, setWebPreviewImage] = useState("");
    const [mobilePreviewImage, setMobilePreviewImage] = useState("");
    const [webFileList, setWebFileList] = useState([]);
    const [mobileFileList, setMobileFileList] = useState([]);

    const [onOpenChoosenCategory, setOnOpenChoosenCategory] = useState(false);
    // get selected categories list and category id
    const [confirmCategory, setConfirmCategory] = useState({
        categoryId: null,
        firstCatName: '',
        secondCatName: '',
        thirdCatName: ''
    });

    const [selectedCatText, setSelectedCatText] = useState('');

    useEffect(() => {
        const firstDivider = (confirmCategory.firstCatName && confirmCategory.secondCatName)
            ? ' / '
            : '';
        const secondDivider = (confirmCategory.secondCatName && confirmCategory.thirdCatName)
            ? ' / '
            : '';
        const selcatText = confirmCategory.firstCatName + firstDivider + confirmCategory.secondCatName + secondDivider + confirmCategory.thirdCatName;

        setSelectedCatText(selcatText);

    }, [confirmCategory]);

    const dispatch = useDispatch();

    // seller option
    const { sellers } = useSelector(state => state.sellerList);
    useEffect(async () => {
        dispatch(allSellers());
    }, []);

    console.log(sellers);

    const { register, handleSubmit, errors, reset, setValue } = useForm();

    //  bannerPostionHandler
    const bannerPostionHandler = (value) => {
        setBannerPostionValue(value);
        switch (value) {
            case 'position_home':
                setFieldCategory(false);
                // display banner for 
                setFieldBannerFor(true);
                setOptionSellerPage(true);
                // hide sellers list
                setFieldSellerList(false);
                break;
            case 'position_seller':
                setFieldCategory(false);
                // display banner for 
                setFieldBannerFor(true);
                setOptionSellerPage(false);
                // display sellers list
                setFieldSellerList(true);
                break;
            case 'position_category':
                setFieldCategory(true);
                // display banner for 
                setFieldBannerFor(true);
                setOptionSellerPage(false);
                // hide sellers list
                setFieldSellerList(false);
                break;
            case " ":
                setFieldCategory(false);
                setFieldBannerFor(false);
                // hide sellers list
                setFieldSellerList(false);
            default:
                setFieldCategory(false);
                setFieldBannerFor(false);
                // hide sellers list
                setFieldSellerList(false);
                break;

        }
    }
    const bannerForHandler = (value) => {
        switch (value) {
            case 'show_case':
                // hide product list
                setFieldProduct(false);

                // seller field setting
                if (bannerPostionValue === 'position_home') {
                    // hide sellers list
                    setFieldSellerList(false);
                }
                break;
            case 'seller_promtion':
                // hide product list
                setFieldProduct(false);

                // seller field setting
                if (bannerPostionValue === 'position_home') {
                    // show sellers list
                    setFieldSellerList(true);
                }
                break;
            case 'product_promtion':
                // show product list
                setFieldProduct(true);

                // seller field setting
                if (bannerPostionValue === 'position_home') {
                    // hide sellers list
                    setFieldSellerList(false);
                }
                break;
            case ' ':
                // seller field setting
                if (bannerPostionValue === 'position_home') {
                    // hide sellers list
                    setFieldSellerList(false);
                }
                // hide product list
                setFieldProduct(false);
                break;

            default:
                // seller field setting
                if (bannerPostionValue === 'position_home') {
                    // hide sellers list
                    setFieldSellerList(false);
                }
                // hide product list
                setFieldProduct(false);
                break;
        }
    }

    const bannderValidityHandler = (value) => {
        switch (value) {
            case 'validity_no':
                setFiledValidityDate(false)
                break;
            case 'validity_yes':
                setFiledValidityDate(true)
                break;
            case ' ':
                setFiledValidityDate(false)
                break;
            default:
                setFiledValidityDate(false)
                break;
        }
    }

    const onChangeSeller = (value) => {
        setValue("sellerId", value);
    }

    const onChangeDatePicker = (date, dateString) => {
        setValue("validityStart", date[0].toISOString());
        setValue("validityEnd", date[1].toISOString());
    }

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

    const handleWebUpload = ({ fileList }) => {
        imageValidation(fileList[0]);

        getBase64(fileList[0].originFileObj, imageUrl =>
            setWebPreviewImage(imageUrl)
        );

        setWebFileList(fileList);
        // setValue method of react hook form for image upload via ant design
        setValue("webImage", fileList[0].originFileObj);
    };

    const handleMobileUpload = ({ fileList }) => {
        imageValidation(fileList[0]);

        getBase64(fileList[0].originFileObj, imageUrl =>
            setMobilePreviewImage(imageUrl)
        );

        setMobileFileList(fileList);
        // setValue method of react hook form for image upload via ant design
        setValue("mobileImage", fileList[0].originFileObj);
    };
    return (
        <form>
            <div className="col">
                <div className="row">
                    <div className="col-sm-6 mt-4">
                        <label className="cat-label">Banner Position</label>
                        <select name="bannerPostion" className="form-control"
                            onChange={(e) => bannerPostionHandler(e.target.value)}
                            ref={register({
                                required: "Select at where you want to display banner"
                            })}
                        >
                            <option value="">Select</option>
                            <option value="position_home">Home</option>
                            <option value="position_seller">Seller's Page</option>
                            <option value="position_category">Category Page</option>
                        </select>
                        {errors.bannerPostion && <p className="errorMsg">{errors.bannerPostion.message}</p>}
                    </div>
                    {fieldCategory &&
                        <div className="col-sm-6 mt-4 position-relative">
                            <label className="cat-label">Cateogry</label>
                            <input name="bannerCategory" className="form-control"
                                onClick={() => setOnOpenChoosenCategory(true)}
                                value={selectedCatText}
                                autoComplete="off"
                                ref={register({
                                    required: "Provide Category"
                                })}
                            />
                            {errors.bannerFor && <p className="errorMsg">{errors.bannerFor.message}</p>}
                            {onOpenChoosenCategory &&
                                <div className="select-subcate-container pt-3 pr-3 pl-3 border">
                                    <ChooseCategory
                                        catLevel={2}
                                        setConfirmCategory={setConfirmCategory}
                                        handleCancel={setOnOpenChoosenCategory}
                                    />
                                </div>
                            }
                        </div>
                    }
                    {fieldBannerFor &&
                        <div className="col-sm-6 mt-4">
                            <label className="cat-label">Banner For</label>
                            <select name="bannerFor" className="form-control"
                                onChange={(e) => bannerForHandler(e.target.value)}
                                ref={register({
                                    required: "Provide seller"
                                })}
                            >
                                <option value="">Select</option>
                                <option value="show_case">Show Case(No Redirection)</option>
                                {optionSellerPage &&
                                    <option value="seller_promtion">Seller Promotion</option>
                                }
                                <option value="product_promtion">Product Promotion</option>
                            </select>
                            {errors.bannerFor && <p className="errorMsg">{errors.bannerFor.message}</p>}
                        </div>
                    }
                    {
                        !fieldSellerList &&
                        <div className="col-sm-6 mt-4">
                            <label className="cat-label">Sellers</label>
                            <Select defaultValue="" style={{ width: '100%', display: "block" }} onChange={onChangeSeller}>
                                <Option value="">Select</Option>
                                <OptGroup label="Own Shop">
                                    {
                                        sellers.filter(seller => seller.sellerRole === 'own').map(filteredSeller => (
                                            <Option key={filteredSeller._id} value={filteredSeller._id}>{filteredSeller.name}</Option>
                                        ))
                                    }
                                </OptGroup>
                                <OptGroup label="Sellers">
                                    {
                                        sellers.filter(seller => seller.sellerRole === 'normal').map(filteredSeller => (
                                            <Option key={filteredSeller._id} value={filteredSeller._id}>{filteredSeller.name}</Option>
                                        ))
                                    }
                                </OptGroup>
                            </Select>
                            {errors.sellerId && <p className="errorMsg">{errors.sellerId.message}</p>}
                        </div>
                    }
                    {
                        fieldProduct &&
                        <div className="col-sm-6 mt-4">
                            <label className="cat-label">Product</label>
                            <input name="productId" type="text" className="form-control"
                                ref={register({
                                    required: "Provide product"
                                })}
                            />
                            {errors.productId && <p className="errorMsg">{errors.productId.message}</p>}
                        </div>
                    }
                    <div className="col-sm-6 mt-4">
                        <label className="cat-label">Banner Validity</label>
                        <select name="bannerValidity" className="form-control"
                            onChange={(e) => bannderValidityHandler(e.target.value)}
                            ref={register({
                                required: "Provide banner validity"
                            })}
                        >
                            <option value="">Select</option>
                            <option value="validity_no">No</option>
                            <option value="validity_yes">Yes</option>
                        </select>
                        {errors.bannerValidity && <p className="errorMsg">{errors.bannerValidity.message}</p>}
                    </div>
                    {filedValidityDate &&
                        <div className="col-sm-6 mt-4">
                            <label className="cat-label">Start date - End date</label>
                            <RangePicker onChange={(date, dateString) => onChangeDatePicker(date, dateString, 1)} className="form-control" />
                            {errors.bannerValidityDate && <p className="errorMsg">{errors.bannerValidityDate.message}</p>}
                        </div>
                    }
                    <div className="col-sm-6 mt-4">
                        <label className="cat-label">Banner Name</label>
                        <input type="text" name="bannerName" className="form-control" />
                        {errors.bannerName && <p className="errorMsg">{errors.bannerName.message}</p>}
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="row">
                    <div className="col-sm-6 mt-5">
                        <div className="d-block">
                            <label className="cat-label">Banner Image(Website)</label>
                            <Upload
                                accept="image/*"
                                showUploadList={false}
                                fileList={webFileList}
                                onChange={handleWebUpload}
                                beforeUpload={() => false}
                                maxCount={1}
                                className="d-block"
                            >
                                <Button icon={<UploadOutlined />} >
                                    Choose Web Banner Image
                                </Button>
                            </Upload>
                        </div>
                        {webPreviewImage &&
                            <div className="mt-4">
                                <Image src={webPreviewImage} className="webBannerPreivew" width="100%" height="120" />
                            </div>
                        }
                    </div>
                    <div className="col-sm-6 mt-5">
                        <div className="d-block">
                            <label className="cat-label">Banner Image(Mobile)</label>
                            <Upload
                                accept="image/*"
                                showUploadList={false}
                                fileList={mobileFileList}
                                onChange={handleMobileUpload}
                                beforeUpload={() => false}
                                maxCount={1}
                                className="d-block"
                            >
                                <Button icon={<UploadOutlined />} >
                                    Choose Mobile Banner Image
                                </Button>
                            </Upload>
                        </div>
                        {mobilePreviewImage &&
                            <div className="mt-4">
                                <Image src={mobilePreviewImage} className="mobileBannerPreivew" width="100%" height="120" />
                            </div>
                        }
                    </div>
                </div>
            </div>
            <div className="d-block mt-5">
                <button type="submit" className="btn c-btn-primary">Add Brand</button>
            </div>
        </form >
    )
};
export default BannerForm;