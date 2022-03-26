import React from 'react';
import Link from 'next/link'
import { parseCookies } from 'nookies';
import axios from 'axios';

import { ChevronLeft } from 'react-feather';

import Wrapper from '../../../../components/delivery/Wrapper';
import DeliveryBranchForm from '../../../../components/delivery/forms/DeliveryBranchForm';

const EditDeliveryBranch = ({ cities, branch }) => {
    return (
        <Wrapper onActive="manageBranch" breadcrumb={["Manage Branch", "Edit Branch"]}>
            <div className="d-block text-right">
                <Link href="/delivery/branch/">
                    <a className="font16 mb-2">
                        <ChevronLeft size={20} />
                        Back
                    </a>
                </Link>
            </div>
            <DeliveryBranchForm
                action="edit_branch"
                cities={cities}
                branchData={branch}
            />
        </Wrapper>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { id } = context.params;
        const { data } = await axios.get(`${process.env.api}/api/delivery/branch/${id}`, {
            headers: {
                token: cookies.del_token,
            },
        });

        const { data: cityData } = await axios.get(`${process.env.api}/api/related/citylist`, {
            headers: {
                token: cookies.del_token,
            },
        });

        return {
            props: {
                cities: cityData,
                branch: data,
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

export default EditDeliveryBranch;