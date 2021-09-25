import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import axios from 'axios';
import baseUrl from '../../../helpers/baseUrl';

import { message, Table, Image, Tag, Button, Switch } from 'antd';
import { CheckOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';

import moment from 'moment';

import ShowMore from 'react-show-more-button';

import Wrapper from '../../../components/admin/Wrapper';

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

    const router = useRouter();
    const { status } = router.query;

    const { adminAuth } = useSelector(state => state.adminAuth);

    useEffect(() => {
        if (product) {
            setMainProductImage(product.colour[0].images.slice(0, 1)[0]);

            setRestProductImages(product.colour[0].images.slice(1, 8));

            setSellerLoading(true);
            const getSellerInfo = async () => {
                try {
                    const { data } = await axios.get(`${process.env.api}/api/seller/${product.createdBy}`);
                    if (data) {
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
            title: 'Discount(%)',
            key: 'discount',
            render: (text, record) => <>{record.discount ? record.discount : '-'}</>,

        },
        {
            title: 'Retail Price',
            dataIndex: "finalPrice",
            key: 'finalPrice',
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
                                    />
                                </div>
                                <div className="d-flex" style={{ flexWrap: 'wrap' }}>
                                    {restProductImages.map(img => (
                                        <div key={img} className="m-1">
                                            <Image
                                                width={112}
                                                height={110}
                                                src={`/uploads/products/${img}`}
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
                                    <span className="font14" style={{ fontWeight: 500 }}>Name</span>: {sellerData.name}
                                    {sellerData.sellerRole === 'own' &&
                                        <span className="badge bg-warning ml-3">Own</span>
                                    }
                                </div>
                                <div className="d-block" >
                                    <span className="font14" style={{ fontWeight: 500 }}>Mobile</span>: {sellerData.mobile}
                                </div>
                                <div className="d-block" >
                                    <span className="font14" style={{ fontWeight: 500 }}>Email</span>: {sellerData.email}
                                </div>
                                <div className="d-block" >
                                    <span className="font14" style={{ fontWeight: 500 }}>Join Date</span>: {moment(sellerData.createdAt).format("DD MMM YYYY")}
                                </div>
                                <div className="d-block" >
                                    <span className="font14" style={{ fontWeight: 500 }}>Status</span>: {sellerData.status === 'approved'
                                        ?
                                        <span span className="badge bg-success ml-3">Approved</span>
                                        :
                                        <span span className="badge bg-danger ml-3">UnApproved</span>
                                    }
                                </div>
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