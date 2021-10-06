import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { Switch, message, Popconfirm } from 'antd';
import { CloseOutlined, CheckOutlined, EditFilled, DeleteFilled, RollbackOutlined } from '@ant-design/icons';

import Wrapper from '../../../components/seller/Wrapper';
import { ReactTable } from '../../../components/helpers/ReactTable';
import AvailableModal from '../../../components/models/AvailableModel';

const ManageProduct = ({ productDatas }) => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('all');

    // modal
    const [visibleAvailabelModal, setVisibleAvailabelModal] = useState(false);
    const [availabelData, setAvailabelData] = useState('');


    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        let modifiedProductsData = [];
        productDatas.map(product => {
            product.products.map(item => {
                const obj = new Object();
                // common
                obj["_id"] = product._id;
                obj["name"] = product.name;
                obj["slug"] = product.slug;
                obj["category"] = product.category;
                obj["brand"] = product.brand;
                obj["colour"] = product.colour;

                // product base
                obj["product_id"] = item._id;
                obj["size"] = item.size;
                obj["quantity"] = item.quantity;
                obj["price"] = item.price;
                obj["discount"] = item.discount;
                obj["promoStartDate"] = item.promoStartDate;
                obj["promoEndDate"] = item.promoEndDate;
                obj["finalPrice"] = item.finalPrice;
                obj["approved"] = item.approved.status;
                obj["status"] = item.status;
                obj["sold"] = item.sold;

                modifiedProductsData.push(obj);
            });
        });
        setProducts(modifiedProductsData);
    }, [productDatas]);

    const { sellerAuth } = useSelector(state => state.sellerAuth);

    const precolumns = useMemo(() => [
        {
            Header: "Name",
            accessor: "name",
            sortable: true,
            show: true,
            displayValue: " Name ",

        },
        {
            Header: "Price(Rs)",
            accessor: "price",
            sortable: false,
            show: true,
            displayValue: " Price "
        },
        {
            Header: "Sale Price(Rs)",
            accessor: "finalPrice",
            sortable: false,
            show: true,
            displayValue: " Sale Price "
        },
        {
            Header: "Available",
            accessor: row => row.quantity,
            displayValue: " Available ",
            Cell: ({ row: { original } }) => (
                <div className="d-block">
                    <span>{original.quantity - original.sold}</span>
                    <EditFilled onClick={() => editAvailableModel(original)} className="text-info ml-2 cp" size={20} />
                </div>
            )
        },
        {
            Header: "Approved",
            accessor: row => row.status,
            displayValue: " Approved ",
            Cell: ({ row: { original } }) => {
                if (original.approved === 'pending') {
                    return (<div className='badge bg-warning'>Pending</div>);
                } else if (original.approved === 'approved') {
                    return (<div className='badge bg-success'>Approved</div>);
                } else if (original.approved === 'notApproved') {
                    return (<div className='badge bg-danger'>Not approved"</div>);
                }
            }
        },
        {
            Header: "Status",
            show: true,
            Cell: ({ row: { original } }) => {
                if (original.status === 'active') {
                    return (
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            onChange={() => changeProductStatusHandler(original.product_id, original.status)}
                            defaultChecked
                        />
                    )
                } else if (original.status === 'inactive') {
                    return (
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            onChange={() => changeProductStatusHandler(original.product_id, original.status)}
                        />
                    )
                } else if (original.status === 'deleted') {
                    return (<span className="badge bg-danger">Deleted</span>)
                }
            }
        },
        {
            Header: "Actions",
            show: true,
            Cell: ({ row: { original } }) => (
                <>
                    <a href={`/seller/product/edit/${original._id}`} className="btn btn-info mr-2"
                    >
                        <EditFilled />
                    </a>
                    {original.status !== 'deleted'
                        ?
                        <Popconfirm
                            title="Are you sure to delete this product?"
                            onConfirm={() => deleteProductHandler(original.product_id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <button className="btn btn-warning">
                                <DeleteFilled />
                            </button>
                        </Popconfirm>
                        :
                        <Popconfirm
                            title="Are you sure to restore this deleted product?"
                            onConfirm={() => restoreProductHandler(original.product_id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <button className="btn btn-warning">
                                <RollbackOutlined />
                            </button>
                        </Popconfirm>
                    }

                </>
            )
        }
    ]);

    useEffect(() => {
        if (activeTab === 'active' || activeTab === 'inactive') {
            var filteredData = products.filter(data => data.status === activeTab || data.status === undefined);
            setFilteredProducts(filteredData);
        } else if (activeTab === 'live') {
            var filteredData = products.filter(data => data.status === 'active' && data.approved === 'approved' || data.status === undefined);
            setFilteredProducts(filteredData);
        }
        else if (activeTab === 'approved') {
            var filteredData = products.filter(data => data.approved === activeTab || data.approved === undefined);
            setFilteredProducts(filteredData);
        } else if (activeTab === 'unapproved') {
            var filteredData = products.filter(data => data.approved === activeTab || data.approved === "pending" || data.approved === undefined);
            setFilteredProducts(filteredData);
        } else if (activeTab === 'all') {
            setFilteredProducts(products);
        }
    }, [activeTab, products]);

    const changeProductStatusHandler = useCallback(async (id, status) => {
        try {
            const { data } = await axiosApi.put(`/api/product/status/${id}/${status}`, {}, {
                headers: {
                    token: sellerAuth.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Product status succssfully changed
                        </div>
                    ),
                    className: 'message-success',
                });
                router.push(router.asPath);
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
    });

    const deleteProductHandler = useCallback(async (id) => {
        try {
            const { data } = await axiosApi.delete(`/api/product/${id}`, {
                headers: {
                    token: sellerAuth.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Product successfully save to archive
                        </div>
                    ),
                    className: 'message-success',
                });
                router.push(router.asPath);
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
    });
    const restoreProductHandler = useCallback(async (id) => {
        try {
            const { data } = await axiosApi.get(`/api/product/restore/${id}`, {
                headers: {
                    token: sellerAuth.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Product successfully restored.
                        </div>
                    ),
                    className: 'message-success',
                });
                router.push(router.asPath);
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
    });

    const handleAvailableModalCancel = () => {
        setVisibleAvailabelModal(false);
    }
    const editAvailableModel = useCallback((product) => {
        setVisibleAvailabelModal(true);
        setAvailabelData(product);
    });

    return (
        <Wrapper onActive="manageproduct" breadcrumb={["Product", "Manage Product"]}>
            <AvailableModal
                title="Update product availablility"
                visible={visibleAvailabelModal}
                handleCancel={handleAvailableModalCancel}
                data={availabelData}
            />
            <div className="d-flex" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                <div className="filter-tab cp" onClick={() => setActiveTab('all')}>
                    All
                    <div className={`activebar ${activeTab === 'all' ? 'active' : ''}`}></div>
                </div>
                <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('live')}>
                    Live
                    <div className={`activebar ${activeTab === 'live' ? 'active' : ''}`}></div>
                </div>
                <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('approved')}>
                    Approved
                    <div className={`activebar ${activeTab === 'approved' ? 'active' : ''}`}></div>
                </div>
                <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('unapproved')}>
                    UnApproved
                    <div className={`activebar ${activeTab === 'unapproved' ? 'active' : ''}`}></div>
                </div>
                <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('active')}>
                    Active
                    <div className={`activebar ${activeTab === 'active' ? 'active' : ''}`}></div>
                </div>
                <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('inactive')}>
                    Inactive
                    <div className={`activebar ${activeTab === 'inactive' ? 'active' : ''}`}></div>
                </div>
            </div>
            <div className="d-block mt-4">
                <ReactTable
                    columns={precolumns}
                    data={filteredProducts}
                    defaultPageSize={20}
                    tableClass={'table-bordered'}
                />
            </div>
        </Wrapper>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/products/auth`, {
            headers: {
                token: cookies.sell_token,
            },
        });
        return {
            props: {
                productDatas: data
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/seller/login',
                destination: '/seller/login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}

export default ManageProduct;