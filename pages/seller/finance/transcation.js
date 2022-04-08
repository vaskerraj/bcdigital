import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head'
import Link from 'next/link'
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import moment from 'moment';

import { message, Table, Input, Select, Tag, DatePicker } from 'antd';
const { Option } = Select;
const { RangePicker } = DatePicker;

import Wrapper from '../../../components/seller/Wrapper';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const SellerTranscation = ({ transcationData, total }) => {

    const [loading, setLoading] = useState(false);
    const [onFirstLoad, setOnFirstLoad] = useState(true);

    const [data, setData] = useState(transcationData);
    const [transTotal, setTransTotal] = useState(total);

    // 
    const [type, setType] = useState(null);
    const [tranDateRange, setTranDateRange] = useState(null);

    // range picker
    const [dates, setDates] = useState([]);
    const [hackValue, setHackValue] = useState();
    const [value, setValue] = useState();

    // router
    const router = useRouter();

    const { sellerAuth } = useSelector(state => state.sellerAuth)

    const recallDeliveryList = async (filterType, filterByPeriod) => {
        setLoading(true);
        try {
            const { data } = await axiosApi.post(`/api/seller/transcation`, {
                type: filterType,
                period: filterByPeriod
            },
                {
                    headers: {
                        token: sellerAuth.token,
                    }
                });
            if (data) {
                setLoading(false);
                setData(data.transcation);
                setTransTotal(data.total);
            }
        } catch (error) {
            setLoading(false)

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
    useEffect(() => {
        if (!onFirstLoad) {
            const filterByType = type !== '' ? type : 'all';
            const defaultStartDate = moment().subtract(1, 'month').format('YYYY-MM-DD');
            const defaultEndDate = moment().format('YYYY-MM-DD');
            const filterByPeriod = tranDateRange !== null ? tranDateRange : {
                startDate: defaultStartDate,
                endDate: defaultEndDate
            };

            // call
            recallDeliveryList(filterByType, filterByPeriod);
        }
    }, [onFirstLoad, type, tranDateRange]);


    const columns = [
        {
            title: 'ID',
            dataIndex: ['_id'],
            key: ['_id'],
            render: (text) => <>{text.toUpperCase()}</>
        },
        {
            title: 'Date',
            dataIndex: ['createdAt'],
            render: (text) => <>{moment(text).format('DD MMM YYYY HH:MM')}</>
        },
        {
            title: 'Type',
            dataIndex: ['transType'],
            render: (text) => <>
                {
                    text === 'orderTotal' ?
                        "Order(item) Total"
                        :
                        text === 'commission' ?
                            "Commission"
                            :
                            text === 'returnOrderTotal' ?
                                "Return Item Total"
                                :
                                text === 'reversalCommission' ?
                                    "Reversal Commission"
                                    :
                                    text
                }
            </>,
        },
        {
            title: 'Order details',
            render: (text, record) => <>
                {record.packageId._id.toUpperCase()}
            </>
        },
        {
            title: 'Amount',
            dataIndex: ['amount'],
            render: (text) => <>
                Rs. {text}
            </>,
        }
    ];

    const handleTranscationTypeChange = useCallback(value => {
        setOnFirstLoad(false);
        setType(value);
    });

    const onChangeDatePicker = useCallback(date => {
        if (date) {
            setDates(date)
            setOnFirstLoad(false);
            setTranDateRange({
                startDate: moment(date[0]).format('YYYY/MM/DD'),
                endDate: moment(date[1]).format('YYYY/MM/DD')
            });
        } else {
            setTranDateRange('all');
        }
    });

    const disabledDate = current => {
        if (!dates || dates.length === 0) {
            return false;
        }
        const tooLate = dates[0] && current.diff(dates[0], 'days') > 30;
        const tooEarly = dates[1] && dates[1].diff(current, 'days') > 30;
        return tooEarly || tooLate;
    };

    const onOpenChange = open => {
        if (open) {
            setHackValue([]);
            setDates([]);
        } else {
            setHackValue(undefined);
        }
    };


    return (
        <>
            <Head>
                <title> Transaction | Seller Center</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Wrapper onActive="transcation" breadcrumb={["Finance", "Transcation"]}>

                <div className="d-block mb-5">
                    <div className="d-flex justify-content-end">
                        <Select defaultValue="all" onChange={handleTranscationTypeChange} style={{ width: 200 }}>
                            <Option value="all">
                                All Transcation
                            </Option>
                            <Option value="orderTotal">
                                Order(item) Total
                            </Option>
                            {/* <Option value="shippingFeePaidBySeller">
                                Shipping Charge
                            </Option> */}
                            <Option value="commission">
                                Commission
                            </Option>
                            <Option value="returnOrderTotal">
                                Return Order(item) Total
                            </Option>
                            <Option value="reversalCommission">
                                Reversal Commission
                            </Option>
                        </Select>
                        <RangePicker
                            defaultValue={[moment().subtract(1, 'months'), moment()]}
                            allowClear={false}
                            format={'YYYY-MM-DD'}
                            value={hackValue || value}
                            onCalendarChange={(date) => onChangeDatePicker(date)}
                            onChange={val => setValue(val)}
                            disabledDate={disabledDate}
                            onOpenChange={onOpenChange}
                            className="form-control ml-3 mr-2"
                            style={{ width: 250 }}
                        />
                    </div>
                </div>
                <div className="mt-4 text-right">Total Amount: <strong>Rs.{transTotal}</strong></div>
                <div className="d-block table-responsive mt-5">
                    <Table
                        rowKey="_id"
                        columns={columns}
                        dataSource={data}
                        loading={loading}
                        pagination={false}
                    />
                </div>
            </Wrapper>
        </>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const defaultStartDate = moment().subtract(1, 'month').format("YYYY-MM-DD")
        const defaultEndDate = moment().format("YYYY-MM-DD");

        const type = "all";
        const period = {
            startDate: defaultStartDate,
            endDate: defaultEndDate,
        }
        const { data } = await axios.post(`${process.env.api}/api/seller/transcation`, {
            type,
            period
        },
            {
                headers: {
                    token: cookies.sell_token,
                },
            });
        return {
            props: {
                transcationData: data.transcation,
                total: data.total
            }
        }
    } catch (err) {
        console.log(err)
        return {
            redirect: {
                source: '/seller/login',
                destination: '/seller/login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}
export default SellerTranscation;
