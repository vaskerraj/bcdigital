import React from 'react';
import Link from 'next/link'
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';

import { ChevronLeft } from 'react-feather';

import Wrapper from '../../../../components/admin/Wrapper';
import ShipAgentForm from '../../../../components/admin/ShipAgentForm';

const AddBrands = ({ agents }) => {

    const { adminAuth } = useSelector(state => state.adminAuth);

    return (
        <Wrapper onActive="agents" breadcrumb={["Shipping", "Agents", "Add Agent"]}>
            <div className="d-block text-right">
                <Link href="/admin/shipping/agents/">
                    <a className="font16 mb-2">
                        <ChevronLeft size={20} />
                        Back
                    </a>
                </Link>
            </div>
            <ShipAgentForm
                action="add_agent"
            />
        </Wrapper>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/shipagent`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                agents: data
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

export default AddBrands;