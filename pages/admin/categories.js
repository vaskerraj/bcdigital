import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';

import axiosApi from '../../helpers/api';
import { message } from 'antd';

import Wrapper from '../../components/admin/Wrapper';
import CategoryBlock from '../../components/admin/CategoryBlock';
import CategoryModal from '../../components/admin/CategoryModal';
import SubCategoryBlock from '../../components/admin/SubCategoryBlock';

const Categories = ({ categories }) => {
    const [subCategories, setSubCategories] = useState('');
    const [givenCategory, setGivenCategory] = useState('');
    const [activeCat, setActiveCat] = useState();

    const [modalAction, setModalAction] = useState();
    const [modalTitle, setModalTitle] = useState('');
    const [visible, setVisible] = useState(false);

    const router = useRouter();

    const { adminAuth } = useSelector(state => state.adminAuth);

    const addCategoryHandler = category => {
        const categoryTitle = typeof (category) === 'string'
            ?
            `Add New Category`
            :
            `Add Sub-Category at ${category.name}`;

        setModalAction("add_category");
        setModalTitle(categoryTitle);
        setGivenCategory(category);
        setVisible(true);
    }

    const editCategoriesHandler = (category) => {
        const categoryTitle = `Edit ${category.name}`;

        setModalAction("edit_category");
        setModalTitle(categoryTitle);
        setGivenCategory(category);
        setVisible(true);
    }
    const deleteCategoriesHandler = async (id) => {
        try {
            const { data } = await axiosApi.delete(`/api/category/${id}`, {
                headers: {
                    token: adminAuth.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Category succssfully deleted
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

    const subCategoryClickHandler = (e) => {
        for (const li of document.querySelectorAll(".category-block.subs li.active")) {
            li.classList.remove("active");
        }
        e.currentTarget.classList.add("active");
    }

    const subCategoryHandler = (category, categoriesChild) => {
        setActiveCat(category._id)
        setSubCategories(
            <SubCategoryBlock
                category={category}
                categoriesChild={categoriesChild}
                subCategoryClickHandler={subCategoryClickHandler}
                editHandler={editCategoriesHandler}
                popConfirm={popConfirm}
                addCategoryHandler={addCategoryHandler}
                activeCat={activeCat}
            />
        );
    }
    const popConfirm = (id) => {
        deleteCategoriesHandler(id)
    }

    return (
        <Wrapper onActive="categories" breadcrumb={["Categories"]}>
            <CategoryModal
                title={modalTitle}
                categoryArray={givenCategory}
                visible={visible}
                handleCancel={handleCancel}
                modalAction={modalAction}
            />
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
                    popConfirm={popConfirm}
                    subCategoryHandler={subCategoryHandler}
                    activeCat={activeCat}
                />
                {subCategories}
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