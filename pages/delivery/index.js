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

    //modal
    const [visible, setVisible] = useState(false);
    const [packgesWithSameTrackingId, setPackgesWithSameTrackingId] = useState([]);

    const router = useRouter();
    const { deliveryAuth } = useSelector(state => state.deliveryAuth);

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

    const handlerReceivePackage = () => {

    }

    return (
        <>
            <Modal
                title="Select Package"
                visible={visible}
                footer={null}
                closable={true}
                onCancel={() => setVisible(false)}
                destroyOnClose={true}
            >
                <div className="d-block">
                    {packgesWithSameTrackingId && packgesWithSameTrackingId.map(item =>
                        <div className="d-flex align-items-center pt-3 pb-3 border-bottom">
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
                                    onClick={() => router.push(`delivery/makeship/${item._id}`)}
                                >
                                    Select
                                </Button>
                            </div>
                        </div>
                    )}
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
                <div className="row mt-3">
                    <div className="col-12 col-md-6">
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
                    <div className="col-12 col-md-6">
                        <Card title="Receive Package">
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