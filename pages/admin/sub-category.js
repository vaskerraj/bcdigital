import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../helpers/api';

import { useForm } from 'react-hook-form';
import { message } from 'antd';

import Wrapper from '../../components/admin/Wrapper';

const SubCategory = ({ categories }) => {
    const [subCategories, setSubCategories] = useState('');
    const router = useRouter();

    const { adminAuth } = useSelector(state => state.adminAuth);

    const { register, handleSubmit, errors } = useForm();

    const subCategorySelect = (category, categoriesChild) => (
        (categoriesChild !== null && categoriesChild !== '') &&
        category.children.length !== 0 &&
        <div className="clearfix mr-4" style={{ width: '20rem' }}>
            <label className="cat-label">
                {typeof (category) === 'string' ? category : category.name}
            </label>
            <select name="parentId"
                className="form-control"
                ref={register()}
            >
                <option value="">---Select---</option>
                {categoriesChild.map(cat =>
                    <option
                        key={cat._id}
                        categories={JSON.stringify(cat)}
                        subs={JSON.stringify(cat.children)}
                        value={cat._id}>
                        {cat.slug}
                    </option>
                )}
            </select>
        </div>
    );
    const subCategoryHandler = (e) => {
        let index = e.target.selectedIndex;
        let el = e.target.childNodes[index];
        const categoriesInfo = el.getAttribute('categories');
        const categoriesChild = el.getAttribute('subs');
        setSubCategories(subCategorySelect(JSON.parse(categoriesInfo), JSON.parse(categoriesChild)));
    }
    const onSubmit = async (inputdata) => {
        try {
            const { data } = await axiosApi.post('/api/categories', {
                name: inputdata.name,
                parentId: inputdata.parentId ? inputdata.parentId : inputdata.category
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
                            Sub category succssfully added
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.push('/admin/categories');
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
        <Wrapper onActive="categories" breadcrumb={["Categories", "Add Sub Categories"]}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="d-flex">
                    <div className="clearfix mr-4" style={{ width: '20rem' }}>
                        <label className="cat-label">Select Category</label>
                        <select
                            defaultValue=""
                            name="category"
                            onChange={subCategoryHandler}
                            className="form-control"
                            ref={register({
                                required: "Select category"
                            })}
                        >
                            <option value="" selected>Select</option>
                            {categories.map(cat =>
                                <option
                                    key={cat._id}
                                    categories={JSON.stringify(cat)}
                                    subs={JSON.stringify(cat.children)}
                                    value={cat._id}>
                                    {cat.name}
                                </option>
                            )}
                        </select>
                        {errors.category && <p className="errorMsg">{errors.category.message}</p>}
                    </div>
                    {subCategories}
                </div>
                <div className="form-group col-12 col-sm-4 mt-sm-5">
                    <label className="cat-label">Sub-Category Name</label>
                    <input
                        type="text"
                        name="name"
                        className="form-control"
                        ref={register({
                            required: "Provide category name"
                        })}
                    />
                    {errors.name && <p className="errorMsg">{errors.name.message}</p>}
                </div>
                <div className="d-block mt-5">
                    <button type="submit" className="btn btn-lg c-btn-primary font16">
                        ADD SUB CATEGORY
                    </button>
                </div>
            </form>
        </Wrapper>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/admingetcat`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                categories: data
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
