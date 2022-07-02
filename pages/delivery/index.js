import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../helpers/api';

import { message, Modal, Card, Tooltip, Input, Button } from 'antd';
import { InfoCircleOutlined, GoogleOutlined, FacebookFilled, RiseOutlined, FallOutlined, SwapOutlined } from '@ant-design/icons';

import Wrapper from '../../components/delivery/Wrapper';

const DeliveryDashbaord = () => {

    const [shipPackageTrackId, setShipPackageTrackId] = useState(null);
    const [recivePackageTrackId, setRecivePackageTrackId] = useState(null);
    const [returnDispatchTrackId, setReturnDispatchTrackId] = useState(null);
    const [receiveReturnTrackId, setReceiveReturnTrackId] = useState(null);

    const [checkedTrackingId, setCheckedTrackingId] = useState(null);

    //modal
    const [activeModel, setActiveModel] = useState(null);
    const [visible, setVisible] = useState(false);
    const [packgesWithSameTrackingId, setPackgesWithSameTrackingId] = useState([]);

    // confirm modal while receiving package
    const [visibleConfirmModal, setVisibleConfirmModal] = useState(false);
    const [packgeForConfirm, setPackgeForConfirm] = useState({});
    const [relatedCity, setRelatedCity] = useState(null);
    const [ignoreRelatedCityNotMatch, setIgnoreRelatedCityNotMatch] = useState(false);


    const router = useRouter();
    const { deliveryAuth } = useSelector(state => state.deliveryAuth);

    const handelModelClose = () => {
        setActiveModel(null)
        setPackgesWithSameTrackingId([]);
        setVisible(false);
    }

    const handelConfirmModelClose = () => {
        setActiveModel(null)
        setPackgeForConfirm({});
        setVisibleConfirmModal(false);
    }

    const handlerShipPackage = async () => {
        try {
            const { data } = await axiosApi.get(`/api/delivery/check/package/${shipPackageTrackId}`,
                {
                    headers: {
                        token: deliveryAuth.token
                    }
                });
            if (data.msg === "found") {
                if (data.packages.length > 1) {
                    setPackgesWithSameTrackingId(data.packages);
                    setActiveModel("make_ship")
                    setVisible(true);
                } else {
                    router.push(`delivery/makeship/${data.packages[0]._id}`);
                }
            } else {
                message.warning({
                    content: (
                        <div>
                            <div className="font-weight-bold">No Found</div>
                            Package not found with this trackingId or package was already shipped.
                        </div>
                    ),
                    className: 'message-success',
                });
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

    const handleReceivePacakgeUpdate = async (packageId) => {
        try {
            const { data } = await axiosApi.put(`/api/delivery/receive/package`,
                {
                    id: packageId
                },
                {
                    headers: {
                        token: deliveryAuth.token
                    }
                });
            if (data) {
                //close all modal
                setVisibleConfirmModal(false);
                setVisible(false);
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Done</div>
                            Now package can deliver via rider(s).
                        </div>
                    ),
                    className: 'message-success',
                });
            }
        } catch (error) {
            //close all modal
            setVisibleConfirmModal(false);
            setVisible(false);
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

    const handleReceivePacakgeAction = (packages, confirmModalStatus = null) => {
        // at confirm model(when trackingId is not duplicate) packages will be package detail but at select package(when tacking id is duplicate) packages = packageId
        // In short: if confirmModalStatus = null packages will be be packageId
        //  if onfirmModalStatus = viewConfirmMoal packages will be be package detail
        if (confirmModalStatus === "viewConfirmMoal") {
            setPackgeForConfirm(packages)
            setVisibleConfirmModal(true);
        } else {
            handleReceivePacakgeUpdate(packages)
        }
    }
    const handlerReceivePackage = async () => {
        try {
            const { data } = await axiosApi.get(`/api/delivery/receive/package/${recivePackageTrackId}`,
                {
                    headers: {
                        token: deliveryAuth.token
                    }
                });
            if (data.msg === "found") {
                if (data.packages.length > 1) {
                    setPackgesWithSameTrackingId(data.packages);
                    setRelatedCity(data.relatedCity);
                    setActiveModel("receive_ship")
                    setVisible(true);
                } else {
                    setRelatedCity(data.relatedCity);
                    setActiveModel("receive_ship");
                    setIgnoreRelatedCityNotMatch(data.relatedCity === data.packages[0].deliveryCity ? false : true);
                    handleReceivePacakgeAction(data.packages[0], "viewConfirmMoal");
                }
            } else {
                message.warning({
                    content: (
                        <div>
                            <div className="font-weight-bold">No Found</div>
                            Package not found with this trackingId or package was already received.
                        </div>
                    ),
                    className: 'message-success',
                });
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
    // returns
    const handlerReturnDispatchPackage = async () => {
        try {
            const { data } = await axiosApi.get(`/api/delivery/check/return/${returnDispatchTrackId}`,
                {
                    headers: {
                        token: deliveryAuth.token
                    }
                });
            if (data.msg === "found") {
                if (data.packages.length > 1) {
                    setPackgesWithSameTrackingId(data.packages);
                    setCheckedTrackingId(data.trackingId);
                    setActiveModel("return_ship")
                    setVisible(true);
                } else {
                    router.push(`delivery/makereturn/${data.packages[0]._id}/?tid=${data.trackingId}`);
                }
            } else {
                message.warning({
                    content: (
                        <div>
                            <div className="font-weight-bold">No Found</div>
                            Package not found with this trackingId or return request was <b>not approved</b>.
                        </div>
                    ),
                    className: 'message-success',
                });
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
    const handleReceiveReturnUpdate = async (packageId) => {
        try {
            const { data } = await axiosApi.put(`/api/delivery/receive/return`,
                {
                    packageId,
                    trackingId: receiveReturnTrackId
                },
                {
                    headers: {
                        token: deliveryAuth.token
                    }
                });
            if (data) {
                //close all modal
                setVisibleConfirmModal(false);
                setVisible(false);
                return router.push(`/delivery/return/${packageId}?tid=${receiveReturnTrackId}`);
            }
        } catch (error) {
            //close all modal
            setVisibleConfirmModal(false);
            setVisible(false);
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
    const handleReceiveReturnAction = (packages, confirmModalStatus = null) => {
        // at confirm model(when trackingId is not duplicate) packages will be package detail but at select package(when tacking id is duplicate) packages = packageId
        // In short: if confirmModalStatus = null packages will be be packageId
        //  if onfirmModalStatus = viewConfirmMoal packages will be be package detail
        if (confirmModalStatus === "viewConfirmMoal") {
            setPackgeForConfirm(packages)
            setVisibleConfirmModal(true);
        } else {
            handleReceiveReturnUpdate(packages)
        }
    }
    const handlerReceiveReturn = async () => {
        try {
            const { data } = await axiosApi.get(`/api/delivery/receive/return/${receiveReturnTrackId}`,
                {
                    headers: {
                        token: deliveryAuth.token
                    }
                });
            if (data.msg === "found") {
                if (data.packages.length > 1) {
                    setPackgesWithSameTrackingId(data.packages);
                    setRelatedCity(data.relatedCity);
                    setActiveModel("receive_return")
                    setVisible(true);
                } else {
                    setRelatedCity(data.relatedCity);
                    setActiveModel("receive_return");
                    setIgnoreRelatedCityNotMatch(data.relatedCity === data.packages[0].deliveryCity ? false : true);
                    handleReceiveReturnAction(data.packages[0], "viewConfirmMoal");
                }
            } else {
                message.warning({
                    content: (
                        <div>
                            <div className="font-weight-bold">No Found</div>
                            Package not found with this trackingId or package was already received.
                        </div>
                    ),
                    className: 'message-success',
                });
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

    return (
        <>
            <Modal
                title="Select Package"
                visible={visible}
                footer={null}
                closable={true}
                onCancel={() => handelModelClose()}
                destroyOnClose={true}
            >
                <div className="d-block">
                    {packgesWithSameTrackingId && packgesWithSameTrackingId.map(item =>
                        <div className="pt-3 pb-3 border-bottom">
                            {relatedCity === item.deliveryCity &&
                                <div className="d-block text-danger text-right">Delivery City doesn't match with your city.</div>
                            }
                            <div className="d-flex align-items-center ">
                                <div>
                                    <div>
                                        Seller : <b>{item.seller.name}</b> | {item.seller.mobile}
                                    </div>
                                    <div className="text-uppercase">Id: {item.orderId._id} | {item._id}</div>
                                </div>
                                <div className="ml-4">
                                    <Button
                                        size="small"
                                        type="primary"
                                        onClick={() =>
                                            activeModel === "make_ship" ?
                                                router.push(`/delivery/makeship/${item._id}`)
                                                :
                                                activeModel === "receive_ship" ?
                                                    handleReceivePacakgeUpdate(item._id)
                                                    :
                                                    activeModel === "return_ship" ?
                                                        router.push(`/delivery/makereturn/${item._id}?tid=${checkedTrackingId}`)
                                                        :
                                                        activeModel === "receive_return" ?
                                                            handleReceiveReturnAction(item._id, receiveReturnTrackId)
                                                            :
                                                            ""
                                        }
                                    >
                                        {ignoreRelatedCityNotMatch ? "Select" : "Continue & Select"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
            <Modal
                title="Confirm Package"
                visible={visibleConfirmModal}
                footer={null}
                closable={false}
                destroyOnClose={true}
            >
                <div className="d-block">
                    <div className="d-flex align-items-center pt-3 pb-3 border-bottom">
                        <div>
                            <div>
                                Seller : <b>{packgeForConfirm.seller?.name}</b> | {packgeForConfirm.seller?.mobile}
                            </div>
                            <div className="text-uppercase">Id: {packgeForConfirm.orderId?._id} | {packgeForConfirm._id}</div>
                        </div>
                    </div>
                    <div className="d-block border-top mt-5 text-right">
                        {relatedCity !== packgeForConfirm.deliveryCity &&
                            <div className="d-block text-danger">Delivery City doesn't match with your related city. Are you still sure to continue?</div>
                        }
                        <button type="button" onClick={handelConfirmModelClose} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                            Cancel
                        </button>
                        <button type="submit"
                            onClick={() =>
                                activeModel === "receive_ship" ?
                                    handleReceivePacakgeUpdate(packgeForConfirm._id)
                                    :
                                    activeModel === "receive_return" ?
                                        handleReceiveReturnAction(packgeForConfirm._id, receiveReturnTrackId)
                                        :
                                        null
                            }
                            className="btn btn-lg c-btn-primary font16 mt-4"
                        >
                            {!ignoreRelatedCityNotMatch ? "Confirm" : "Continue & Confirm"}
                        </button>
                    </div>
                </div>
            </Modal>
            <Wrapper onActive="index" breadcrumb={["Dashboard"]} >
                <div className="row">
                    <div className="col-3">
                        <Card style={{ width: '100%' }}>
                            <div className="d-flex justify-content-between custom-card-header">
                                <div>Pending Deliveries</div>
                                <div>
                                    <Tooltip title="not include cancelled orders & returned orders">
                                        <InfoCircleOutlined />
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="custom-card-total">
                                0
                            </div>
                        </Card>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-md-4 mt-4">
                        <Card title="Ship Package">
                            <div className="d-flex">
                                <div>
                                    <div className="d-block">Tracking Id </div>
                                    <Input
                                        allowClear
                                        className="mt-1"
                                        onChange={(e) => setShipPackageTrackId(e.target.value)}
                                    />
                                </div>
                                <div className="mt-3">
                                    <Button type="primary" className="mt-4 ml-2" onClick={handlerShipPackage}>Check</Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 col-md-4 mt-4">
                        <Card title="Receive Package(Reach at city)">
                            <div className="d-flex">
                                <div>
                                    <div className="d-block">Tracking Id </div>
                                    <Input
                                        allowClear
                                        className="mt-1"
                                        onChange={(e) => setRecivePackageTrackId(e.target.value)}
                                    />
                                </div>
                                <div className="mt-3">
                                    <Button type="danger" className="mt-4 ml-2" onClick={handlerReceivePackage}>Submit</Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 col-md-4 mt-4">
                        <Card title="Fail Delivery Dispatch">
                            <div className="d-flex">
                                <div>
                                    <div className="d-block">Tracking Id </div>
                                    <Input
                                        allowClear
                                        className="mt-1"
                                        onChange={(e) => setRecivePackageTrackId(e.target.value)}
                                    />
                                </div>
                                <div className="mt-3">
                                    <Button danger className="mt-4 ml-2" onClick={handlerReceivePackage}>Check</Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 col-md-4 mt-4">
                        <Card title="Fail Delivery(Reach at city)">
                            <div className="d-flex">
                                <div>
                                    <div className="d-block">Tracking Id </div>
                                    <Input
                                        allowClear
                                        className="mt-1"
                                        onChange={(e) => setRecivePackageTrackId(e.target.value)}
                                    />
                                </div>
                                <div className="mt-3">
                                    <Button type="primary" className="mt-4 ml-2" onClick={handlerReceivePackage}>Submit</Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 col-md-4 mt-4">
                        <Card title="Ship Returns">
                            <div className="d-flex">
                                <div>
                                    <div className="d-block">Tracking Id </div>
                                    <Input
                                        allowClear
                                        className="mt-1"
                                        onChange={(e) => setReturnDispatchTrackId(e.target.value)}
                                    />
                                </div>
                                <div className="mt-3">
                                    <Button danger className="mt-4 ml-2" onClick={handlerReturnDispatchPackage}>Check</Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 col-md-4 mt-4">
                        <Card title="Receive Returns(Reach at city)">
                            <div className="d-flex">
                                <div>
                                    <div className="d-block">Tracking Id </div>
                                    <Input
                                        allowClear
                                        className="mt-1"
                                        onChange={(e) => setReceiveReturnTrackId(e.target.value)}
                                    />
                                </div>
                                <div className="mt-3">
                                    <Button type="primary" className="mt-4 ml-2"
                                        onClick={handlerReceiveReturn}>Submit</Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </Wrapper>
        </>
    )
}

export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/isdelivery`, {
            headers: {
                token: cookies.del_token,
            },
        });
        return {
            props: {
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/delivery/login',
                destination: '/delivery/login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}

export default DeliveryDashbaord;