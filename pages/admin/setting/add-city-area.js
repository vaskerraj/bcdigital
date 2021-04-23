import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { ChevronLeft } from 'react-feather';

import { useForm } from 'react-hook-form';
import { message } from 'antd';

import Wrapper from '../../../components/admin/Wrapper';

const SubCategory = ({ addresses }) => {
    const [subAddresses, setSubAddresses] = useState('');
    const [inputLabel, setInputLabel] = useState('City');
    const router = useRouter();

    const { adminAuth } = useSelector(state => state.adminAuth);

    const { register, handleSubmit, errors } = useForm();

    const parentIdChangeHandler = (e) => {
        if (e.target.value !== '') {
            setInputLabel('Area');
        } else {
            setInputLabel('City');
        }
    }

    const subAddressSelect = (address, addressesChild, nextLabel) => (
        (addressesChild !== null && addressesChild !== '') &&
        address.children.length !== 0 &&
        <div className="clearfix mr-4" style={{ width: '20rem' }}>
            <label className="cat-label">
                {nextLabel}
            </label>
            <select defaultValue="" name="parentId"
                className="form-control"
                onChange={(e) => parentIdChangeHandler(e)}
                ref={register()}
            >
                <option value="">Select</option>
                {addressesChild.map(add =>
                    <option
                        key={add._id}
                        addresses={JSON.stringify(add)}
                        subs={JSON.stringify(add.children)}
                        value={add._id}>
                        {add.slug}
                    </option>
                )}
            </select>
        </div>
    );
    const subAddressHandler = (e, nextLabel) => {
        setInputLabel(nextLabel);
        let index = e.target.selectedIndex;
        let el = e.target.childNodes[index];
        const addressesInfo = el.getAttribute('addresses');
        const addressesChild = el.getAttribute('subs');
        setSubAddresses(subAddressSelect(JSON.parse(addressesInfo), JSON.parse(addressesChild), nextLabel));
    }
    const onSubmit = async (inputdata) => {
        try {
            const { data } = await axiosApi.post('/api/defaultaddresses', {
                name: inputdata.name,
                parentId: inputdata.parentId ? inputdata.parentId : inputdata.region
            }, {
                headers: {
                    token: adminAuth.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            {inputLabel} succssfully added
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.push('/admin/setting/default-address');
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
    return (
        <Wrapper onActive="setting" breadcrumb={["Setting", "Default Address", "Add City/Area"]}>
            <div className="d-block text-right">
                <Link href="/admin/setting/default-address">
                    <a className="font16 mb-2">
                        <ChevronLeft size={20} />
                        Back
                    </a>
                </Link>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="d-flex">
                    <div className="clearfix mr-4" style={{ width: '20rem' }}>
                        <label className="cat-label">Select Region</label>
                        <select
                            defaultValue=""
                            name="region"
                            onChange={(e) => subAddressHandler(e, 'City')}
                            className="form-control"
                            ref={register({
                                required: "Select region"
                            })}
                        >
                            <option value="" selected>Select</option>
                            {addresses.map(add =>
                                <option
                                    key={add._id}
                                    addresses={JSON.stringify(add)}
                                    subs={JSON.stringify(add.children)}
                                    value={add._id}>
                                    {add.name}
                                </option>
                            )}
                        </select>
                        {errors.region && <p className="errorMsg">{errors.region.message}</p>}
                    </div>
                    {subAddresses}
                </div>
                <div className="form-group col-12 col-sm-4 mt-sm-5">
                    <label className="cat-label">{inputLabel}</label>
                    <input
                        type="text"
                        name="name"
                        className="form-control"
                        ref={register({
                            required: `Provide ${inputLabel.toLowerCase()}`
                        })}
                    />
                    {errors.name && <p className="errorMsg">{errors.name.message}</p>}
                </div>
                <div className="d-block mt-5">
                    <button type="submit" className="btn btn-lg c-btn-primary font16">
                        ADD {inputLabel.toUpperCase()}
                    </button>
                </div>
            </form>
        </Wrapper>
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

export default SubCategory;
