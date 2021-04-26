import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import { Upload, Progress, DatePicker, Select, Button, message } from 'antd';
const { Option, OptGroup } = Select;
const { RangePicker } = DatePicker;
import { UploadOutlined } from '@ant-design/icons';

import { useForm } from 'react-hook-form';

import moment from 'moment';

import axiosApi from '../../../helpers/api';
import baseUrl from '../../../helpers/baseUrl';

import ChooseCategory from '../../ChooseCategory';

import { allSellers } from '../../../redux/actions/sellerAction';

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
    const { Action, bannerData, sellers } = props;
    const [bannerPostionValue, setBannerPostionValue] = useState('');
    const [fieldCategory, setFieldCategory] = useState(false);

    const [fieldBannerFor, setFieldBannerFor] = useState(false);

    const [optionSellerPage, setOptionSellerPage] = useState(true);
    const [fieldSellerList, setFieldSellerList] = useState(false);
    const [fieldProduct, setFieldProduct] = useState(false);

    const [filedValidityDate, setFiledValidityDate] = useState(false);


    // image upload states
    const [webPreviewImage, setWebPreviewImage] = useState("");
    const [mobilePreviewImage, setMobilePreviewImage] = useState("");
    const [webFileList, setWebFileList] = useState([]);
    const [mobileFileList, setMobileFileList] = useState([]);
    const [progress, setProgress] = useState(0);

    // seller upload state
    const [sellerList, setSellerList] = useState("");

    const [onOpenChoosenCategory, setOnOpenChoosenCategory] = useState(false);
    const [categoryId, setCategoryId] = useState('');
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

        // categoryId state
        setCategoryId(confirmCategory.categoryId);

    }, [confirmCategory]);

    const [validityDate, setValidityDate] = useState('');
    const [validityStartDate, setValidityStartDate] = useState('');
    const [validityEndDate, setValidityEndDate] = useState('');

    const router = useRouter();

    const { adminAuth } = useSelector(state => state.adminAuth);

    // selected catgories for banner on edit banner
    useEffect(() => {
        if (bannerData && Action === 'edit_banner') {
            const categoryData = bannerData.categoryId;
            if (categoryData) {
                const firstBreadcrumb = categoryData.parentId.parentId ? categoryData.parentId.parentId.name + ' / ' : null;
                const secondBreadcrumb = categoryData.parentId ? categoryData.parentId.name + ' / ' : null;
                const thirdBreadcrumb = categoryData.name;
                setSelectedCatText(firstBreadcrumb ? firstBreadcrumb : '' + secondBreadcrumb + thirdBreadcrumb);
                //////////////////////////^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^//////////////////////////////
                // check for 3rd level of category(at 2nd level of cateogry its null)
            }
        }
    }, [bannerData, Action]);

    const defaultValues = {
        bannerPosition: Action === "edit_banner" ? bannerData.bannerPosition : '',
        bannerFor: Action === "edit_banner" ? bannerData.bannerFor : '',
        categoryId: Action === "edit_banner" ? bannerData.categoryId : '',
        sellerId: Action === "edit_banner" ? bannerData.sellerId : '',
        productId: Action === "edit_banner" ? bannerData.productId : '',
        bannerValidity: Action === "edit_banner" ? bannerData.validityStart ? 'validity_yes' : 'validity_no' : '',
        validityStart: Action === "edit_banner" ? bannerData.validityStart : '',
        validityEnd: Action === "edit_banner" ? bannerData.validityEnd : '',
        bannerName: Action === "edit_banner" ? bannerData.bannerName : '',
    }
    const { register, handleSubmit, errors, reset, setValue } = useForm({
        defaultValues: defaultValues,
    });

    useEffect(() => {
        reset(defaultValues);
    }, []);

    useEffect(() => {
        register({ name: "sellerId" });
        register({ name: "validityStart" });
        register({ name: "validityEnd" });
        register({ name: "webImage" });
        register({ name: "mobileImage" });
    }, [register]);

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

    const onChangeSeller = value => {
        setValue("sellerId", value);
        setSellerList(value);
    }

    const onChangeDatePicker = (date, dateString) => {

        if (date) {
            const validityStart = moment(date[0]);
            const validityEnd = moment(date[1]);
            setValue("validityStart", validityStart);
            setValue("validityEnd", validityEnd);

            setValidityDate(validityStart !== '' && validityEnd !== '' ? date : "")

        } else {
            setValidityDate('');
        }
    }

    const validityDateFormatOnEdit = 'YYYY-MM-DD';
    useEffect(() => {
        if (bannerData && Action === "edit_banner") {
            bannerPostionHandler(bannerData.bannerPosition);
            bannerForHandler(bannerData.bannerFor);
            //banner validaity on database have validity date
            bannderValidityHandler(bannerData.validityStart ? 'validity_yes' : 'validity_no');

            //for banner validaity error
            setValidityDate(bannerData.validityStart);

            //set default date on edit
            bannerData.validityStart ?
                setValidityStartDate(moment(bannerData.validityStart, validityDateFormatOnEdit).add(1, 'd'))
                :
                setValidityStartDate('');

            bannerData.validityEnd ?
                setValidityEndDate(moment(bannerData.validityEnd, validityDateFormatOnEdit).add(1, 'd'))
                :
                setValidityEndDate('');

            // image
            const flistListWebBannerData =
            {
                uid: bannerData._id,
                name: bannerData.webImage,
                status: 'done',
                url: `${baseUrl}/uploads/banners/${bannerData.webImage}`,
            };

            setWebPreviewImage(`${baseUrl}/uploads/banners/${bannerData.webImage}`);
            setWebFileList([flistListWebBannerData]);

            // mobile 

            const flistListMobileBannerData =
            {
                uid: bannerData._id,
                name: bannerData.mobileImage,
                status: 'done',
                url: `${baseUrl}/uploads/banners/${bannerData.mobileImage}`,
            };

            setMobilePreviewImage(`${baseUrl}/uploads/banners/${bannerData.mobileImage}`);
            setMobileFileList([flistListMobileBannerData]);

        }

        if (Action === "add_banner") {
            setWebPreviewImage("");
            setWebFileList([]);

            // mobile 
            setMobilePreviewImage("");
            setMobileFileList([]);

            //set blank date
            setValidityStartDate('')
            setValidityEndDate('')

        }
    }, [bannerData, Action]);

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

    const onSubmit = async (inputdata) => {
        const formData = new FormData();
        formData.append('bannerPosition', inputdata.bannerPosition);
        formData.append('bannerFor', inputdata.bannerFor);
        inputdata.categoryId !== undefined && inputdata.categoryId !== null && inputdata.categoryId !== ''
            ? formData.append('categoryId', inputdata.categoryId) : null;

        inputdata.sellerId !== undefined && inputdata.sellerId !== null && inputdata.sellerId !== ''
            ? formData.append('sellerId', inputdata.sellerId) : null;

        inputdata.productId !== undefined && inputdata.productId !== null && inputdata.productId !== ''
            ? formData.append('productId', inputdata.productId) : null;

        inputdata.bannerValidity === 'validity_yes' && inputdata.validityStart !== undefined && inputdata.validityStart !== null && inputdata.validityStart !== ''
            ? formData.append('validityStart', inputdata.validityStart) : null;

        inputdata.bannerValidity === 'validity_yes' && inputdata.validityEnd !== undefined && inputdata.validityEnd !== null && inputdata.validityEnd !== ''
            ? formData.append('validityEnd', inputdata.validityEnd) : null;

        formData.append('bannerName', inputdata.bannerName);
        formData.append('webImage', inputdata.webImage);
        formData.append('mobileImage', inputdata.mobileImage);

        if (Action === 'add_banner') {

            try {
                const data = await axiosApi.post("/api/banner", formData,
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
                                Banner succssfully added
                            </div>
                        ),
                        className: 'message-success',
                    });

                    router.reload();
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
        } else {
            try {
                formData.append('bannerId', bannerData._id);
                const data = await axiosApi.put(`/api/banner`, formData,
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
                                Banner succssfully added
                            </div>
                        ),
                        className: 'message-success',
                    });

                    router.push('/admin/banner');
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
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="col">
                <div className="row">
                    <div className="col-sm-6 mt-4">
                        <label htmlFor="bannerPosition" className="cat-label">Banner Position</label>
                        <select defaultValue="" name="bannerPosition" id="bannerPosition" className="form-control"
                            readOnly={Action === 'edit_banner' ? true : false}
                            onChange={(e) => bannerPostionHandler(e.target.value)}
                            ref={register({
                                required: "Select at where you want to display banner"
                            })}
                        >
                            <option key="p_blank" value="">Select</option>
                            <option key="position_home" value="position_home">Home</option>
                            <option key="position_seller" value="position_seller">Seller's Page</option>
                            <option key="position_category" value="position_category">Category Page</option>
                        </select>
                        {errors.bannerPostion && <p className="errorMsg">{errors.bannerPostion.message}</p>}
                    </div>
                    {fieldCategory &&
                        <div className="col-sm-6 mt-4 position-relative">
                            <label className="cat-label">Cateogry</label>
                            <input name="bannerCategory" className="form-control normal-input-readyonly"
                                readOnly
                                onClick={() => setOnOpenChoosenCategory(true)}
                                value={selectedCatText}
                                autoComplete="off"
                                ref={register({
                                    required: "Provide category"
                                })}
                            />
                            <input type="hidden" name="categoryId"
                                value={categoryId}
                                readOnly={true}
                                ref={register({
                                    required: "Provide category"
                                })}
                            />
                            {errors.bannerCategory && <p className="errorMsg">{errors.bannerCategory.message}</p>}
                            {errors.categoryId && <p className="categoryId">{errors.categoryId.message}</p>}
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
                            <select defaultValue="" name="bannerFor" className="form-control"
                                onChange={(e) => bannerForHandler(e.target.value)}
                                ref={register({
                                    required: "Provide banner for"
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
                        fieldSellerList &&
                        <div className="col-sm-6 mt-4">
                            <label className="cat-label">Sellers</label>
                            <Select defaultValue="" style={{ width: '100%', display: "block" }} onChange={onChangeSeller}>
                                <Option value="">Select</Option>
                                <OptGroup label="Own Shop">
                                    {
                                        sellers.filter(seller => seller.sellerRole === 'own').map(filteredSeller => (
                                            <Option key={filteredSeller._id} value={filteredSeller._id}>{filteredSeller.name}/{filteredSeller.username}</Option>
                                        ))
                                    }
                                </OptGroup>
                                <OptGroup label="Sellers">
                                    {
                                        sellers.filter(seller => seller.sellerRole === 'normal').map(filteredSeller => (
                                            <Option key={filteredSeller._id} value={filteredSeller._id}>{filteredSeller.name}/{filteredSeller.username}</Option>
                                        ))
                                    }
                                </OptGroup>
                            </Select>
                            <input type="hidden" name="checkSellerId"
                                value={sellerList}
                                readOnly={true}
                                ref={register({
                                    required: "Select seller"
                                })}
                            />
                            {errors.checkSellerId && <p className="errorMsg">{errors.checkSellerId.message}</p>}
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
                            <RangePicker
                                defaultValue={[validityStartDate, validityEndDate]}
                                format={validityDateFormatOnEdit}
                                onChange={(date, dateString) => onChangeDatePicker(date, dateString, 1)}
                                className="form-control"
                            />
                            <input type="hidden" name="validityDate"
                                value={validityDate}
                                ref={register({
                                    required: "Provide validity date"
                                })}
                            />
                            {errors.validityDate && <p className="errorMsg">{errors.validityDate.message}</p>}
                        </div>
                    }
                    <div className="col-sm-6 mt-4">
                        <label className="cat-label">Banner Name</label>
                        <input type="text" name="bannerName" className="form-control"
                            ref={register({
                                required: "Provide banner name"
                            })}
                        />
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
                            <input type="hidden" name="webImageCheck"
                                value={webFileList}
                                readOnly={true}
                                ref={register({
                                    required: "Upload picture"
                                })}
                            />
                            {errors.webImageCheck && <p className="errorMsg">{errors.webImageCheck.message}</p>}
                        </div>
                        {webPreviewImage &&
                            <div className="mt-4 position-relative" style={{ width: '100%', height: '200px' }}>
                                <Image src={webPreviewImage} className="webBannerPreivew"
                                    layout="fill"
                                />
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
                            <input type="hidden" name="mobileImageCheck"
                                value={mobileFileList}
                                readOnly={true}
                                ref={register({
                                    required: "Upload picture"
                                })}
                            />
                            {errors.mobileImageCheck && <p className="errorMsg">{errors.mobileImageCheck.message}</p>}
                        </div>
                        {mobilePreviewImage &&
                            <div className="mt-4 position-relative" style={{ width: '80%', height: '150px' }}>
                                <Image src={mobilePreviewImage} className="mobileBannerPreivew"
                                    quality="100"
                                    layout="fill"
                                />
                            </div>
                        }
                    </div>
                </div>
            </div>
            <div className="d-block mt-5">
                <button type="submit" className="btn c-btn-primary">
                    {Action === 'edit_banner' ? 'UPDATE BANNER' : 'ADD BANNER'}
                </button>
            </div>
        </form >
    )
};
export default BannerForm;