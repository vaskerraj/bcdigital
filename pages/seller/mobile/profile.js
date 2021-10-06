import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { Affix, Tabs, message, Tag, Upload, Button } from 'antd';
const { TabPane } = Tabs;
import {
    UploadOutlined,
    DeleteOutlined
} from '@ant-design/icons';

import { ChevronLeft } from 'react-feather';

import { useForm } from "react-hook-form";

import WarehouseAddress from '../../../components/seller/WarehouseAddress';
import ReturnAddress from '../../../components/seller/ReturnAddress';
import { sellerStatusText } from '../../../helpers/functions';

const SellerProfile = ({ seller, defaultAddresses }) => {

    // file upload states
    const [docFileList, setDocFileList] = useState([]);
    const [chequeFileList, setChequeFileList] = useState([]);

    // file repload state
    const [chequeBusinessDocPreview, setChequeBusinessDocPreview] = useState(seller.documentFile.split("_")[1]);
    const [chequeFilePreview, setChequeFilePreview] = useState(seller.account.chequeFile.split("_")[1]);

    const router = useRouter();
    const { sellerAuth } = useSelector(state => state.sellerAuth);

    //////////////////////////////////// business //////////////////////////// ///////

    const filterBusinessAdd = seller.addresses.find(ele => ele.label === 'business');

    const defaultValues = {
        legalName: seller.legalName,
        regType: seller.registrationType,
        regNumber: seller.registrationNumber,
        business_name: filterBusinessAdd.fullname,
        business_mobile: filterBusinessAdd.mobile,
        business_email: filterBusinessAdd.email,
        businessRegion: filterBusinessAdd.region.name,
        businessCity: filterBusinessAdd.city.name,
        businessArea: filterBusinessAdd.area.name,
        businessStreet: filterBusinessAdd.street,
    }

    const { register, handleSubmit, formState: { errors }, reset, setValue, getValues } = useForm({
        defaultValues: defaultValues
    });


    useEffect(() => {
        reset(defaultValues);
    }, [defaultAddresses]);

    useEffect(() => {
        register({ name: "docFile" });
    }, [register]);

    const handleDocUpload = ({ fileList }) => {
        setDocFileList(fileList);
        setChequeBusinessDocPreview(fileList[0].name);
        // setValue method of react hook form for image upload via ant design
        setValue("docFile", fileList[0].originFileObj);
    };

    const deleteDocUploadHandler = () => {
        setChequeBusinessDocPreview(false);
        setDocFileList([]);
    }

    const onSubmit = async (inputdata) => {

        const formData = new FormData();
        formData.append('legalName', inputdata.legalName);
        formData.append('regType', inputdata.regType);
        formData.append('regNumber', inputdata.regNumber);
        formData.append('docFile', inputdata.docFile);

        formData.append('fullname', inputdata.business_name);
        formData.append('mobile', inputdata.business_mobile);
        formData.append('email', inputdata.business_email);
        formData.append('street', inputdata.businessStreet);

        try {
            const { data } = await axiosApi.put('/api/seller/profile/business', formData,
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
                            Business information succssfully updated.
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.push(router.asPath);
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
    /////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////// warehouse ///////////////////////////////////
    const filterWarehouseAdd = seller.addresses.find(ele => ele.label === 'warehouse');

    const warehouseDefaultValues = {
        warehouse_name: filterWarehouseAdd.fullname,
        warehouse_mobile: filterWarehouseAdd.mobile,
        warehouse_email: filterWarehouseAdd.email,
        warehouseRegion: filterWarehouseAdd.region._id,
        warehouseCity: filterWarehouseAdd.city._id,
        warehouse_street: filterWarehouseAdd.street
    }

    const {
        register: ware_register,
        formState: { errors: ware_errors },
        handleSubmit: ware_handleSubmit,
        reset: ware_reset,
        getValues: ware_getValues,
    } = useForm({
        defaultValues: warehouseDefaultValues
    });

    const wareOnSubmit = async (inputdata) => {
        let wareAddress = new Object();

        wareAddress['label'] = 'warehouse';
        wareAddress['fullname'] = inputdata.warehouse_name;
        wareAddress['mobile'] = inputdata.warehouse_mobile;
        wareAddress['email'] = inputdata.warehouse_email;
        wareAddress['region'] = inputdata.warehouseRegion
        wareAddress['city'] = inputdata.warehouseCity
        wareAddress['area'] = inputdata.warehouseArea
        wareAddress['street'] = inputdata.warehouse_street

        try {
            const { data } = await axiosApi.put('/api/seller/profile/warehouse',
                {
                    addresses: wareAddress
                },
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
                            Warehouse address succssfully updated.
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.push(router.asPath);
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

    //////////////////////////////////return address //////////////////////////////

    const filterReturneAdd = seller.addresses.find(ele => ele.label === 'return');
    const returnDefaultValues = {
        return_name: filterReturneAdd.fullname,
        return_mobile: filterReturneAdd.mobile,
        return_email: filterReturneAdd.email,
        returnRegion: filterReturneAdd.region._id,
        returnCity: filterReturneAdd.city._id,
        return_street: filterReturneAdd.street
    }
    const {
        register: return_register,
        formState: { errors: return_errors },
        handleSubmit: return_handleSubmit,
        reset: return_reset,
        getValues: return_getValues,
    } = useForm({
        defaultValues: returnDefaultValues
    });

    const returnOnSubmit = async (inputdata) => {
        let returnAddress = new Object();

        returnAddress['label'] = 'return';
        returnAddress['fullname'] = inputdata.return_name;
        returnAddress['mobile'] = inputdata.return_mobile;
        returnAddress['email'] = inputdata.return_email;
        returnAddress['region'] = inputdata.returnRegion
        returnAddress['city'] = inputdata.returnCity
        returnAddress['area'] = inputdata.returnArea
        returnAddress['street'] = inputdata.return_street

        try {
            const { data } = await axiosApi.put('/api/seller/profile/return',
                {
                    addresses: returnAddress
                },
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
                            Return address succssfully updated.
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.push(router.asPath);
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


    //////////////////////////////////////////////////////////////////////////////

    //////////////////////////////////// bank //////////////////////////// ///////
    const bankDefaultValues = {
        title: seller.account.title,
        number: seller.account.number,
        bankname: seller.account.bankName,
        bankbranch: seller.account.branch,
    }

    const {
        register: bank_register,
        formState: { errors: bank_errors },
        handleSubmit: bank_handleSubmit,
        setValue: return_setValue,
    } = useForm({
        defaultValues: bankDefaultValues
    });

    useEffect(() => {
        bank_register({ name: "copyofcheque" });
    }, [bank_register]);

    const handleChequeUpload = ({ fileList }) => {
        setChequeFileList(fileList);
        setChequeFilePreview(fileList[0].name);
        // setValue method of react hook form for image upload via ant design
        return_setValue("copyofcheque", fileList[0].originFileObj);
    };

    const deleteChequeUploadHandler = () => {
        setChequeFilePreview(false);
        setChequeFileList([]);
    }

    const bankOnSubmit = async (inputdata) => {
        const bankFormData = new FormData();
        bankFormData.append('title', inputdata.title);
        bankFormData.append('number', inputdata.number);
        bankFormData.append('bankName', inputdata.bankname);
        bankFormData.append('bankBranch', inputdata.bankbranch);
        bankFormData.append('copyofcheque', inputdata.copyofcheque);

        try {
            const { data } = await axiosApi.put('/api/seller/profile/bank', bankFormData,
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
                            Bank Information succssfully updated.
                            Account Information was updated and will be reviewed shortly
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.push(router.asPath);
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
    /////////////////////////////////////////////////////////////////////////////////

    return (
        <>
            <Affix>
                <div className="container-fluid backNav-container border-top cp" onClick={() => router.back()}>
                    <div className="d-flex mb-2 align-items-center">
                        <ChevronLeft size={26} className="mr-3" />
                        <div className="back-navigation">
                            Profile
                        </div>
                    </div>
                </div>
            </Affix>
            <div className="container">
                <Tabs tabPosition="top" >
                    <TabPane tab="General Info" key="1">
                        <div className="d-flex">
                            <div className="font-weight-bold" style={{ minWidth: '20rem' }}>
                                Shop Name:
                            </div>
                            <div>
                                {seller.legalName}
                            </div>
                        </div>
                        <div className="d-flex mt-4">
                            <div className="font-weight-bold" style={{ minWidth: '20rem' }}>
                                Mobile Number:
                            </div>
                            <div>
                                {seller.userId.mobile}
                            </div>
                        </div>
                        <div className="d-flex mt-4">
                            <div className="font-weight-bold" style={{ minWidth: '20rem' }}>
                                Email Address:
                            </div>
                            <div>
                                {seller.userId.email}
                            </div>
                        </div>
                        <div className="d-flex mt-4">
                            <div className="font-weight-bold" style={{ minWidth: '20rem' }}>
                                Business Document Status:
                            </div>
                            <div>
                                <Tag color="red">
                                    {sellerStatusText(seller.documentVerify)}
                                </Tag>
                            </div>
                        </div>
                        <div className="d-flex mt-4">
                            <div className="font-weight-bold" style={{ minWidth: '20rem' }}>
                                Bank Info Status:
                            </div>
                            <div>
                                <Tag color="red">
                                    {sellerStatusText(seller.account.bankVerify)}
                                </Tag>
                            </div>
                        </div>
                    </TabPane>
                    <TabPane tab="Business Info" key="2">
                        <div className="col-12 col-sm-6 col-md-4">
                            <form autoComplete="new password" onSubmit={handleSubmit(onSubmit)}>
                                <div className="d-block">
                                    <div className="d-flex justify-content-between">
                                        <label htmlFor="legalName">
                                            Legal Name/Business Owner Name
                                        </label>
                                        <span className="text-success">
                                            {sellerStatusText(seller.documentVerify)}
                                        </span>
                                    </div>
                                    <input name="legalName" className="form-control"
                                        id="legalName"
                                        ref={register({
                                            required: "Provide"
                                        })}
                                    />
                                    {errors.legalName && <p className="errorMsg">{errors.legalName.message}</p>}
                                </div>
                                <div className="d-block mt-3">
                                    <div className="d-flex justify-content-between">
                                        <label>
                                            Business Registration Number
                                        </label>
                                        <span className="text-success">
                                            {sellerStatusText(seller.documentVerify)}
                                        </span>
                                    </div>
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
                                    </label>
                                    <div className="d-inline ml-3">
                                        {!chequeBusinessDocPreview ?
                                            <>
                                                <Upload
                                                    name="docFile"
                                                    accept=".png, .jpg, .jpeg .pdf"
                                                    showUploadList={false}
                                                    fileList={docFileList}
                                                    onChange={handleDocUpload}
                                                    beforeUpload={() => false}
                                                    maxCount={1}
                                                >
                                                    <Button icon={<UploadOutlined />}>Upload</Button>
                                                </Upload>
                                                <input type="hidden" name="uploadCheck"
                                                    value={docFileList}
                                                    readOnly={true}
                                                    ref={register({
                                                        required: "Provide"
                                                    })}
                                                />
                                                {errors.uploadCheck && <p className="errorMsg">{errors.uploadCheck.message}</p>}
                                            </>
                                            :
                                            <Button onClick={deleteDocUploadHandler}>
                                                {chequeBusinessDocPreview}
                                                <DeleteOutlined className="text-danger" />
                                            </Button>
                                        }

                                    </div>
                                    <div className="d-block mt-3">
                                        <label htmlFor="business_name">
                                            Contact Person Name
                                        </label>
                                        <input name="business_name" className="form-control"
                                            id="business_name"
                                            ref={register({
                                                required: "Provide"
                                            })}
                                        />
                                        {errors.business_name && <p className="errorMsg">{errors.business_name.message}</p>}
                                    </div>
                                    <div className="d-block mt-3">
                                        <label htmlFor="business_mobile">
                                            Contact Person Mobile No.
                                        </label>
                                        <input name="business_mobile" className="form-control"
                                            id="business_mobile"
                                            ref={register({
                                                required: "Provide"
                                            })}
                                        />
                                        {errors.business_mobile && <p className="errorMsg">{errors.business_mobile.message}</p>}
                                    </div>
                                    <div className="d-block mt-3">
                                        <label htmlFor="business_email">
                                            Contact Person Email
                                        </label>
                                        <input name="business_email" className="form-control"
                                            id="business_email"
                                            ref={register({
                                                required: "Provide"
                                            })}
                                        />
                                        {errors.business_email && <p className="errorMsg">{errors.business_email.message}</p>}
                                    </div>
                                    <div className="d-block mt-3">
                                        <label htmlFor="businessRegion">
                                            Region
                                        </label>
                                        <input name="businessRegion" className="form-control" disabled
                                            id="businessRegion"
                                            ref={register({
                                                required: "Provide"
                                            })}
                                        />
                                        {errors.businessRegion && <p className="errorMsg">{errors.businessRegion.message}</p>}
                                    </div>
                                    <div className="d-block mt-3">
                                        <label htmlFor="businessCity">
                                            City
                                        </label>
                                        <input name="businessCity" className="form-control" disabled
                                            id="businessCity"
                                            ref={register({
                                                required: "Provide"
                                            })}
                                        />
                                        {errors.businessCity && <p className="errorMsg">{errors.businessCity.message}</p>}
                                    </div>
                                    <div className="d-block mt-3">
                                        <label htmlFor="businessArea">
                                            Area
                                        </label>
                                        <input name="businessArea" className="form-control" disabled
                                            id="businessArea"
                                            ref={register({
                                                required: "Provide"
                                            })}
                                        />
                                        {errors.businessArea && <p className="errorMsg">{errors.businessArea.message}</p>}
                                    </div>
                                    <div className="d-block mt-3">
                                        <label htmlFor="businessStreet">
                                            Street
                                        </label>
                                        <input name="businessStreet" className="form-control"
                                            id="businessStreet"
                                            ref={register({
                                                required: "Provide"
                                            })}
                                        />
                                        {errors.businessStreet && <p className="errorMsg">{errors.businessStreet.message}</p>}
                                    </div>
                                </div>
                                <div className="d-block mt-5 mb-2 text-right">
                                    <button type="submit" className="ant-btn ant-btn-danger ant-btn-lg ml-3">
                                        UPDATE
                                    </button>
                                </div>
                            </form>
                        </div>
                    </TabPane>
                    <TabPane tab="Warehouse Address" key="3" >
                        <div className="col-12 col-sm-6 col-md-4">

                            <form onSubmit={ware_handleSubmit(wareOnSubmit)}>
                                <div className="d-block">
                                    <div>
                                        <label>Contact Person names</label>
                                        <input type="text" name="warehouse_name" className="form-control"
                                            ref={ware_register({
                                                required: "Provide fullname"
                                            })}
                                        />
                                        {ware_errors.warehouse_name && <p className="errorMsg">{ware_errors.warehouse_name.message}</p>}
                                    </div>
                                    <div className="mt-3">
                                        <label>Contact Person Mobile no.</label>
                                        <input type="text"
                                            className="form-control"
                                            name="warehouse_mobile"
                                            autoComplete="off"
                                            ref={ware_register({
                                                required: true,
                                                minLength: 10,
                                                maxLength: 10
                                            })}
                                        />
                                        {ware_errors.warehouse_mobile && ware_errors.warehouse_mobile.type === "required" && (
                                            <p className="errorMsg">Provide mobile number</p>
                                        )}
                                        {ware_errors.warehouse_mobile && ware_errors.warehouse_mobile.type === "minLength" && (
                                            <p className="errorMsg">
                                                Invalid mobile number
                                            </p>
                                        )}
                                        {ware_errors.warehouse_mobile && ware_errors.warehouse_mobile.type === "maxLength" && (
                                            <p className="errorMsg">
                                                Invalid mobile number
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-3">
                                        <label>Contact Person Email</label>
                                        <input type="email"
                                            className="form-control"
                                            name="warehouse_email"
                                            ref={ware_register({
                                                required: "Provide email address",
                                            })}
                                        />
                                        {ware_errors.warehouse_email && <p className="errorMsg">{ware_errors.warehouse_email.message}</p>}
                                    </div>

                                    <div className="mt-3">
                                        <WarehouseAddress
                                            addresses={defaultAddresses}
                                            formRegister={ware_register}
                                            errors={ware_errors}
                                            reset={ware_reset}
                                            getValues={ware_getValues}
                                            defaultRegion={filterWarehouseAdd.region._id}
                                            defaultCity={filterWarehouseAdd.city._id}
                                            defaultArea={filterWarehouseAdd.area._id}
                                        />
                                    </div>
                                    <div className="mt-3">

                                        <label>Street Address</label>
                                        <input type="text" name="warehouse_street" className="form-control"
                                            ref={ware_register({
                                                required: "Provide street address"
                                            })}
                                        />
                                        {ware_errors.warehouse_street && <p className="errorMsg">{ware_errors.warehouse_street.message}</p>}
                                    </div>
                                </div>
                                <div className="d-block mt-5 mb-2 text-right">
                                    <button type="submit" className="ant-btn ant-btn-danger ant-btn-lg ml-3">
                                        UPDATE
                                    </button>
                                </div>
                            </form>
                        </div>
                    </TabPane>
                    <TabPane tab="Return Address" key="4">
                        <div className="col-12 col-sm-6 col-md-4">
                            <form onSubmit={return_handleSubmit(returnOnSubmit)}>
                                <div className="d-block">
                                    <div>
                                        <label>Contact Person name</label>
                                        <input type="text" name="return_name" className="form-control"
                                            ref={return_register({
                                                required: "Provide fullname"
                                            })}
                                        />
                                        {return_errors.return_name && <p className="errorMsg">{return_errors.return_name.message}</p>}
                                    </div>
                                    <div className="mt-3">
                                        <label>Contact Person Mobile no.</label>
                                        <input type="text"
                                            className="form-control"
                                            name="return_mobile"
                                            autoComplete="off"
                                            ref={return_register({
                                                required: true,
                                                minLength: 10,
                                                maxLength: 10
                                            })}
                                        />
                                        {return_errors.return_mobile && return_errors.return_mobile.type === "required" && (
                                            <p className="errorMsg">Provide mobile number</p>
                                        )}
                                        {return_errors.return_mobile && return_errors.return_mobile.type === "minLength" && (
                                            <p className="errorMsg">
                                                Invalid mobile number
                                            </p>
                                        )}
                                        {return_errors.return_mobile && return_errors.return_mobile.type === "maxLength" && (
                                            <p className="errorMsg">
                                                Invalid mobile number
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-3">
                                        <label>Contact Person Email</label>
                                        <input type="email"
                                            className="form-control"
                                            name="return_email"
                                            ref={return_register({
                                                required: "Provide email address",
                                            })}
                                        />
                                        {return_errors.return_email && <p className="errorMsg">{return_errors.return_email.message}</p>}
                                    </div>
                                    <div className="mt-3">
                                        <ReturnAddress
                                            addresses={defaultAddresses}
                                            formRegister={return_register}
                                            errors={return_errors}
                                            reset={return_reset}
                                            getValues={return_getValues}
                                            defaultRegion={filterWarehouseAdd.region._id}
                                            defaultCity={filterWarehouseAdd.city._id}
                                            defaultArea={filterWarehouseAdd.area._id}
                                        />
                                    </div>
                                    <div className="mt-3">

                                        <label>Street Address</label>
                                        <input type="text" name="return_street" className="form-control"
                                            ref={return_register({
                                                required: "Provide street address"
                                            })}
                                        />
                                        {return_errors.return_street && <p className="errorMsg">{return_errors.return_street.message}</p>}
                                    </div>
                                </div>
                                <div className="d-block mt-5 mb-2 text-right">
                                    <button type="submit" className="ant-btn ant-btn-danger ant-btn-lg ml-3">
                                        UPDATE
                                    </button>
                                </div>
                            </form>
                        </div>

                    </TabPane>
                    <TabPane tab="Bank Info" key="5">
                        <form onSubmit={bank_handleSubmit(bankOnSubmit)}>
                            <div className="col-12 col-sm-6 col-md-4">
                                <div className="text-right">
                                    <strong>Status:</strong>
                                    <Tag color="green" className="ml-3">
                                        {sellerStatusText(seller.account.bankVerify)}
                                    </Tag>
                                </div>
                                <div className="d-block mt-3">
                                    <label>
                                        Account Title
                                    </label>
                                    <input name="title" className="form-control"
                                        ref={bank_register({
                                            required: "Provide"
                                        })}
                                    />
                                    {bank_errors.title && <p className="errorMsg">{bank_errors.title.message}</p>}
                                </div>
                                <div className="d-block mt-3">
                                    <label>
                                        Account Number
                                    </label>
                                    <input name="number" className="form-control"
                                        ref={bank_register({
                                            required: "Provide"
                                        })}
                                    />
                                    {bank_errors.number && <p className="errorMsg">{bank_errors.number.message}</p>}
                                </div>

                                <div className="d-block mt-3">
                                    <label>
                                        Bank Name
                                    </label>

                                    <input name="bankname" className="form-control"
                                        ref={bank_register({
                                            required: "Provide"
                                        })}
                                    />
                                    {bank_errors.bankname && <p className="errorMsg">{bank_errors.bankname.message}</p>}
                                </div>
                                <div className="d-block mt-3">
                                    <label>
                                        Bank Branch
                                    </label>

                                    <input name="bankbranch" className="form-control" ref={bank_register()} />
                                </div>
                                <div className="d-block mt-3">
                                    <label>
                                        Copy Of Cheque
                                    </label>
                                    <div className="d-inline ml-3">
                                        {!chequeFilePreview ?
                                            <>
                                                <Upload
                                                    name="copyOfCheque"
                                                    className="avatar-uploader"
                                                    accept=".png, .jpg, .jpeg .pdf"
                                                    showUploadList={false}
                                                    fileList={chequeFileList}
                                                    onChange={handleChequeUpload}
                                                    beforeUpload={() => false}
                                                    maxCount={1}
                                                >
                                                    <Button icon={<UploadOutlined />}>Upload</Button>
                                                </Upload>
                                                <input type="hidden" name="copyOfChequeCheck"
                                                    value={chequeFileList}
                                                    readOnly={true}
                                                    ref={bank_register({
                                                        required: "Provide"
                                                    })}
                                                />
                                                {bank_errors.copyOfChequeCheck && <p className="errorMsg">{bank_errors.copyOfChequeCheck.message}</p>}

                                            </>
                                            :
                                            <Button onClick={deleteChequeUploadHandler}>
                                                {chequeFilePreview}
                                                <DeleteOutlined className="text-danger" />
                                            </Button>
                                        }
                                    </div>
                                </div>
                                <div className="d-block mt-5 mb-2 text-right">
                                    <button type="submit" className="ant-btn ant-btn-danger ant-btn-lg ml-3">
                                        UPDATE
                                    </button>
                                </div>
                            </div>
                        </form>
                    </TabPane>
                </Tabs>
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

        const { data: defaultAddresses } = await axios.get(`${process.env.api}/api/defaultaddress`);
        if (data) {
            if (data.stepComplete) {
                return {
                    props: {
                        seller: data,
                        defaultAddresses
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
                } else if (data.step === 'addresses') {
                    return {
                        redirect: {
                            source: '/seller/mobile/start/bank',
                            destination: '/seller/mobile/start/bank',
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

    } catch (err) {
        console.log(err)
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

export default SellerProfile;
