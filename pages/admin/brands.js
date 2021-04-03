import React, { useState } from 'react';
import Image from 'next/image'
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';

import axiosApi from '../../helpers/api';
import { Popconfirm, message } from 'antd';
import { Edit3, Trash2 } from 'react-feather';

import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';

import Wrapper from '../../components/admin/Wrapper';
import BrandModal from '../../components/admin/BrandModal';

const Brands = ({ brands }) => {
    const [brandItem, setBrandItem] = useState(Object.values(brands));
    const [visible, setVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalAction, setmodalAction] = useState('');
    const [brandsData, setBrandsData] = useState();

    const { adminAuth } = useSelector(state => state.adminAuth);

    const addBrand = () => {
        setVisible(true);
        setModalTitle("Add Brand");
        setmodalAction("add_brand");
        setBrandsData('');
    }
    const handleCancel = () => {
        setVisible(false);
    }

    const onDeleteHandler = async (id) => {
        try {
            const { data } = await axiosApi.delete(`/api/brands/${id}`, {
                headers: {
                    token: adminAuth.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Brands succssfully deleted
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

    const onEditHandler = (brands) => {
        setVisible(true);
        setModalTitle("Edit Brand");
        setmodalAction("edit_brand");
        setBrandsData(brands);
    }
    const SortableBrands = SortableElement(({ value }) =>
        <div className="col-sm-6 col-md-3 mt-4">
            <div className="brand-block d-block p-3 mt-3 mt-sm-0">
                <div className="rounded img-thumbnail text-center">
                    <Image src={`/uploads/brands/${value.image}`} height="140" width="auto" />
                </div>
                <div className="d-block mt-4 font-weight-bold font16">
                    {value.name}
                </div>
                <div className="d-flex justify-content-between mt-3">
                    <button onClick={() => onEditHandler(value)} className="btn c-btn-primary" style={{ paddingLeft: '1.2rem', paddingRight: '1.2rem', border: '1px solid' }}>
                        <Edit3 size={16} />
                    </button>
                    <Popconfirm
                        title="Are you sure to delete this brand?"
                        onConfirm={() => onDeleteHandler(value._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <button className="btn c-btn-primary">
                            <Trash2 size={16} /> Delete
                        </button>
                    </Popconfirm>
                </div>
            </div>
        </div>
    );

    const SortableBrandList = SortableContainer(({ items }) => {
        return (
            <div className="row">
                {items.map((value, index) => (
                    <SortableBrands key={`item-${value._id}`} index={index} value={value} />
                ))}
            </div>
        );
    });

    const onSortEnd = ({ oldIndex, newIndex }) => {
        setBrandItem(arrayMove(brandItem, oldIndex, newIndex));
        const newArray = arrayMove(brandItem, oldIndex, newIndex);
        async function reorderBrand() {
            const { data } = await axiosApi.post('/api/orderbrands', {
                order: newArray
            }, {
                headers: {
                    token: adminAuth.token
                }
            });
        }
        reorderBrand();
    };
    return (
        <Wrapper onActive="brands" breadcrumb={["Brands"]}>
            <BrandModal
                title={modalTitle}
                visible={visible}
                handleCancel={handleCancel}
                modalAction={modalAction}
                brandsData={brandsData}
            />
            <div className="d-block text-right mb-3">
                <button onClick={() => addBrand()} className="btn btn-lg c-btn-primary font16">
                    Add Brand
                </button>
            </div>
            <div className="d-block">
                <SortableBrandList items={brandItem} onSortEnd={onSortEnd} />
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