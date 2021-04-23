import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { message } from 'antd';

import Wrapper from '../../../components/admin/Wrapper';
import SettingTab from '../../../components/admin/SettingTab';
import DefaultAddressModal from '../../../components/admin/DefaultAddressModal';
import DefaultAddressBlock from '../../../components/admin/DefaultAddressBlock';
import SubDefaultAddressBlock from '../../../components/admin/SubDefaultAddressBlock';

const Setting = ({ addresses }) => {
    const [cityArea, setCityArea] = useState('');
    const [givenAddress, setGivenAddress] = useState('');
    const [activeAdd, setActiveAdd] = useState();

    const [modalAction, setModalAction] = useState();
    const [modalTitle, setModalTitle] = useState('');
    const [visible, setVisible] = useState(false);

    const router = useRouter();
    const dispatch = useDispatch();

    const { adminAuth } = useSelector(state => state.adminAuth);

    const addAddressHandler = (address, section) => {
        let addressTitle;
        switch (section) {
            case 'Region':
                addressTitle = "Add Region";
                break;
            case 'City':
                addressTitle = "Add City";
                break;
            case 'Area':
                addressTitle = "Add Area";
                break;
            default:
                addressTitle = "Add Address";
                break;
        }

        setModalAction("add_address");
        setModalTitle(addressTitle);
        setGivenAddress(address);
        setVisible(true);
    }

    const editAddressHandler = (address, section) => {
        const addressTitle = `Edit ${address.name}`;

        setModalAction("edit_address");
        setModalTitle(addressTitle);
        setGivenAddress(address);
        setVisible(true);
    }

    const deleteAddressHandler = async (id, section) => {
        try {
            const { data } = await axiosApi.delete(`/api/defaultAddress/${id}`, {
                headers: {
                    token: adminAuth.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            {section} succssfully deleted
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.reload();
                }, 2000);
            }
        } catch (error) {
            message.warning({
                content: (
                    <div>
                        <div className="font-weight-bold">Error</div>
                        {error.response ? error.response.data.error : error.message}
                    </div>
                ),
                className: 'message-warning',
            });
        }
    }

    const handleCancel = () => {
        setVisible(false);
    }

    const subAddressClickHandler = (e) => {
        for (const li of document.querySelectorAll(".category-block.subs li.active")) {
            li.classList.remove("active");
        }
        e.currentTarget.classList.add("active");
    }

    const subAddressHandler = (address, addressChild) => {
        setActiveAdd(address._id)
        setCityArea(
            <SubDefaultAddressBlock
                address={address}
                addressChild={addressChild}
                subAddressClickHandler={subAddressClickHandler}
                editHandler={editAddressHandler}
                popConfirm={popConfirm}
                addAddressHandler={addAddressHandler}
                activeAdd={activeAdd}
            />
        );
    }
    const popConfirm = (id, section) => {
        deleteAddressHandler(id, section)
    }

    return (
        <Wrapper onActive="setting" breadcrumb={["Setting"]}>
            <DefaultAddressModal
                title={modalTitle}
                addressArray={givenAddress}
                visible={visible}
                handleCancel={handleCancel}
                modalAction={modalAction}
            />
            <SettingTab />
            <div className="d-block">
                <div className="d-block text-right mb-3">
                    {addresses.length !== 0 &&
                        <Link href="/admin/setting/add-city-area">
                            <button className="btn btn-lg c-btn-primary font16">
                                Add City/Area
                            </button>
                        </Link>
                    }
                </div>
                <div className="d-flex mt-lg-4">
                    <DefaultAddressBlock
                        addresses={addresses}
                        addressInfo="Region"
                        addAddress={addAddressHandler}
                        editHandler={editAddressHandler}
                        popConfirm={popConfirm}
                        subAddressHandler={subAddressHandler}
                        activeAdd={activeAdd}
                    />
                    {cityArea}
                </div >
            </div>
        </Wrapper >
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/admin/defaultadd`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                addresses: data
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

export default Setting;