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

const EditSellerUsernameModal = (props) => {
    const { visible, handleCancel, ownshopData } = props;

    const defaultValues = {
        shopmobile: ownshopData.mobile
    }
    const { register, handleSubmit, errors, reset } = useForm({
        defaultValues: defaultValues
    });

    useEffect(() => {
        reset(defaultValues);
    }, [visible]);

    const router = useRouter();

    const { adminAuth } = useSelector(state => state.adminAuth);

    const onModalUpdate = async (inputdata) => {
        try {
            const { data } = await axiosApi.put("/api/ownshop/username", {
                sellerId: ownshopData._id,
                mobile: inputdata.shopmobile
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
                            Username successfully updated.
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

    return (
        <Modal
            visible={visible}
            footer={null}
            closable={false}
            destroyOnClose={true}
        >
            <div className="d-flex" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                <div className="filter-tab">
                    Change Username
                </div>
            </div>
            <form onSubmit={handleSubmit(onModalUpdate)}>
                <div className="d-block mt-5">
                    <label className="cat-label">
                        New Mobile No.
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
                <div className="d-block border-top mt-5 text-right">
                    <button type="button" onClick={handleCancel} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                        Cancel
                    </button>

                    <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                        UPDATE CHANGES
                    </button>
                </div>
            </form>
        </Modal >
    );
}

export default EditSellerUsernameModal;

