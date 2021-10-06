import React from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../../helpers/api';


import { message } from 'antd';

import { useForm } from "react-hook-form";

import StartStep from '../../../../components/seller/Step';
import BusinessAddress from '../../../../components/seller/BusinessAddress';
import WarehouseAddress from '../../../../components/seller/WarehouseAddress';
import ReturnAddress from '../../../../components/seller/ReturnAddress';

const AddressDetails = ({ defaultAddresses }) => {

    // uncomment and work for same address as business address
    // const [businessRegion, setBusinessRegion] = useState('');
    // const [businessCity, setBusinessCity] = useState('');
    // const [businessArea, setBusinessArea] = useState('');

    // const [warehouseRegion, setWarehouseRegion] = useState('');
    // const [warehouseCity, setWarehouseCity] = useState('');
    // const [warehouseArea, setWarehouseArea] = useState('');

    // const [returnRegion, setReturnRegion] = useState('');
    // const [returnCity, setReturnCity] = useState('');
    // const [returnArea, setReturnArea] = useState('');

    // const sameWareHouseAddress = (e) => {
    //     if (e.target.checked) {
    //         setWarehouseRegion(businessRegion);
    //         setWarehouseCity(businessCity);
    //         setWarehouseArea(businessArea);
    //     }
    // }

    const { register, handleSubmit, errors, reset, setValue, getValues } = useForm();

    const router = useRouter();
    const { sellerAuth } = useSelector(state => state.sellerAuth);

    const onSubmit = async (inputdata) => {

        let addressArrayAsDatabase = new Array();
        let businessAddress = new Object();
        businessAddress['label'] = 'business';
        businessAddress['fullname'] = inputdata.business_name;
        businessAddress['mobile'] = inputdata.business_mobile;
        businessAddress['email'] = inputdata.business_email;
        businessAddress['region'] = inputdata.businessRegion
        businessAddress['city'] = inputdata.businessCity
        businessAddress['area'] = inputdata.businessArea
        businessAddress['street'] = inputdata.business_street
        addressArrayAsDatabase.push(businessAddress);

        let warehouseAddress = new Object();
        warehouseAddress['label'] = 'warehouse';
        warehouseAddress['fullname'] = inputdata.warehouse_name;
        warehouseAddress['mobile'] = inputdata.warehouse_mobile;
        warehouseAddress['email'] = inputdata.warehouse_email;
        warehouseAddress['region'] = inputdata.warehouseRegion
        warehouseAddress['city'] = inputdata.warehouseCity
        warehouseAddress['area'] = inputdata.warehouseArea
        warehouseAddress['street'] = inputdata.warehouse_street;
        addressArrayAsDatabase.push(warehouseAddress);

        let returnAddress = new Object();
        returnAddress['label'] = 'return';
        returnAddress['fullname'] = inputdata.return_name;
        returnAddress['mobile'] = inputdata.return_mobile;
        returnAddress['email'] = inputdata.return_email;
        returnAddress['region'] = inputdata.returnRegion
        returnAddress['city'] = inputdata.returnCity
        returnAddress['area'] = inputdata.returnArea
        returnAddress['street'] = inputdata.return_street;
        addressArrayAsDatabase.push(returnAddress);

        try {
            const { data } = await axiosApi.put('/api/seller/start/addresses',
                {
                    addresses: addressArrayAsDatabase
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
                            Addresses succssfully added.
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.push('./bank');
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
                <StartStep activeStep={1} />
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                        <div className="col-12 col-sm-6 col-md-4 mt-5">
                            <div className="border p-3">
                                Business Address
                                <div className="d-block mt-4">
                                    <div>
                                        <label>Fullname</label>
                                        <input type="text" name="business_name" className="form-control"
                                            ref={register({
                                                required: "Provide fullname"
                                            })}
                                        />
                                        {errors.business_name && <p className="errorMsg">{errors.business_name.message}</p>}
                                    </div>
                                    <div className="mt-2">
                                        <label>Mobile no.</label>
                                        <input type="text"
                                            className="form-control"
                                            name="business_mobile"
                                            autoComplete="off"
                                            ref={register({
                                                required: true,
                                                minLength: 10,
                                                maxLength: 10
                                            })}
                                        />
                                        {errors.business_mobile && errors.business_mobile.type === "required" && (
                                            <p className="errorMsg">Provide mobile number</p>
                                        )}
                                        {errors.business_mobile && errors.business_mobile.type === "minLength" && (
                                            <p className="errorMsg">
                                                Invalid mobile number
                                            </p>
                                        )}
                                        {errors.business_mobile && errors.business_mobile.type === "maxLength" && (
                                            <p className="errorMsg">
                                                Invalid mobile number
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <label>Email</label>
                                        <input type="email"
                                            className="form-control"
                                            name="business_email"
                                            autoComplete="off"
                                            ref={register({
                                                required: "Provide email address"
                                            })}
                                        />
                                        {errors.business_email && <p className="errorMsg">{errors.business_email.message}</p>}
                                    </div>
                                    <div className="mt-2">
                                        <BusinessAddress
                                            addresses={defaultAddresses}
                                            formRegister={register}
                                            errors={errors}
                                            reset={reset}
                                            getValues={getValues}
                                        />
                                    </div>
                                    <div className="mt-2">
                                        <label className="font14 font-weight-bold">Street Address</label>
                                        <input name="business_street" type="text" className="form-control"
                                            ref={register({
                                                required: "Provide street address"
                                            })}
                                        />
                                        {errors.business_street && <p className="errorMsg">{errors.business_street.message}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 col-md-4 mt-5">
                            <div className="border p-3">
                                Warehouse Address
                                <div className="d-block mt-4">
                                    <div>
                                        <label>Fullname</label>
                                        <input type="text" name="warehouse_name" className="form-control"
                                            ref={register({
                                                required: "Provide fullname"
                                            })}
                                        />
                                        {errors.warehouse_name && <p className="errorMsg">{errors.warehouse_name.message}</p>}
                                    </div>
                                    <div className="mt-2">
                                        <label>Mobile no.</label>
                                        <input type="text"
                                            className="form-control"
                                            name="warehouse_mobile"
                                            autoComplete="off"
                                            ref={register({
                                                required: true,
                                                minLength: 10,
                                                maxLength: 10
                                            })}
                                        />
                                        {errors.warehouse_mobile && errors.warehouse_mobile.type === "required" && (
                                            <p className="errorMsg">Provide mobile number</p>
                                        )}
                                        {errors.warehouse_mobile && errors.warehouse_mobile.type === "minLength" && (
                                            <p className="errorMsg">
                                                Invalid mobile number
                                            </p>
                                        )}
                                        {errors.warehouse_mobile && errors.warehouse_mobile.type === "maxLength" && (
                                            <p className="errorMsg">
                                                Invalid mobile number
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <label>Email</label>
                                        <input type="email"
                                            className="form-control"
                                            name="warehouse_email"
                                            ref={register({
                                                required: "Provide email address",
                                            })}
                                        />
                                        {errors.warehouse_email && <p className="errorMsg">{errors.warehouse_email.message}</p>}
                                    </div>
                                    <div className="mt-2">
                                        <WarehouseAddress
                                            addresses={defaultAddresses}
                                            formRegister={register}
                                            errors={errors}
                                            reset={reset}
                                            getValues={getValues}
                                        />
                                    </div>
                                    <div className="mt-2">

                                        <label>Street Address</label>
                                        <input type="text" name="warehouse_street" className="form-control"
                                            ref={register({
                                                required: "Provide street address"
                                            })}
                                        />
                                        {errors.warehouse_street && <p className="errorMsg">{errors.warehouse_street.message}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 col-md-4 mt-5">
                            <div className="border p-3">
                                Return Address
                                <div className="d-block mt-4">
                                    <div>
                                        <label>Fullname</label>
                                        <input type="text" name="return_name" className="form-control"
                                            ref={register({
                                                required: "Provide fullname"
                                            })}
                                        />
                                        {errors.return_name && <p className="errorMsg">{errors.return_name.message}</p>}
                                    </div>
                                    <div className="mt-2">
                                        <label>Mobile no.</label>
                                        <input type="text"
                                            className="form-control"
                                            name="return_mobile"
                                            autoComplete="off"
                                            ref={register({
                                                required: true,
                                                minLength: 10,
                                                maxLength: 10
                                            })}
                                        />
                                        {errors.return_mobile && errors.return_mobile.type === "required" && (
                                            <p className="errorMsg">Provide mobile number</p>
                                        )}
                                        {errors.return_mobile && errors.return_mobile.type === "minLength" && (
                                            <p className="errorMsg">
                                                Invalid mobile number
                                            </p>
                                        )}
                                        {errors.return_mobile && errors.return_mobile.type === "maxLength" && (
                                            <p className="errorMsg">
                                                Invalid mobile number
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <label>Email</label>
                                        <input type="email"
                                            className="form-control"
                                            name="return_email"
                                            ref={register({
                                                required: "Provide email address",
                                            })}
                                        />
                                        {errors.return_email && <p className="errorMsg">{errors.return_email.message}</p>}
                                    </div>
                                    <div className="mt-2">
                                        <ReturnAddress
                                            addresses={defaultAddresses}
                                            formRegister={register}
                                            errors={errors}
                                            reset={reset}
                                            getValues={getValues}
                                        />
                                    </div>
                                    <div className="mt-2">

                                        <label>Street Address</label>
                                        <input type="text" name="return_street" className="form-control"
                                            ref={register({
                                                required: "Provide street address"
                                            })}
                                        />
                                        {errors.return_street && <p className="errorMsg">{errors.return_street.message}</p>}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="d-block mt-5 mb-2 text-right">
                        <button type="submit" className="ant-btn ant-btn-danger ant-btn-lg ml-3">
                            SAVE & CONTINUE
                        </button>
                    </div>
                </form>
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
            } else if (!data.stepComplete && data.step === 'addresses') {
                return {
                    redirect: {
                        source: '/seller/mobile/start/bank',
                        destination: '/seller/mobile/start/bank',
                        permanent: false,
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

        const { data: defaultAddresses } = await axios.get(`${process.env.api}/api/defaultaddress`);
        return {
            props: {
                defaultAddresses
            }
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

export default AddressDetails;