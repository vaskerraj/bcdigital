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
    duration: 2,
});

const AvailableModal = (props) => {
    const { title, visible, handleCancel, data } = props;

    const { register, handleSubmit, errors, getValues } = useForm();


    const router = useRouter();

    const { sellerAuth } = useSelector(state => state.sellerAuth);

    const onSubmit = async (inputdata) => {
        // check quantity once
        const availableQuantity = data.quantity - data.sold;
        if (inputdata.action === "decrement" && inputdata.quantity > availableQuantity) {
            message.warning({
                content: (
                    <div>
                        <div className="font-weight-bold">Error</div>
                        Quantity must be between 1 - {availableQuantity}
                    </div>
                ),
                className: 'message-warning',
            });
            return false;
        }
        try {
            const serverData = await axiosApi.post("/api/product/available",
                {
                    productId: data.product_id,
                    action: inputdata.action,
                    quantity: inputdata.quantity,
                },
                {
                    headers: {
                        token: sellerAuth.token
                    }
                }
            );
            if (serverData) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Product availablility updated.
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
            title={title}
            visible={visible}
            footer={null}
            closable={false}
            destroyOnClose={true}
        >
            <>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <td>Name</td>
                            <td>Price</td>
                            <td>Sale Price</td>
                            <td>Available</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{data.name}</td>
                            <td>{data.price}</td>
                            <td>{data.finalPrice}</td>
                            <td>{data.quantity - data.sold}</td>
                        </tr>
                    </tbody>
                </table>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="d-block">
                        <label className="cat-label">Action</label>
                        <select name="action" className="form-control mt-1"
                            ref={register({
                                required: "Provide action"
                            })}
                        >
                            <option value="">Select</option>
                            <option value="increment">Increment</option>
                            <option value="decrement">Decrement</option>

                        </select>
                        {errors.action && <p className="errorMsg">{errors.action.message}</p>}
                    </div>
                    <div className="d-block mt-3">
                        <label className="cat-label">Quantity</label>
                        <input type="number" name="quantity" className="form-control"
                            ref={register({
                                required: "Provide quanity",
                                min: {
                                    value: 1,
                                    message:
                                        `Quantity must be between 1 - ${getValues('action') === "decrement" ? data.quantity : 1000
                                        }`
                                },
                                max: {
                                    value: getValues('action') === "decrement" ? data.quantity : 1000,
                                    message:
                                        `Quantity must be between 1 - ${getValues('action') === "decrement" ? data.quantity : 1000
                                        }`
                                }
                            })}
                        />

                        {errors.quantity && <p className="errorMsg">{errors.quantity.message}</p>}
                    </div>
                    <div className="d-block border-top mt-5 text-right">
                        <button type="button" onClick={handleCancel} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                            Cancel
                        </button>

                        <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                            SAVE CHANGES
                        </button>
                    </div>
                </form>
            </>
        </Modal>
    );
}

export default AvailableModal;

