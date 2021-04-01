import React, { useState } from 'react';
import { Edit3, PlusSquare, Trash2 } from 'react-feather';

const CategoryBlock = (props) => {
    const {
        categories, addCategory, categoryInfo,
        subCategoryHandler, editHandler, deleteHandler, activeCat
    } = props;
    return (
        <div className="category-block d-block border">
            <div className="d-flex justify-content-between align-items-center p-2 pt-3 pb-3 border-bottom">
                <div className="font-weight-bold font14">
                    {typeof (categoryInfo) === 'string' ? categoryInfo : categoryInfo.name}
                </div>
                <div className="mr-2">
                    <PlusSquare size={24} onClick={() => addCategory(categoryInfo)} className="cp" />
                </div>
            </div>
            <div className="d-block">
                <ul className="list-unstyled">
                    {!categories.length &&
                        <div onClick={() => addCategory(categoryInfo)}
                            className="p-4 text-center text-decoration-underline text-info cp"
                        >
                            Add New Categories
                        </div>
                    }
                    {categories.map(cat =>
                        cat.children.length ?
                            <li key={cat._id}
                                onClick={() => subCategoryHandler(cat, cat.children)}
                                className={activeCat === cat._id ? "active" : null}
                            >
                                {cat.name}
                                <span className="editcategory fR cp" onClick={() => editHandler(cat, cat.children)}>
                                    <Edit3 size={18} />
                                </span>
                                <span className="deletecategory fR cp mr-2" onClick={() => deleteHandler(cat.children)}>
                                    <Trash2 size={18} />
                                </span>
                            </li>
                            :
                            <li key={cat._id} className="non-clickable">
                                {cat.name}
                                <span className="fR cp" onClick={() => editHandler(cat, cat.children)}>
                                    <Edit3 size={18} />
                                </span>
                                <span className="deletecategory fR cp mr-2" onClick={() => deleteHandler(cat.children)}>
                                    <Trash2 size={18} />
                                </span>
                            </li>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default CategoryBlock;
