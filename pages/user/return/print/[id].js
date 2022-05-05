import React, { useRef, useCallback } from 'react';
import { parseCookies } from 'nookies';
import axios from 'axios';

import { useReactToPrint } from 'react-to-print';

import FullShippingLabel from '../../../../components/FullShippingLabel';

const PrintReturnLabel = ({ packageData }) => {
    const componentRef = useRef();

    const handleAfterPrint = useCallback(() => {
        console.log("`onAfterPrint` called");
    }, []);


    const pageStyle = `
            @page {
                size: A4;
                margin:0
            }
        `;

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        onAfterPrint: handleAfterPrint,
        pageStyle: pageStyle
    });

    return (
        <div className="mx-auto my-4 mt-4" style={{ maxWidth: '850px' }}>
            <div className="d-block text-right">
                <button className="btn c-btn-primary mb-3" onClick={handlePrint}>Print</button>
            </div>
            <FullShippingLabel
                ref={componentRef}
                packageData={packageData}
                sellerReturnAddress={true}
                type="return"
            />
        </div>
    )
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { id } = context.params;
        const { trackingId } = context.query;
        const { data } = await axios.get(`${process.env.api}/api/retrunitems/${id}/${trackingId}`, {
            headers: {
                token: cookies.token,
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
                destination: '../../../login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}
export default PrintReturnLabel;
