import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import { message, DatePicker } from 'antd';
const { RangePicker } = DatePicker;

import { useForm } from 'react-hook-form';

import moment from 'moment';

import axiosApi from '../../helpers/api';

import ChooseCategory from '../ChooseCategory';


// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});


const ProductForm = (props) => {
    const { action, couponData } = props;

    const [onOpenChoosenCategory, setOnOpenChoosenCategory] = useState(false);
    const [categoryId, setCategoryId] = useState('');

    // get selected categories list and category id
    const [confirmCategory, setConfirmCategory] = useState({
        categoryId: null,
        firstCatName: '',
        secondCatName: '',
        thirdCatName: ''
    });

    const [selectedCatText, setSelectedCatText] = useState('');

    useEffect(() => {
        const firstDivider = (confirmCategory.firstCatName && confirmCategory.secondCatName)
            ? ' / '
            : '';
        const secondDivider = (confirmCategory.secondCatName && confirmCategory.thirdCatName)
            ? ' / '
            : '';
        const selcatText = confirmCategory.firstCatName + firstDivider + confirmCategory.secondCatName + secondDivider + confirmCategory.thirdCatName;

        setSelectedCatText(selcatText);

        // categoryId state
        setCategoryId(confirmCategory.categoryId);

    }, [confirmCategory]);


    const router = useRouter();

    const { register, handleSubmit, errors, setValue, reset } = useForm();

    const dispatch = useDispatch();
    const { sellerAuth } = useSelector(state => state.sellerAuth);
    console.log(sellerAuth)

    const onSubmit = async (inputdata) => {
        if (action === 'add_product') {
            try {
                const data = await axiosApi.post("/api/product", {

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
                                Product succssfully added
                            </div>
                        ),
                        className: 'message-success',
                    });
                    setTimeout(() => {
                        router.push('/seller/product/add');
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
                    <div className="col-12 position-relative">
                        <label className="cat-label">Cateogry</label>
                        <input name="bannerCategory" className="form-control normal-input-readyonly"
                            readOnly
                            onClick={() => setOnOpenChoosenCategory(true)}
                            value={selectedCatText}
                            autoComplete="off"
                            ref={register({
                                required: "Provide category"
                            })}
                        />
                        <input type="hidden" name="categoryId"
                            value={categoryId}
                            readOnly={true}
                            ref={register({
                                required: "Provide category"
                            })}
                        />
                        {errors.bannerCategory && <p className="errorMsg">{errors.bannerCategory.message}</p>}
                        {errors.categoryId && <p className="categoryId">{errors.categoryId.message}</p>}
                        {onOpenChoosenCategory &&
                            <div className="select-subcate-container pt-3 pr-3 pl-3 border">
                                <ChooseCategory
                                    catLevel={3}
                                    setConfirmCategory={setConfirmCategory}
                                    handleCancel={setOnOpenChoosenCategory}
                                />
                            </div>
                        }
                    </div>
                </div>
            </div>
            <div className="d-block mt-5">
                <button type="submit" className="btn c-btn-primary">
                    {action === 'edit_product' ? 'UPDATE PRODUCT' : 'ADD PRODUCT'}
                </button>
            </div>
        </form >
    )
};
export default ProductForm;