import React from 'react'
import Image from 'next/image';

import { useBarcode } from '@createnextapp/react-barcode';

import moment from 'moment';

import { customImageLoader } from '../helpers/functions';

const FullShippingLabel = React.forwardRef(({ packageData, sellerReturnAddress = false, type = null }, ref) => {
    const deliveryDetail = sellerReturnAddress ? packageData.returnAddress?.addresses[0] : packageData.delivery?.addresses[0];

    const { inputRef: returnTrackingId } = useBarcode({
        value: packageData.returnTrackingId,
        options: {
            displayValue: false,
            background: '#fff',
            width: 1.7,
            height: 50,
            marginBottom: '-10px'
        }
    });

    const getReturnRequestDate = (products) => {
        const returnRequestDate = products.orderStatusLog.find(item => item.status === "return_request")
        return moment(returnRequestDate.statusChangeDate).format("DD MMM YYYY")
    }

    return (
        <div ref={ref} className="p-4 m-3" style={{ border: '2px solid #000', borderRadius: '3px', backgroundColor: '#fff' }}>
            <div className="row mt-2">
                <div className="col-5">
                    <img src="/logo192.png" height="53px" />
                </div>
                <div className="col-7" style={{ borderLeft: '1px solid #ccc' }}>
                    {!sellerReturnAddress ?
                        <div className="ml-2">
                            <strong>From: {packageData.seller.name}</strong>
                        </div>
                        :
                        type === "fail"
                            ?
                            <div className="ml-2">
                                Return <strong>Fail Delivery</strong>
                            </div>
                            :
                            <div className="ml-2">
                                <strong>Return Delivery</strong>
                            </div>
                    }
                </div>
            </div>
            <div className="row border-top mt-2">
                <div className="col-5">
                    <strong>To:</strong>
                    <div className="d-block">
                        <div className="d-block font-weight-bold">{!sellerReturnAddress ? deliveryDetail.name : packageData.seller.name}</div>
                        {deliveryDetail.street}
                        {deliveryDetail.area ? ',' + deliveryDetail.area.name : ''}
                        {',' + deliveryDetail.city.name + ',' + deliveryDetail.region.name}
                        <div className="d-block">{packageData.deliveryMobile}</div>
                    </div>
                </div>
                <div className="col-7">
                    <div className="mt-3 p-2" style={{ border: '1px solid #ccc' }}>
                        <div className="text-uppercase">ID: {packageData.orders._id} | <b>{packageData._id}</b></div>
                        <div className="mt-1">
                            Return Request: {getReturnRequestDate(packageData.rproducts[0])}
                        </div>
                    </div>
                </div>
            </div>
            <div className="d-block border-top mt-3 pt-2 text-center">
                <canvas ref={returnTrackingId} />
                <div className="d-block">
                    <strong>Tracking Id:{packageData.returnTrackingId}</strong>
                </div>
            </div>

            <div className="d-block border-top mt-3 pt-3">
                <div className="mb-3">
                    {type === "fail"
                        ?
                        <div className="font14" style={{ fontWeight: 400 }}>
                            Return <strong>Fail Items</strong>
                        </div>
                        :
                        <div className="font14" style={{ fontWeight: 400 }}>
                            <strong>Return Items</strong>
                        </div>
                    }
                </div>
                {
                    packageData.rproducts.map(item => (
                        <>
                            <div key={item.products[0]._id} className="pt-3 pb-3">
                                <div className="row">
                                    <div className="col-12 col-sm-7 col-md-7">
                                        <div className="d-flex">
                                            <Image src={`/uploads/products/${item.colour[0].images[0]}`}
                                                layout="fixed"
                                                width="100"
                                                height="100"
                                                objectFit="cover"
                                                objectPosition="top center"
                                                quality="50"
                                                loader={customImageLoader}
                                            />
                                            <div className="product-detail ml-3" style={{ width: '100%' }}>
                                                <div className="product-name">{item.name}</div>
                                                <div className="d-flex justify-content-between align-items-center mt-1">
                                                    <div>
                                                        <div className="">
                                                            {item.products[0].size !== 'nosize' ? `Size : ${item.products[0].size} ` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-none d-sm-block col-sm-2 col-md-2">
                                        <div className="d-flex mt-2">
                                            <div className="pt-1">Qty:</div>
                                            <div className="mt-1">{item.productQty}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ))
                }
            </div>
        </div >
    )
})

export default FullShippingLabel;
