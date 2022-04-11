import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

import { useDispatch, useSelector } from 'react-redux';

import axios from 'axios';
import axiosApi from '../../helpers/api';

import SliderImage from 'react-zoom-slider';
import { Affix, Carousel, message, Progress } from 'antd';
import { StarFilled } from '@ant-design/icons';

import { Skeleton } from 'antd';
import { ChevronLeft } from 'react-feather';

import { useForm } from 'react-hook-form';
import ShowMore from 'react-show-more-button';

import Wrapper from '../../components/Wrapper';
import { checkProductDiscountValidity } from '../../helpers/productDiscount';
import useWindowDimensions from '../../helpers/useWindowDimensions';
import ProductStarIcon from '../../components/helpers/ProductStarIcon';
import StarFillIcon from '../../components/helpers/StarFillIcon';
import RelatedProductSlider from '../../components/helpers/RelatedProductSlider';

import { addToCart, removeOrderFromCart } from '../../redux/actions/cartAction';
import Loading from '../../components/Loading';
import moment from 'moment';

import { customImageLoader } from '../../helpers/functions';


// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
});

const ProductDetail = ({ product, pr, qty, as }) => {
    console.log(product)
    // while unauthorize user try to add product to cart
    const dispatch = useDispatch();
    useEffect(() => {
        if (pr && qty && !as) {
            dispatch(addToCart(pr, Number(qty)));
            router.replace(`/product/${product._id}/${product.slug}`);
        } else if (pr && qty && as) {
            productBuyNow(pr, Number(qty));
        }
    }, [pr, qty, as]);

    // hide mobileTabBar at mobile
    // we gonna implmente hide at HeaderMenu so hide only at small screen(576px)
    const { height, width } = useWindowDimensions();
    const [mobileTabBarStatus, setMobileTabBarStatus] = useState("");
    const [onlyMobile, setOnlyMoble] = useState(false);

    useEffect(() => {
        if (width <= 576) {
            setMobileTabBarStatus("hide");
            setOnlyMoble(true);
        } else {
            setMobileTabBarStatus("");
            setOnlyMoble(false);
        }
    }, [width])

    const [sliderImages, setSliderImages] = useState([]);
    const [firstBreadcrumb, setFirstBreadcrumb] = useState({ name: null, slug: null });
    const [secondBreadcrumb, setSecondBreadcrumb] = useState({ name: null, slug: null });
    const [thirdBreadcrumb, setThirdBreadcrumb] = useState({ name: null, slug: null });

    const [loadingSkeleton, setLoadingSkeleton] = useState(true);

    const [changeOnProduct, setChangeOnProduct] = useState({
        id: product.products[0]._id,
        quantity: product.products[0].quantity,
        sold: product.products[0].sold,
        price: product.products[0].price,
        discount: product.products[0].discount,
        promoStartDate: product.products[0].promoStartDate,
        promoEndDate: product.products[0].promoEndDate,
        finalPrice: checkProductDiscountValidity(product.products[0].promoStartDate, product.products[0].promoEndDate) === true ?
            product.products[0].finalPrice
            : product.products[0].price,
        available: product.products[0].quantity - product.products[0].sold
    });

    const [productCount, setProductCount] = useState(1);

    const [selectedProductSize, setSelectedProductSize] = useState("");

    const [itemLeftText, setItemLeftText] = useState(false);

    const [relatedProduct, setRelatedProduct] = useState([]);

    const [buyNowLoading, setBuyNowLoading] = useState(false);

    const isPromoValidate = checkProductDiscountValidity(changeOnProduct.promoStartDate, changeOnProduct.promoEndDate);

    useEffect(() => {
        let sliderImageData = [];
        product.colour[0].images.map(item => {
            const imageObj = new Object();
            imageObj['image'] = `${process.env.NEXT_PUBLIC_CUSTOM_IMAGECDN}/uploads/products/${item}`;
            imageObj['text'] = product.name;
            sliderImageData.push(imageObj);
        });
        setSliderImages(sliderImageData);


        // selected category breadcrumb
        if (product) {
            const categoryData = product.category;
            if (categoryData) {
                const firstLevelCategory = categoryData.parentId.parentId ? categoryData.parentId.parentId.name : null;
                setFirstBreadcrumb({ name: firstLevelCategory, slug: categoryData.parentId.slug });

                const secondLevelCategory = categoryData.parentId ? categoryData.parentId.name : null;
                setSecondBreadcrumb({ name: secondLevelCategory, slug: categoryData.slug });

                const thirdLevelCategory = categoryData.name;
                setThirdBreadcrumb({ name: thirdLevelCategory, slug: categoryData.slug });
            }
        }

        // skeletion
        setLoadingSkeleton(false);

    }, [product]);

    const router = useRouter();

    const { loading, cartItem, error } = useSelector(state => state.cartItems);
    const { userInfo } = useSelector(state => state.userAuth);

    const { register, handleSubmit, errors, reset, clearErrors, getValues, trigger } = useForm({
        mode: "onChange"
    });

    // related products
    useEffect(async () => {
        const { data: relProducts } = await axiosApi.post('/api/products/related', {
            productId: product._id
        });
        setRelatedProduct(relProducts);
    }, [product]);

    const outOfStockError = (productId) => {
        message.warning({
            content: (
                <div>
                    <div className="font-weight-bold">Out of stock</div>
                    Product is out of stock
                </div>
            ),
            className: 'message-warning',
        });

        // remove product from cart
        if (productId) {
            removeOrderFromCart(productId);
        }

        setTimeout(() => {
            router.push(router.asPath);
        }, 2000);
    }

    const productBuyNow = async (productId, quantity) => {
        try {
            setBuyNowLoading(true);
            //check product stock
            const { data: checkProductQty } = await axiosApi.get("api/product/cart/" + productId);
            const available = checkProductQty.products[0].quantity - checkProductQty.products[0].sold;
            if (available === 0) {
                setBuyNowLoading(false);
                outOfStockError();
            } else {
                const { data } = await axiosApi.post('/api/cart', {
                    products: { productId, productQty: quantity },
                    shipping: null,
                    shippingCharge: 0,
                    coupon: null,
                    couponDiscount: 0,
                    total: changeOnProduct.finalPrice * Number(quantity),
                    grandTotal: changeOnProduct.finalPrice * Number(quantity)
                },
                    {
                        headers: {
                            token: userInfo.token
                        }
                    }
                );
                if (data.msg === "error") {
                    router.reload();
                } else if (data.msg === "success") {
                    return router.push('/checkout');
                }
            }
        } catch (error) {
            setBuyNowLoading(false);
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

    const changeProductSize = (product, e) => {
        for (const size of document.querySelectorAll(".sizes.active")) {
            size.classList.remove("active");
        }
        e.currentTarget.classList.add("active");

        setChangeOnProduct({
            id: product._id,
            quantity: product.quantity,
            sold: product.sold,
            price: product.price,
            discount: product.discount,
            promoStartDate: product.promoStartDate,
            promoEndDate: product.promoEndDate,
            finalPrice: product.finalPrice,
            available: product.quantity - product.sold
        });

        setSelectedProductSize(product.size);
        // clear error at size
        clearErrors("size");

        // set product count to 1 if size will be change after qunaity increase/decrease
        setProductCount(1);
        // show item left text
        setItemLeftText(true)

    }

    const onQtyDecrementHandler = () => {
        // tigger validation
        trigger("size", { shouldFocus: true });

        const getSizeValue = getValues("size");

        if (productCount > 1 && getSizeValue !== '') {
            setProductCount(prevCount => prevCount - 1);
        }
    }

    const onQtyIncrementHandler = () => {
        // tigger validation
        trigger("size");
        const getSizeValue = getValues("size");

        if (changeOnProduct.available !== 0 && productCount < 6 && changeOnProduct.available !== productCount && getSizeValue !== '') {
            setProductCount(prevCount => prevCount + 1);
        }
    }

    useEffect(() => {
        if (product.products.length === 1) {
            setItemLeftText(true)
        }
    }, [product])

    const onProductAddToCart = formdata => {
        if (userInfo) {
            dispatch(addToCart(formdata.product, Number(formdata.quantity)));
        } else {
            const redirectUrl = encodeURIComponent(`/product/${product._id}/${product.slug}?pr=${formdata.product}&qty=${formdata.quantity}`)
            router.push(`/login?redirect=${redirectUrl}`);
        }

        if (error && error.message === "outofstock") {
            message.warning({
                content: (
                    <div>
                        <div className="font-weight-bold">Out of stock</div>
                        Product is out of stock
                    </div>
                ),
                className: 'message-warning',
            });

            // remove product from cart
            removeOrderFromCart(error.productId);

            setTimeout(() => {
                router.push(router.asPath);
            }, 2000);
        }
    }
    const onProductBuyNow = formdata => {
        console.log(formdata);
        if (userInfo) {
            productBuyNow(formdata.product, Number(formdata.quantity));
            // dispatch(addToCart(formdata.product, Number(formdata.quantity)));
        } else {
            const redirectUrl = encodeURIComponent(`/product/${product._id}/${product.slug}?pr=${formdata.product}&qty=${formdata.quantity}&as=buy`)
            router.push(`/login?redirect=${redirectUrl}`);
        }

    }

    //description
    const renderHTML = (rawHTML) => React.createElement("div", { dangerouslySetInnerHTML: { __html: rawHTML } });

    // rating
    const reviewProgressPercent = (rating) => {
        return (rating / product.review.length) * 100;
    }
    const reviewBaseRating = (rating) => {
        return product.review.filter(el => el.rating === rating).length;
    }

    return (
        <Wrapper mobileTabBar={mobileTabBarStatus}>
            <Head>
                <title>{product.name} | BC Digital</title>
                <meta name="description" content={`${product.name} at BC Digital`}></meta>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {onlyMobile &&
                <Affix offsetTop={70}>
                    <div className="container-fluid backNav-container border-top cp" onClick={() => router.back()}>
                        <div className="d-flex mb-2 align-items-center">
                            <ChevronLeft size={26} className="mr-3" />
                            <div className="back-navigation">
                                {product.name}
                            </div>
                        </div>
                    </div>
                </Affix>
            }
            <div className="container">
                <div className="d-block mt-3">
                    {!onlyMobile &&
                        <div className="row">
                            <ul className="breadcrumb bg-transparent">
                                {firstBreadcrumb.name ?
                                    (
                                        <>
                                            <li className="breadcrumb-item">
                                                {firstBreadcrumb.name}
                                            </li>
                                            <li className="breadcrumb-item">
                                                <Link href={`/search?q=${secondBreadcrumb.slug}&type=cat`}>
                                                    <a className="text-info">
                                                        {secondBreadcrumb.name}
                                                    </a>
                                                </Link>
                                            </li>
                                            <li className="breadcrumb-item">
                                                <Link href={`/search?q=${secondBreadcrumb.slug}&type=cat`}>
                                                    <a className="text-info">
                                                        {thirdBreadcrumb.name}
                                                    </a>
                                                </Link>
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
                                                <Link href={`/search?q=${secondBreadcrumb.slug}&type=cat`}>
                                                    <a className="text-info">
                                                        {thirdBreadcrumb.name}
                                                    </a>
                                                </Link>
                                            </li>
                                        </>
                                    )
                                }
                                <li className="breadcrumb-item text-muted">
                                    {product.name}
                                </li>
                            </ul>
                        </div>
                    }
                </div>
                <div className="col bg-white p-4">
                    <div className="row">
                        {!onlyMobile &&
                            <div className="col-4 d-none d-sm-block">
                                {sliderImages.length &&
                                    <SliderImage
                                        data={sliderImages}
                                        width="100%"
                                        height="400px"
                                        showDescription={false}
                                        direction="right"
                                    />
                                }
                            </div>
                        }
                        {onlyMobile &&
                            <div className="col-12 d-block d-sm-none position-relative mb-3">
                                <Carousel>
                                    {
                                        product.colour[0].images.map(item => (
                                            <Image key={item._id} src={`/uploads/products/${item}`} layout="responsive"
                                                width="100%"
                                                height="100%"
                                                loader={customImageLoader}
                                            />
                                        ))
                                    }
                                </Carousel>
                            </div>
                        }
                        <div className="product col-12 col-sm-8 ">
                            <Skeleton loading={loadingSkeleton} active />
                            <Skeleton loading={loadingSkeleton} active />
                            {!loadingSkeleton &&
                                <>
                                    {onlyMobile &&
                                        <div className="d-block d-sm-none">
                                            <div className="font16">{product.name}</div>
                                            <div className="col small-screen mt-1 mb-4">
                                                <div className="row align-items-baseline">
                                                    <div className="col-7">
                                                        <div className="d-flex align-items-baseline">
                                                            <div className="product-finalprice">
                                                                Rs.<span>{changeOnProduct.finalPrice}</span>
                                                            </div>
                                                            {changeOnProduct.discount || changeOnProduct.discount !== null && isPromoValidate &&
                                                                <>
                                                                    <div className="product-del ml-3">
                                                                        Rs.<span>{changeOnProduct.price}</span>
                                                                    </div>
                                                                    <div className="product-discount ml-2">
                                                                        - {changeOnProduct.discount}%
                                                                    </div>
                                                                </>
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="col-5 text-center">
                                                        <div className="product-rating text-muted">
                                                            <span className="mr-2">
                                                                <ProductStarIcon star={Math.round(product.rating)} />
                                                            </span>
                                                            {product.rating !== 0 &&
                                                                <span>({product.review.length})</span>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    <div className="d-none d-sm-block">
                                        <div className="product-name">
                                            <div className="d-block font15 font-weight-bold text-info">
                                                {product.brand ?
                                                    (
                                                        <Link href={`/brand/${product.brand._id}`} >
                                                            {product.brand.name}
                                                        </Link>
                                                    )
                                                    :
                                                    (
                                                        <span>No Brand</span>
                                                    )
                                                }
                                            </div>
                                            <h1>{product.name}</h1>
                                        </div>
                                        <div className="product-rating text-muted">
                                            <span className="mr-2">
                                                <ProductStarIcon star={Math.round(product.rating)} />
                                            </span>
                                            {
                                                product.review.length === 0 ?
                                                    'No Review'
                                                    :
                                                    product.review.length + ' reviews'
                                            }
                                        </div>
                                        <div className="product-price d-flex mb-4">
                                            <div className="mr-4 pt-2 font14">
                                                Price
                                            </div>
                                            <div>
                                                {changeOnProduct.discount !== null && changeOnProduct.discount !== 0 && isPromoValidate &&
                                                    <div className="product-del">
                                                        Rs.<span>{changeOnProduct.price}</span>
                                                    </div>
                                                }
                                                <div className="d-flex align-items-baseline">
                                                    <div className="product-finalprice">
                                                        Rs.<span>{changeOnProduct.finalPrice}</span>
                                                    </div>
                                                    {changeOnProduct.discount !== null && changeOnProduct.discount !== null && isPromoValidate &&
                                                        <div className="product-discount ml-3">
                                                            - {changeOnProduct.discount}%
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {product.colour[0].name !== undefined &&
                                        <div className="row align-item-center mb-3">
                                            <div className="col-2 col-sm-2 col-md-1 font14">
                                                Colour
                                            </div>
                                            <div className="col-10 col-sm-10 col-md-11 font16" style={{ fontWeight: '500' }}>
                                                {product.colour[0].name}
                                            </div>
                                        </div>
                                    }

                                    <form id="product-detail" onSubmit={handleSubmit(onProductAddToCart)} ref={register()}>
                                        <input type="hidden" name="product" value={changeOnProduct.id} ref={register()} readOnly />
                                        {product.products[0].size !== "nosize" &&
                                            <div className="product-size row border-top align-items-center pt-2 mb-4">
                                                <div className="col-2 col-sm-2 col-md-1 font14 mt-2">Size</div>
                                                <div className="col-10 col-sm-10 col-md-11 position-relative">
                                                    <div className="clearfix">
                                                        {product.products.map((item) => (
                                                            <>
                                                                {item.approved.status === 'approved' && item.status === 'active' &&
                                                                    <span
                                                                        key={item._id}
                                                                        onClick={(e) => changeProductSize(item, e)}
                                                                        className={`sizes ${item.quantity - item.sold === 0 && 'out'}`}
                                                                    >
                                                                        {item.size}
                                                                    </span>
                                                                }
                                                            </>
                                                        ))}
                                                    </div>
                                                    <input type="text" name="productSize"
                                                        className="hiddenAndFocus"
                                                        value={selectedProductSize}
                                                        readOnly
                                                        ref={register({
                                                            required: "Please select size."
                                                        })}
                                                    />
                                                    {errors.productSize &&
                                                        <div className="errorMsg">{errors.productSize.message}</div>
                                                    }
                                                </div>
                                            </div>
                                        }
                                        <div className="row border-top align-items-center pt-4 mb-4">
                                            <div className="col-2 col-sm-2 col-md-1">Qty</div>
                                            <div className="col-10 col-sm-10 col-md-11">
                                                <div className="product-qty">
                                                    <div className="decrement" onClick={onQtyDecrementHandler}>-</div>
                                                    <input type="number" name="quantity" className="quantity" value={productCount}
                                                        ref={register()}
                                                        readOnly
                                                    />
                                                    <div className="increment" onClick={onQtyIncrementHandler}>+</div>
                                                </div>
                                                {itemLeftText &&
                                                    <>
                                                        <div className="d-inline-flex ml-3">
                                                            {
                                                                changeOnProduct.available < 5 && changeOnProduct.available > 0 &&
                                                                <span className="text-danger">
                                                                    Hurry, only {changeOnProduct.available} item left
                                                                </span>
                                                            }
                                                        </div>

                                                        {changeOnProduct.available === 0 &&
                                                            <div className="d-inline-flex ml-3 text-danger font15">
                                                                Currently out of stock
                                                            </div>
                                                        }
                                                    </>
                                                }
                                            </div>
                                        </div>
                                        {onlyMobile &&
                                            <Affix offsetBottom={0}>
                                                <div className="addtocart-container">
                                                    <div className="row">
                                                        <div className="col-6">
                                                            <button type="button"
                                                                className={`btn btn-lg btn-block btn-primary font16 position-relative ${buyNowLoading ? 'disabled' : ''}`}
                                                                style={{ padding: '0.7rem 1rem' }}
                                                                form={"product-detail"}
                                                                onClick={handleSubmit(onProductBuyNow)}
                                                            >
                                                                {buyNowLoading ? <Loading color="#fff" style={{ padding: '1.2rem' }} /> : ('Buy Now')}
                                                            </button>
                                                        </div>
                                                        <div className="col-6">
                                                            <button type="submit"
                                                                className={`btn btn-lg btn-block btn-danger font16 position-relative ${loading ? 'disabled' : ''}`}
                                                                style={{ padding: '0.7rem 1rem' }}
                                                            >
                                                                {loading ? <Loading color="#fff" style={{ padding: '1.2rem' }} /> : ('Add To Cart')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Affix>
                                        }
                                        {!onlyMobile &&
                                            <div className="addtocart-container">
                                                <div className="row">
                                                    <div className="col-6">
                                                        <button type="button"
                                                            className={`btn btn-lg btn-block btn-primary font16 position-relative ${buyNowLoading ? 'disabled' : ''}`}
                                                            style={{ padding: '0.7rem 1rem' }}
                                                            form={"product-detail"}
                                                            onClick={handleSubmit(onProductBuyNow)}
                                                        >
                                                            {buyNowLoading ? <Loading color="#fff" style={{ padding: '1.2rem' }} /> : ('Buy Now')}
                                                        </button>
                                                    </div>
                                                    <div className="col-6">
                                                        <button type="submit"
                                                            className={`btn btn-lg btn-block btn-danger font16 position-relative ${loading ? 'disabled' : ''}`}
                                                            style={{ padding: '0.7rem 1rem' }}
                                                        >
                                                            {loading ? <Loading color="#fff" style={{ padding: '1.2rem' }} /> : ('Add To Cart')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    </form>
                                </>
                            }
                        </div>
                    </div>
                </div>
                <div className="col bg-white p-4 mt-4">
                    <div className="d-block">
                        <h2 className="font16">Key Highlights</h2>
                    </div>
                    <div className="d-block ck-content mt-1 pb-1 border-top">
                        {renderHTML(product.shortDescription)}
                    </div>
                </div>
                <div className="col bg-white p-4 mt-4">
                    <div className="d-block">
                        <h2 className="font16">Description</h2>
                    </div>
                    <div className="d-block ck-content mt-1 pb-2 border-top">

                        <ShowMore
                            maxHeight={600}
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
                {relatedProduct.length !== 0 &&
                    <div className="col bg-white p-4 mt-4">
                        <div className="d-block">
                            <h2 className="font16">You May Also Like</h2>
                        </div>
                        <div className="d-block slide mt-1 pb-2 border-top">
                            <RelatedProductSlider data={relatedProduct} />
                        </div>
                    </div>
                }
                <div className="col bg-white p-4 mt-4">
                    <div className="d-block">
                        <h2 className="font16">Rating & Review</h2>
                    </div>
                    <div className="col mt-1 pb-4 border-top border-bottom">
                        <div className="row">
                            <div className="col-12 col-sm-4 text-center mt-4">
                                <h1 style={{ fontSize: '6rem', fontWeight: 300, marginBottom: 0 }}>{product.rating}</h1>
                                <ProductStarIcon star={Math.round(product.rating) || 0} />
                                <div className="font16">1 Ratings</div>
                            </div>
                            <div className="col-12 col-sm-4 mt-4">
                                <div className="d-flex justify-content-around ">
                                    <div className="d-flex align-items-center mr-2">
                                        5
                                        <StarFillIcon classes={'star-size14'} currentColor={'#ffc854'} />
                                    </div>
                                    <Progress percent={reviewProgressPercent(reviewBaseRating(5))}
                                        showInfo={false}
                                        strokeLinecap="square"
                                        strokeColor={'#ffc854'}
                                        trailColor={'#dfe1e5'}
                                    />
                                    <div className="ml-2">
                                        {reviewBaseRating(5)}
                                    </div>
                                </div>
                                <div className="d-flex mt-1">
                                    <div className="d-flex align-items-center mr-2">
                                        4
                                        <StarFillIcon classes={'star-size14'} currentColor={'#ffc854'} />
                                    </div>
                                    <Progress percent={reviewProgressPercent(reviewBaseRating(4))}
                                        showInfo={false}
                                        strokeLinecap="square"
                                        strokeColor={'#ffc854'}
                                        trailColor={'#dfe1e5'}
                                    />
                                    <div className="ml-2">
                                        {reviewBaseRating(4)}
                                    </div>
                                </div>
                                <div className="d-flex mt-1">
                                    <div className="d-flex align-items-center mr-2">
                                        3
                                        <StarFillIcon classes={'star-size14'} currentColor={'#ffc854'} />
                                    </div>
                                    <Progress percent={reviewProgressPercent(reviewBaseRating(3))}
                                        showInfo={false}
                                        strokeLinecap="square"
                                        strokeColor={'#ffc854'}
                                        trailColor={'#dfe1e5'}
                                    />
                                    <div className="ml-2">
                                        {reviewBaseRating(3)}
                                    </div>
                                </div>
                                <div className="d-flex mt-1">
                                    <div className="d-flex align-items-center mr-2">
                                        2
                                        <StarFillIcon classes={'star-size14'} currentColor={'#ffc854'} />
                                    </div>
                                    <Progress percent={reviewProgressPercent(reviewBaseRating(2))}
                                        showInfo={false}
                                        strokeLinecap="square"
                                        strokeColor={'#ffc854'}
                                        trailColor={'#dfe1e5'}
                                    />
                                    <div className="ml-2">
                                        {reviewBaseRating(2)}
                                    </div>
                                </div>
                                <div className="d-flex mt-1">
                                    <div className="d-flex align-items-center mr-2">
                                        1
                                        <StarFillIcon classes={'star-size14'} currentColor={'#ffc854'} />
                                    </div>
                                    <Progress percent={reviewProgressPercent(reviewBaseRating(1))}
                                        showInfo={false}
                                        strokeLinecap="square"
                                        strokeColor={'#ffc854'}
                                        trailColor={'#dfe1e5'}
                                    />
                                    <div className="ml-2">
                                        {reviewBaseRating(1)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-1">
                        {product.review.map(review =>
                            <div key={review._id} className="pt-3 pb-3 pl-2 pr-2 border-bottom">
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <div className="d-block">
                                            By
                                            <strong className="ml-2">{review.postedBy.name}</strong>
                                        </div>
                                        <ProductStarIcon star={Math.round(review.rating)} />
                                    </div>
                                    <div>
                                        {moment(review.createdAt).format('DD MMM YYYY')}
                                    </div>
                                </div>
                                <div className="mt-2">
                                    {review.review}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Wrapper >
    );
}

export async function getServerSideProps(context) {
    try {

        // while unauthorize user try to add product at cart
        const urlquery = context.query;
        const pr = urlquery.pr || null;
        const qty = urlquery.qty || null;
        const as = urlquery.as || null;

        const { slug } = context.params;
        const productId = slug[0];
        const { data } = await axios.get(`${process.env.api}/api/product/${productId}`);

        return {
            props: {
                product: data,
                pr,
                qty,
                as
            }
        }
    } catch (err) {
        return {
            props: {},
        };
    }
}

export default ProductDetail;
