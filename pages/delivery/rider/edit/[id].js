import React from 'react';
import Link from 'next/link'
import { parseCookies } from 'nookies';
import axios from 'axios';

import { ChevronLeft } from 'react-feather';

import Wrapper from '../../../../components/delivery/Wrapper';
import DeliveryRiderForm from '../../../../components/delivery/forms/DeliveryRiderForm';

const EditRiderBranch = ({ cities, rider }) => {
    return (
        <Wrapper onActive="manageRider" breadcrumb={["Manage Riders", "Edit Rider"]}>
            <div className="d-block text-right">
                <Link href="/delivery/rider/">
                    <a className="font16 mb-2">
                        <ChevronLeft size={20} />
                        Back
                    </a>
                </Link>
            </div>
            <DeliveryRiderForm
                action="edit_rider"
                cities={cities}
                riderData={rider}
            />
        </Wrapper>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        if (cookies.del_role === "rider") {
            //only rider cant access
            return {
                redirect: {
                    source: '/delivery/404',
                    destination: '/delivery/404',
                    permanent: false,
                },
            }
        }
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
                rider: data,
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

export default EditRiderBranch;