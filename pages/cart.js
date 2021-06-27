import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import moment from 'moment';

import axios from 'axios';
import axiosApi from '../helpers/api';

import { Select, Collapse, message, Radio, Affix, Popover } from 'antd';
const { Option } = Select;
const { Panel } = Collapse;

import { Trash2 } from 'react-feather';

import useWindowDimensions from '../helpers/useWindowDimensions';
import { addToCart, removeOrderFromCart } from '../redux/actions/cartAction';

import Wrapper from '../components/Wrapper';
import Loading from '../components/Loading';

// config antdesign message
message.config({
    top: '25vh',
    maxCount: 1,
    duration: 4,
});

const cart = ({ parseCartItems, cartProducts, shippingPlans }) => {
    const [combinedCartItems, setCombinedCartItems] = useState([]);
    const [grandTotal, setGrandTotal] = useState(0);
    const [outOfStockError, setOutOfStockError] = useState([]);

    // hide mobileTabBar at mobile
    // we gonna implmente hide at HeaderMenu so hide only at small screen(576px)
    const { height, width } = useWindowDimensions();
    const [mobileTabBarStatus, setMobileTabBarStatus] = useState("");
    const [onlyMobile, setOnlyMoble] = useState(false);

    // shipping
    const [shippingCharge, setShippingCharge] = useState(0);
    const [shippingId, setShippingId] = useState(null);
    const [packagesForCustomer, setPackagesForCustomer] = useState(1);


    //coupon
    const [coupon, setCoupon] = useState('');
    const [validCoupon, setValidCoupon] = useState('');
    const [couponError, setCouponError] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);

    const [checkoutLoading, setCheckoutLoading] = useState(false);

    useEffect(() => {
        if (width <= 768) {
            setMobileTabBarStatus("hide");
            setOnlyMoble(true);
        } else {
            setMobileTabBarStatus("");
            setOnlyMoble(false);
        }
    }, [width]);

    const { cartItem } = useSelector(state => state.cartItems);
    const { userInfo } = useSelector(state => state.userAuth);

    useEffect(() => {
        if (cartItem) {
            const combineProductWithCartItems = cartProducts.map(item => ({
                ...item,
                ...cartItem.find(ele => ele.productId === item.products[0]._id),
            }));
            setCombinedCartItems(combineProductWithCartItems);

            // check out of stock products
            const outOfStockCartProduct = combineProductWithCartItems.find(item => item.products[0].quantity === item.products[0].sold);
            if (outOfStockCartProduct) {
                setOutOfStockError(true);
            } else {
                setOutOfStockError(false);
            }
        }
    }, [cartItem, cartProducts, shippingCharge]);

    useEffect(() => {
        if (combinedCartItems) {
            // for total number of package to ship to customer
            const uniqueSellerForPackage = [...new Map(combinedCartItems.map(item =>
                [item.createdBy['_id'], item.createdBy])).values()];

            const packages = uniqueSellerForPackage.length === 0 ? 1 : uniqueSellerForPackage.length;
            setPackagesForCustomer(packages);

            const cartTotalAfterCombine = combinedCartItems.reduce((a, c) => (a + c.productQty * c.products[0].finalPrice), 0);

            if (shippingPlans.plans.length !== 0) {
                setShippingCharge(Number(shippingPlans.plans[0].amount) * Number(packages));
                setShippingId(shippingPlans.plans[0]._id);

                // set grand Total
                setGrandTotal(Number(cartTotalAfterCombine) + (Number(shippingPlans.plans[0].amount) * Number(packages)) - Number(couponDiscount));
            } else {
                setShippingCharge(0);
                setShippingId(null);

                // set grand Total
                setGrandTotal(cartTotalAfterCombine - Number(couponDiscount));
            }
        }
    }, [shippingPlans, combinedCartItems]);

    const cartTotal = combinedCartItems.reduce((a, c) => (a + c.productQty * c.products[0].finalPrice), 0);

    const dispatch = useDispatch();
    const router = useRouter();

    const checkoutHandler = async () => {
        if (outOfStockError) {
            message.error({
                content: (
                    <div>
                        <div className="font-weight-bold">Notice</div>
                        Some product(s) are out of stock. Please remove those product(s) from cart
                    </div>
                ),
                className: 'message-error',
            });
        } else {
            setCheckoutLoading(true);
            try {
                const { data } = await axiosApi.post('/api/cart', {
                    products: cartItem,
                    total: cartTotal,
                    shipping: shippingId,
                    shippingCharge,
                    coupon: validCoupon === '' ? null : validCoupon,
                    couponDiscount,
                    grandTotal
                },
                    {
                        headers: {
                            token: userInfo.token
                        }
                    }
                );
                if (data.msg === "error") {
                    setCheckoutLoading(false);
                    router.reload();
                } else if (data.msg === "success") {
                    setCheckoutLoading(false);
                    router.push('/checkout');
                }
            } catch (error) {
                setCheckoutLoading(false);
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

    const removeFromCartHandler = (productId) => {
        document.querySelector('.item_' + productId).style.display = "none"
        dispatch(removeOrderFromCart(productId));
        router.push(router.asPath);
    }

    const cartQtyChangeHandler = (productId, value) => {
        dispatch(addToCart(productId, Number(value)));
        router.push(router.asPath);
    }

    const selectAvailableProduct = (product, qty) => {
        const rawAvailableProducts = product.quantity - product.sold;
        const availableProducts = rawAvailableProducts > 6 ? 6 : rawAvailableProducts;
        return (
            availableProducts !== 0 ?
                <Popover
                    placement={onlyMobile ? 'right' : 'top'}
                    trigger="click"
                    visible={rawAvailableProducts < qty ? true : false}
                    title="Quantity Changed !!!"
                    content={
                        <div>
                            Quantity of this product has been change from {qty} to {availableProducts}
                        </div>
                    }
                >
                    <Select
                        autoFocus={rawAvailableProducts < qty ? true : false}
                        defaultValue={rawAvailableProducts < qty ? availableProducts : qty}
                        onChange={(value) => cartQtyChangeHandler(product._id, value)}
                        onFocus={() =>
                            rawAvailableProducts < qty
                                ?
                                setTimeout(() => {
                                    cartQtyChangeHandler(product._id, rawAvailableProducts < qty ? availableProducts : qty)
                                }, 5000)
                                : ''
                        }
                        style={{ width: '100%' }}
                    >
                        {
                            [...Array(availableProducts).keys()].map(x => (
                                <Option value={x + 1}>{x + 1}</Option>
                            ))
                        }
                    </Select>
                </Popover >
                :
                <div className="text-danger font font-weight-bold">Out of Stock</div>
        )
    }

    const onDeliveryChange = e => {
        if (e.target.checked) {
            setShippingCharge(Number(e.target.amount) * Number(packagesForCustomer));
            setShippingId(e.target.value);

            // set grand total
            setGrandTotal(Number(cartTotal) + (Number(e.target.amount) * Number(packagesForCustomer)) - Number(couponDiscount));
        } else {
            setShippingCharge(0);
            setShippingId(null);

            // set grand Total
            setGrandTotal(cartTotal - Number(couponDiscount));
        }
    }

    const applyCouponHanlder = async () => {
        setCouponError('');
        try {
            const { data } = await axiosApi.post("/api/apply/coupon", { coupon, cartTotal },
                {
                    headers:
                    {
                        token: userInfo.token
                    }
                }
            );
            if (data) {
                if (data.msg) {
                    setCouponError(data.msg);
                } else {
                    setValidCoupon(data._id);
                    const discountType = data.discountType;

                    const couponDiscountAmount = discountType === 'flat'
                        ? Math.round(data.discountAmount)
                        : Math.round((cartTotal * data.discountAmount) / 100);
                    setCouponDiscount(couponDiscountAmount);

                    const totalAferCouponDiscount = cartTotal + (Number(shippingCharge) * Number(packagesForCustomer)) - couponDiscountAmount;
                    setGrandTotal(totalAferCouponDiscount);
                }
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

    const removeCouponHanlder = () => {
        setCoupon('');
        setCouponError('');
        setValidCoupon('');
        setCouponDiscount(0);

        // set grand total(coupon discount = 0: so need to sub)
        setGrandTotal(Number(cartTotal) + + (Number(shippingCharge) * Number(packagesForCustomer)));
    }

    const summerySection = () => (
        <div className="summery bg-white p-4">
            <h3>SUMMERY</h3>
            <div className="clearfix mt-5">
                <div className="d-flex justify-content-between">
                    <span>Product Total</span>
                    <span>Rs.{combinedCartItems.reduce((a, c) => (a + c.productQty * c.products[0].finalPrice), 0)}</span>
                </div>
                {shippingCharge !== 0 &&
                    <div className="d-flex justify-content-between mt-3 pt-4 border-top border-gray align-items-center">
                        <span>Shipping Charge</span>
                        <span>Rs.{shippingCharge}</span>
                    </div>
                }
                {couponDiscount !== 0 &&
                    <div className="d-flex justify-content-between mt-3 pt-4 border-top border-gray align-items-center">
                        <span>Coupon Discount</span>
                        <span>Rs.{couponDiscount}</span>
                    </div>
                }
                <div className="d-flex justify-content-between mt-4 pt-3 border-top border-gray align-items-center">
                    <span className="font-weight-bold">Total</span>
                    <span className="grandtotal font-weight-normal" style={{ fontSize: '2.0rem' }}>Rs.{grandTotal}</span>
                </div>
                <div className="d-block mt-5">
                    <button onClick={checkoutHandler} className={`btn btn-danger btn-block btn-lg position-relative ${checkoutLoading ? 'disabled' : ''}`} style={{ fontSize: '2.0rem' }}>
                        {checkoutLoading ? <Loading color="#fff" style={{ padding: '1.5rem' }} /> : ('Proceed to Checkout')}
                    </button>
                </div>
            </div>
        </div>
    )

    return (

        <Wrapper mobileTabBar={mobileTabBarStatus}>
            <div className="container">
                {combinedCartItems.length === 0 ? (
                    <div className="container mt-5" style={{ minHeight: '25vh' }}>
                        <div className="text-center mt-5">
                            <h2 className="text-muted">Cart is Empty</h2>
                        </div>
                        <div className="text-center mt-5">
                            <Link href="/">
                                <button type="button" className="btn c-btn-primary">Start Shopping</button>
                            </Link>
                        </div>
                    </div>
                ) :
                    <div className="row">
                        <div className="col-sm-12 col-md-8 mt-5">
                            <div className="d-block bg-white">
                                <div className="title border-bottom d-flex justify-content-between p-3 pl-4">
                                    <h3>CART ({combinedCartItems.reduce((a, c) => a + c.productQty, 0)})</h3>
                                    {shippingCharge !== 0 &&
                                        <div className="">Delivery Charge: Rs.{shippingCharge}</div>
                                    }
                                </div>
                                {!onlyMobile &&
                                    <div className="col-12">
                                        <ul className="list-unstyled">
                                            {
                                                combinedCartItems.map(item => (
                                                    <li key={item.products[0]._id} className={`cart-item item_${item.products[0]._id}`}>
                                                        <div className="row">
                                                            <div className="col-8">
                                                                <div className="d-flex">
                                                                    <Link href={`/product/${item._id}/${item.slug}`}>
                                                                        <a className="cp">
                                                                            <Image src={`/uploads/products/${item.colour[0].images[0]}`}
                                                                                layout="fixed"
                                                                                width="120"
                                                                                height="120"
                                                                                objectFit="cover"
                                                                                objectPosition="top center"
                                                                                quality="100"
                                                                            />
                                                                        </a>
                                                                    </Link>
                                                                    <div className="product-detail ml-3">
                                                                        <div className="product-name">{item.name}</div>
                                                                        <div className="mt-1">
                                                                            {item.colour[0].name}
                                                                            {item.colour[0].name && item.products[0].size !== 'nosize' && ' | '}
                                                                            {item.products[0].size !== 'nosize' ? item.products[0].size : ''}
                                                                        </div>
                                                                        <div className="mt-1 text-muted">
                                                                            Brand : {item.brand ? item.brand.name : 'No Brand'}
                                                                        </div>
                                                                        <div className="d-flex text-muted mt-3">
                                                                            <div className="cp" onClick={() => removeFromCartHandler(item.products[0]._id)}>
                                                                                <Trash2 color="gray" size={16} className="mr-2" />
                                                                                Remove
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-2">
                                                                {selectAvailableProduct(item.products[0], item.productQty)}
                                                            </div>
                                                            <div className="col-2 text-right">
                                                                <div className="product-finalprice font-weight-bold">
                                                                    Rs.{(Number(item.products[0].finalPrice) * Number(item.productQty))}
                                                                </div>
                                                                {item.products[0].discount !== null && item.products[0].discount !== 0 &&
                                                                    <div className="product-del">
                                                                        Rs.<span>{item.products[0].price}</span>
                                                                    </div>
                                                                }
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    </div>
                                }

                                {onlyMobile &&
                                    <div className="col-12 small">
                                        <ul className="list-unstyled">
                                            {
                                                combinedCartItems.map(item => (
                                                    <li key={item.products[0]._id} className={`cart-item item_${item.products[0]._id}`}>
                                                        <div className="d-flex">
                                                            <Link href={`/product/${item._id}/${item.slug}`}>
                                                                <a className="cp">
                                                                    <Image src={`/uploads/products/${item.colour[0].images[0]}`}
                                                                        layout="fixed"
                                                                        width="120"
                                                                        height="120"
                                                                        objectFit="cover"
                                                                        objectPosition="top center"
                                                                        quality="100"
                                                                    />
                                                                </a>
                                                            </Link>
                                                            <div className="product-detail ml-3">
                                                                <div className="d-flex align-items-baseline">
                                                                    <div className="product-finalprice font-weight-bold font16" style={{ marginTop: '-0.7rem' }}>
                                                                        Rs.{(Number(item.products[0].finalPrice) * Number(item.productQty))}
                                                                    </div>
                                                                    {item.products[0].discount !== null && item.products[0].discount !== 0 &&
                                                                        <div className="product-del ml-3">
                                                                            Rs.<span>{item.products[0].price}</span>
                                                                        </div>
                                                                    }
                                                                </div>
                                                                <div className="d-block product-name font14">{item.name}</div>
                                                                <div className="d-block mt-1">
                                                                    {item.colour[0].name}
                                                                    {item.colour[0].name && item.products[0].size !== 'nosize' && ' | '}
                                                                    {item.products[0].size !== 'nosize' ? item.products[0].size : ''}
                                                                </div>
                                                                <div className="d-block mt-1 text-muted">
                                                                    Brand : {item.brand ? item.brand.name : 'No Brand'}
                                                                </div>
                                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                                    <div className="">
                                                                        {selectAvailableProduct(item.products[0], item.productQty)}
                                                                    </div>
                                                                    <div className="">
                                                                        <Trash2 color="gray" size={16} className="cp" onClick={() => removeFromCartHandler(item.products[0]._id)} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    </div>
                                }
                            </div>
                            {shippingPlans.plans.length !== 0 &&
                                <div className="d-block bg-white mt-5">
                                    <div className="d-flex title border-bottom justify-content-between p-3 pl-4">
                                        <h4>SELECT DELIVERY OPTION</h4>
                                    </div>
                                    <div className="col-12 p-3">
                                        <Radio.Group onChange={onDeliveryChange} value={shippingPlans.plans[0]._id}>
                                            {shippingPlans.plans.map((plan, index) => (
                                                <Radio value={plan._id} amount={plan.amount}>
                                                    <div className="d-inline-flex">
                                                        <div className="d-block">
                                                            <span className="font-weight-bold">Rs.{plan.amount * Number(packagesForCustomer)}</span> | {plan.name}
                                                            <div className="mt-1">
                                                                Estimated Delivery:
                                                                <span className="font-weight-bold ml-2">
                                                                    {plan.minDeliveryTime ?
                                                                        moment().add(plan.minDeliveryTime, 'days').format('D MMM , YYYY')
                                                                        : moment().add(2, 'days').format('D MMM, YYYY')
                                                                    }
                                                                    <span className="ml-2 mr-2">-</span>
                                                                    {plan.maxDeliveryTime ?
                                                                        moment().add(plan.maxDeliveryTime, 'days').format('D MMM , YYYY')
                                                                        : moment().add(5, 'days').format('D MMM, YYYY')
                                                                    }
                                                                </span>
                                                            </div>
                                                            {shippingPlans.as === 'default' &&
                                                                <div className="mt-1 text-danger">Note: Delivery charge may vary as your address.</div>
                                                            }
                                                        </div>
                                                    </div>
                                                </Radio>
                                            ))
                                            }
                                        </Radio.Group>
                                    </div>
                                </div>
                            }
                            <div className="d-block coupon bg-white mt-5">
                                <Collapse
                                    ghost
                                    defaultActiveKey={[onlyMobile ? '' : '1']}
                                    expandIconPosition={'right'}
                                >
                                    <Panel header={<h4>COUPON/VOUCHER</h4>} key="1" >
                                        <div className="d-flex apply-coupon">
                                            <input className="form-control"
                                                disabled={validCoupon !== '' ? true : false}
                                                value={coupon}
                                                onChange={e => setCoupon(e.target.value)}
                                                onKeyDown={() => setCouponError('')}
                                                placeholder="Enter Coupon Code"
                                            />
                                            {validCoupon === '' &&
                                                <button className="btn btn-outline-success btn-apply ml-3" onClick={applyCouponHanlder}>Apply</button>
                                            }
                                            {validCoupon !== '' &&
                                                <button className="btn btn-outline-warning btn-apply ml-3" onClick={removeCouponHanlder}>Remove</button>
                                            }
                                        </div>
                                        <div className="d-block font13 text-danger mt-2">
                                            {couponError}
                                        </div>
                                    </Panel>
                                </Collapse>
                            </div>

                        </div>
                        <div className="col-sm-12 col-md-4 mt-5">
                            {!onlyMobile &&
                                <Affix offsetTop={70}>
                                    {summerySection()}
                                </Affix>
                            }
                            {onlyMobile &&
                                summerySection()
                            }
                        </div>
                    </div>
                }
            </div>
        </Wrapper >
    );
}

export async function getServerSideProps(context) {
    try {
        const { cartItem, token } = parseCookies(context);

        const parseCartItems = cartItem ? JSON.parse(cartItem) : [];
        const productIds = parseCartItems.reverse().map(item => item.productId);

        const { data } = await axios.post(`${process.env.api}/api/cartitems`, { productIds },
            {
                headers: {
                    token
                },
            });
        const { data: shippingPlans } = await axios.get(`${process.env.api}/api/shipping`, {
            headers: {
                token
            }
        });
        return {
            props: {
                parseCartItems,
                cartProducts: data,
                shippingPlans
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/login?redirect=cart',
                destination: '/login?redirect=cart',
                permanent: false,
            },
        };
    }
}

export default cart;
