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

const DefaultAddressModal = (props) => {
    const { title, addressArray, visible, handleCancel, modalAction } = props;

    const [visibled, setVisibled] = useState(false);
    const defaultValues = {
        name: modalAction === "edit_address" ? addressArray.name : null,
    }
    const { register, handleSubmit, errors, reset } = useForm({
        defaultValues: defaultValues,
    });

    useEffect(() => {
        reset(defaultValues)
    }, [visible]);

    const router = useRouter();

    const { adminAuth } = useSelector(state => state.adminAuth);

    const onModalSubmit = async (inputdata) => {
        try {
            const { data } = await axiosApi.post('/api/defaultaddresses', {
                name: inputdata.name,
                parentId: inputdata.parentId ? inputdata.parentId : null
            }, {
                headers: {
                    token: adminAuth.token
                }
            });
            if (data) {
                setVisibled(false);
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Default Address succssfully added
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
            const { data } = await axiosApi.put('/api/defaultaddresses', {
                name: inputdata.name,
                defaultAddId: inputdata.defaultAddId
            }, {
                headers: {
                    token: adminAuth.token
                }
            });
            if (data.msg === 'success') {
                setVisibled(false);
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Default Address succssfully updated
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
                <label>Name</label>
                <input type="text" className="form-control mt-1"
                    name="name"
                    autoComplete="none"
                    ref={register({
                        required: "Provide name"
                    })}
                />
                {errors.name && <p className="errorMsg">{errors.name.message}</p>}
            </div>
            {
                (modalAction === 'add_address' && addressArray.children) &&
                <div className="d-block">
                    <input type="hidden" name="parentId"
                        value={addressArray._id}
                        ref={register()}
                    />
                </div>
            }
            {
                modalAction === 'edit_address' &&
                <div className="d-block">
                    <input type="hidden" name="defaultAddId"
                        value={addressArray._id}
                        ref={register()}
                    />
                </div>
            }
            <div className="d-block border-top mt-5 text-right">
                <button type="button" onClick={handleCancel} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                    Cancel
                </button>
                {modalAction === 'add_address' &&
                    <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                        {modalAction === 'add_address' && addressArray.children ? 'ADD -ADDRESS' : 'ADD ADDRESS'}
                        {(modalAction === 'edit_address') && 'UPDATE ADDRESS'}
                    </button>
                }
                {modalAction === 'edit_address' &&
                    <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                        UPDATE ADDRESS
                    </button>
                }
            </div>
        </>
    )
    return (
        <Modal
            title={title}
            visible={visible || visibled}
            footer={null}
            closable={false}
            destroyOnClose={true}
        >
            { modalAction === 'edit_address' &&
                <form onSubmit={handleSubmit(onModalUpdate)}>
                    {commonForm()}
                </form>
            }
            { modalAction === 'add_address' &&
                <form onSubmit={handleSubmit(onModalSubmit)}>
                    {commonForm()}
                </form>
            }
        </Modal >
    );
}

export default DefaultAddressModal;

