import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { Modal, message } from 'antd';

import { useForm } from 'react-hook-form';

import axiosApi from '../../helpers/api';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const SubAdminModal = (props) => {
    const { title, visible, handleCancel, modalAction, subadminData } = props;

    const defaultValues = {
        name: modalAction === "edit_subadmin" ? subadminData.name : null,
        mobile: modalAction === "edit_subadmin" ? subadminData.mobile : null,
        adminRole: modalAction === "edit_subadmin" ? subadminData.adminRole : null,
    }
    const { register, handleSubmit, errors, reset } = useForm({
        defaultValues: defaultValues,
    });

    useEffect(() => {
        reset(defaultValues);
    }, [visible]);

    const router = useRouter();

    const { adminAuth } = useSelector(state => state.adminAuth);

    const onModalSubmit = async (inputdata) => {
        try {
            const data = await axiosApi.post("/api/subadmin",
                {
                    name: inputdata.name,
                    mobile: inputdata.mobile,
                    email: inputdata.email,
                    password: inputdata.password,
                    adminRole: inputdata.adminRole
                },
                {
                    headers: {
                        token: adminAuth.token
                    }
                }
            );
            if (data) {
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
        try {
            const { data } = await axiosApi.put("/api/subadmin",
                {
                    subadminId: subadminData._id,
                    name: inputdata.name,
                    mobile: inputdata.mobile,
                    adminRole: inputdata.adminRole
                },
                {
                    headers: {
                        token: adminAuth.token
                    }
                }
            );
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Sub Admin succssfully updated
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
                <label className="cat-label">Fullname</label>
                <input type="text" className="form-control mt-1"
                    name="name"
                    autoComplete="off"
                    ref={register({
                        required: "Provide name"
                    })}
                />
                {errors.name && <p className="errorMsg">{errors.name.message}</p>}
            </div>
            {modalAction === "add_subadmin" &&
                <>
                    <div className="d-block mt-2">
                        <label className="cat-label">
                            Email
                            <span className="text-muted">(as username)</span>
                        </label>
                        <input type="email" className="form-control mt-1"
                            name="email"
                            autoComplete="none"
                            ref={register({
                                required: "Provide email",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                        />
                        {errors.email && <p className="errorMsg">{errors.email.message}</p>}

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
            <div className="d-block mt-2">
                <label className="cat-label">Mobile No.</label>
                <input type="number" className="form-control mt-1"
                    name="mobile"
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
                {errors.mobile && <p className="errorMsg">{errors.mobile.message}</p>}
            </div>
            <div className="d-block mt-2">
                <label className="cat-label">Role</label>
                <select name="adminRole" className="form-control"
                    ref={register({
                        required: "Provide role"
                    })}
                >
                    <option value="">Select</option>
                    <option value="subsuperadmin">Sub Superadmin</option>
                    <option value="ordermanager">Order Manager</option>
                    <option value="financer">Financer</option>
                    <option value="contentmanager">Content Manager</option>
                </select>
                {errors.adminRole && <p className="errorMsg">{errors.adminRole.message}</p>}
            </div>

            <div className="d-block border-top mt-5 text-right">
                <button type="button" onClick={handleCancel} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                    Cancel
                </button>
                {modalAction === 'add_subadmin' &&
                    <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                        ADD SUB-ADMIN
                    </button>
                }
                {modalAction === 'edit_subadmin' &&
                    <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                        UPDATE SUB-ADMIN
                    </button>
                }
            </div>
        </>
    )

    return (
        <Modal
            title={title}
            visible={visible}
            footer={null}
            closable={false}
            destroyOnClose={true}
        >
            {modalAction === 'edit_subadmin' &&
                <form onSubmit={handleSubmit(onModalUpdate)}>
                    {commonForm()}
                </form>
            }
            {modalAction === 'add_subadmin' &&
                <form onSubmit={handleSubmit(onModalSubmit)}>
                    {commonForm()}
                </form>
            }
        </Modal>
    );
}

export default SubAdminModal;

