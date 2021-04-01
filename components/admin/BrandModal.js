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

const BrandModal = (props) => {
    const { title, visible, handleCancel, modalAction } = props;

    const [visibled, setVisibled] = useState(false);
    const defaultValues = {
        name: modalAction === "edit_brand" ? categoryArray.name : null,
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

    }
    const onModalUpdate = async (inputdata) => {

    }
    const commonForm = () => {

    }

    return (
        <Modal
            title={title}
            visible={visible || visibled}
            footer={null}
            closable={false}
            destroyOnClose={true}
        >
            {modalAction === 'edit_brand' &&
                <form onSubmit={handleSubmit(onModalUpdate)}>
                    {commonForm()}
                </form>
            }
            {modalAction === 'add_brand' &&
                <form onSubmit={handleSubmit(onModalSubmit)}>
                    {commonForm()}
                </form>
            }
        </Modal >
    );
}

export default BrandModal;

