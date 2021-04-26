import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import { message, DatePicker } from 'antd';
const { RangePicker } = DatePicker;

import { useForm } from 'react-hook-form';

import moment from 'moment';

import axiosApi from '../../../helpers/api';
import { allCategories } from '../../../redux/actions/categoryAction';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});


const CouponForm = (props) => {
    const { action, couponData } = props;

    const [validityDate, setValidityDate] = useState('');
    const [couponUseInCategory, setCouponUseInCategory] = useState(false);
    const [categoryIds, setCategoryIds] = useState([]);

    const validityDateFormatOnEdit = 'YYYY-MM-DD';

    useEffect(() => {
        if (couponData && action === "edit_coupon") {
            const catIds = couponData.categoryId.map(cat => cat._id)
            setCategoryIds(catIds);
        }
    }, [action, couponData]);

    const router = useRouter();

    const defaultValues = {
        availableFor: action === "edit_coupon" ? couponData.availableFor : '',
        code: action === "edit_coupon" ? couponData.code : '',
        description: action === "edit_coupon" ? couponData.description : '',
        discountType: action === "edit_coupon" ? couponData.discountType : '',
        discountAmount: action === "edit_coupon" ? couponData.discountAmount : '',
        minBasket: action === "edit_coupon" ? couponData.minBasket : '',
        applicableOn: action === "edit_coupon" ? couponData.applicableOn : '',
        totalVoucher: action === "edit_coupon" ? couponData.totalVoucher : '',
        redeemsPerUser: action === "edit_coupon" ? couponData.redeemsPerUser : '',
        couponUseIn: action === "edit_coupon" ? couponData.couponUseIn : '',
        validityStart: action === "edit_coupon" ? couponData.validityStart : '',
        validityEnd: action === "edit_coupon" ? couponData.validityEnd : '',
        category: action === "edit_coupon" ? couponData.categoryIds : [],
    }
    const { register, handleSubmit, errors, setValue, getValues, reset } = useForm({
        defaultValues: defaultValues
    });


    useEffect(() => {
        reset(defaultValues);
    }, []);

    useEffect(() => {
        register({ name: "validityStart" });
        register({ name: "validityEnd" });
    }, [register]);

    const dispatch = useDispatch();
    const { adminAuth } = useSelector(state => state.adminAuth);
    const { categories } = useSelector(state => state.categoryList);

    useEffect(() => {
        dispatch(allCategories());
    }, []);

    const onChangeDatePicker = (date, dateString) => {
        if (date) {
            const validityStart = moment(date[0]);
            const validityEnd = moment(date[1]);
            setValue("validityStart", validityStart);
            setValue("validityEnd", validityEnd);

            setValidityDate(validityStart !== '' && validityEnd !== '' ? date : "")
        } else {
            setValidityDate('');
        }
    }

    const couponUseInHandler = value => {
        value === 'all' ? setCouponUseInCategory(false) : setCouponUseInCategory(true);
    }

    useEffect(() => {
        if (couponData && action === "edit_coupon") {

            //coupon validaity on database have validity date
            setValidityDate(couponData.validityStart);

            // all categories or Specifice category
            couponUseInHandler(couponData.couponUseIn);

        }
    }, [couponData, action]);

    const handleCheck = checkedId => {
        const { category: ids } = getValues();
        const newIds = ids?.includes(checkedId)
            ? ids?.filter(id => id !== checkedId)
            : [...(ids ?? []), checkedId];
        return newIds;
    }

    const markallCategoryHandler = (e) => {
        let value = false

        if (e.target.checked) {
            value = true;
        }

        Array.from(document.querySelectorAll("input[name='category']"))
            .forEach((checkbox) => {
                document.getElementById(checkbox.id).checked = value;
            });
    }

    const onSubmit = async (inputdata) => {
        if (action === 'add_coupon') {
            try {
                const data = await axiosApi.post("/api/coupon", {
                    availableFor: inputdata.availableFor,
                    code: (inputdata.code).toUpperCase(),
                    description: inputdata.description,
                    discountType: inputdata.discountType,
                    discountAmount: inputdata.discountAmount,
                    minBasket: inputdata.minBasket,
                    applicableOn: inputdata.applicableOn,
                    totalVoucher: inputdata.totalVoucher,
                    redeemsPerUser: inputdata.redeemsPerUser,
                    validityStart: inputdata.validityStart,
                    validityEnd: inputdata.validityEnd,
                    couponUseIn: inputdata.couponUseIn,
                    categoryId: inputdata.category,
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
                                Coupon succssfully added
                            </div>
                        ),
                        className: 'message-success',
                    });
                    setTimeout(() => {
                        router.push('/admin/coupon/');
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
                const data = await axiosApi.put(`/api/coupon`, {
                    couponId: couponData._id,
                    availableFor: inputdata.availableFor,
                    code: (inputdata.code).toUpperCase(),
                    description: inputdata.description,
                    discountType: inputdata.discountType,
                    discountAmount: inputdata.discountAmount,
                    minBasket: inputdata.minBasket,
                    applicableOn: inputdata.applicableOn,
                    totalVoucher: inputdata.totalVoucher,
                    redeemsPerUser: inputdata.redeemsPerUser,
                    validityStart: inputdata.validityStart,
                    validityEnd: inputdata.validityEnd,
                    couponUseIn: inputdata.couponUseIn,
                    categoryId: inputdata.category,
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
                                Coupon succssfully updated
                            </div>
                        ),
                        className: 'message-success',
                    });

                    setTimeout(() => {
                        router.push('/admin/coupon/');
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
                    <div className="col-12">
                        <div className="d-flex">
                            <div className="">
                                <label>
                                    <input defaultChecked type="radio" name="availableFor" value="alluser" className="mr-1"
                                        ref={register({
                                            required: "Provide available for"
                                        })}
                                    />
                                    FOR ALL USERS
                                </label>
                            </div>
                            <div className="ml-4">
                                <label>
                                    <input type="radio" name="availableFor" value="newuser" className="mr-1"
                                        ref={register({
                                            required: "Provide available for"
                                        })}
                                    />
                                    FOR NEW USERS ONLY
                                </label>
                            </div>
                        </div>
                        {errors.availableFor && <p className="errorMsg">{errors.availableFor.message}</p>}
                    </div>
                    <div className="col-sm-6 mt-4">
                        <label className="cat-label">Coupon Code</label>
                        <input type="text" name="code"
                            className="form-control"
                            style={{ textTransform: 'uppercase' }}
                            ref={register({
                                required: "Provide coupon code"
                            })}
                        />
                        {errors.code && <p className="errorMsg">{errors.code.message}</p>}
                    </div>
                    <div className="col-sm-6 mt-4">
                        <label className="cat-label">Description</label>
                        <input type="text" name="description"
                            className="form-control"
                            autoComplete="none"
                            ref={register({
                                required: "Provide coupon description"
                            })}
                        />
                        {errors.description && <p className="errorMsg">{errors.description.message}</p>}
                    </div>
                    <div className="col-sm-6 mt-4">
                        <div className="d-flex">
                            <div>
                                <label htmlFor="discountAmount" className="cat-label">
                                    Discount Amount(RS)
                                </label>
                            </div>
                            <div className="ml-5">
                                <label>
                                    <input type="radio" name="discountType" value="percentage" className="mr-1" defaultChecked
                                        ref={register({
                                            required: "Provide discount Type"
                                        })}
                                    />
                                    %
                                </label>
                            </div>
                            <div className="ml-3">
                                <label>
                                    <input type="radio" name="discountType" value="flat" className="mr-1"
                                        ref={register({
                                            required: "Provide coupon description"
                                        })}
                                    />
                                    Flat
                                </label>
                            </div>
                        </div>
                        <input type="number" name="discountAmount"
                            className="form-control"
                            id="discountAmount"
                            autoComplete="none"
                            ref={register({
                                required: "Provide  discount amount"
                            })}
                        />
                        {errors.discountAmount && <p className="errorMsg">{errors.discountAmount.message}</p>}
                        {errors.discountType && <p className="errorMsg">{errors.discountType.message}</p>}
                    </div>
                    <div className="col-sm-6 mt-4">
                        <label className="cat-label">MINIMUM BASKET VALUE(RS)</label>
                        <input type="number" name="minBasket"
                            className="form-control"
                            ref={register({
                                required: "Provide minium basket value"
                            })}
                        />
                        {errors.minBasket && <p className="errorMsg">{errors.minBasket.message}</p>}
                    </div>
                    <div className="col-sm-6 mt-4">
                        <label className="cat-label">Applicable On</label>
                        <select defaultValue="" name="applicableOn" className="form-control"
                            ref={register({
                                required: "Provide applicable on"
                            })}
                        >
                            <option value="">Select</option>
                            <option value="orginalPrice">Orginal Price</option>
                            <option value="discountedPrice">Discounted Price</option>
                        </select>
                        {errors.applicableOn && <p className="errorMsg">{errors.applicableOn.message}</p>}
                    </div>
                    <div className="col-sm-6 mt-4">
                        <label className="cat-label">Total No. of Vouchers</label>
                        <input type="number" name="totalVoucher"
                            className="form-control"
                            ref={register({
                                required: "Provide total no. of voucher"
                            })}
                        />
                        {errors.totalVoucher && <p className="errorMsg">{errors.totalVoucher.message}</p>}
                    </div>
                    <div className="col-sm-6 mt-4">
                        <label htmlFor="redeemsPerUser" className="cat-label">NO. OF REDEEMS ALLOWED (PER USER)</label>
                        <input type="number" name="redeemsPerUser" id="redeemsPerUser" className="form-control"
                            ref={register({
                                required: "Provide no of redeems allows per user"
                            })}
                        />
                        {errors.redeemsPerUser && <p className="errorMsg">{errors.redeemsPerUser.message}</p>}
                    </div>
                    <div className="col-sm-6 mt-4">
                        <label className="cat-label">Validity(Start date - End date)</label>
                        {action === 'edit_coupon' &&

                            <RangePicker
                                defaultValue={[moment(couponData.validityStart, validityDateFormatOnEdit).add(1, 'd'), moment(couponData.validityEnd, validityDateFormatOnEdit).add(1, 'd')]}
                                format={validityDateFormatOnEdit}
                                onChange={(date, dateString) => onChangeDatePicker(date, dateString)}
                                className="form-control"
                            />

                        }
                        {action === 'add_coupon' &&

                            <RangePicker
                                defaultValue=""
                                format={validityDateFormatOnEdit}
                                onChange={(date, dateString) => onChangeDatePicker(date, dateString)}
                                className="form-control"
                            />

                        }
                        <input type="hidden" name="validityDate"
                            value={validityDate}
                            ref={register({
                                required: "Provide validity date"
                            })}
                        />
                        {errors.validityDate && <p className="errorMsg">{errors.validityDate.message}</p>}
                    </div>
                    <div className="col-12 mt-4">
                        <span className="cat-label">SELECT COUPON FOR</span>
                        <div className="d-flex mt-3">
                            <div className="">
                                <label>
                                    <input
                                        type="radio"
                                        name="couponUseIn" value="all"
                                        className="mr-1"
                                        onChange={() => couponUseInHandler('all')}
                                        ref={register({
                                            required: "Provide coupon for"
                                        })}
                                    />
                                    All Category
                                </label>
                            </div>
                            <div className="ml-4">
                                <label>
                                    <input
                                        type="radio"
                                        name="couponUseIn" value="categories"
                                        className="mr-1"
                                        onChange={() => couponUseInHandler('categories')}
                                        ref={register({
                                            required: "Provide coupon for"
                                        })}
                                    />
                                    Specifice Category
                                </label>
                            </div>
                        </div>
                        {errors.couponUseIn && <p className="errorMsg">{errors.couponUseIn.message}</p>}
                        <div className="text-danger font13">*Note : Coupon Code Used At Second Level Of Categories</div>

                        {couponUseInCategory &&
                            <>
                                <div className="categories-coupon d-block border mt-5">
                                    <div className="d-flex justify-content-between pl-2 pt-3 pr-2 pb-4 border-bottom">
                                        <div className="font-weight-bold">Categories</div>
                                        <div className="">
                                            <input
                                                type="checkbox"
                                                id="markall_categories"
                                                className="text-right"
                                                onChange={(e) => markallCategoryHandler(e)}
                                            />
                                            <label htmlFor="markall_categories">
                                                Mark All
                                    </label>
                                        </div>
                                    </div>
                                    <ul className="scrollbar list-unstyled mt-1">
                                        {categories && categories.map(cat => (
                                            cat.children.map(catc => (
                                                <li key={catc._id} className="p-3 border-bottom">
                                                    <input
                                                        type="checkbox"
                                                        name="category"
                                                        id={`cat_${catc._id}`}
                                                        value={catc._id}
                                                        onChange={() => handleCheck(catc._id)}
                                                        defaultChecked={categoryIds.includes(catc._id)}
                                                        ref={
                                                            register({
                                                                required: true
                                                            })
                                                        }
                                                    />
                                                    <label htmlFor={`cat_${catc._id}`}>
                                                        {cat.name}/<span className="font-weight-bold">{catc.name}</span>
                                                    </label>
                                                </li>
                                            ))
                                        ))
                                        }
                                    </ul>
                                </div>
                                <div className="d-block">
                                    {errors.category && <p className="errorMsg">Select atleast one category</p>}
                                </div>
                            </>
                        }

                    </div>
                </div>
            </div>
            <div className="d-block mt-5">
                <button type="submit" className="btn c-btn-primary">
                    {action === 'edit_coupon' ? 'UPDATE COUPON' : 'ADD COUPON'}
                </button>
            </div>
        </form >
    )
};
export default CouponForm;