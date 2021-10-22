import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { parseCookies, destroyCookie } from 'nookies';

import axios from "axios";
import axiosApi from '../../helpers/api';

import { message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

function EsweaPaymentSuccess({ oid, amt, refId, cookies }) {
    const router = useRouter();

    const verifyPayment = async () => {

        try {
            let formdata = new FormData();
            formdata.append("amt", amt);
            formdata.append("rid", refId);
            formdata.append("pid", oid);
            formdata.append("scd", process.env.NEXT_PUBLIC_ESEWA_SCD);

            let reqOptions = {
                url: process.env.NEXT_PUBLIC_ESWEA_TRANS_PATH,
                method: "POST",
                data: formdata,
            }

            const { data: varifyData } = await axios.request(reqOptions);

            const parser = new DOMParser();
            let xmlDoc = parser.parseFromString(varifyData, "text/xml");

            const responseCode = xmlDoc.getElementsByTagName("response_code")[0].childNodes[0].nodeValue;

            if (responseCode.trim() === 'Success') {
                const { data: paymentData } = await axiosApi.put(`/api/orders/payment`,
                    {
                        paymentType: 'esewa',
                        amount: amt,
                        orderId: oid,
                        tranId: refId
                    },
                    {
                        headers: {
                            token: cookies
                        }
                    });
                if (paymentData.msg === 'success') {
                    // clear carttems cookie on successfull esewa payment
                    destroyCookie(null, "cartItem");

                    return router.push(`../order-confirm?orderId=${oid}&payment=success`)
                } else if (paymentData.msg === 'unfair_payment') {
                    // clear carttems cookie on successfull esewa payment
                    destroyCookie(null, "cartItem");

                    return router.push(`../payment-issue?orderId=${oid}&payment=error&ref=${refId}`);
                }
            } else {
                return router.push(`./eswea-failed?oid=${oid}`);
            }

        } catch (error) {
            message.warning({
                content: (
                    <div>
                        <div className="font-weight-bold">Error</div>
                        Something went wrong at E-sewa payment. Try another method for payment.
                    </div>
                ),
                className: 'message-warning',
            });
            setTimeout(() => {
                return router.push('../checkout');
            }, 3000);
        }
    }
    useEffect(() => {
        verifyPayment();
    }, []);
    return (
        <div className="container">

            <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
                <LoadingOutlined style={{ fontSize: '3rem' }} />
                Payment Processing...
                <div className="d-block">Please don't close your browser and dont press back button</div>
            </div>
        </div>
    )
}

export async function getServerSideProps(context) {
    try {
        const { token } = parseCookies(context);
        // while unauthorize user try to add product at cart
        const urlquery = context.query;
        const oid = urlquery.oid;
        const amt = urlquery.amt;
        const refId = urlquery.refId;

        return {
            props: {
                oid,
                amt,
                refId,
                cookies: token
            }
        }
    } catch (err) {
        return {
            props: {},
        };
    }
}

export default EsweaPaymentSuccess
