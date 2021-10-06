import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../helpers/api';

import Wrapper from '../../components/seller/Wrapper';

const SellerDashbaord = () => {
    const dispatch = useDispatch();

    const { sellerAuth } = useSelector(state => state.sellerAuth);

    return (
        <Wrapper onActive="index" breadcrumb={["Dashboard"]}>
            <div className="d-block">
                Dashboard page
            </div>
        </Wrapper>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/isseller`, {
            headers: {
                token: cookies.sell_token,
            },
        });
        if (data) {
            if (data.stepComplete) {
                return {
                    props: {}
                }
            } else {
                if (data.step === 'company') {
                    return {
                        redirect: {
                            source: '/seller/start/addresses',
                            destination: '/seller/start/addresses',
                            permanent: false,
                        }
                    }
                } else if (data.step === 'addresses') {
                    return {
                        redirect: {
                            source: '/seller/start/bank',
                            destination: '/seller/start/bank',
                            permanent: false,
                        }
                    }
                }
            }
        } else {
            return {
                redirect: {
                    source: '/seller/start/company',
                    destination: '/seller/start/company',
                    permanent: false,
                }
            }
        }
    } catch (err) {
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

export default SellerDashbaord;