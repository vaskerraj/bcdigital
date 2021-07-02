import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from "nookies";

import axios from "axios";
import axiosApi from '../helpers/api';

import moment from 'moment';

import { Input, Collapse, message, Radio, Affix, Modal, Space } from 'antd';

import { MapPin, Phone } from 'react-feather';

import { useForm } from 'react-hook-form';

import AddressForm from '../components/user/AddressForm';
import { addAddress } from '../redux/actions/addressAction';
import ShippingAddress from '../components/ShippingAddress';

const Checkout = ({ cartDetails, products, shippingPlans, defaultAddresses, addresses }) => {

    // choosenAddress(isDefault : true) if user have address from user pannel
    const [choosenAddress, setChoosenAddress] = useState([]);

    // while add new address even have default address
    const [changeAddress, setChangeAddress] = useState(false);

    const [changeDeliveryMobile, setChangeDeliveryMobile] = useState(false);
    const [deliveryMobileNumber, setDeliveryMobileNumber] = useState('');

    // change address
    const [newDefaultShippingAddress, setNewDefaultShippingAddress] = useState('');
    // add new address
    const [newAddressVisible, setNewAddressVisible] = useState(false);

    // shipping plan and charges
    const [shippingCharge, setShippingCharge] = useState(0);
    const [shippingId, setShippingId] = useState(cartDetails.shipping);
    const [packagesForCustomer, setPackagesForCustomer] = useState(1);

    const [paymentType, setPaymentType] = useState('');

    const [grandTotal, setGrandTotal] = useState(0);

    const router = useRouter();

    const dispatch = useDispatch();
    const { adrInfo, error } = useSelector(state => state.addresses);
    useEffect(() => {

        if (adrInfo) {
            // close add new address modal if address has been added from modal.
            cancelNewAddress();
            router.push(router.asPath);
        }
        if (error) {
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
    }, [adrInfo, error]);

    const { userInfo } = useSelector(state => state.userAuth);

    useEffect(() => {
        if (addresses) {
            const userDefaultaddress = addresses.filter(add => add.isDefault !== 'false');
            setChoosenAddress(userDefaultaddress);
        }
    }, [addresses]);

    useEffect(() => {
        if (choosenAddress.length) {
            setDeliveryMobileNumber(choosenAddress[0].mobile);
        }
    }, [choosenAddress]);

    const isDefaultAddress = choosenAddress.map(item => item._id)[0];

    useEffect(() => {
        if (products) {
            // for total number of package to ship to customer
            const uniqueSellerForPackage = [...new Map(products.map(item =>
                [item.createdBy['_id'], item.createdBy])).values()];

            const packages = uniqueSellerForPackage.length === 0 ? 1 : uniqueSellerForPackage.length;
            setPackagesForCustomer(packages);

            setShippingCharge(Number(shippingPlans.plans[0].amount) * Number(packages));
            setShippingId(shippingPlans.plans[0]._id);

            // set grand Total
            setGrandTotal(Number(cartDetails.total) + (Number(shippingPlans.plans[0].amount) * Number(packages)) - Number(cartDetails.couponDiscount));

        }
    }, [shippingPlans, products, cartDetails]);


    const { register, handleSubmit, errors, reset, getValues } = useForm();

    const onSubmit = (inputdata) => {
        dispatch(addAddress(
            inputdata.fullname,
            inputdata.mobile,
            inputdata.addLabel,
            inputdata.region,
            inputdata.city,
            inputdata.area,
            inputdata.address
        ))
    }
    // change address
    const onAddressChange = () => {
        setChangeAddress(true);
        setChangeDeliveryMobile(false);
    }
    const onAddressChangeCancel = () => {
        setChangeAddress(false);
        setChangeDeliveryMobile(false);
    }
    // shipping address radio change
    const changeShippingAddress = (e) => {
        if (e.target.checked) {
            setNewDefaultShippingAddress(e.target.value);
        } else {
            setNewDefaultShippingAddress('')
        }
    }

    // add new address modal
    const addNewAddress = () => {
        setNewAddressVisible(true)
    }

    const cancelNewAddress = () => {
        setNewAddressVisible(false)
    }

    const saveNewDefaultAddress = async () => {
        if (isDefaultAddress === newDefaultShippingAddress) {
            setChangeAddress(false);
            return;
        }
        try {
            const { data } = await axiosApi.get(`/api/defaultaddress/${newDefaultShippingAddress}`, {
                headers: {
                    token: userInfo.token
                }
            });
            if (data) {
                setChangeAddress(false);
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
    const onDeliveryChange = e => {
        if (e.target.checked) {
            setShippingCharge(Number(e.target.amount) * Number(packagesForCustomer));
            setShippingId(e.target.value);

            // set grand total
            setGrandTotal(Number(cartDetails.total) + (Number(e.target.amount) * Number(packagesForCustomer)) - Number(cartDetails.couponDiscount));
        } else {
            setShippingCharge(0);
            setShippingId(null);

            // set grand Total
            setGrandTotal(cartDetails.total - Number(cartDetails.couponDiscount));
        }
    }
    const onPaymentChange = e => {
        if (e.target.checked) {
            setPaymentType(e.target.value);
        }
    }
    return (
        <>
            <Head>
                <title>Checkout | BC Digital</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Modal
                title={'Add New Address'}
                visible={newAddressVisible}
                footer={null}
                closable={false}
                destroyOnClose={true}
            >
                <AddressForm
                    formRegister={register}
                    handleSubmit={handleSubmit(onSubmit)}
                    errors={errors}
                    reset={reset}
                    getValues={getValues}
                    addresses={defaultAddresses}
                    cancelButton={true}
                    onCancel={cancelNewAddress}
                />
            </Modal>
            <div className="container">
                <div className="row">
                    <div className="col-sm-12 col-md-8 mt-5">
                        <div className="d-block bg-white">
                            <div className="title border-bottom d-flex justify-content-between p-3 pl-4">
                                <h4>Ship To</h4>
                            </div>
                            <div className="col-12 p-4">
                                {shippingPlans.as === 'default' ?
                                    (
                                        <div className="d-block pb-5">
                                            <AddressForm
                                                formRegister={register}
                                                handleSubmit={handleSubmit(onSubmit)}
                                                errors={errors}
                                                reset={reset}
                                                getValues={getValues}
                                                addresses={defaultAddresses}
                                                cancelButton={false}
                                            />
                                        </div>
                                    )
                                    :
                                    (
                                        <>
                                            {!changeAddress && choosenAddress.length !== 0 &&
                                                <div className="d-block pb-5">
                                                    <div className="d-flex">
                                                        <div className="">
                                                            <MapPin size={20} />
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="d-block font-weight-bold">
                                                                {choosenAddress[0].name}
                                                                <span className="badge bg-warning ml-3">{choosenAddress[0].label}</span>
                                                                <span className="text-info font-weight-normal ml-3 cp" onClick={onAddressChange}>Change</span>
                                                            </div>
                                                            <div className="d-block">
                                                                {choosenAddress[0].street}
                                                                {choosenAddress[0].area ? ',' + choosenAddress[0].area.name : ''}
                                                                {',' + choosenAddress[0].city.name + ',' + choosenAddress[0].region.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-item-center mt-3">
                                                        <div className="">
                                                            <Phone size={20} />
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="d-block  font-weight-bold">
                                                                {!changeDeliveryMobile ?
                                                                    <>
                                                                        {deliveryMobileNumber ? deliveryMobileNumber : choosenAddress[0].mobile}
                                                                        <span className="text-info font-weight-normal ml-3 cp"
                                                                            onClick={() => setChangeDeliveryMobile(true)}
                                                                        >
                                                                            Change
                                                                        </span>
                                                                    </>
                                                                    :
                                                                    <div className="d-flex">
                                                                        <Input allowClear
                                                                            value={deliveryMobileNumber}
                                                                            onChange={(e) => setDeliveryMobileNumber(e.target.value)}
                                                                        />
                                                                        <button className="btn btn-lg btn-outline-info ml-3"
                                                                            onClick={() => setChangeDeliveryMobile(false)}
                                                                        >
                                                                            Save
                                                                        </button>
                                                                    </div>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        </>
                                    )
                                }
                                {changeAddress &&
                                    <ShippingAddress
                                        data={addresses}
                                        addNewAddress={addNewAddress}
                                        isDefaultAddress={isDefaultAddress}
                                        changeShippingAddress={changeShippingAddress}
                                        onAddressChangeCancel={onAddressChangeCancel}
                                        saveNewDefaultAddress={saveNewDefaultAddress}
                                    />
                                }
                            </div>
                        </div>
                        <div className="d-block bg-white mt-5">
                            <div className="title border-bottom d-flex justify-content-between p-3 pl-4">
                                <h4 className="text-uppercase">Delivery Options</h4>
                            </div>
                            <div className="col-12 p-3">
                                <Radio.Group onChange={onDeliveryChange} value={shippingId} className="mb-1">
                                    {shippingPlans.plans.map((plan, index) => (
                                        <Radio key={plan._id} value={plan._id} amount={plan.amount}>
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
                        <div className="d-block bg-white mt-5 mb-4">
                            <div className="title border-bottom d-flex justify-content-between p-3 pl-4">
                                <h4>Pay With</h4>
                            </div>
                            <div className="col-12 p-3 pb-5">
                                <Radio.Group onChange={onPaymentChange} value={paymentType} style={{ width: '100%' }}>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Radio value="card" style={{ width: '100%', borderBottom: '1px solid #ddd', paddingBottom: '1.5rem' }}>
                                            <div className="d-inline-flex align-items-center">
                                                <span className="font16 mr-2">Credt/Debit Card</span>
                                                <Image src="/payment-card.png" layout="fixed" width="60" height="33" />
                                            </div>
                                        </Radio>
                                        <Radio value="eswewa" style={{ width: '100%', borderBottom: '1px solid #ddd', paddingBottom: '1.5rem' }}>
                                            <div className="d-inline-flex align-items-center">
                                                <span className="font16 mr-2">e-Sewa</span>
                                                <Image src="/payment-esewa.png" layout="fixed" width="60" height="33" />
                                            </div>
                                        </Radio>
                                        <Radio value="cashondelivery" style={{ width: '100%' }}>
                                            <div className="d-inline-flex align-items-center">
                                                <span className="font16 mr-2">Cash On Delivery</span>
                                                <Image src="/payment-cash.png" layout="fixed" width="60" height="33" />
                                            </div>
                                        </Radio>
                                    </Space>
                                </Radio.Group>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-12 col-md-4 mt-5">
                        <Affix offsetTop={70}>
                            <div className="summery bg-white p-4">
                                <h4>SUMMERY</h4>
                                <div className="clearfix mt-5">
                                    <div className="d-flex justify-content-between">
                                        <span>Product Total</span>
                                        <span>Rs.{cartDetails.total}</span>
                                    </div>
                                    {cartDetails.shippingCharge !== 0 &&
                                        <div className="d-flex justify-content-between mt-3 pt-4 border-top border-gray align-items-center">
                                            <span>Shipping Charge</span>
                                            <span>Rs.{shippingCharge}</span>
                                        </div>
                                    }
                                    {cartDetails.couponDiscount !== 0 &&
                                        <div className="d-flex justify-content-between mt-3 pt-4 border-top border-gray align-items-center">
                                            <span>Coupon Discount</span>
                                            <span>Rs.{cartDetails.couponDiscount}</span>
                                        </div>
                                    }
                                    <div className="d-flex justify-content-between mt-4 pt-3 border-top border-gray align-items-center">
                                        <span className="font-weight-bold">Total</span>
                                        <span className="grandtotal font-weight-normal" style={{ fontSize: '2.0rem' }}>Rs.{grandTotal}</span>
                                    </div>
                                    <div className="d-block mt-5">
                                        <button onClick={''} className={`btn btn-danger btn-block btn-lg position-relative`} style={{ fontSize: '2.0rem' }}>
                                            Submit Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Affix>
                    </div>
                </div>
            </div>
        </>
    )
};

export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data: checkoutData } = await axios.get(`${process.env.api}/api/checkout`, {
            headers: {
                token: cookies.token,
            },
        });
        const { data: shipping } = await axios.get(`${process.env.api}/api/shipping`, {
            headers: {
                token: cookies.token,
            },
        });

        const { data: defaultAddresses } = await axios.get(`${process.env.api}/api/defaultaddress`);

        let addresses = null;
        if (shipping.as === 'user') {
            addresses = await axios.get(`${process.env.api}/api/addresses`, {
                headers: {
                    token: cookies.token,
                },
            });
        }
        return {
            props: {
                cartDetails: checkoutData.cartDetails,
                products: checkoutData.products,
                shippingPlans: shipping,
                defaultAddresses,
                addresses: addresses ? addresses.data : null
            }
        }

    } catch (err) {
        return {
            redirect: {
                source: '/login?redirect=checkout',
                destination: '/login?redirect=checkout',
                permanent: false,
            },
            props: {},
        };
    }
}

export default Checkout;