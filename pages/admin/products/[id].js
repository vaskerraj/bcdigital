import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import axios from 'axios';
import baseUrl from '../../../helpers/baseUrl';

import { message, Table, Image, Tag, Button, Switch, Input } from 'antd';
import { CheckOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';

import { useForm, Controller } from 'react-hook-form';
import moment from 'moment';

import ShowMore from 'react-show-more-button';

import Wrapper from '../../../components/admin/Wrapper';
import { checkProductDiscountValidity } from '../../../helpers/productDiscount';
import { customImageLoader } from '../../../helpers/functions';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});


const OverAllProductDetails = ({ product }) => {

    const [mainProductImage, setMainProductImage] = useState([]);
    const [restProductImages, setRestProductImages] = useState([]);
    const [sellerData, setSellerData] = useState([]);
    const [sellerLoading, setSellerLoading] = useState(false);

    // change commission rate

    const [changeCommissionRate, setChangeCommissionRate] = useState(false);
    const [commissionPercantage, setCommissionPercantage] = useState(0);

    const router = useRouter();
    const { status } = router.query;

    const { adminAuth } = useSelector(state => state.adminAuth);


    const { register, handleSubmit, errors, reset, getValues, trigger, control } = useForm();

    useEffect(() => {
        if (product) {
            setMainProductImage(product.colour[0].images.slice(0, 1)[0]);

            setRestProductImages(product.colour[0].images.slice(1, 8));

            setSellerLoading(true);
            const getSellerInfo = async () => {
                try {
                    const { data } = await axios.get(`${process.env.api}/api/seller/${product.createdBy}`);
                    if (data) {
                        setCommissionPercantage(product.point !== undefined ? product.point : data.commission);
                        setSellerLoading(false);
                        setSellerData(data);
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
            getSellerInfo();
        }
    }, [product]);

    const onSubmitCommissionChange = async (inputData) => {
        console.log(inputData)
        const amount = inputData.commission;
        console.log(amount)
        try {
            const { data } = await axios.put(`${process.env.api}/api/admin/product/commission`, {
                productId: product._id,
                amount
            },
                {
                    headers: {
                        token: adminAuth.token,
                    }
                }
            );
            if (data.msg === 'success') {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Commission rate succssfully update for this product.
                        </div>
                    ),
                    className: 'message-warning',
                });
                setTimeout(() => {
                    router.reload(true);
                }, 2000)
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


    const columns = [
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
            render: size => (
                <>
                    <Tag color="blue" key={size} className="mt-1">
                        {size.toUpperCase()}
                    </Tag>
                </>
            ),
        },
        {
            title: 'In Stock',
            key: 'quantity',
            render: (text, record) => <>{record.quantity - record.sold}</>,
        },
        {
            title: 'Price',
            dataIndex: "price",
            key: "price",
        },
        {
            title: 'Discount',
            key: 'discount',
            render: (text, record) => <>{checkProductDiscountValidity(record.promoStartDate, record.promoEndDate) ? record.discount : '-'}</>,

        },
        {
            title: 'Retail Price',
            key: 'finalPrice',
            render: (text, record) => <>{checkProductDiscountValidity(record.promoStartDate, record.promoEndDate) === true ?
                record.finalPrice
                : record.price}</>,
        },
        {
            title: 'Commission Amt',
            render: (text, record) => <>{
                (
                    checkProductDiscountValidity(record.promoStartDate, record.promoEndDate) === true ?
                        record.finalPrice
                        : record.price
                        *
                        commissionPercantage
                ) / 100}
            </>
        },
        {
            title: 'Orders',
            dataIndex: "orders",
            key: 'orders',
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                record.approved.status === 'approved'
                    ?
                    <Switch
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                        onChange={() => handleProductStatus(record._id, 'unapproved')}
                        defaultChecked
                    />
                    :
                    <Switch
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                        onChange={() => handleProductStatus(record._id, 'approved')}
                    />
            ),
        },
    ];

    const handleProductStatus = async (id, status) => {
        try {
            const { data } = await axios.put(`${process.env.api}/api/product/each/status/${id}/${status}`, {},
                {
                    headers: {
                        token: adminAuth.token,
                    }
                });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Product status successfully updated.
                        </div>
                    ),
                    className: 'message-warning',
                });
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

    // for key highlights and description
    const renderHTML = (rawHTML) => React.createElement("div", { dangerouslySetInnerHTML: { __html: rawHTML } });

    return (
        <Wrapper onActive={status} breadcrumb={["Products Details"]}>
            <div className="d-flex justify-content-between align-items-center">
                <div className="fontb" style={{ fontSize: '2.2rem', fontWeight: 600 }}>
                    Product Name
                </div>
                <div className="">
                    <Link href={`${baseUrl}/product/${product._id}/${product.slug}`}>
                        <a target="_blank">
                            <Button type="primary" shape="round">Preview</Button>
                        </a>
                    </Link>
                </div>
            </div>
            <div className="row mt-3">
                <div className="col-9">
                    <div style={{ border: '2px solid #ddd', borderRadius: 8, padding: 10 }}>
                        <Image.PreviewGroup>
                            <div className="d-flex">
                                <div className="m-1" style={{ width: 200 }}>
                                    <Image
                                        width={200}
                                        height={220}
                                        src={`/uploads/products/${mainProductImage}`}
                                        loader={customImageLoader}
                                    />
                                </div>
                                <div className="d-flex" style={{ flexWrap: 'wrap' }}>
                                    {restProductImages.map(img => (
                                        <div key={img} className="m-1">
                                            <Image
                                                width={112}
                                                height={110}
                                                src={`/uploads/products/${img}`}
                                                loader={customImageLoader}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Image.PreviewGroup>
                    </div>
                    <div className="mt-3" style={{ border: '2px solid #ddd', borderRadius: 8, padding: 10 }}>

                        <Table
                            columns={columns}
                            dataSource={product.products}
                            pagination={{ position: ['none', 'none'], defaultPageSize: 20 }}
                        />

                    </div>
                    <div className="mt-3" style={{ border: '2px solid #ddd', borderRadius: 8, padding: 10 }}>
                        <div className="font15" style={{ fontWeight: 700 }}>General Info</div>
                        <div className="d-flex justify-content-around" style={{ flexWrap: 'wrap' }}>
                            <div>
                                <div style={{ fontWeight: 500 }}>Colour</div>
                                <div>{product.colour[0].name !== undefined ? product.colour[0].name : "-"}</div>
                            </div>
                            <div >
                                <div style={{ fontWeight: 500 }}>Category</div>
                                <div>{product.category.name}</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 500 }}>Brand</div>
                                <div>{product.brand.name}</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 500 }}>Average Rating</div>
                                <div>{product.rating}</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 500 }}>Review</div>
                                <div>{product.review.length}</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 500 }}>Created At</div>
                                <div>{moment(product.createdAt).format("DD MMM YYYY")}</div>
                            </div>
                        </div>
                        <div className="font14 mt-4 pt-4" style={{ fontWeight: 500, borderTop: '5px dashed #eee' }}>Key Highlights</div>
                        <div className="d-block ck-content mt-1 pb-1 border-top">
                            {renderHTML(product.shortDescription)}
                        </div>
                        <div className="font14 mt-4" style={{ fontWeight: 500 }}>Description</div>
                        <div className="d-block ck-content mt-1 pb-2 border-top">
                            <ShowMore
                                maxHeight={400}
                                styleButton={{
                                    border: 'none',
                                    backgroundColor: '#fff',
                                    color: '#342ead',
                                    fontWeight: 'bold'
                                }}
                            >
                                {renderHTML(product.description)}
                            </ShowMore>
                        </div>
                    </div>
                </div>
                <div className="col-3">
                    <div style={{ border: '2px solid #ddd', borderRadius: 8, padding: 10 }}>
                        <div className="font15" style={{ fontWeight: 700 }}>Seller Info</div>
                        {!sellerLoading
                            ?
                            <div className="d-block">
                                <div className="d-block" >
                                    <span className="font14" style={{ fontWeight: 500 }}>Name</span>: {sellerData.userId?.name}
                                    {sellerData.userId?.sellerRole === 'own' &&
                                        <span className="badge bg-warning ml-3">Own</span>
                                    }
                                </div>
                                <div className="d-block" >
                                    <span className="font14" style={{ fontWeight: 500 }}>Mobile</span>: {sellerData.userId?.mobile}
                                </div>
                                <div className="d-block" >
                                    <span className="font14" style={{ fontWeight: 500 }}>Email</span>: {sellerData.userId?.email}
                                </div>
                                <div className="d-block" >
                                    <span className="font14" style={{ fontWeight: 500 }}>Join Date</span>: {moment(sellerData.userId?.createdAt).format("DD MMM YYYY")}
                                </div>
                                <div className="d-block" >
                                    <span className="font14" style={{ fontWeight: 500 }}>Status</span>: {sellerData.status?.title === 'approved'
                                        ?
                                        <span span className="badge bg-success ml-3">Approved</span>
                                        :
                                        <span span className="badge bg-danger ml-3">UnApproved</span>
                                    }
                                </div>
                                <div className="d-block border-top font14 mt-2 pt-2" style={{ fontWeight: 500 }}>
                                    <span className="mr-2">
                                        Commission Rate:
                                    </span>
                                    <span className="font16">
                                        {sellerData.commission} %
                                    </span>
                                </div>
                            </div>
                            :
                            <div className="text-center mt-2 mb-2">
                                <LoadingOutlined size={30} />
                            </div>
                        }
                    </div>
                    <div className="mt-4" style={{ border: '2px solid #ddd', borderRadius: 8, padding: 10 }}>
                        <div className="font14" style={{ fontWeight: 700 }}>Change Commission Rate For Product?</div>
                        {!sellerLoading ?
                            <div className="d-block">
                                <form onSubmit={handleSubmit(onSubmitCommissionChange)}>
                                    <div className="d-flex align-item-center mt-3">
                                        <div className="ml-3">
                                            <div className="d-block  font-weight-bold">
                                                {!changeCommissionRate ?
                                                    <>
                                                        {product.point ? product.point : sellerData.commission} %
                                                        <span className="text-info font-weight-normal ml-3 cp"
                                                            onClick={() => setChangeCommissionRate(true)}
                                                        >
                                                            Change
                                                        </span>
                                                    </>
                                                    :
                                                    <>

                                                        <div className="d-flex">
                                                            <Controller
                                                                name="commission"
                                                                defaultValue={product.point ? product.point : sellerData.commission}
                                                                control={control}
                                                                render={({ onChange, value, onBlur, onFocus, ref }) => (
                                                                    <Input allowClear
                                                                        name="commission"
                                                                        type="number"
                                                                        autoComplete="none"
                                                                        value={value}
                                                                        onChange={(e) => {
                                                                            onChange(e);
                                                                        }
                                                                        }

                                                                    />)}
                                                                rules={{ required: true, maxLength: 10 }}
                                                            />
                                                            <button type="submit" className="btn btn-lg btn-outline-info ml-3">
                                                                Save
                                                            </button>
                                                        </div>
                                                        {errors.commision && errors.commision.type === "required" && (
                                                            <p className="d-block errorMsg">Provide commission rate</p>
                                                        )}
                                                    </>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            :
                            <div className="text-center mt-2 mb-2">
                                <LoadingOutlined size={30} />
                            </div>
                        }
                    </div>
                </div>
            </div>
        </Wrapper >
    );
}

export async function getServerSideProps(context) {
    try {

        const { id } = context.params;
        const { data } = await axios.get(`${process.env.api}/api/product/${id}`);

        return {
            props: {
                product: data,
            }
        }
    } catch (err) {
        return {
            props: {},
        };
    }
}

export default OverAllProductDetails;