import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import { message } from 'antd';

import { useForm, Controller } from 'react-hook-form';

import axiosApi from '../../../helpers/api';

import { Select } from 'antd';

const { Option, OptGroup } = Select;

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const DeliveryRiderForm = (props) => {
    const { action, deliveryData, riderData } = props;
    console.log(deliveryData)

    const router = useRouter();

    const { deliveryAuth } = useSelector(state => state.deliveryAuth);

    const defaultValues = {
        name: action === "edit_rider" ? riderData.branchName : '',
        number: action === "edit_rider" ? riderData.number : '',
        address: action === "edit_rider" ? riderData.address : '',
    }
    const { register, handleSubmit, errors, reset, control, setValue } = useForm({
        defaultValues: defaultValues
    });

    useEffect(() => {
        reset(defaultValues);
    }, []);

    const onSubmit = async (inputdata) => {
        if (action === 'add_rider') {

            try {
                const data = await axiosApi.post("/api/delivery/register", {
                    name: inputdata.name,
                    mobile: inputdata.number,
                    email: inputdata.email,
                    password: inputdata.password,
                    deliveryRole: "rider",
                    relatedCity: deliveryData.relatedCity._id,
                    address: inputdata.address,
                    branchId: deliveryData.userId._id,
                },
                    {
                        headers: {
                            token: deliveryAuth.token
                        }
                    });
                if (data) {
                    message.success({
                        content: (
                            <div>
                                <div className="font-weight-bold">Success</div>
                                New rider succssfully added
                            </div>
                        ),
                        className: 'message-success',
                    });
                    setTimeout(() => {
                        router.push('/delivery/rider/');
                    }, 3000);
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
                const data = await axiosApi.put(`/api/delivery/rider`, {
                    shipAgentId: riderData._id,
                    name: inputdata.name,
                    number: inputdata.number,
                    address: inputdata.address,
                    relatedCity: inputdata.relatedCity,
                },
                    {
                        headers: {
                            token: deliveryAuth.token
                        }
                    });
                if (data) {
                    message.success({
                        content: (
                            <div>
                                <div className="font-weight-bold">Success</div>
                                Rider's info succssfully updated
                            </div>
                        ),
                        className: 'message-success',
                    });

                    setTimeout(() => {
                        router.push('/delivery/rider/');
                    }, 3000);
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
                    <div className="col-sm-6 col-md-4 mt-4">
                        <label className="cat-label">Rider Name</label>
                        <input type="text" name="name"
                            className="form-control"
                            ref={register({
                                required: "Provide rider name"
                            })}
                        />
                        {errors.name && <p className="errorMsg">{errors.name.message}</p>}
                    </div>
                    <div className="col-sm-6 col-md-4 mt-4">
                        <label className="cat-label">Mobile</label>
                        <input type="number" name="number"
                            className="form-control"
                            autoComplete="none"
                            ref={register({
                                required: "Provide mobile number"
                            })}
                        />
                        {errors.number && <p className="errorMsg">{errors.number.message}</p>}
                    </div>
                    <div className="col-sm-6 col-md-4 mt-4">
                        <label className="cat-label">Address</label>
                        <input type="text" name="address"
                            className="form-control"
                            ref={register({
                                required: "Provide address"
                            })}
                        />
                        {errors.address && <p className="errorMsg">{errors.address.message}</p>}
                    </div>
                </div>
                {action === 'add_rider' &&
                    <div className="row">
                        <div className="col-12 mt-4 font16">
                            <strong>Login Detail</strong>
                        </div>
                        <div className="col-sm-6 mt-3 pt-1">
                            <label className="cat-label">Email</label>
                            <input type="email" name="email"
                                className="form-control"
                                autoComplete="none"
                                ref={register({
                                    required: "Provide email"
                                })}
                            />
                            {errors.email && <p className="errorMsg">{errors.email.message}</p>}
                        </div>
                        <div className="col-sm-6">
                            <div className="d-block position-relative mt-3 pt-1">
                                <label className="cat-label">Password</label>
                                <input type="text"
                                    name="password"
                                    className="form-control"
                                    autoComplete="off"
                                    ref={register({
                                        required: true,
                                        pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[a-zA-Z]).{5,}$/i,
                                        minLength: 5
                                    })}
                                />
                                {errors.password && errors.password.type === "required" && (
                                    <p className="errorMsg">Provide password</p>
                                )}
                                {errors.password && errors.password.type === "minLength" && (
                                    <p className="errorMsg">
                                        Password must be atleast 5 characters
                                    </p>
                                )}
                                {errors.password && errors.password.type === "pattern" && (
                                    <p className="errorMsg">
                                        Password should contain letter and number
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                }
            </div>
            <div className="d-block mt-5">
                <button type="submit" className="btn c-btn-primary">
                    {action === 'edit_rider' ? 'UPDATE RIDER' : 'ADD RIDER'}
                </button>
            </div>
        </form >
    )
};
export default DeliveryRiderForm;