import React, { useState } from 'react';
import Link from 'next/link'
import Image from 'next/image'
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';

import axiosApi from '../../../helpers/api';
import { Popconfirm, message } from 'antd';
import { Edit3, Trash2 } from 'react-feather';

import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';

import Wrapper from '../../../components/admin/Wrapper';

const Brands = ({ banner }) => {
    const [bannerItem, setBannerItem] = useState(Object.values(banner));

    const { adminAuth } = useSelector(state => state.adminAuth);

    const onDeleteHandler = async (id) => {
        try {
            const { data } = await axiosApi.delete(`/api/banner/${id}`, {
                headers: {
                    token: adminAuth.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Banner succssfully deleted
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

    const SortableBanners = SortableElement(({ value }) =>
        <div className="col-sm-6 col-md-4 mt-4">
            <div className="brand-block d-block p-3 mt-3 mt-sm-0">
                <div className="rounded img-thumbnail text-center">
                    <Image src={`/uploads/brands/${value.image}`} height="160" width="100%" />
                </div>
                <div className="d-block mt-4 font-weight-bold font16">
                    {value.name}
                </div>
                <div className="d-flex justify-content-between mt-3">
                    <Link href={`/admin/banner/edit/${value._id}`}>
                        <button className="btn c-btn-primary" style={{ paddingLeft: '1.2rem', paddingRight: '1.2rem', border: '1px solid' }}>
                            <Edit3 size={16} />
                        </button>
                    </Link>
                    <Popconfirm
                        title="Are you sure to delete this banner?"
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
                    <SortableBanners key={`item-${value._id}`} index={index} value={value} />
                ))}
            </div>
        );
    });

    const onSortEnd = ({ oldIndex, newIndex }) => {
        setBannerItem(arrayMove(bannerItem, oldIndex, newIndex));
        const newArray = arrayMove(bannerItem, oldIndex, newIndex);
        async function reorderBrand() {
            const { data } = await axiosApi.post('/api/orderbanner', {
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
        <Wrapper onActive="banners" breadcrumb={["Banners"]}>
            <div className="d-block text-right mb-3">
                <Link href="/admin/banner/add">
                    <button className="btn btn-lg c-btn-primary font16">
                        Add Banner
                    </button>
                </Link>
            </div>
            <div className="d-block">
                {(bannerItem && bannerItem.length === 0) && <div className="d-block text-center mt-5 text-muted font16">No Data</div>}
                <SortableBrandList items={bannerItem} onSortEnd={onSortEnd} />
            </div>
        </Wrapper>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/admin/banner`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                banner: data
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