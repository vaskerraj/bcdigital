import React from 'react';
import Link from 'next/link'
import { parseCookies } from 'nookies';
import axios from 'axios';

import { ChevronLeft } from 'react-feather';

import Wrapper from '../../../../../components/admin/Wrapper';
import ShipAgentForm from '../../../../../components/admin/ShipAgentForm';

const EditAgent = ({ agent }) => {
    return (
        <Wrapper onActive="agents" breadcrumb={["Shipping", "Agents", "Edit Agent"]}>
            <div className="d-block text-right">
                <Link href="/admin/shipping/agents/">
                    <a className="font16 mb-2">
                        <ChevronLeft size={20} />
                        Back
                    </a>
                </Link>
            </div>
            <ShipAgentForm
                action="edit_agent"
                agentData={agent}
            />
        </Wrapper >
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { id } = context.params;
        const { data } = await axios.get(`${process.env.api}/api/shipagent/${id}`, {
            headers: {
                token: cookies.ad_token,
            },
        });

        return {
            props: {
                agent: data
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

export default EditAgent;