import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';

import axiosApi from '../../helpers/api';
import { message } from 'antd';

import { Edit3, Trash2 } from 'react-feather';

import Wrapper from '../../components/admin/Wrapper';
import BrandModal from '../../components/admin/BrandModal';

const Brands = ({ brands }) => {

    const [visible, setVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalAction, setmodalAction] = useState('');
    const addBrand = () => {
        setVisible(true);
        setModalTitle("Add Brand");
        setmodalAction("add_brand");
    }
    const handleCancel = () => {
        setVisible(false);
    }
    return (
        <Wrapper onActive="index" breadcrumb={["Brands"]}>
            <BrandModal
                title={modalTitle}
                visible={visible}
                handleCancel={handleCancel}
                modalAction={modalAction}
            />
            <div className="d-block text-right mb-3">
                <button onClick={() => addBrand()} className="btn btn-lg c-btn-primary font16">
                    Add Brand
                </button>
            </div>
            <div className="d-block">
                <div className="row">
                    {brands && brands.map(brand => (
                        <div className="col-sm-2 col-md-3">
                            <div className="brand-block d-block p-3 mt-3 mt-sm-0">
                                <div className="rounded img-thumbnail">
                                    <img src={`/uploads/brands/${brand.image}`} height="140" width="100%" />
                                </div>
                                <div className="d-block mt-4 font-weight-bold font16">
                                    {brand.name}
                                </div>
                                <div className="d-flex justify-content-between mt-3">
                                    <button className="btn c-btn-primary" style={{ paddingLeft: '1.2rem', paddingRight: '1.2rem', border: '1px solid' }}>
                                        <Edit3 size={16} />
                                    </button>
                                    <button className="btn c-btn-primary">
                                        <Trash2 size={16} /> Delete
                                </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div >
            </div>
        </Wrapper>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/admin/brands`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                brands: data
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

export default Brands;