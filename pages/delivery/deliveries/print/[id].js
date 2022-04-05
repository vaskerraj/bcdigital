import React, { useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../../helpers/api';

import { useReactToPrint } from 'react-to-print';

import { message, Button } from 'antd';

import ShippingLabel from '../../../../components/ShippingLabel';

const PrintSellerReturnLabel = ({ packageData }) => {

    const router = useRouter();
    const { deliveryAuth } = useSelector(state => state.deliveryAuth);

    const printType = router.query.type;

    const componentRef = useRef();

    const handleAfterPrint = useCallback(() => {
        console.log("`onAfterPrint` called");
    }, []);


    const pageStyle = `
            @page {
                size: 96mm 48mm;
                margin:0
            }
        `;

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        onAfterPrint: handleAfterPrint,
        pageStyle: pageStyle
    });

    const handleFailDelivery = async (packageId) => {
        try {
            const { data } = await axiosApi.put(`/api/delivery/makefaildelivery`,
                {
                    type: "id",
                    id: packageId,
                },
                {
                    headers: {
                        token: deliveryAuth.token
                    }
                });
            if (data) {
                if (data.msg === "not_found") {
                    message.warning({
                        content: (
                            <div>
                                <div className="font-weight-bold">No Found</div>
                                Package not valid to make fail delivery and return.
                            </div>
                        ),
                        className: 'message-warning',
                    });
                } else {
                    message.success({
                        content: (
                            <div>
                                <div className="font-weight-bold">Success</div>
                                Successfully update.Process to return.
                            </div>
                        ),
                        className: 'message-success',
                    });
                    setTimeout(() => {
                        return router.back();
                    }, 4000);
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
    const handleReturnDelivery = async (packageId) => {

    }
    return (
        <div className="mx-auto my-4 mt-4" style={{ maxWidth: '550px' }}>
            <div className="d-block text-right">
                <button className="btn c-btn-primary mr-3 mb-3 mt-1" onClick={handlePrint}>Print</button>
                {printType === "fail" ?
                    <Button danger size="large" onClick={() => handleFailDelivery(packageData._id)}>Make Fail Delivery</Button>
                    :
                    <Button danger size="large" onClick={() => handleReturnDelivery(packageData._id)}>Make Return</Button>
                }
            </div>
            <ShippingLabel
                ref={componentRef}
                packageData={packageData}
                sellerReturnAddress={true}
                type={printType} // type will be fail (fail_delivery) or return delivery(return from customer)
            />
        </div>
    )
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { id } = context.params;
        const { data } = await axios.get(`${process.env.api}/api/delivery/seller/return/${id}`, {
            headers: {
                token: cookies.del_token,
            },
        });
        return {
            props: {
                packageData: data
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
export default PrintSellerReturnLabel;
