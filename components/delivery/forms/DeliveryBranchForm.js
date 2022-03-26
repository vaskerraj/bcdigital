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

const DeliveryBranchForm = (props) => {
    const { action, cities, branchData } = props;

    const router = useRouter();

    const { deliveryAuth } = useSelector(state => state.deliveryAuth);

    const defaultValues = {
        name: action === "edit_branch" ? branchData.branchName : '',
        number: action === "edit_branch" ? branchData.number : '',
        address: action === "edit_branch" ? branchData.address : '',
    }
    const { register, handleSubmit, errors, reset, control, setValue } = useForm({
        defaultValues: defaultValues
    });

    useEffect(() => {
        reset(defaultValues);
    }, []);

    useEffect(() => {
        register({ name: "relatedCity" });
    }, [register]);

    useEffect(() => {
        if (action === "edit_branch") setValue("relatedCity", branchData.relatedCity._id)
    }, [action]);

    const onHandleChanage = (value, option) => setValue("relatedCity", option.key);

    const onSubmit = async (inputdata) => {
        if (action === 'add_branch') {

            try {
                const data = await axiosApi.post("/api/delivery/register", {
                    name: inputdata.name,
                    mobile: inputdata.number,
                    email: inputdata.email,
                    password: inputdata.password,
                    deliveryRole: "branch",
                    relatedCity: inputdata.relatedCity,
                    address: inputdata.address,
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
                                New branch succssfully added
                            </div>
                        ),
                        className: 'message-success',
                    });
                    setTimeout(() => {
                        router.push('/delivery/branch/');
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
                const data = await axiosApi.put(`/api/delivery/branch`, {
                    shipAgentId: branchData._id,
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
                                Branch succssfully updated
                            </div>
                        ),
                        className: 'message-success',
                    });

                    setTimeout(() => {
                        router.push('/delivery/branch/');
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
                        <label className="cat-label">Branch Name</label>
                        <input type="text" name="name"
                            className="form-control"
                            ref={register({
                                required: "Provide branch name"
                            })}
                        />
                        {errors.name && <p className="errorMsg">{errors.name.message}</p>}
                    </div>
                    <div className="col-sm-6 col-md-4 mt-4">
                        <label className="cat-label">Number/Mobile</label>
                        <input type="number" name="number"
                            className="form-control"
                            autoComplete="none"
                            ref={register({
                                required: "Provide  number"
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
                    <div className="col-sm-6 col-md-4 mt-4">
                        <label className="cat-label">Service At(City)</label>
                        <Controller
                            name="serviceCity"
                            defaultValue={action === 'add_branch' ? "" : branchData.relatedCity.name}
                            control={control}
                            render={({ onChange, value, ref }) => (
                                <Select
                                    showSearch
                                    className="d-block"
                                    style={{ width: 250 }}
                                    onChange={(value, option) => {
                                        onChange(value);
                                        onHandleChanage(value, option);
                                    }
                                    }
                                    value={value}
                                    placeholder="Select City"

                                >
                                    {cities.map(areas =>
                                        <OptGroup key={areas._id} label={areas.name}>
                                            {areas.children.map(city =>
                                                <Option key={city._id} value={city.name}>{city.name}</Option>
                                            )}
                                        </OptGroup>
                                    )}
                                </Select>
                            )}
                            rules={{ required: "Provide city" }}
                        />

                        {errors.serviceCity && <p className="errorMsg">{errors.serviceCity.message}</p>}
                    </div>
                </div>
                {action === 'add_branch' &&
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
                    {action === 'edit_branch' ? 'UPDATE BRANCH' : 'ADD BRANCH'}
                </button>
            </div>
        </form >
    )
};
export default DeliveryBranchForm;