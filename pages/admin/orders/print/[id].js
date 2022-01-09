import React, { useRef, useCallback } from 'react';
import { parseCookies } from 'nookies';
import axios from 'axios';

import { useReactToPrint } from 'react-to-print';

import ShippingLabel from '../../../../components/ShippingLabel';

const PrintShippingLabel = ({ packageData }) => {
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

    return (
        <div className="mx-auto my-4 mt-4" style={{ maxWidth: '550px' }}>
            <div className="d-block text-right">
                <button className="btn c-btn-primary mb-3" onClick={handlePrint}>Print</button>
            </div>
            <ShippingLabel ref={componentRef} packageData={packageData} />
        </div>
    )
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { id } = context.params;
        const { data } = await axios.get(`${process.env.api}/api/admin/package/${id}`, {
            headers: {
                token: cookies.ad_token,
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
export default PrintShippingLabel;
