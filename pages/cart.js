import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from 'nookies';

import axios from 'axios';

import { Select, Collapse } from 'antd';
const { Option } = Select;
const { Panel } = Collapse;

import { Trash2 } from 'react-feather';

import useWindowDimensions from '../helpers/useWindowDimensions';

import Wrapper from '../components/Wrapper';
import { addToCart, removeOrderFromCart } from '../redux/actions/cartAction';

const cart = ({ parseCartItems, cartProducts }) => {
    console.log(parseCartItems);

    const [combinedCartItems, setCombinedCartItems] = useState([]);

    // hide mobileTabBar at mobile
    // we gonna implmente hide at HeaderMenu so hide only at small screen(576px)
    const { height, width } = useWindowDimensions();
    const [mobileTabBarStatus, setMobileTabBarStatus] = useState("");
    const [onlyMobile, setOnlyMoble] = useState(false);

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


    useEffect(() => {
        if (cartItem) {
            const combineProductWithCartItems = cartProducts.map(item => ({
                ...item,
                ...cartItem.find(ele => ele.productId === item.products[0]._id),
            }));
            console.log(combineProductWithCartItems);
            setCombinedCartItems(combineProductWithCartItems);
        }
    }, [cartItem]);

    console.log(combinedCartItems);

    const router = useRouter();
    const checkoutHandler = () => {
        router.push('/checkout');
    }

    const dispatch = useDispatch();

    const removeFromCartHandler = (productId) => {
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
            <Select defaultValue={qty} style={{ width: '100%' }}
                onChange={(value) => cartQtyChangeHandler(product._id, value)}
            >
                {
                    [...Array(availableProducts).keys()].map(x => (
                        <Option value={x + 1}>{x + 1}</Option>
                    ))
                }
            </Select>
        )
    }
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
                                    <h3>CART ({parseCartItems.reduce((a, c) => a + c.productQty, 0)})</h3>
                                </div>
                                <div className="voucherText"></div>
                                <div className="couponConfirmed"></div>
                                {!onlyMobile &&
                                    <div className="col-12">
                                        <ul className="list-unstyled">
                                            {
                                                combinedCartItems.map(item => (
                                                    <li key={item.products[0]._id} className="cart-item">
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
                                                            <div className="col-2">
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
                                                    <li key={item.products[0]._id} className="cart-item">
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
                            <div className="d-block coupon bg-white mt-5">
                                <Collapse
                                    ghost
                                    defaultActiveKey={[onlyMobile ? '' : '1']}
                                    expandIconPosition={'right'}
                                >
                                    <Panel header={<h3>Coupon/Voucher</h3>} key="1" >
                                        <div className="d-flex apply-coupon">
                                            <input className="form-control" placeholder="Enter Coupon Code" />
                                            <button className="btn btn-outline-success btn-apply ml-3">Apply</button>
                                        </div>
                                    </Panel>
                                </Collapse>
                            </div>
                        </div>
                        <div className="col-sm-12 col-md-4 mt-5">
                            <div className="summery bg-white p-4">
                                <h3>SUMMERY</h3>
                                <div className="clearfix mt-5">
                                    <div className="d-flex justify-content-between">
                                        <span>Product Total</span>
                                        <span>Rs.{combinedCartItems.reduce((a, c) => (a + c.productQty * c.products[0].finalPrice), 0)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mt-4 pt-3 border-top border-gray align-items-center">
                                        <span className="font-weight-bold">Total</span>
                                        <span className="grandtotal font-weight-normal" style={{ fontSize: '2.0rem' }}>Rs.{combinedCartItems.reduce((a, c) => (a + c.productQty * c.products[0].finalPrice), 0)}</span>
                                    </div>
                                    <div className="d-block mt-5">
                                        <button onClick={checkoutHandler} className="btn btn-danger btn-block btn-lg" style={{ fontSize: '2.0rem' }}>
                                            Proceed to Checkout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </Wrapper >
    );
}

export async function getServerSideProps(context) {
    try {
        const { cartItem } = parseCookies(context);
        console.log(cartItem);
        const parseCartItems = cartItem ? JSON.parse(cartItem) : [];

        const productIds = parseCartItems.reverse().map(item => item.productId);
        const { data } = await axios.post(`${process.env.api}/api/cartitems`, {
            productIds
        });
        return {
            props: {
                parseCartItems,
                cartProducts: data
            }
        }
    } catch (err) {
        console.log(err)
        return {

        };
    }
}

export default cart;
