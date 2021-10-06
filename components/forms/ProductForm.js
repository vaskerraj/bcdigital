import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import { message, Select, Upload, DatePicker, Popover } from 'antd';
const { Option } = Select;
const { Dragger } = Upload;

import { InboxOutlined, CameraOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';

import { useForm, Controller } from 'react-hook-form';

import moment from 'moment';

import axiosApi from '../../helpers/api';
import baseUrl from '../../helpers/baseUrl';

import ChooseCategory from '../ChooseCategory';
import MobileChooseCategory from '../MobileChooseCategory';
import Editor from '../Editor';
import { allBrands } from '../../redux/actions/brandAction';
import { addClass, removeClass } from '../../helpers/addRemoveClass';
import DiscountPopover from '../helpers/DiscountPopover';


// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const useMountEffect = fun => useEffect(fun, []);

const ProductForm = (props) => {
    const { action, productData, platform } = props;

    const scrollOnErrorRef = useRef(null);

    const [loading, setLoading] = useState(true);
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

        // clear error at confirm category
        clearErrors("bannerCategory");

    }, [confirmCategory]);

    // color with image
    const [colorWithImage, setColorWithImage] = useState([]);
    const [quntityWithPriceOnSize, setQuntityWithPriceOnSize] = useState([]);

    // discount
    const [discountContainerVisible, setDiscountContainerVisible] = useState('');
    const [productWarranty, setProductWarranty] = useState(true);

    const router = useRouter();

    const { register, unregister, handleSubmit, errors, control, getValues, reset, setValue, trigger, clearErrors } = useForm({
        mode: "onChange",
        shouldUnregister: true
    });

    const dispatch = useDispatch();
    const { sellerAuth } = useSelector(state => state.sellerAuth);

    const { brands } = useSelector(state => state.brandList);

    useEffect(() => {
        if (brands.length !== 0) setLoading(false);
    }, [brands]);


    useEffect(() => {
        dispatch(allBrands());
    }, [action]);


    const imageValidation = (file) => {
        const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
        if (!isJpgOrPng) {
            message.error("You can only upload JPG/PNG file!");
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error(`${file.name} is larger then 2MB. Image must smaller than 2MB!`);
        }
        return file.type === "image/jpeg" || file.type === "image/png" ? true : Upload.LIST_IGNORE;
    }

    // colour
    const onColorChange = useCallback((colour, index) => {
        if (colour !== "" && colour !== undefined) {
            // update colour if already exisit base on index
            let exsitingColor = [...colorWithImage]
            exsitingColor.splice(index, 1, colour);

            // setColorWithImage(exsitingColor);

            var el = document.getElementById("productPicture_" + index);
            removeClass(el, 'd-none');
            addClass(el, 'd-block');
        } else if (colour === undefined) {
            var el = document.getElementById("productPicture_" + index);
            removeClass(el, 'd-block');
            addClass(el, 'd-none');
        }
    });

    const rangePickerDateFormat = 'YYYY-MM-DD';
    const OPTIONS = ['Multicolor', 'Black', 'White', 'Blue', 'Green', 'Yellow', 'Orange', 'Gray', 'Brown', 'Pink', 'Purple', 'Maroon'];

    const filteredColourOptions = OPTIONS.filter(o => !colorWithImage.includes(o));

    const selectColourUI = () => (
        <div className="mt-4">
            <label className="cat-label">Color</label>
            <Controller
                name="colour[0].name"
                defaultValue=""
                control={control}
                render={({ onChange, onFocus, value, ref }) => (
                    <Select
                        name="colourName"
                        showSearch
                        style={{ width: '100%' }}
                        onChange={(colour) => {
                            onChange(colour);
                            // pass colour and index
                            onColorChange(colour, 0);
                        }
                        }
                        onFocus={onFocus}
                        value={value}
                        placeholder="Select color"
                        optionFilterProp="children"
                        allowClear={true}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {filteredColourOptions.map(item => (
                            <Select.Option key={item} value={item}>
                                {item}
                            </Select.Option>
                        ))}
                    </Select>
                )}
                rules={{ required: "Provide colour" }}
            />
            {errors.colour?.[0]?.name &&
                <p className="errorMsg">{errors.colour?.[0]?.name.message}</p>
            }

            <div className="col-12 mt-4 product-picture d-none" id="productPicture_0">
                <label className="cat-label">Product pictures</label>
                <Controller
                    name="colour[0].images"
                    defaultValue=""
                    control={control}
                    render={({ onChange, ref }) => (
                        <Dragger
                            name="file"
                            accept=".png, .jpg, .jpeg"
                            style={{ height: '15rem' }}
                            multiple={true}
                            ref={ref}
                            action={`${baseUrl}/api/product/colour/images`}
                            listType="picture"
                            onChange={(file) => {

                                var imageUid = file.fileList.map(file => {
                                    const getResponse = file.response;
                                    if (getResponse !== undefined) {
                                        return file.response.filename[0];
                                    }
                                })
                                onChange(imageUid);
                            }
                            }
                            maxCount={6}
                        >
                            <p className="ant-upload-drag-icon">
                                {!platform ? <InboxOutlined /> : <CameraOutlined />}
                            </p>
                            {!platform &&
                                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                            }
                            <p className="ant-upload-hint">
                                <b>Upload at least 2 and upto 6 pictures of your product</b>.
                                Strictly prohibit from uploading other company data and obscene images
                            </p>
                        </Dragger>
                    )}
                    rules={{ required: "Provide image" }}
                />
                {errors.colour?.[0]?.images &&
                    <p className="errorMsg">{errors.colour?.[0]?.images.message}</p>
                }
            </div>
        </div>
    );

    const displayQuantityWithPriceOnSizeChange = useCallback(sizes => {
        // reset validation while allowClear of select icon
        if (sizes.length === 0) {
            reset({
                ...getValues(),
                size: ''
            });
        }
        setQuntityWithPriceOnSize(sizes);
    });

    const backToProductSize = useCallback(() => {
        // reset validation while back from no picture
        reset({
            ...getValues(),
            size: ''
        });
        setQuntityWithPriceOnSize([]);
    });

    const productWithoutSize = useCallback(() => {
        setQuntityWithPriceOnSize(["nosize"])
        // reset size if product doesnt have any size
        reset({
            ...getValues(),
            size: ['nosize']
        });
        setDiscountContainerVisible('');
    });

    const handleDiscountVisibleChange = (index, preDefineDiscount) => {
        setDiscountContainerVisible(index);
        if (preDefineDiscount === null && getValues(`product[${index}].rawdiscount`) === "100") {
            setTimeout(() => {
                document.querySelector('[name="product[' + index + '].rawdiscount"]').value = "";
            }, 100);
        }

        const getPromoStartDateForCheck = getValues(`product[${index}].rawpromodate`);
        if (getPromoStartDateForCheck === undefined) {
            setValue("product[" + index + "].rawpromodate", undefined)
        } else if (getPromoStartDateForCheck[0].format("YYYY-MM-DD") === "2015-01-01") {
            setValue("product[" + index + "].rawpromodate", undefined)
        }
    }

    const discountConfirmHandler = (index, discount, promodate) => {
        setDiscountContainerVisible('');
        document.querySelector('#discountTxt_' + index).textContent = discount;
        document.querySelector('[name="product[' + index + '].discount"]').value = discount;
        // promo date
        const promoStart = moment(promodate[0]);
        const promoEnd = moment(promodate[1]);
        document.querySelector('[name="product[' + index + '].promoStartDate"]').value = promoStart;
        document.querySelector('[name="product[' + index + '].promoEndDate"]').value = promoEnd;
        // recalculate final price after confirm
        handleLineItemChange(index)
    }

    const onDiscountCancelHandler = () => {
        setDiscountContainerVisible('');
    }

    const handleLineItemChange = (elementIndex) => {
        const price = document.querySelector('[name="product[' + elementIndex + '].price"]').value || 0;
        const discount = document.querySelector('[name="product[' + elementIndex + '].discount"]').value || 0;

        const finalPrice = Math.round(parseFloat(price) - price * (parseFloat(discount) / 100));
        document.querySelector('#finalprice_' + elementIndex).textContent = finalPrice;
        document.querySelector('[name="product[' + elementIndex + '].finalPrice"]').value = finalPrice;
    }

    const scrollToProductImage = () => scrollOnErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const onSubmit = async (inputdata) => {
        if (inputdata.colour[0].images.length < 2) {
            scrollToProductImage();
            message.warning({
                content: (
                    <div>
                        <div className="font-weight-bold">Error</div>
                        Upload at least 2 and upto 6 pictures of your product.
                    </div>
                ),
                className: 'message-warning',
            });
            return false;
        }
        if (action === 'add_product') {
            try {
                const data = await axiosApi.post("/api/product", {
                    inputdata
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
    }

    useMountEffect(scrollToProductImage); // Scroll on mount
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="col">
                <div className={`text-center mt-5 mb-5 ${loading ? 'd-block' : 'd-none'}`}>Loading ...</div>
                <div className={`row ${!loading ? 'd-block' : 'd-none'}`}>
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
                        {errors.categoryId && <p className="errorMsg d-none">{errors.categoryId.message}</p>}
                        {onOpenChoosenCategory &&
                            <>
                                {
                                    platform === 'mobile'
                                        ?
                                        <div className="select-subcate-mdcontainer pt-3 pr-3 pl-3">
                                            <MobileChooseCategory
                                                catLevel={3}
                                                setConfirmCategory={setConfirmCategory}
                                                handleCancel={setOnOpenChoosenCategory}
                                            />
                                        </div>
                                        :
                                        <div className="select-subcate-container pt-3 pr-3 pl-3 border">
                                            <ChooseCategory
                                                catLevel={3}
                                                setConfirmCategory={setConfirmCategory}
                                                handleCancel={setOnOpenChoosenCategory}
                                            />
                                        </div>
                                }
                            </>
                        }
                    </div>
                    <div className="col-12 mt-4">
                        <label className="cat-label">Product Name</label>
                        <input type="text"
                            name="productname"
                            className="form-control"
                            autoComplete="off"
                            ref={register({
                                required: "Provide product name"
                            })}
                        />
                        {errors.productname && <p className="errorMsg">{errors.productname.message}</p>}
                    </div>

                    <div className="col-12 mt-4">
                        <div className="row">
                            <div className="d-block col-sm-6 col-md-4">
                                <label className="cat-label">Brand</label>
                                <Controller
                                    name="brand"
                                    defaultValue=""
                                    control={control}
                                    render={({ onChange, ref }) => (
                                        <Select
                                            showSearch
                                            style={{ width: '100%' }}
                                            onChange={onChange}
                                            placeholder="Select brand"
                                            optionFilterProp="children"
                                            allowClear={true}
                                            filterOption={(input, option) =>
                                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                        >
                                            <Option value="null">No Brand</Option>
                                            {brands && brands.map(brand => (
                                                <Option key={brand._id} value={brand._id}>{brand.name}</Option>
                                            ))}
                                        </Select>
                                    )}
                                    rules={{ required: "Provide brand" }}
                                />

                                {errors.brand && <p className="errorMsg">{errors.brand.message}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="col-12 mt-4">
                        <div className="row">
                            <div className="d-flex">
                                <div className="text-info">
                                    <label>
                                        <input type="radio" name="colour" value="yes"
                                            defaultChecked={true}
                                            onChange={() => setColorWithImage([])} className="mr-1"
                                        />
                                        Product have colour?
                                    </label>
                                </div>
                                <div className="text-info ml-3">
                                    <label>
                                        <input type="radio" name="colour" value="no"
                                            onChange={() => setColorWithImage(["nocolour"])} className="mr-1"
                                        />
                                        Product doesn't have colour?
                                    </label>
                                </div>
                            </div>
                            <div className="d-block col-sm-6 col-md-4" ref={scrollOnErrorRef}>

                                {colorWithImage[0] !== "nocolour" ?

                                    <>
                                        {selectColourUI()}
                                    </>
                                    :
                                    (
                                        <div className="mt-2">
                                            <input type="hidden" name="colour[0].name" value="nocolour" />
                                            <label className="cat-label">Product pictures</label>
                                            <Controller
                                                name="colour[0].images"
                                                defaultValue=""
                                                control={control}
                                                render={({ onChange, ref }) => (
                                                    <Dragger
                                                        name="file"
                                                        accept=".png, .jpg, .jpeg"
                                                        style={{ height: '15rem' }}
                                                        multiple={true}
                                                        action={`${baseUrl}/api/product/colour/images`}
                                                        listType="picture"
                                                        onChange={(file) => {

                                                            var imageUid = file.fileList.map(file => {
                                                                const getResponse = file.response;
                                                                if (getResponse !== undefined) {
                                                                    return file.response.filename[0];
                                                                }
                                                            })
                                                            onChange(imageUid);
                                                        }
                                                        }
                                                        maxCount={6}
                                                    >
                                                        <p className="ant-upload-drag-icon">
                                                            {!platform ? <InboxOutlined /> : <CameraOutlined />}
                                                        </p>
                                                        {!platform &&
                                                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                                        }
                                                        <p className="ant-upload-hint">
                                                            <b>Upload at least 2 and upto 6 pictures of your product</b>.
                                                            Strictly prohibit from uploading other company data and obscene images
                                                        </p>
                                                    </Dragger>
                                                )}
                                                rules={{ required: "Provide image" }}
                                            />
                                            {errors.colour?.[0]?.images &&
                                                <p className="errorMsg">{errors.colour?.[0]?.images.message}</p>
                                            }
                                        </div>
                                    )
                                }
                            </div >
                            {
                                colorWithImage.filter(item => item !== 'nocolour').map((item, i) => (
                                    <div className="d-block col-sm-6 col-md-4 mt-4" key={i}>
                                        <label className="cat-label">Color</label>
                                        <Controller
                                            name={`colour[${i + 1}].name`}
                                            defaultValue=""
                                            control={control}
                                            render={({ onChange, onFocus, value, ref }) => (
                                                <Select
                                                    name="colourName"
                                                    showSearch
                                                    style={{ width: '100%' }}
                                                    onChange={(colour) => {
                                                        onChange(colour);
                                                        // pass colour and index
                                                        onColorChange(colour, i + 1);
                                                    }
                                                    }
                                                    onFocus={onFocus}
                                                    value={value}
                                                    placeholder="Select color"
                                                    optionFilterProp="children"
                                                    allowClear={true}
                                                    filterOption={(input, option) =>
                                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                    }
                                                >
                                                    {filteredColourOptions.map(item => (
                                                        <Select.Option key={item} value={item}>
                                                            {item}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            )}
                                        />
                                        <div className="col-12 mt-4 product-picture d-none" id={`productPicture_${i + 1}`}>
                                            <label className="cat-label">Product pictures</label>
                                            <Controller
                                                name={`colour[${i + 1}].images`}
                                                defaultValue=""
                                                control={control}
                                                render={({ onChange, ref }) => (
                                                    <Dragger
                                                        name="file"
                                                        accept=".png, .jpg, .jpeg"
                                                        style={{ height: '10rem' }}
                                                        multiple={true}
                                                        action={`${baseUrl}/api/product/colour/images`}
                                                        onChange={(file) => {

                                                            var imageUid = file.fileList.map(file => {
                                                                const getResponse = file.response;
                                                                if (getResponse !== undefined) {
                                                                    return file.response.filename[0];
                                                                }
                                                            })
                                                            onChange(imageUid);
                                                        }
                                                        }
                                                        maxCount={6}
                                                    >
                                                        <p className="ant-upload-drag-icon">
                                                            {!platform ? <InboxOutlined /> : <CameraOutlined />}
                                                        </p>
                                                        {!platform &&
                                                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                                        }
                                                        <p className="ant-upload-hint">
                                                            <b>Upload at least 2 and upto 6 pictures of your product</b>.
                                                            Strictly prohibit from uploading other company data and obscene images
                                                        </p>
                                                    </Dragger>
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))
                            }

                        </div >
                    </div >

                    <div className="col-12 border-top pt-4 mt-4">
                        <div className="row"
                            style={{
                                display: quntityWithPriceOnSize.length !== 0
                                    && quntityWithPriceOnSize[0] === "nosize"
                                    ? "none"
                                    :
                                    "flex"
                            }}
                        >
                            <div className="col-sm-6 col-md-4">
                                <label className="d-block cat-label">Size</label>
                                <Controller
                                    name="size"
                                    defaultValue=""
                                    control={control}
                                    render={({ onChange, ref }) => (
                                        <Select
                                            showSearch
                                            mode="multiple"
                                            allowClear
                                            style={{ width: '100%' }}
                                            className="mt-sm-1"
                                            onChange={(size) => {
                                                onChange(size);
                                                displayQuantityWithPriceOnSizeChange(size)
                                            }
                                            }
                                            value={quntityWithPriceOnSize}
                                            placeholder="Select Size"
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                        >
                                            <Option value="Free Size">Free Size</Option>
                                            <Option value="XS">XS</Option>
                                            <Option value="S">S</Option>
                                            <Option value="M">M</Option>
                                            <Option value="L">L</Option>
                                            <Option value="XL">XL</Option>
                                            <Option value="XXL">XXL</Option>
                                            <Option value="New Born">New Born</Option>
                                            <Option value="0-3 months">0-3 months</Option>
                                            <Option value="3-6 months">3-6 months</Option>
                                            <Option value="6-12months">6-12 months</Option>
                                            <Option value="Above 1 year">Above 1 year</Option>
                                            <Option value="2 year">2 year</Option>
                                        </Select>
                                    )}
                                    rules={{ required: "Provide size" }}
                                />
                                {errors.size && <p className="errorMsg">{errors.size.message}</p>}
                            </div>
                            <div className="col-sm-6 col-md-6 mt-sm-5">
                                <span className="text-info cp" onClick={productWithoutSize}>Product doesn't have size?</span>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 table-responsive mt-4">
                                {quntityWithPriceOnSize.length !== 0 &&
                                    <>

                                        <button className="btn btn-light mb-4"
                                            style={{
                                                display: quntityWithPriceOnSize[0] === "nosize" ? "block" : "none"
                                            }}
                                            onClick={() => backToProductSize()}
                                        >
                                            <ArrowLeftOutlined className="mr-1" />
                                            Product have size !
                                        </button>

                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th style={{
                                                        width: '10rem',
                                                        display: quntityWithPriceOnSize[0] === "nosize" ? "none" : "table-cell"
                                                    }}
                                                    >
                                                        Size
                                                    </th>
                                                    <th>Quntity</th>
                                                    <th>Price(Rs)</th>
                                                    <th>Discount(%)</th>
                                                    <th>Final Price(Rs)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {quntityWithPriceOnSize && quntityWithPriceOnSize.map((item, i) => (
                                                    <tr key={i}>

                                                        <td style={{ display: item === "nosize" ? "none" : "table-cell" }}>
                                                            {item}
                                                            <input type="hidden" name={`product[${i}].size`} value={item}
                                                                ref={register({
                                                                    required: "Provide size"
                                                                })}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input type="number" name={`product[${i}].quantity`} className="form-control pt-1 pb-1"
                                                                style={{ width: '12rem', height: '3rem' }}
                                                                ref={register({
                                                                    required: "Provide quantity"
                                                                })}
                                                            />
                                                            {errors.product?.[i]?.quantity &&
                                                                <p className="errorMsg">{errors.product?.[i]?.quantity.message}</p>
                                                            }
                                                        </td>
                                                        <td>
                                                            <input type="number" name={`product[${i}].price`} className="form-control pt-1 pb-1"
                                                                style={{ width: '12rem', height: '3rem' }}
                                                                onChange={() => handleLineItemChange(i)}
                                                                ref={register({
                                                                    required: "Provide price"
                                                                })}
                                                            />

                                                            {errors.product?.[i]?.price &&
                                                                <p className="errorMsg">{errors.product?.[i]?.price.message}</p>
                                                            }
                                                        </td>
                                                        <td>
                                                            <span id={`discountTxt_${i}`} className="mr-2 font-weight-bold">-</span>
                                                            <Popover
                                                                placement="top"
                                                                trigger="click"
                                                                visible={discountContainerVisible === i}
                                                                content={
                                                                    <DiscountPopover
                                                                        index={i}
                                                                        Controller={Controller}
                                                                        register={register}
                                                                        unregister={unregister}
                                                                        control={control}
                                                                        reset={reset}
                                                                        errors={errors}
                                                                        trigger={trigger}
                                                                        getValues={getValues}
                                                                        setValue={setValue}
                                                                        defineDiscount={null}
                                                                        definePromoStartDate={null}
                                                                        definePromoEndDate={null}
                                                                        rangePickerDateFormat={rangePickerDateFormat}
                                                                        onDiscountCancelHandler={onDiscountCancelHandler}
                                                                        discountConfirmHandler={discountConfirmHandler}
                                                                    />
                                                                }
                                                            >
                                                                <EditOutlined size={16} onClick={() => handleDiscountVisibleChange(i, null)} />
                                                            </Popover>

                                                            <input type="hidden" name={`product[${i}].discount`} ref={register()} />
                                                            <input type="hidden" name={`product[${i}].promoStartDate`} ref={register()} />
                                                            <input type="hidden" name={`product[${i}].promoEndDate`} ref={register()} />
                                                        </td>
                                                        <td>
                                                            <span id={`finalprice_${i}`} className="font-weight-bold">-</span>
                                                            <input type="hidden" name={`product[${i}].finalPrice`} ref={register()} />
                                                            <input type="hidden" name={`product[${i}].sold`} value="0" ref={register()} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                }
                            </div>
                        </div>
                    </div>

                    <div className="col-12 border-top pt-4 mt-5">
                        <label className="cat-label">Short Description</label>
                        <Controller
                            name="shortDescription"
                            defaultValue=""
                            control={control}
                            render={({ onChange, ref }) => (
                                <Editor data=""
                                    onChange={(event, editor) => {
                                        const data = editor.getData();
                                        onChange(data);
                                    }
                                    }
                                />
                            )}
                            rules={{ required: "Provide short description" }}
                        />
                        {errors.shortDescription && <p className="errorMsg">{errors.shortDescription.message}</p>}
                    </div>

                    <div className="col-12 mt-5">
                        <label className="cat-label">Description</label>
                        <Controller
                            name="description"
                            defaultValue=""
                            control={control}
                            render={({ onChange, ref }) => (
                                <Editor data=""
                                    onChange={(event, editor) => {
                                        const data = editor.getData();
                                        onChange(data);
                                    }
                                    }
                                />
                            )}
                            rules={{ required: "Provide description" }}
                        />
                        {errors.description && <p className="errorMsg">{errors.description.message}</p>}
                    </div>
                    <div className="col-12 mt-5 border-top">
                        <div className="row mt-4">
                            <div className="d-flex">
                                <div className="text-info">
                                    <label>
                                        <input type="radio" name="warranty" value="yes"
                                            defaultChecked={true}
                                            onChange={() => setProductWarranty(true)} className="mr-1"
                                        />
                                        Product have Warranty ?
                                    </label>
                                </div>
                                <div className="text-info ml-3">
                                    <label>
                                        <input type="radio" name="warranty" value="no"
                                            onChange={() => setProductWarranty(false)} className="mr-1"
                                        />
                                        Product doesn't have Warranty?
                                    </label>
                                </div>
                            </div>
                        </div>
                        {productWarranty &&
                            <div className="row mt-3">
                                <div className="col-sm-6">
                                    <label className="cat-label">Warranty Type</label>
                                    <select name="warrantyType" className="form-control"
                                        ref={register({
                                            required: "Provide warranty Type"
                                        })}
                                    >
                                        <option value="">Select</option>
                                        <option value="brand">Brand Warranty</option>
                                        <option value="local">Local Warranty</option>
                                    </select>
                                    {errors.warrantyType && <p className="errorMsg">{errors.warrantyType.message}</p>}
                                </div>
                                <div className="col-sm-6">
                                    <label className="cat-label">Warranty Period</label>
                                    <select name="warrantyPeriod" className="form-control"
                                        ref={register({
                                            required: "Provide warranty Type"
                                        })}
                                    >
                                        <option value="">Select</option>
                                        <option>3 Month</option>
                                        <option>4 Month</option>
                                        <option>5 Month</option>
                                        <option>6 Month</option>
                                        <option>7 Month</option>
                                        <option>8 Month</option>
                                        <option>9 Month</option>
                                        <option>10 Month</option>
                                        <option>11 Month</option>
                                        <option>1 Year</option>
                                        <option>2 Year</option>
                                        <option>3 Year</option>
                                        <option>4 Year</option>
                                        <option>5 Year</option>
                                    </select>
                                    {errors.warrantyPeriod && <p className="errorMsg">{errors.warrantyPeriod.message}</p>}
                                </div>
                            </div>
                        }
                    </div>
                    <div className="col-12 mt-5 border-top">
                        <div className="d-block mt-4">Provide information about product for delivery purpose</div>
                        <div className="d-block mt-3">
                            <b>Free Shipping</b>
                            <label>
                                <input type="radio" name="freeShipping" value="no"
                                    className="ml-3 mr-1"
                                    ref={register({
                                        required: "Provide free shipping status"
                                    })}
                                />
                                No
                            </label>
                            <label>
                                <input type="radio" name="freeShipping" value="yes"
                                    className=" ml-2 mr-1"
                                    ref={register({
                                        required: "Provide free shipping status"
                                    })}
                                />
                                Yes
                            </label>
                            {errors.freeShipping && <p className="errorMsg">{errors.freeShipping.message} </p>}
                        </div>
                        <div className="d-block col-sm-6 col-md-4 mt-3">
                            <label className="cat-label">Weight(kg)</label>
                            <input type="text" name="weight" className="form-control"
                                ref={register({
                                    required: "Provide package weight"
                                })}
                            />
                            {errors.weight && <p className="errorMsg">{errors.weight.message}</p>}
                        </div>
                        <div className="d-block mt-3">
                            <div className="cat-label">Dimensions (cm)</div>
                            <div className="row">
                                <div className="col-sm-4">
                                    <input type="number" name="length" className="form-control"
                                        ref={register({
                                            required: "Provide package length"
                                        })}
                                        placeholder="Length(cm)"
                                    />
                                    {errors.length && <p className="errorMsg">{errors.length.message}</p>}
                                </div>
                                <div className="col-sm-4 mt-2 mt-sm-0">
                                    <input type="number" name="width" className="form-control"
                                        ref={register({
                                            required: "Provide package width"
                                        })}
                                        placeholder="Width(cm)"
                                    />
                                    {errors.width && <p className="errorMsg">{errors.width.message}</p>}
                                </div>
                                <div className="col-sm-4 mt-2 mt-sm-0">
                                    <input type="number" name="height" className="form-control"
                                        ref={register({
                                            required: "Provide package height"
                                        })}
                                        placeholder="Height(cm)"
                                    />
                                    {errors.height && <p className="errorMsg">{errors.height.message}</p>}
                                </div>
                            </div>
                            <div className="d-block mt-3">
                                <label className="cat-label">Dangerous Materials</label>
                                <div className="d-block">
                                    <div className="d-flex">
                                        <div className="mr-3">
                                            <input type="checkbox" name="dangerousMaterials" id="dangerous_none" value="None"
                                                ref={register({ validate: v => v.length > 0 })}
                                            />
                                            <label htmlFor="dangerous_none">
                                                None
                                            </label>
                                        </div>
                                        <div className="mr-3">
                                            <input type="checkbox" name="dangerousMaterials" id="dangerous_battery" value="Battery"
                                                ref={register({ validate: v => v.length > 0 })}
                                            />
                                            <label htmlFor="dangerous_battery">
                                                Battery
                                            </label>
                                        </div>
                                        <div className="mr-3">
                                            <input type="checkbox" name="dangerousMaterials" id="dangerous_liquid" value="Liquid"
                                                ref={register({ validate: v => v.length > 0 })}
                                            />
                                            <label htmlFor="dangerous_liquid">
                                                Liquid
                                            </label>
                                        </div>
                                        <div>
                                            <input type="checkbox" name="dangerousMaterials" id="dangerous_flamable" value="Flamable"
                                                ref={register({ validate: v => v.length > 0 })}
                                            />
                                            <label htmlFor="dangerous_flamable">
                                                Flamable
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                {errors.dangerousMaterials && <p className="errorMsg">Check at least one dangerous materials</p>}
                            </div>
                        </div>
                    </div>
                    <div className="col-12 mt-5">
                        <button type="submit" className="btn c-btn-primary">
                            {action === 'edit_product' ? 'UPDATE PRODUCT' : 'ADD PRODUCT'}
                        </button>
                    </div>
                </div >

            </div >

        </form >
    )
};
export default ProductForm;