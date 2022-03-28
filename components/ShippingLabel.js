import React, { useEffect } from 'react'
import { useBarcode } from '@createnextapp/react-barcode';

import moment from 'moment';

const ShippingLabel = React.forwardRef(({ packageData }, ref) => {
    console.log(packageData)
    const deliveryDetail = packageData.delivery?.addresses[0];

    const { inputRef: trackingIdRef } = useBarcode({
        value: packageData.trackingId,
        options: {
            displayValue: false,
            background: '#fff',
            width: 1.3,
            height: 35,
            marginBottom: '-10px'
        }
    })
    return (
        <div ref={ref} className="p-2" style={{ backgroundColor: '#fff', fontSize: '10px' }}>
            <div className="row mt-2">
                <div className="col-5">
                    <img src="/logo192.png" height="30px" />
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
                <div className="col-7 mt-2">
                    <svg ref={trackingIdRef} />
                    <div className="d-block ml-3">
                        <div className="d-block">
                            <strong>Tracking Id:{packageData.trackingId}</strong>
                        </div>
                        <div className="d-block">
                            Id:

                            <span className="text-uppercase">
                                {packageData.orders._id} | <strong>{packageData._id}</strong>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
})

export default ShippingLabel
