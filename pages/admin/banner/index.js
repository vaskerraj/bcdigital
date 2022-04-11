import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import { useRouter } from 'next/router';
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';

import axiosApi from '../../../helpers/api';
import { Popconfirm, Select, message } from 'antd';
const { Option, OptGroup } = Select;

import { Edit3, Trash2 } from 'react-feather';

import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';

import Wrapper from '../../../components/admin/Wrapper';
import ChooseCategory from '../../../components/ChooseCategory';
import { allSellers } from '../../../redux/actions/sellerAction';
import { customImageLoader } from '../../../helpers/functions';

const Brands = ({ banner }) => {
    const [bannerItem, setBannerItem] = useState([]);

    const [bannerPostionValue, setBannerPostionValue] = useState("");
    const [fieldCategory, setFieldCategory] = useState(false);
    const [fieldSellerList, setFieldSellerList] = useState(false);
    // seller upload state
    const [sellerList, setSellerList] = useState("");

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

    const router = useRouter;
    const dispatch = useDispatch();

    const { adminAuth } = useSelector(state => state.adminAuth);

    // seller option
    const { sellers } = useSelector(state => state.sellerList);
    useEffect(async () => {
        dispatch(allSellers());
    }, [bannerPostionValue]);

    //set init banner at init render
    useEffect(() => {
        const initBanner = banner.filter(bn => bn.bannerPosition === "position_home");
        setBannerItem(Object.values(initBanner ? initBanner : []));
        setBannerPostionValue('position_home');
    }, []);

    //  bannerPostionHandler
    const bannerPostionHandler = (value) => {
        setBannerPostionValue(value);
        switch (value) {
            case 'position_home':
                setFieldCategory(false);
                // hide sellers list
                setFieldSellerList(false);
                break;
            case 'position_seller':
                setFieldCategory(false);
                // display sellers list
                setFieldSellerList(true);
                break;
            case 'position_category':
                setFieldCategory(true);

                // hide sellers list
                setFieldSellerList(false);
                break;
            case " ":
                setFieldCategory(false);
                // hide sellers list
                setFieldSellerList(false);
            default:
                setFieldCategory(false);
                // hide sellers list
                setFieldSellerList(false);
                break;

        }
    }

    const onChangeSeller = value => {
        setSellerList(value);
    }

    const filterHandler = () => {
        // bannerPostionValue  sellerList categoryId
        let filteredBanner;
        if (bannerPostionValue === "position_home") {
            filteredBanner = banner.filter(bn => bn.bannerPosition === "position_home");
        } else if (bannerPostionValue === "position_seller") {
            filteredBanner = banner.filter(bn => bn.bannerPosition === "position_seller" && bn.sellerId === sellerList);
        } else if (bannerPostionValue === "position_category") {
            filteredBanner = banner.filter(bn => bn.bannerPosition === "position_category" && bn.categoryId === categoryId);
        }
        // need to convert to object for Sort and Reorder
        setBannerItem(Object.values(filteredBanner ? filteredBanner : []));
    }

    const onDeleteHandler = async (id) => {
        try {
            const { data } = await axiosApi.delete(`/api/banner/${id}`, {
                headers: {
                    token: adminAuth.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Banner succssfully deleted
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
    }

    const SortableBanners = SortableElement(({ value }) =>
        <div className="col-sm-6 col-md-6 col-lg-4 mt-4">
            <div className="brand-block d-block p-3 mt-3 mt-sm-0">
                <div className="rounded img-thumbnail text-center">
                    <Image src={`/uploads/banners/${value.mobileImage}`} height="160" width="330"
                        loader={customImageLoader} />
                </div>
                <div className="d-block mt-4 font-weight-bold font16">
                    {value.name}
                </div>
                <div className="d-flex justify-content-between mt-3">
                    <Link href={`/admin/banner/edit/${value._id}`}>
                        <button className="btn c-btn-primary" style={{ paddingLeft: '1.2rem', paddingRight: '1.2rem', border: '1px solid' }}>
                            <Edit3 size={16} />
                        </button>
                    </Link>
                    <Popconfirm
                        title="Are you sure to delete this banner?"
                        onConfirm={() => onDeleteHandler(value._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <button className="btn c-btn-primary">
                            <Trash2 size={16} /> Delete
                        </button>
                    </Popconfirm>
                </div>
            </div>
        </div>
    );

    const SortableBrandList = SortableContainer(({ items }) => {
        return (
            <div className="row">
                {items.map((value, index) => (
                    <SortableBanners key={`item-${value._id}`} index={index} value={value} />
                ))}
            </div>
        );
    });

    const onSortEnd = ({ oldIndex, newIndex }) => {
        setBannerItem(arrayMove(bannerItem, oldIndex, newIndex));
        const newArray = arrayMove(bannerItem, oldIndex, newIndex);
        async function reorderBrand() {
            const { data } = await axiosApi.post('/api/orderbanner', {
                order: newArray
            }, {
                headers: {
                    token: adminAuth.token
                }
            });
        }
        reorderBrand();
    };
    return (
        <Wrapper onActive="banners" breadcrumb={["Banners"]}>
            <div className="d-block text-right mb-3">
                <Link href="/admin/banner/add">
                    <button className="btn btn-lg c-btn-primary font16">
                        Add Banner
                    </button>
                </Link>
            </div>
            <div className="row filter-container">
                <div className="col-12 col-lg-11">
                    <div className="row">
                        <div className="col-12 col-md-5 mt-3">
                            <label className="cat-label">Banner Position</label>
                            <select defaultValue="position_home" name="bannerPosition" className="form-control"
                                onChange={(e) => bannerPostionHandler(e.target.value)}
                            >
                                <option value="">Select</option>
                                <option value="position_home">Home</option>
                                <option value="position_seller">Seller's Page</option>
                                <option value="position_category">Category Page</option>
                            </select>
                        </div>
                        {fieldCategory &&
                            <div className="col-12 col-lg-7 mt-3 position-relative">
                                <label className="cat-label">Cateogry</label>
                                <input name="bannerCategory" className="form-control normal-input-readyonly"
                                    readOnly
                                    onClick={() => setOnOpenChoosenCategory(true)}
                                    value={selectedCatText}
                                    autoComplete="off"
                                />
                                {onOpenChoosenCategory &&
                                    <div className="select-subcate-container pt-3 pr-3 pl-3 border">
                                        <ChooseCategory
                                            catLevel={2}
                                            setConfirmCategory={setConfirmCategory}
                                            handleCancel={setOnOpenChoosenCategory}
                                        />
                                    </div>
                                }
                            </div>
                        }
                        {
                            fieldSellerList &&
                            <div className="col-12 col-md-7 mt-3 ml-3 ml-sm-0">
                                <label className="cat-label">Sellers</label>
                                <Select defaultValue="" style={{ width: '100%', display: "block" }} onChange={onChangeSeller}>
                                    <Option value="">Select</Option>
                                    <OptGroup label="Own Shop">
                                        {
                                            sellers.filter(seller => seller.sellerRole === 'own').map(filteredSeller => (
                                                <Option key={filteredSeller._id} value={filteredSeller._id}>{filteredSeller.name}/{filteredSeller.username}</Option>
                                            ))
                                        }
                                    </OptGroup>
                                    <OptGroup label="Sellers">
                                        {
                                            sellers.filter(seller => seller.sellerRole === 'normal').map(filteredSeller => (
                                                <Option key={filteredSeller._id} value={filteredSeller._id}>{filteredSeller.name}/{filteredSeller.username}</Option>
                                            ))
                                        }
                                    </OptGroup>
                                </Select>
                            </div>
                        }
                    </div>
                </div>
                <div className="col-12 col-lg-1 mt-4 ml-3 ml-sm-0">
                    <button
                        onClick={filterHandler}
                        className="btn btn-lg btn-block btn-warning"
                        style={{ marginTop: '2.3rem' }}
                    >
                        Filter
                    </button>
                </div>
            </div>
            <div className="d-block mt-3">
                {(bannerItem && bannerItem.length === 0) && <div className="d-block text-center mt-5 text-muted font16">No Data</div>}
                <SortableBrandList items={bannerItem} onSortEnd={onSortEnd} />
            </div>
        </Wrapper>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/admin/banner`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                banner: data
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

export default Brands;