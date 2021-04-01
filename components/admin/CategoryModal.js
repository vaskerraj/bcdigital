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

const CategryModal = (props) => {
    const { title, categoryArray, visible, handleCancel, modalAction } = props;

    const [visibled, setVisibled] = useState(false);
    const defaultValues = {
        name: modalAction === "edit_category" ? categoryArray.name : null,
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
            const { data } = await axiosApi.post('/api/categories', {
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
                            Category succssfully added
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
            const { data } = await axiosApi.put('/api/category', {
                name: inputdata.name,
                categoryId: inputdata.categoryid
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
                            Category succssfully updated
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
                <label>Cateogry</label>
                <input type="text" className="form-control mt-1"
                    name="name"
                    autoComplete="off"
                    ref={register({
                        required: "Category can't be empty"
                    })}
                />
                {errors.name && <p className="errorMsg">{errors.name.message}</p>}
            </div>
            {
                (modalAction === 'add_category' && categoryArray.children) &&
                <div className="d-block">
                    <input type="hidden" name="parentId"
                        value={categoryArray._id}
                        ref={register()}
                    />
                </div>
            }
            {
                modalAction === 'edit_category' &&
                <div className="d-block">
                    <input type="hidden" name="categoryid"
                        value={categoryArray._id}
                        ref={register()}
                    />
                </div>
            }
            <div className="d-block border-top mt-5 text-right">
                <button type="button" onClick={handleCancel} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                    Cancel
                </button>
                {modalAction === 'add_category' &&
                    <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                        {modalAction === 'add_category' && categoryArray.children ? 'ADD SUB-CATEGORY' : 'ADD CATEGORY'}
                        {(modalAction === 'edit_category') && 'UPDATE CATEGORY'}
                    </button>
                }
                {modalAction === 'edit_category' &&
                    <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                        UPDATE CATEGORY
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
            { modalAction === 'edit_category' &&
                <form onSubmit={handleSubmit(onModalUpdate)}>
                    {commonForm()}
                </form>
            }
            { modalAction === 'add_category' &&
                <form onSubmit={handleSubmit(onModalSubmit)}>
                    {commonForm()}
                </form>
            }
        </Modal >
    );
}

export default CategryModal;

