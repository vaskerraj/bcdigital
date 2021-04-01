import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';

import axiosApi from '../../helpers/api';
import { useForm } from 'react-hook-form';
import { message } from 'antd';

import Wrapper from '../../components/admin/Wrapper';
import CategoryBlock from '../../components/admin/CategoryBlock';
import CategoryModal from '../../components/admin/CategoryModal';
import SubCategoryBlock from '../../components/admin/SubCategoryBlock';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const Categories = ({ categories }) => {
    const [subCategories, setSubCategories] = useState('');
    const [givenCategory, setGivenCategory] = useState('');
    const [activeCat, setActiveCat] = useState();

    const [modalTitle, setModalTitle] = useState('');
    const [visible, setVisible] = useState(false);

    const router = useRouter();

    const initInputValue = {
        name: categories.name,
        parentId: categories.parentId
    }
    const { register, handleSubmit, errors } = useForm({
        defaultValues: initInputValue
    });

    const dispatch = useDispatch();

    const { adminAuth } = useSelector(state => state.adminAuth);

    const addCategoryHandler = category => {
        const categoryTitle = typeof (category) === 'string'
            ?
            `Add New Category`
            :
            `Add Sub-Category at ${category.name}`;

        setModalTitle(categoryTitle);
        setGivenCategory(category);
        setVisible(true);
    }

    const editCategoriesHandler = (category, subCategory) => {

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
    const onModalSubmit = async (inputdata) => {
        try {
            const { data } = await axiosApi.post('/api/categories', {
                name: inputdata.name,
                parentId: inputdata.parentId ? inputdata.parentId : null
            }, {
                headers: {
                    token: adminAuth.token
                }
            });
            if (data) {
                setVisible(false);
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Category succssfully added
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.reload();
                }, 2000);
            }
        } catch (error) {
            setVisible(false);
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
        <Wrapper onActive="categories" breadcrumb={["Categories"]}>
            <CategoryModal
                title={modalTitle}
                categoryArray={givenCategory}
                visible={visible}
                handleCancel={handleCancel}
                formRegister={register}
                handleSubmit={handleSubmit(onModalSubmit)}
                errors={errors}
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