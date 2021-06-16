import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import axios from 'axios';

import { Checkbox, Menu, Select, Slider, Pagination, Tag, Drawer, Affix, Badge } from 'antd';
const { Option } = Select;

import { Check, Filter, Search } from 'react-feather';

import useWindowDimensions from '../helpers/useWindowDimensions';

import Wrapper from '../components/Wrapper';
import ProductCard from '../components/helpers/ProductCard';
import ProductStarIcon from '../components/helpers/ProductStarIcon';

import { storeSearchTag } from '../redux/actions/searchTagAction';

const search = ({ searchQuery, typeQuery, categoryAndBrand, total, products, maxPrice, categoryQuery, priceQuery, brandQuery }) => {
    const router = useRouter();
    const dispatch = useDispatch();

    // hide mobileTabBar at mobile
    // we gonna implmente hide at HeaderMenu so hide only at small screen(576px)
    const { height, width } = useWindowDimensions();
    const [mobileTabBarStatus, setMobileTabBarStatus] = useState("");
    const [onlyMobile, setOnlyMoble] = useState(false);

    const [sliderMinValue, setSliderMinValue] = useState(0);
    const [sliderMaxValue, setSliderMaxValue] = useState(maxPrice + 200);
    // pagination
    const [currPage, setCurrPage] = useState(1);

    // 
    const [changeCategory, setChangeCategory] = useState(null);
    const [changePrice, setChangePrice] = useState(null);
    const [changeBrands, setChangeBrands] = useState([]);
    const [changeRating, setChangeRating] = useState(null);
    const [changeSort, setChangeSort] = useState(null);
    const [changePage, setChangePage] = useState(null);

    //filter
    const [filterTags, setFilterTags] = useState([]);

    // drawer 
    const [drawerVisible, setDrawerVisible] = useState(false);

    //breadcrumb
    const [firstBreadcrumb, setFirstBreadcrumb] = useState({ name: null, slug: null });
    const [secondBreadcrumb, setSecondBreadcrumb] = useState({ name: null, slug: null });
    const [thirdBreadcrumb, setThirdBreadcrumb] = useState({ name: null, slug: null });

    useEffect(() => {
        if (width <= 576) {
            setMobileTabBarStatus("hide");
            setOnlyMoble(true);
        } else {
            setMobileTabBarStatus("");
            setOnlyMoble(false);
        }
    }, [width]);

    // check serach query at database 
    // if not exist with validate search then insert at database
    useEffect(() => {
        if (searchQuery && typeQuery === 'search') {
            setTimeout(() => {
                dispatch(storeSearchTag(searchQuery));
            }, 5000);
        }
    }, [searchQuery]);

    //breadcrumb
    useEffect(() => {
        if (typeQuery === 'cat') {
            const categoryData = products[0].category;
            if (categoryData) {
                const firstLevelCategory = categoryData.parentId.parentId ? categoryData.parentId.parentId.name : null;
                setFirstBreadcrumb({ name: firstLevelCategory, slug: categoryData.parentId.slug });

                const secondLevelCategory = categoryData.parentId ? categoryData.parentId.name : null;
                setSecondBreadcrumb({ name: secondLevelCategory, slug: categoryData.slug });

                const thirdLevelCategory = categoryData.name;
                setThirdBreadcrumb({ name: thirdLevelCategory, slug: categoryData.slug });
            }
        }
    }, [typeQuery]);

    // filter and make unique
    const key = '_id';

    const uniqueRelatedCategories = categoryAndBrand === undefined
        ? []
        : [...new Map(categoryAndBrand.map(item =>
            [item.category[key], item.category])).values()];

    const brandsWithName = categoryAndBrand.filter(item => item.brand !== null);
    const uniqueBrands = [...new Map(brandsWithName.map(item =>
        [item.brand[key], item.brand])).values()];

    // initial filter tag(if page loaded after filter applied)
    // Note: alternative ==> use of nookies(store filter tag at cookies);
    useEffect(() => {
        let allInitalFilterFromUrl = [];
        if (categoryQuery !== 'all') {
            const relatedCategoryFromUrl = uniqueRelatedCategories.find(item => item._id === categoryQuery);
            if (relatedCategoryFromUrl !== undefined) {
                allInitalFilterFromUrl.push({
                    type: 'relatedCategory',
                    id: categoryQuery,
                    tag: relatedCategoryFromUrl.name
                });
            }
        }
        if (priceQuery !== '') {
            if (priceQuery[0] !== '' && priceQuery[1] !== '') {
                const removePrevSliderValue = filterTags.filter(item => item.type !== 'priceRange');
                allInitalFilterFromUrl.push(
                    ...removePrevSliderValue,
                    {
                        type: 'priceRange',
                        id: 'priceRange_' + Math.random(),
                        tag: `Rs.${priceQuery[0]} - Rs.${priceQuery[1]}`
                    }
                );
            }
        }

        if (brandQuery !== 'all' && brandQuery !== '') {
            if (typeof (brandQuery) === 'string') {
                const brandNameFromUrl = uniqueBrands.find(item => item._id === brandQuery);
                allInitalFilterFromUrl.push({
                    type: 'brands',
                    id: brandQuery,
                    tag: brandNameFromUrl.name
                })
            } else {
                let initialBrands = [];
                brandQuery.map(brand => {
                    const brandObj = new Object();
                    const brandNameFromUrl = uniqueBrands.find(item => item._id === brand);
                    brandObj['type'] = 'brands';
                    brandObj['id'] = brand;
                    brandObj['tag'] = brandNameFromUrl.name;
                    initialBrands.push(brandObj);
                });
                const initialFilterWithBrand = [...allInitalFilterFromUrl, ...initialBrands];
                allInitalFilterFromUrl = initialFilterWithBrand;
            }
        }
        setFilterTags(allInitalFilterFromUrl);
    }, []);

    // update slider value on new search
    useEffect(() => {
        if (maxPrice) {
            setSliderMinValue(
                router.query.price !== '' && router.query.price !== undefined
                    ? router.query.price[0] !== ''
                        ? router.query.price[0]
                        : 0
                    : 0
            )
            setSliderMaxValue(
                router.query.price !== '' && router.query.price !== undefined
                    ? router.query.price[1] !== ''
                        ? router.query.price[1]
                        : maxPrice + 200
                    : maxPrice + 200
            )
        }
    }, [maxPrice]);

    // update current page if url doesnt have page parameter
    useEffect(() => {
        const currentPageFromQuery = router.query.page;
        if (currentPageFromQuery === undefined) {
            setCurrPage(1);
        }
    }, [searchQuery]);


    useEffect(() => {
        if (changeCategory !== null) {
            router.query.category = changeCategory;
            router.push(router);
        }
        if (changePrice !== null) {
            router.query.price = changePrice;
            router.push(router);
        }
        if (changeBrands.length !== 0) {
            router.query.brand = changeBrands;
            router.push(router);
        }

        if (changeSort !== null) {
            router.query.sort = changeSort;
            router.push(router);
        }

        if (changePage !== null) {
            router.query.page = changePage;
            router.replace(router);
        }

    }, [changeCategory, changePrice, changeBrands, changeRating, changeSort, changePage]);

    // handlers to change search parameters
    const handleCategoryClick = useCallback(catId => {
        // set page to 1 on sort change
        setCurrPage(1);
        setChangePage(1);

        setChangeCategory(catId);
    });

    const sliderAfterChange = useCallback((value) => {
        setChangePrice(value);
        const removePrevSliderValue = filterTags.filter(item => item.type !== 'priceRange');
        setFilterTags([
            ...removePrevSliderValue,
            {
                type: 'priceRange',
                id: 'priceRange_' + Math.random(),
                tag: `Rs.${value[0]} - Rs.${value[1]}`
            }
        ]);
    });

    const sliderOnChange = useCallback((value) => {
        // set page to 1 on sort change
        setCurrPage(1);
        setChangePage(1);

        setSliderMinValue(value[0])
        setSliderMaxValue(value[1])
    });

    const handleRatingClick = useCallback(rating => {
        setChangeRating(rating);
    })

    const handleSortChange = useCallback(value => {
        setChangeSort(value);

        // set page to 1 on sort change
        setCurrPage(1);
        setChangePage(1);
    });

    const handlePageChange = useCallback(value => {
        setCurrPage(value);

        // problem: useEffect not called on changePage 
        router.query.page = value;
        router.replace(router);
    });

    const replaceUrlForAtNull = (type) => {
        if (type === 'brands') {
            router.query.brand = undefined;
            router.replace(router);
        }

        if (type === 'relatedCategory') {
            router.query.category = undefined;
            router.replace(router);
        }
        if (type === 'priceRange') {
            router.query.price = undefined;
            router.replace(router);
        }
    }

    const clearFilter = (type, id) => {
        // set page to 1 on sort change
        setCurrPage(1);
        setChangePage(1);

        if (type === 'brands') {

            // clear filter tags to prevent same two tags
            const clearTagByFilter = filterTags.filter(brand => brand.id !== id);
            setFilterTags(clearTagByFilter);

            // brands can be multiple so we just need to pass id only
            const idOfBrandToPushAtUrl = clearTagByFilter.filter(item => item.type === 'brands').map(i => i.id);
            if (idOfBrandToPushAtUrl.length === 0) replaceUrlForAtNull('brands');
            setChangeBrands(idOfBrandToPushAtUrl);
        }

        //clear related category's tag
        if (type === 'relatedCategory') {
            // update state without relatedCategory coz there is only one relatedCategory for filter
            const clearRelatedTagFromFilterTag = filterTags.filter(item => item.type !== 'relatedCategory');
            setFilterTags(clearRelatedTagFromFilterTag);
            replaceUrlForAtNull('relatedCategory');
        }

        if (type === 'priceRange') {
            const clearPriceRange = filterTags.filter(item => item.type !== 'priceRange');
            setFilterTags(clearPriceRange);
            setSliderMinValue(0)
            setSliderMaxValue(maxPrice + 200);
            replaceUrlForAtNull('priceRange');
        }
    }

    const clearAllFilterHandler = () => {
        setFilterTags([]);
        setSliderMinValue(0)
        setSliderMaxValue(maxPrice + 200)

        router.push('/search?q=' + searchQuery);
        if (typeof window !== "undefined") {
            location.href = '/search?q=' + searchQuery + '&type=' + typeQuery;
        }
    }
    const filterSection = (screen) => (
        <div className={`d-block bg-white ${screen === 'large' ? typeQuery !== 'cat' ? 'mt-4' : '' : ''}`}>
            <div className={`d-block filter-tags  ${screen === 'large' ? 'large pb-3 p-4' : 'small pb-3 p-1'} `}>
                <div className="d-flex justify-content-between">
                    {screen === 'large' &&
                        <>
                            <h3>Filters</h3>
                            {filterTags.length !== 0 &&
                                <div className="text-primary font13 cp" onClick={clearAllFilterHandler}>CLEAR ALL</div>
                            }
                        </>
                    }
                </div>
                <div className="d-block">
                    {filterTags.map(filter => (
                        <Tag key={filter.id} closable={true}
                            onClose={(e) => clearFilter(filter.type, filter.id)}
                            className="tags mt-3"
                        >
                            {filter.tag}
                        </Tag>
                    )
                    )}
                </div>
            </div>
            <Menu mode="inline" defaultOpenKeys={['category', 'slider', 'brand', 'rating']}>
                {uniqueRelatedCategories.length !== 0 && screen === 'large' &&
                    <Menu.SubMenu key="category" title={<span className='filter-titile'>Related Categories</span>}>
                        <div className="d-block mt-2 mb-3">
                            {uniqueRelatedCategories && uniqueRelatedCategories.map(cat => (
                                <div key={cat._id}
                                    className="related-category"
                                    onClick={() => {
                                        handleCategoryClick(cat._id);
                                        // there is only one related category to filter tag
                                        const removePrevRelatedTag = filterTags.filter(item => item.type !== 'relatedCategory');
                                        setFilterTags([
                                            ...removePrevRelatedTag,
                                            {
                                                type: 'relatedCategory',
                                                id: cat._id,
                                                tag: cat.name
                                            }
                                        ]);
                                    }
                                    }
                                >
                                    {cat.name}
                                </div>
                            ))
                            }
                        </div>
                    </Menu.SubMenu>
                }
                <Menu.SubMenu key="slider" title={<span className='filter-titile'>Price</span>}>
                    <div className="pt-3 pb-3">
                        <Slider className="ml-4 mr-4 mt-2 mb-2"
                            range
                            tipFormatter={v => `Rs.${v}`}
                            max={maxPrice + 200}
                            value={[sliderMinValue, sliderMaxValue]}
                            onChange={sliderOnChange}
                            onAfterChange={sliderAfterChange}
                        />
                    </div>
                </Menu.SubMenu>
                {uniqueBrands.length !== 0 &&
                    <Menu.SubMenu key="brand" title={<span className='filter-titile'>Brands</span>}>
                        <div className="d-block mt-2 mb-3">
                            {uniqueBrands && uniqueBrands.map(brand => (
                                <>
                                    <Checkbox key={brand._id}
                                        checked={brandQuery.includes(brand._id) === true ? true : false}
                                        name="category"
                                        className="d-block pl-4 pt-2 pb-2"
                                        onChange={(e) => {
                                            // handleBrandChange(e)
                                            if (e.target.checked) {
                                                setChangeBrands([...changeBrands, brand._id]);
                                                setFilterTags([
                                                    ...filterTags,
                                                    {
                                                        type: 'brands',
                                                        id: brand._id,
                                                        tag: brand.name
                                                    }
                                                ])
                                            } else {
                                                clearFilter('brands', brand._id)
                                            }
                                        }
                                        }
                                    >
                                        {brand.name}
                                    </Checkbox>
                                    <br />
                                </>
                            ))
                            }
                        </div>
                    </Menu.SubMenu>
                }
                <Menu.SubMenu key="rating" title={<span className='filter-titile'>Rating</span>}>
                    <div className="d-block mt-2 mb-3">
                        <div className="d-block pl-4 pt-3 pb-2 cp" onClick={() => handleRatingClick(5)}>
                            <ProductStarIcon star={5} />
                        </div>
                        <div className="d-block pl-4 pt-2 pb-2 cp" onClick={() => handleRatingClick(4)}>
                            <ProductStarIcon star={4} />
                        </div>
                        <div className="d-block pl-4 pt-2 pb-2 cp" onClick={() => handleRatingClick(3)}>
                            <ProductStarIcon star={3} />
                        </div>
                        <div className="d-block pl-4 pt-2 pb-2 cp" onClick={() => handleRatingClick(2)}>
                            <ProductStarIcon star={2} />
                        </div>
                        <div className="d-block pl-4 pt-2 pb-2 cp" onClick={() => handleRatingClick(1)}>
                            <ProductStarIcon star={1} />
                        </div>
                    </div>
                </Menu.SubMenu>
            </Menu>
        </div >
    )
    const onDrawerClose = () => {
        setDrawerVisible(false);
    }
    return (
        <Wrapper mobileTabBar={mobileTabBarStatus}>
            <Head>
                <title>{searchQuery}-Buy Online Product At Best Price In Nepal | BC Digital</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Drawer
                title="Filter"
                placement="right"
                onClose={onDrawerClose}
                visible={drawerVisible}
                bodyStyle={{
                    padding: '0.5rem'
                }}
                footer={
                    <div
                        style={{
                            textAlign: 'right',
                        }}
                    >
                        <button
                            onClick={() => {
                                setDrawerVisible(false);
                                clearAllFilterHandler();
                            }
                            }
                            className="btn btn-lg btn-light" style={{ marginRight: 8 }}
                        >
                            Reset
                      </button>
                        <button onClick={() => setDrawerVisible(false)} className="btn btn-lg btn-danger">
                            Apply
                      </button>
                    </div>
                }
            >
                {filterSection('small')}
            </Drawer>
            <div className="container">
                <div className="row">
                    {!onlyMobile && typeQuery === 'cat' &&
                        <ul className="breadcrumb bg-transparent mt-3">
                            {firstBreadcrumb.name ?
                                (
                                    <>
                                        <li className="breadcrumb-item">
                                            {firstBreadcrumb.name}
                                        </li>
                                        <li className="breadcrumb-item">
                                            <Link href={`cat/${secondBreadcrumb.slug}`}>
                                                <a className="text-info">
                                                    {secondBreadcrumb.name}
                                                </a>
                                            </Link>
                                        </li>
                                        <li className="breadcrumb-item">
                                            {thirdBreadcrumb.name}
                                        </li>
                                    </>
                                )
                                :
                                (
                                    <>
                                        <li className="breadcrumb-item">
                                            {secondBreadcrumb.name}
                                        </li>
                                        <li className="breadcrumb-item">
                                            {thirdBreadcrumb.name}
                                        </li>
                                    </>
                                )
                            }
                        </ul>
                    }
                    <div className="col-sm-3 d-none d-sm-block">
                        {filterSection('large')}
                    </div>
                    <div className="col-12 col-sm-9">
                        {!onlyMobile &&
                            <div className={`d-block bg-white align-items-center p-3 ${typeQuery !== 'cat' && 'mt-4'}`}>
                                <div className="row">
                                    <div className="col-6 font14" style={{ paddingTop: '0.7rem' }}>
                                        {total} Product Found
                                </div>
                                    <div className="col-6 text-right">
                                        <Select
                                            defaultValue={
                                                router.query.sort !== '' && router.query.sort !== undefined
                                                    ? router.query.sort
                                                    :
                                                    'best'
                                            }
                                            className="text-left"
                                            style={{ width: 200 }}
                                            onChange={handleSortChange}
                                        >
                                            <Option value="best">Recommended</Option>
                                            <Option value="sold">Best Selling</Option>
                                            <Option value="newest">Newest</Option>
                                            <Option value="price">Price(Low to High)</Option>
                                            <Option value="dprice">Price(High to Low)</Option>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        }
                        {onlyMobile &&
                            <Affix offsetTop={70}>
                                <div className="row bg-white backNav-container border-top p-2">
                                    <div className="d-flex justify-content-between">
                                        <Select
                                            defaultValue={
                                                router.query.category !== '' && router.query.category !== undefined
                                                    ? router.query.category
                                                    :
                                                    'all'
                                            }
                                            className="text-left"
                                            style={{ width: 150 }}
                                            onSelect={(LabeledValue, option) => {
                                                if (LabeledValue !== 'all') {
                                                    handleCategoryClick(LabeledValue);
                                                    // there is only one related category to filter tag
                                                    const removePrevRelatedTag = filterTags.filter(item => item.type !== 'relatedCategory');
                                                    setFilterTags([
                                                        ...removePrevRelatedTag,
                                                        {
                                                            type: 'relatedCategory',
                                                            id: LabeledValue,
                                                            tag: option.children
                                                        }
                                                    ]);
                                                } else {
                                                    clearFilter('relatedCategory', '')
                                                }
                                            }
                                            }
                                            autoClearSearchValue="Category"
                                            bordered={false}
                                            dropdownClassName="mobile-filter-dropdown"
                                            menuItemSelectedIcon={<Check color={'#f33535'} />}
                                        >
                                            <Option value="all">All Categories</Option>
                                            {uniqueRelatedCategories && uniqueRelatedCategories.map(cat => (
                                                <Option value={cat._id}>{cat.name}</Option>
                                            ))
                                            }
                                        </Select>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <Select
                                                defaultValue={
                                                    router.query.sort !== '' && router.query.sort !== undefined
                                                        ? router.query.sort
                                                        :
                                                        'best'
                                                }
                                                className="text-left"
                                                style={{ width: 150 }}
                                                onChange={handleSortChange}
                                                bordered={false}
                                                dropdownClassName="mobile-filter-dropdown"
                                                menuItemSelectedIcon={<Check color={'#f33535'} />}
                                            >
                                                <Option value="best">Recommended</Option>
                                                <Option value="sold">Best Selling</Option>
                                                <Option value="newest">Newest</Option>
                                                <Option value="price">Price(Low to High)</Option>
                                                <Option value="dprice">Price(High to Low)</Option>
                                            </Select>
                                            <div>
                                                <Badge dot={filterTags.length !== 0 ? true : false}>
                                                    <Filter className="cp" onClick={() => setDrawerVisible(true)} />
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Affix>
                        }
                        {products.length !== 0 ?
                            (
                                <>
                                    <div className="row mt-2">
                                        {products.map(product => (
                                            <div key={product._id} className="col-6 col-sm-4 col-md-3 search-item-list mt-4">
                                                <ProductCard data={product} />
                                            </div>
                                        ))}
                                    </div>
                                    {total !== 0 &&
                                        <div className="col text-right mt-5">
                                            <Pagination
                                                current={currPage}
                                                total={total}
                                                responsive
                                                defaultPageSize={24}
                                                onChange={handlePageChange}
                                            />
                                        </div>
                                    }
                                </>
                            )
                            :
                            (
                                <div className="row mt-5 mb-5 text-center">
                                    <Search size={80} className="text-muted mt-5" />
                                    <div className="mt-2" style={{ fontSize: '1.8rem' }}>No Match Products</div>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </Wrapper >
    );
}
export async function getServerSideProps({ query }) {
    try {
        const { q: searchQuery } = query;
        const type = query.type || '';
        const price = query.price || '';
        const rating = query.rating || '';
        const sort = query.sort || 'best';
        const page = query.page || 1;
        const category = query.category || 'all';
        const brand = query.brand || 'all';
        const { data: results } = await axios.post(`${process.env.api}/api/product/search`, {
            query: searchQuery,
            type,
            category,
            price,
            brand,
            page,
            sort,
            rating
        });
        return {
            props: {
                searchQuery,
                typeQuery: type,
                total: results.total,
                products: results.products,
                categoryAndBrand: results.categoryAndBrand,
                maxPrice: results.maxPrice,
                categoryQuery: category,
                priceQuery: price,
                brandQuery: brand
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/nomatch?q=' + query.q,
                destination: '/nomatch?q=' + query.q,
                permanent: false,
            },
        }
    }
}

export default search;