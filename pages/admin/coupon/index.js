import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import moment from 'moment';

import { message, Popconfirm } from 'antd';
import { EditFilled, DeleteFilled } from '@ant-design/icons';

import Wrapper from '../../../components/admin/Wrapper';
import { ReactTable } from '../../../components/helpers/ReactTable';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const CouponList = ({ coupons }) => {

    const router = useRouter();
    const { adminAuth } = useSelector(state => state.adminAuth);

    const precolumns = useMemo(() => [
        {
            Header: "Code",
            accessor: "code",
            sortable: true,
            show: true,
            displayValue: " Code ",

        },
        {
            Header: "Description",
            accessor: "description",
            sortable: false,
            show: true,
            displayValue: " Description "
        },
        {
            Header: "Coupon For",
            accessor: row => row.availableFor,
            Cell: ({ row: { original } }) => (
                original.availableFor === 'alluser' ?
                    (<span className="badge bg-warning">All User</span >)
                    :
                    (<span className="badge bg-success">New User</span>)
            )
        },
        {
            Header: "Dicount Amount",
            accessor: "discountAmount",
            accessor: row => row.discountAmount,
            Cell: ({ row: { original } }) => (
                <span>
                    {original.discountType === 'percentage' ? original.discountAmount + ' %' : 'RS ' + original.discountAmount}
                </span>
            )
        },
        {
            Header: "Min Basket",
            accessor: "minBasket",
            sortable: false,
            show: true,
            displayValue: " Min. Basket "
        },
        {
            Header: "Vouchers",
            accessor: "totalVoucher",
        },
        {
            Header: "Remaining Voucher",
            accessor: "remainingVoucher",
        },
        {
            Header: "Allowed / user",
            accessor: "redeemsPerUser",
        },
        {
            Header: "Expire Date",
            accessor: row => row.validityEnd,
            Cell: ({ row: { original } }) => (
                <span>
                    {moment(original.validityEnd).format('ddd, DD MMM YYYY')}
                </span>
            )
        },
        {
            Header: "Actions",
            show: true,
            Cell: ({ row: { original } }) => (
                <>
                    <Link href={`/admin/coupon/edit/${original._id}`}>
                        <button type="button" className="btn btn-info mr-2">
                            <EditFilled />
                        </button>
                    </Link>
                    <Popconfirm
                        title="Are you sure to delete this sub-admin?"
                        onConfirm={() => deleteCouponHandler(original._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <button className="btn btn-warning">
                            <DeleteFilled />
                        </button>
                    </Popconfirm>

                </>
            )
        }
    ]);

    const deleteCouponHandler = useCallback(async (id) => {
        try {
            const { data } = await axiosApi.delete(`/api/coupon/${id}`, {
                headers: {
                    token: adminAuth.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Sub admin successfully deleted
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.reload();
                }, 2000);
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
    });


    return (
        <Wrapper onActive="coupon" breadcrumb={["Coupon"]}>
            <div className="d-block text-right mt-5">
                <Link href="/admin/coupon/add">
                    <button type="button" className="btn c-btn-primary">
                        Add Coupon
                    </button>
                </Link>
            </div>
            <div className="table-responsive mt-5">
                <ReactTable
                    columns={precolumns}
                    data={coupons}
                    defaultPageSize={100}
                    tableClass={'table-bordered'}
                />
            </div>
        </Wrapper >
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/admin/coupon`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                coupons: data
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/admin/login',
                destination: '/admin/login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}

export default CouponList;