import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import { message } from 'antd';

import { useForm } from 'react-hook-form';

import axiosApi from '../../helpers/api';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const BannerForm = (props) => {
    const { action, agentData } = props;

    const router = useRouter();

    const { adminAuth } = useSelector(state => state.adminAuth);

    const defaultValues = {
        name: action === "edit_agent" ? agentData.name : '',
        email: action === "edit_agent" ? agentData.email : '',
        number: action === "edit_agent" ? agentData.number : '',
        address: action === "edit_agent" ? agentData.address : '',
        panNo: action === "edit_agent" ? agentData.panNo : '',
        minTime: action === "edit_agent" ? agentData.minDeliveryTime : '',
        maxTime: action === "edit_agent" ? agentData.minDeliveryTime : '',
    }
    const { register, handleSubmit, errors, reset } = useForm({
        defaultValues: defaultValues
    });

    useEffect(() => {
        reset(defaultValues);
    }, []);


    const onSubmit = async (inputdata) => {
        if (action === 'add_agent') {
            console.log(inputdata);

            try {
                const data = await axiosApi.post("/api/shipagent", {
                    name: inputdata.name,
                    email: inputdata.email,
                    address: inputdata.address,
                    number: inputdata.number,
                    panNo: inputdata.panNo,
                    minDeliveryTime: inputdata.minTime,
                    maxDeliveryTime: inputdata.maxTime
                },
                    {
                        headers: {
                            token: adminAuth.token
                        }
                    });
                if (data) {
                    message.success({
                        content: (
                            <div>
                                <div className="font-weight-bold">Success</div>
                                Agent succssfully added
                            </div>
                        ),
                        className: 'message-success',
                    });
                    setTimeout(() => {
                        router.push('/admin/shipping/agents');
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
        } else {
            try {
                const data = await axiosApi.put(`/api/shipagent`, {
                    shipAgentId: agentData._id,
                    name: inputdata.name,
                    email: inputdata.email,
                    address: inputdata.address,
                    number: inputdata.number,
                    panNo: inputdata.panNo,
                    minDeliveryTime: inputdata.minTime,
                    maxDeliveryTime: inputdata.maxTime
                },
                    {
                        headers: {
                            token: adminAuth.token
                        }
                    });
                if (data) {
                    message.success({
                        content: (
                            <div>
                                <div className="font-weight-bold">Success</div>
                                Agent succssfully updated
                            </div>
                        ),
                        className: 'message-success',
                    });

                    setTimeout(() => {
                        router.push('/admin/shipping/agents');
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
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="col">
                <div className="row">
                    <div className="col-sm-6 col-md-4 mt-4">
                        <label className="cat-label">Name</label>
                        <input type="text" name="name"
                            className="form-control"
                            ref={register({
                                required: "Provide name"
                            })}
                        />
                        {errors.name && <p className="errorMsg">{errors.name.message}</p>}
                    </div>
                    <div className="col-sm-6 col-md-4 mt-4">
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
                        <label className="cat-label">Pan number</label>
                        <input type="text" name="panNo"
                            className="form-control"
                            ref={register({
                                required: "Provide pan number"
                            })}
                        />
                        {errors.panNo && <p className="errorMsg">{errors.panNo.message}</p>}
                    </div>
                    <div className="col-sm-6 col-md-4 mt-4">
                        <label htmlFor="minTime" className="cat-label">MINIMUM DELIVERY TIME</label>
                        <select defaultValue="" name="minTime" id="minTime" className="form-control"
                            ref={register({
                                required: "Provide"
                            })}
                        >
                            <option value="">Select</option>
                            <option value="1">1 Day</option>
                            <option value="2">2 Day</option>
                            <option value="3">3 Day</option>
                            <option value="4">4 Day</option>
                            <option value="5">5 Day</option>
                            <option value="6">6 Day</option>
                            <option value="7">7 Day</option>
                        </select>
                        {errors.minTime && <p className="errorMsg">{errors.minTime.message}</p>}
                    </div>
                    <div className="col-sm-6 col-md-4 mt-4">
                        <label htmlFor="maxTime" className="cat-label">MAXIMIUM DELIVERY TIME</label>
                        <select defaultValue="" name="maxTime" id="maxTime" className="form-control"
                            ref={register({
                                required: "Provide"
                            })}
                        >
                            <option value="">Select</option>
                            <option value="1">1 Day</option>
                            <option value="2">2 Day</option>
                            <option value="3">3 Day</option>
                            <option value="4">4 Day</option>
                            <option value="5">5 Day</option>
                            <option value="6">6 Day</option>
                            <option value="7">7 Day</option>
                        </select>
                        {errors.maxTime && <p className="errorMsg">{errors.maxTime.message}</p>}
                    </div>
                </div>
            </div>
            <div className="d-block mt-5">
                <button type="submit" className="btn c-btn-primary">
                    {action === 'edit_agent' ? 'UPDATE AGENT' : 'ADD AGENT'}
                </button>
            </div>
        </form >
    )
};
export default BannerForm;