import React, { useState } from 'react';
import Head from 'next/head'
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import moment from 'moment';

import { message, Tag, Select } from 'antd';
const { Option } = Select;

import Wrapper from '../../../components/seller/Wrapper';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const Finance = ({ financeData }) => {

    const [finance, setFinance] = useState(financeData);

    const { sellerAuth } = useSelector(state => state.sellerAuth);

    const recallInvoice = async (sellerInvoiceDateId) => {
        try {
            const { data } = await axiosApi.post(`/api/seller/finance`, {
                invoiceDate: sellerInvoiceDateId
            },
                {
                    headers: {
                        token: sellerAuth.token,
                    }
                });
            if (data) {
                setFinance(data);
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

    const handleDateChange = (dateId) => {
        recallInvoice(dateId);
    }
    return (
        <>
            <Head>
                <title>Account Statement | Seller Center</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Wrapper onActive="finance" breadcrumb={["Finance", "Account"]}>
                {finance?.dates.length === 0
                    ?
                    <div className="text-center">No statement found</div>
                    :
                    <>
                        <div className="text-right">
                            <Select
                                defaultValue={finance.selectedInvoice._id}
                                onChange={handleDateChange}
                                style={{ width: 200 }}
                            >
                                {
                                    finance.dates.map(item =>
                                        <Option key={item._id} value={item._id}>
                                            {moment(item.dateFrom).format("DD MMM YYYY")}-{moment(item.dateTo).format("DD MMM YYYY")}
                                        </Option>
                                    )
                                }
                            </Select>
                        </div>
                        <div className="d-block mt-4">
                            <div className="mx-auto my-4" style={{ width: '60%' }}>
                                <div className="d-flex justify-content-between">
                                    {finance.selectedInvoice.paymentStatus === 'not_paid' ?
                                        <div>
                                            This payment will be settle days between
                                            <b className="ml-2">{moment(finance.selectedInvoice.dateTo).add(15, 'days').format('YYYY-MMM-DD')}</b>
                                            -
                                            <b>{moment(finance.selectedInvoice.dateTo).add(17, 'days').format('YYYY-MMM-DD')}</b>
                                        </div>
                                        :
                                        <div>Paid at : {moment(finance.selectedInvoice.paymentDate).format('YYYY-MM-DD HH-MM')}</div>
                                    }
                                    <div>Payment: <Tag color={finance.selectedInvoice.paymentStatus === 'paid' ? "green" : "red"}>
                                        {finance.selectedInvoice.paymentStatus === "not_paid" ? "Not Paid" : "Paid"}
                                    </Tag></div>
                                </div>
                            </div>
                            <div className="bg-white mx-auto my-4 p-5" style={{ width: '60%' }}>
                                <div className="d-block">
                                    <div className="d-block font-weight-bold">Orders</div>
                                    <div className="d-flex justify-content-between mt-3">
                                        <div>Order's Item Total:</div>
                                        <div>Rs.{finance.itemTotal}</div>
                                    </div>
                                    <div className="d-flex justify-content-between mt-2">
                                        <div>Commission:</div>
                                        <div>Rs.{finance.comission}</div>
                                    </div>
                                </div>
                                <div className="d-block text-right">
                                    Sub Total : <span className="ml-5">Rs.{finance.orderSubTotal}</span>
                                </div>
                                <div className="d-block border-top mt-5 pt-4">
                                    <div className="d-block font-weight-bold mt-1">Returns</div>
                                    <div className="d-flex justify-content-between mt-3">
                                        <div>Order's Item Total:</div>
                                        <div><b>-</b> Rs.{finance.returnItems}</div>
                                    </div>
                                    <div className="d-flex justify-content-between mt-2">
                                        <div>Reversal Commission:</div>
                                        <div>Rs.{finance.revCommission}</div>
                                    </div>
                                </div>
                                <div className="d-block text-right">
                                    Sub Total : <b className="ml-5">-</b> Rs.{finance.returnSubTotal}
                                </div>
                                <div className="d-block border-top mt-4 pt-3">
                                    <div className="d-flex justify-content-between font-weight-bold mt-2">
                                        <div>Closing Balance:</div>
                                        <div>Rs.{finance.closingBalance}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                }
            </Wrapper>
        </>
    )
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);

        const { data } = await axios.post(`${process.env.api}/api/seller/finance`, {
            invoiceDate: 'current'
        }, {
            headers: {
                token: cookies.sell_token,
            },
        });
        return {
            props: {
                financeData: data,
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/seller/login',
                destination: '/seller/login',
                permanent: false,
            },
            props: {},
        };
    }
}
export default Finance;