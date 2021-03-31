import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';

import Wrapper from '../../components/admin/Wrapper';
import CategoryBlock from '../../components/admin/CategoryBlock';

const Categories = ({ categories }) => {
    const [activeCat, setActiveCat] = useState();

    const dispatch = useDispatch();

    const { adminAuth } = useSelector(state => state.adminAuth);

    const addCategoryHandler = category => {

    }

    const editCategoriesHandler = (category, subCategory) => {

    }
    const deleteCategoriesHandler = (category) => {
    }

    const subCategoryClickHandler = (e) => {
        e.target.classList.add("active");
    }

    const subCategoryHandler = (category, categoriesChild) => {
        setActiveCat(category._id)
    }

    return (
        <Wrapper onActive="categories" breadcrumb={["Categories"]}>
            <div className="d-block text-right mb-3">
                {categories.length !== 0 &&
                    <Link href="/admin/sub-category">
                        <button className="btn btn-lg c-btn-primary font16">
                            Add Sub-Categories
                        </button>
                    </Link>
                }
            </div>
            <div className="d-flex">
                <CategoryBlock
                    categories={categories}
                    categoryInfo="Categories"
                    addCategory={addCategoryHandler}
                    editHandler={editCategoriesHandler}
                    deleteHandler={deleteCategoriesHandler}
                    subCategoryHandler={subCategoryHandler}
                    activeCat={activeCat}
                />
            </div >
        </Wrapper >
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

export default Categories;