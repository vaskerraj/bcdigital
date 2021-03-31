import React from 'react';
import { Edit3, PlusSquare, Trash2 } from 'react-feather';

const SubCategoryBlock = (props) => {
    const {
        category, categoriesChild, subCategoryClickHandler,
        editHandler, deleteHandler, addCategoryHandler, activeCat
    } = props;
    const renderAndPusSubs = (categories) => {
        let allCategories = [];
        for (let category of categories) {
            allCategories.push(
                category.children.length ?
                    <li key={category._id}
                        onClick={(e) => subCategoryClickHandler(e)}
                        className={activeCat === category._id ? "active" : null}
                    >
                        {category.name}
                        <span className="fR cp" onClick={() => editHandler(category, category.children)}>
                            <Edit3 size={18} />
                        </span>
                        {category.children.length > 0 ? <ul className="sub-cat">{renderSubCategory(category, category.children)}</ul> : null}
                    </li>
                    :
                    <li key={category._id} className="non-clickable">
                        {category.name}
                        <span className="editcategory fR cp" onClick={() => editHandler(category, category.children)}>
                            <Edit3 size={18} />
                        </span>
                        <span className="deletecategory fR cp mr-2" onClick={() => deleteHandler(category.children)}>
                            <Trash2 size={18} />
                        </span>
                    </li>
            )
        }
        return allCategories;
    }
    const renderSubCategory = (providedCat, categories) => (
        <div className="category-block subs d-block border position-relative">
            <div className="d-flex justify-content-between align-items-center p-2 pt-3 pb-3 border-bottom">
                <div className="font-weight-bold font14">
                    {providedCat.name}
                </div>
                <div className="mr-2">
                    <PlusSquare size={24} onClick={() => addCategoryHandler(providedCat)} className="addcategory cp" />
                </div>
            </div>
            <div className="d-block">
                <ul className="list-unstyled">
                    {renderAndPusSubs(categories)}
                </ul>
            </div>
        </div>
    )
    return renderSubCategory(category, categoriesChild)
}

export default SubCategoryBlock;
