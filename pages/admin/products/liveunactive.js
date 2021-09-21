import React, { useState, useEffect, useCallback } from 'react';
import router, { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { message, Table, Pagination, Select, Tag, Input, AutoComplete, Button } from 'antd';
const { Option } = Select;
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';

import moment from 'moment';

import Wrapper from '../../../components/admin/Wrapper';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});


const LiveUnactiveProducts = ({ productData, total }) => {

    const [loading, setLoading] = useState(false);
    const [onFirstLoad, setOnFirstLoad] = useState(true);

    const [data, setData] = useState(productData);
    const [productTotal, setProductTotal] = useState(total);
    const [currPage, setCurrPage] = useState(1);
    const [page, setPage] = useState(1);
    const [sizePerPage, setSizePerPage] = useState(10);
    const [sort, setSort] = useState('newest');
    const [onSearch, setOnSearch] = useState(false);

    // 
    const [productName, setProductName] = useState("");
    const [productId, setProductId] = useState("");
    const [brand, setBrand] = useState("");
    const [seller, setSeller] = useState("");

    // for autocomplete
    const [sellerOptions, setSellerOptions] = useState([]);
    const [brandOptions, setBrandOptions] = useState([]);

    // filter
    const [filter, setFilter] = useState(false);

    // pagation
    const [pagination, setPagination] = useState({ position: ['none', 'none'], defaultPageSize: sizePerPage });


    const { adminAuth } = useSelector(state => state.adminAuth);

    const recallProductList = async (filterByname, filterByProductId, filterByBrand, filterByseller) => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${process.env.api}/api/products/list`, {
                status: 'liveunactive',
                name: filterByname,
                productId: filterByProductId,
                brand: filterByBrand,
                seller: filterByseller,
                sort,
                page,
                limit: sizePerPage
            },
                {
                    headers: {
                        token: adminAuth.token,
                    }
                });
            if (data) {
                setLoading(false);
                setData(data.products);
                setProductTotal(data.total);
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
            const filterByProductId = productId !== '' ? productId.toLowerCase() : 'all';
            const filterByBrand = brand !== '' ? brand : 'all';
            const filterByseller = seller !== '' ? seller : 'all';

            // call
            recallProductList(filterByname, filterByProductId, filterByBrand, filterByseller);
        }
    }, [onFirstLoad, page, sizePerPage, sort, onSearch]);


    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => <a href={`/admin/products/${record._id}`}>{text}</a>,
        },
        {
            title: 'Item Id',
            dataIndex: '_id',
            key: '_id',
            render: text => <>{text.toUpperCase()}</>,
        },
        {
            title: 'Seller',
            dataIndex: ['createdBy', 'name'],
            key: ['createdBy', 'name'],
            render: (text, record) => <a href={record.createdBy._id}>{text}</a>,
        },
        {
            title: 'Brand',
            dataIndex: ['brand', 'name'],
            key: 'brand.name',

        },
        {
            title: 'Colour',
            dataIndex: ['colour[0]', 'name'],
            key: 'colourName',
            render: (text, record) => <>{record.colour[0].name !== undefined ? record.colour[0].name : '-'}</>,
        },
        {
            title: 'Size',
            key: 'size',
            dataIndex: 'products',
            render: products => (
                <>
                    {products.map(product => {
                        if (product.size !== 'nosize') {
                            return (
                                <Tag color="blue" key={product.size} className="mt-1">
                                    {product.size.toUpperCase()}
                                </Tag>
                            );
                        } else {
                            return <>-</>
                        }
                    })}
                </>
            ),
            width: '13%'
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: text => <>{moment(text).format("DD MMM YYYY")}</>,
        },
    ];

    const handlePageChange = useCallback(value => {
        setOnFirstLoad(false);
        setFilter(prevState => prevState === true ? true : false);
        setCurrPage(value);
        setPage(value);
        setOnSearch(true)
    });

    const handleLimitChange = value => {
        setOnFirstLoad(false);
        setFilter(prevState => prevState === true ? true : false);
        setPagination({ position: ['none', 'none'], defaultPageSize: value });
        setSizePerPage(value);
        setCurrPage(1);
        setPage(1);
        setOnSearch(true);
    };

    const handleSortChange = useCallback(value => {
        setOnFirstLoad(false);
        setFilter(prevState => prevState === true ? true : false);
        setSort(value);
        setOnSearch(true);
    });

    const handleSearchClick = () => {
        setOnFirstLoad(false);
        setFilter(true);
        setCurrPage(1);
        setPage(1);
        setOnSearch(true)
    }

    const handleClearFilter = () => {
        setFilter(false);
        return router.reload();
    }

    const handleSellerSearch = useCallback(async (value) => {

        const { data } = await axiosApi.post("/api/search/sellers", {
            searchtext: value
        });

        let serachSellers = [];
        data.map(seller => {
            const sellerObj = new Object;
            sellerObj['key'] = seller._id;
            sellerObj['seller'] = seller._id;
            sellerObj['value'] = seller.name;
            serachSellers.push(sellerObj);
        });
        setSellerOptions(serachSellers);
    });

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


    return (
        <Wrapper onActive="liveunactiveProduct" breadcrumb={["Products", "Live But UnActive Products"]}>
            <div className="mb-5">
                <div className="d-flex justify-content-around">
                    <Input className="mr-3" placeholder="Product Name"
                        onChange={(e) => setProductName(e.target.value)}
                    />
                    <Input className="mr-3" placeholder="Product Id" onChange={(e) => setProductId(e.target.value)} />
                    <div className="mr-3" style={{ width: 200 }}>
                        <AutoComplete
                            style={{ width: 200 }}
                            options={sellerOptions}
                            onSelect={(val, option) => setSeller(option.seller)}
                            onSearch={handleSellerSearch}
                            backfill={true}
                            placeholder="Seller"
                        />
                    </div>
                    <div className="mr-3" style={{ width: 200 }}>
                        <AutoComplete
                            style={{ width: 200 }}
                            options={brandOptions}
                            onSelect={(val, option) => setBrand(option.brand)}
                            onSearch={handleBrandSearch}
                            backfill={true}
                            placeholder="Brand"
                        />
                    </div>
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
            <Table
                columns={columns}
                dataSource={data}
                pagination={pagination}
                loading={loading}
            />
            {
                productTotal !== 0 &&
                <div className="d-flex justify-content-between mt-5">
                    <Select defaultValue={sizePerPage} style={{ width: 120 }} onChange={handleLimitChange}>
                        <Option value={10}>10</Option>
                        <Option value={30}>30</Option>
                        <Option value={50}>50</Option>
                        <Option value={100}>100</Option>
                    </Select>
                    <Pagination
                        current={currPage}
                        total={productTotal}
                        responsive
                        pageSize={sizePerPage}
                        onChange={handlePageChange}
                    />
                </div>
            }
        </Wrapper >
    );
}

export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);

        const status = "liveunactive";
        const name = 'all';
        const productId = 'all';
        const brand = 'all';
        const seller = 'all';
        const sort = 'newest';
        const page = 1;
        const limit = 30;

        const { data } = await axios.post(`${process.env.api}/api/products/list`, {
            status,
            name,
            productId,
            brand,
            seller,
            sort,
            page,
            limit
        },
            {
                headers: {
                    token: cookies.ad_token,
                }
            });
        return {
            props: {
                productData: data.products,
                total: data.total
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/admin/login',
                destination: '/admin/login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}

export default LiveUnactiveProducts;
