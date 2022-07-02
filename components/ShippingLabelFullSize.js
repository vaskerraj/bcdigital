import React, { useEffect } from 'react'

import { useBarcode } from '@createnextapp/react-barcode';
import * as QRCode from 'easyqrcodejs';

import moment from 'moment';

const ShippingLabelFullSize = React.forwardRef(({ packageData }, ref) => {
    const deliveryDetail = packageData.delivery?.addresses[0];

    const qrcode = React.createRef();

    const { inputRef: trackingIdRef } = useBarcode({
        value: packageData.orders._id,
        options: {
            displayValue: false,
            background: '#fff',
            width: 1.7,
            marginBottom: '-10px'
        }
    });
    const { inputRef: packageIdRef } = useBarcode({
        value: packageData._id,
        options: {
            displayValue: false,
            background: '#fff',
            width: 1.7,
            height: 50,
            marginBottom: '-10px'
        }
    });

    useEffect(() => {
        // Options
        var options = {
            text: packageData._id + '/' + packageData.orders.orderedBy._id,
            width: 150,
            height: 150,
        }
        // Create new QRCode Object
        new QRCode(qrcode.current, options);
    }, [])
    return (
        <div ref={ref} className="p-4 m-3" style={{ border: '2px solid #000', borderRadius: '3px', backgroundColor: '#fff' }}>
            <div className="row mt-2">
                <div className="col-5">
                    <img src="/logo192.png" height="53px" />
                </div>
                <div className="col-7" style={{ borderLeft: '1px solid #ccc' }}>
                    <div className="ml-2">
                        <strong>From: {packageData.seller.name}</strong>
                    </div>
                </div>
            </div>
            <div className="row border-top mt-2">
                <div className="col-5">
                    <strong>To:</strong>
                    <div className="d-block">
                        <div className="d-block font-weight-bold">{deliveryDetail.name}</div>
                        {deliveryDetail.street}
                        {deliveryDetail.area ? ',' + deliveryDetail.area.name : ''}
                        {',' + deliveryDetail.city.name + ',' + deliveryDetail.region.name}
                        <div className="d-block">{packageData.deliveryMobile}</div>
                    </div>
                </div>
                <div className="col-7">
                    <div className="mt-3" style={{ border: '1px solid #ccc' }}>
                        <table className="table table-bordered text-center" style={{ marginBottom: '0px' }}>
                            <tbody>
                                <tr>
                                    <td>Shipping Plan</td>
                                </tr>
                                <tr>
                                    <td>
                                        {packageData.products.reduce((a, c) => a + c.package.weight, 0)} KG
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        {packageData.paymentType === 'cashondelivery' ? 'COD' : 'NON COD'}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        RS. {packageData.paymentType === 'cashondelivery'
                                            ? packageData.packageTotal + packageData.shippingCharge
                                            : 0}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="d-block border-top mt-3 pt-2 text-center">
                <canvas ref={trackingIdRef} />
                <div className="d-block">
                    <strong>Tracking Id:61d5498ab6a</strong>
                </div>
            </div>
            <div className="d-block border-top mt-3 pt-2 text-center">
                <canvas ref={packageIdRef} />
                <div className="d-block">
                    {packageData._id}
                </div>
            </div>
            <div className="row border-top mt-2">
                <div className="col-7">
                    <div className="d-block mt-4">
                        Item Quantity:  {packageData.products.reduce((a, c) => a + c.productQty, 0)}
                    </div>
                    <div className="d-block mt-2">
                        Order At: {moment(packageData.createdAt).format("DD MMM YYYY")}
                    </div>
                </div>
                <div className="col-5 mt-3">
                    <div ref={qrcode}></div>
                </div>
            </div>
        </div>
    )
})

export default ShippingLabelFullSize;
