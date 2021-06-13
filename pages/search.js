import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import axios from 'axios';

import { Checkbox, Menu, Select, Slider, Pagination, Tag } from 'antd';
const { Option } = Select;

import useWindowDimensions from '../helpers/useWindowDimensions';

import Wrapper from '../components/Wrapper';
import ProductCard from '../components/helpers/ProductCard';

import { storeSearchTag } from '../redux/actions/searchTagAction';
import ProductStarIcon from '../components/helpers/ProductStarIcon';

const search = ({ searchQuery, categoryAndBrand, total, products, maxPrice }) => {
    const router = useRouter();
    const dispatch = useDispatch();

    // hide mobileTabBar at mobile
    // we gonna implmente hide at HeaderMenu so hide only at small screen(576px)
    const { height, width } = useWindowDimensions();
    const [mobileTabBarStatus, setMobileTabBarStatus] = useState("");
    const [onlyMobile, setOnlyMoble] = useState(false);

    const [sliderMinValue, setSliderMinValue] = useState(0);
    const [sliderMaxValue, setSliderMaxValue] = useState(maxPrice + 100);
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
        if (searchQuery) {
            setTimeout(() => {
                dispatch(storeSearchTag(searchQuery));
            }, 5000);
        }
    }, [searchQuery]);

    // update slider value on new search
    useEffect(() => {
        if (maxPrice) {
            setSliderMinValue(0)
            setSliderMaxValue(maxPrice + 100)
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

    // filter and make unique
    const key = '_id';

    const uniqueRelatedCategories = [...new Map(categoryAndBrand.map(item =>
        [item.category[key], item.category])).values()];

    const brandsWithName = categoryAndBrand.filter(item => item.brand !== null);
    const uniqueBrands = [...new Map(brandsWithName.map(item =>
        [item.brand[key], item.brand])).values()];

    // handlers to change search parameters
    const handleCategoryClick = catId => {
        // set page to 1 on sort change
        setCurrPage(1);
        setChangePage(1);

        setChangeCategory(catId);
    }

    const replaceUrlForBand = (brandLength, brands) => {
        if (brandLength === 0) {
            router.query.brand = null;
            router.replace(router);
        } else {
            router.query.brand = brands;
            router.replace(router);

        }
    }

    const handleBrandChange = useCallback(event => {
        // set page to 1 on sort change
        setCurrPage(1);
        setChangePage(1);

        let brandList = changeBrands;
        const brandChecked = event.target.checked;
        const checkedValue = event.target.value;
        if (brandChecked) {
            setChangeBrands([...changeBrands, checkedValue]);
        } else {
            var indexOfBrand = brandList.indexOf(checkedValue);
            if (indexOfBrand > -1) {
                brandList.splice(indexOfBrand, 1);
                setChangeBrands(brandList);
                //problem: useEffect not fire while uncheck input
                replaceUrlForBand(brandList.length, brandList);
            }
        }
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

    const clearFilter = (type, id) => {
        // set page to 1 on sort change
        setCurrPage(1);
        setChangePage(1);

        if (type === 'brands') {

            // clear filter tags to prevent same two tags
            const clearTagByFilter = filterTags.filter(brand => brand.id !== id);
            setFilterTags(clearTagByFilter)

            //update state and replace url
            let brandList = changeBrands;
            var indexOfBrand = brandList.indexOf(id);
            if (indexOfBrand > -1) {
                brandList.splice(indexOfBrand, 1);
                setChangeBrands(brandList);

                //problem: useEffect not fire while uncheck input
                replaceUrlForBand(brandList.length, brandList);

            }
        }

        //clear related category's tag
        if (type === 'relatedCategory') {
            // update state without relatedCategory coz there is only one relatedCategory for filter
            const clearRelatedTag = filterTags.filter(item => item.type !== 'relatedCategory');
            setFilterTags(clearRelatedTag);
            setChangeCategory(clearRelatedTag)
        }

        if (type === 'priceRange') {
            const clearPriceRange = filterTags.filter(item => item.type !== 'priceRange');
            setChangePrice(clearPriceRange);
            setSliderMinValue(0)
            setSliderMaxValue(maxPrice + 100)
        }
    }

    const clearAllFilterHandler = () => {
        setFilterTags([]);
        setSliderMinValue(0)
        setSliderMaxValue(maxPrice + 100)

        router.push('/search?q=' + searchQuery);
        location.href = '/search?q=' + searchQuery;
    }
    return (
        <Wrapper mobileTabBar={mobileTabBarStatus}>
            <Head>
                <title>{searchQuery}-Buy Online Product At Best Price In Nepal | BC Digital</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="container">
                <div className="row">
                    <div className="col-sm-3 d-none d-sm-block">
                        <div className="d-block bg-white mt-4">
                            <div className="d-block filter-tags pb-3 p-4">
                                <div className="d-flex justify-content-between">
                                    <h3>Filters</h3>
                                    {filterTags.length !== 0 &&
                                        <div className="text-primary font13 cp" onClick={clearAllFilterHandler}>CLEAR ALL</div>
                                    }
                                </div>
                                <div className="d-block">
                                    {filterTags.map(filter => (
                                        <Tag key={filter.id} closable={true}
                                            onClose={(e) => clearFilter(filter.type, filter.id)}
                                            className="mt-3"
                                        >
                                            {filter.tag}
                                        </Tag>
                                    )
                                    )}
                                </div>
                            </div>
                            <Menu mode="inline" defaultOpenKeys={['category', 'slider', 'brand', 'rating']}>
                                {uniqueRelatedCategories.length !== 0 &&
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
                                            max={maxPrice + 100}
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
                                                    <Checkbox key={brand._id} name="category" className="d-block pl-4 pt-2 pb-2"
                                                        value={brand._id}
                                                        onChange={(e) => {
                                                            handleBrandChange(e)
                                                            if (e.target.checked) {
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
                        </div>
                    </div>
                    <div className="col-12 col-sm-9">
                        <div className="d-block bg-white align-items-center p-3 mt-4">
                            <div className="row">
                                <div className="col-6 font14" style={{ paddingTop: '0.7rem' }}>
                                    {total} Product Found
                                </div>
                                <div className="col-6 text-right">
                                    <Select defaultValue="best" className="text-left" style={{ width: 200 }} onChange={handleSortChange}>
                                        <Option value="best">Recommended</Option>
                                        <Option value="sold">Best Selling</Option>
                                        <Option value="newest">Newest</Option>
                                        <Option value="price">Price(Low to High)</Option>
                                        <Option value="dprice">Price(High to Low)</Option>
                                    </Select>
                                </div>
                            </div>
                        </div>
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
                    </div>
                </div>
            </div>
        </Wrapper >
    );
}
export async function getServerSideProps({ query }) {
    try {
        const { q: searchQuery } = query;
        const price = query.price || '';
        const rating = query.rating || '';
        const sort = query.sort || 'best';
        const page = query.page || 1;
        const category = query.category || 'all';
        const brand = query.brand || 'all';
        const { data: results } = await axios.post(`${process.env.api}/api/product/search`, {
            query: searchQuery,
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
                total: results.total,
                products: results.products,
                categoryAndBrand: results.categoryAndBrand,
                maxPrice: results.maxPrice
            }
        }
    } catch (err) {
        return {
            props: {},
        };
    }
}

export default search;