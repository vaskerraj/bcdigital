import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import moment from 'moment'

import { Table, DatePicker, AutoComplete, Input, Select, Button, Switch, message, Popconfirm } from 'antd';
const { RangePicker } = DatePicker;
const { Option } = Select;
import { SearchOutlined, CloseOutlined, CheckOutlined, EditFilled, DeleteFilled, RollbackOutlined } from '@ant-design/icons';

import Wrapper from '../../../components/seller/Wrapper';
import AvailableModal from '../../../components/models/AvailableModel';
import { checkProductDiscountValidity } from '../../../helpers/productDiscount';

const ManageProduct = ({ productDatas }) => {

    const [loading, setLoading] = useState(false);
    const [onFirstLoad, setOnFirstLoad] = useState(true);

    const [data, setData] = useState(productDatas);
    const [productTotal, setProductTotal] = useState(productDatas.length);
    const [sort, setSort] = useState('newest');
    const [onSearch, setOnSearch] = useState(false);

    // 
    const [productName, setProductName] = useState("");
    const [brand, setBrand] = useState("");
    const [pDateRange, setPDateRange] = useState(null);

    // for autocomplete
    const [brandOptions, setBrandOptions] = useState([]);

    const [activeTab, setActiveTab] = useState('all');

    // filter
    const [filter, setFilter] = useState(false);

    // modal
    const [visibleAvailabelModal, setVisibleAvailabelModal] = useState(false);
    const [availabelData, setAvailabelData] = useState('');

    const router = useRouter();

    const { sellerAuth } = useSelector(state => state.sellerAuth);

    const recallProductList = async (filterByname, filterByBrand, filterByPDateRange) => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${process.env.api}/api/seller/products`, {
                status: activeTab,
                name: filterByname,
                brand: filterByBrand,
                pDate: filterByPDateRange,
                sort,
            },
                {
                    headers: {
                        token: sellerAuth.token,
                    }
                });
            if (data) {
                setLoading(false);
                setData(data.products);
                setProductTotal(data.products.length);
                setOnSearch(false);
            }
        } catch (error) {
            setLoading(false)
            setOnSearch(false);
            setFilter(false);

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
    useEffect(() => {
        if (!onFirstLoad) {
            const filterByname = productName !== '' ? productName : 'all';
            const filterByBrand = brand !== '' ? brand : 'all';
            const filterByPDateRange = pDateRange !== null ? pDateRange : 'all';

            // call
            recallProductList(filterByname, filterByBrand, filterByPDateRange);
        }
    }, [onFirstLoad, activeTab, sort, onSearch]);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: '_id',
            render: (text, record) => <>{text}</>,
        },
        {
            title: 'Price(Rs)',
            dataIndex: 'price',
            key: 'price',
        },
        {
            title: 'Sale Price(Rs)',
            render: (text, record) =>
                checkProductDiscountValidity(record.promoStartDate, record.promoEndDate) === true
                    ? record.finalPrice
                    :
                    record.price
        },
        {
            title: 'Available',
            render: (text, record) =>
                <div className="d-block">
                    <span>{record.quantity - record.sold}</span>
                    <EditFilled onClick={() => editAvailableModel(record)} className="text-info ml-2 cp" size={20} />
                </div>
        },
        {
            title: 'Approved',
            dataIndex: ['colour[0]', 'name'],
            key: 'colourName',
            render: (text, record) => {
                if (record.approved === 'pending') {
                    return (<div className='badge bg-warning'>Pending</div>);
                } else if (record.approved === 'approved') {
                    return (<div className='badge bg-success'>Approved</div>);
                } else if (record.approved === 'unapproved') {
                    return (<div className='badge bg-danger'>UnApproved</div>);
                }
            },
        },
        {
            title: 'Status',
            render: (text, record) => {
                if (record.status === 'active') {
                    return (
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            onChange={() => changeProductStatusHandler(record.product_id, record.status)}
                            defaultChecked
                        />
                    )
                } else if (record.status === 'inactive') {
                    return (
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            onChange={() => changeProductStatusHandler(record.product_id, record.status)}
                        />
                    )
                } else if (record.status === 'deleted') {
                    return (<span className="badge bg-danger">Deleted</span>)
                }
            }
        },
        {
            title: 'Action',
            render: (text, record) => (
                <>
                    <a href={`/seller/product/edit/${record._id}`} className="btn btn-info mr-2"
                    >
                        <EditFilled />
                    </a>
                    {record.status !== 'deleted'
                        ?
                        <Popconfirm
                            title="Are you sure to delete this product?"
                            onConfirm={() => deleteProductHandler(record.product_id)}
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
                            onConfirm={() => restoreProductHandler(record.product_id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <button className="btn btn-warning">
                                <RollbackOutlined />
                            </button>
                        </Popconfirm>
                    }
                </>
            ),
        },

    ];
    const handleStatusChange = useCallback(value => {
        setOnFirstLoad(false);
        setFilter(prevState => prevState === true ? true : false);
        setActiveTab(value);
        setOnSearch(true)
    });

    const handleSortChange = useCallback(value => {
        setOnFirstLoad(false);
        setFilter(prevState => prevState === true ? true : false);
        setSort(value);
        setOnSearch(true);
    });

    const onChangeDatePicker = useCallback(date => {
        if (date) {
            setFilter(prevState => prevState === true ? true : false);
            setPDateRange({
                startDate: moment(date[0]).format('YYYY/MM/DD'),
                endDate: moment(date[1]).format('YYYY/MM/DD')
            });
        }
    });

    const handleSearchClick = () => {
        setOnFirstLoad(false);
        setFilter(true);
        setOnSearch(true)
    }

    const handleClearFilter = () => {
        setFilter(false);
        return router.reload();
    }

    const handleBrandSearch = useCallback(async (value) => {

        const { data } = await axiosApi.post("/api/search/brands", {
            searchtext: value
        });

        let brandSellers = [];
        data.map(brand => {
            const brandObj = new Object;
            brandObj['key'] = brand._id;
            brandObj['brand'] = brand._id;
            brandObj['value'] = brand.name;
            brandSellers.push(brandObj);
        });
        setBrandOptions(brandSellers);
    });


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
                setOnFirstLoad(false);
                setActiveTab(status);
                setOnSearch(true)
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
                setOnFirstLoad(false);
                setActiveTab(activeTab);
                setOnSearch(true)
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
                setOnFirstLoad(false);
                setActiveTab(activeTab);
                setOnSearch(true)
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
        <>
            <Head>
                <title>Manage Products | BC Digital Seller Center</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Wrapper onActive="manageproduct" breadcrumb={["Product", "Manage Product"]}>
                <AvailableModal
                    title="Update product availablility"
                    visible={visibleAvailabelModal}
                    handleCancel={handleAvailableModalCancel}
                    data={availabelData}
                />
                <div className="d-flex mb-5" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                    <div className="filter-tab cp" onClick={() => handleStatusChange('all')}>
                        All
                        <div className={`activebar ${activeTab === 'all' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('live')}>
                        Live
                        <div className={`activebar ${activeTab === 'live' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('approved')}>
                        Approved
                        <div className={`activebar ${activeTab === 'approved' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('unapproved')}>
                        UnApproved
                        <div className={`activebar ${activeTab === 'unapproved' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('active')}>
                        Active
                        <div className={`activebar ${activeTab === 'active' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('inactive')}>
                        Inactive
                        <div className={`activebar ${activeTab === 'inactive' ? 'active' : ''}`}></div>
                    </div>
                </div>
                <div className="d-block mb-5">
                    <div className="d-flex justify-content-around">
                        <Input className="mr-3" placeholder="Product name" onChange={(e) => setProductName(e.target.value)} />
                        <AutoComplete
                            className="mr-3"
                            style={{ width: 500 }}
                            options={brandOptions}
                            onSelect={(val, option) => setBrand(option.brand)}
                            onSearch={handleBrandSearch}
                            backfill={true}
                            placeholder="Brand"
                        />
                        <RangePicker
                            defaultValue=""
                            format={'YYYY-MM-DD'}
                            onChange={(date) => onChangeDatePicker(date)}
                            className="form-control mr-2"
                        />
                        {filter &&
                            <Button type="dashed" className="mr-2" icon={<CloseOutlined />} onClick={handleClearFilter}>Clear</Button>
                        }

                        <Button type="default"
                            icon={<SearchOutlined />}
                            onClick={handleSearchClick}
                            size="middle"
                        >
                            Search
                        </Button>
                    </div>
                </div>
                <div className="d-flex justify-content-between mb-4">
                    <div>
                        {productTotal} Product(s)
                    </div>
                    <Select
                        defaultValue={sort}
                        style={{ width: 120 }}
                        onChange={handleSortChange}
                        size="small"
                    >
                        <Option value="newest">Newest</Option>
                        <Option value="oldest">Oldest</Option>
                    </Select>
                </div>
                <div className="d-block table-responsive mt-5">
                    <Table
                        rowKey="_id"
                        columns={columns}
                        dataSource={data}
                        pagination={false}
                        loading={loading}
                    />
                </div>
            </Wrapper>
        </>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);

        const status = "all";
        const name = 'all';
        const brand = 'all';
        const pDate = 'all';
        const sort = 'newest';

        const { data } = await axios.post(`${process.env.api}/api/seller/products`, {
            status,
            name,
            brand,
            pDate,
            sort,
        },
            {
                headers: {
                    token: cookies.sell_token,
                },
            });
        return {
            props: {
                productDatas: data.products
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