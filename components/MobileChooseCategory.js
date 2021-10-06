import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'react-feather';
import { useDispatch, useSelector } from 'react-redux';
import { allCategories } from '../redux/actions/categoryAction';

const MobileChooseCategory = ({ catLevel, setConfirmCategory, handleCancel }) => {
    const [subCategories, setSubCategories] = useState('');
    const [activeCat, setActiveCat] = useState();
    const [selectedCategory, setSelectedCategory] = useState();
    const [finalCategory, setFinalCategory] = useState();
    const [lastCategoryList, setLastCategoryList] = useState(true);

    // selected categories list
    const [firstCategoryName, setFirstCategoryName] = useState('');
    const [secondCategoryName, setSecondCategoryName] = useState('');
    const [thirdCategoryName, setThirdCategoryName] = useState('');

    const dispatch = useDispatch();
    const { categories } = useSelector(state => state.categoryList);

    useEffect(async () => {
        dispatch(allCategories());
    }, []);

    const subCategoryShowHandler = (e, category, subsLevel) => {
        setSelectedCategory(category._id);
        category.children.length > 0 ? setLastCategoryList(catLevel === 2 ? false : true) : setLastCategoryList(false);
        if (subsLevel == "secondLevel") {
            setSecondCategoryName(category.name);;
            // reset 3rd level category
            setThirdCategoryName('');
            for (const li of document.querySelectorAll("li.secondLevel a.active")) {
                li.classList.remove("active");
            }
            e.currentTarget.classList.add("active");
        } else {
            setThirdCategoryName(category.name);
            for (const li of document.querySelectorAll("li.thirdLevel a.active")) {
                li.classList.remove("active");
            }
            e.target.classList.add("active");
        }
    }

    const renderSubCategories = (subCategories, subsLevel) => {
        return subCategories.map(category =>
            (catLevel === 3 && category.children.length > 0) ?
                <li key={category._id} className={`dropdown-mdsubmenu ${subsLevel}`}>
                    <a
                        onClick={(e) => subCategoryShowHandler(e, category, subsLevel)}
                    >
                        {category.name}
                        <ChevronRight className="fR" />
                    </a>
                    {
                        category.children.length > 0 ?
                            <ul className="dropdown-menu subs scrollbar">
                                {renderSubCategories(category.children, "thirdLevel")}
                            </ul>
                            :
                            null
                    }
                </li>
                :
                <li key={category._id} className={subsLevel}>
                    <a
                        onClick={(e) => subCategoryShowHandler(e, category, subsLevel)}
                    >
                        {category.name}
                    </a>
                </li>
        )
    }

    const showSubCatHandler = (category) => {
        setActiveCat(category._id);
        setSelectedCategory(category._id);
        category.children.length > 0 ? setLastCategoryList(true) : setLastCategoryList(false);
        setFirstCategoryName(category.name);
        // reset 2nd and 3rd level category
        setSecondCategoryName('');
        setThirdCategoryName('');
        setSubCategories(
            renderSubCategories(category.children, "secondLevel")
        )
    }

    const cancelCategoryHanlder = () => {
        handleCancel(false);
    }

    const clearCategoryHanlder = () => {
        setSubCategories('');
        setActiveCat('');
        setSelectedCategory('');
        setLastCategoryList(true);
        // reset all level of category
        setFirstCategoryName('');
        setSecondCategoryName('');
        setThirdCategoryName('');
    }
    const confirmCategoryHandler = () => {
        setConfirmCategory({ "categoryId": selectedCategory, "firstCatName": firstCategoryName, "secondCatName": secondCategoryName, "thirdCatName": thirdCategoryName });

        //close after confirm
        handleCancel(false);
    }

    return (
        <div className="category-mdcontainer">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="text-left">
                    Current Selection :
                    <b>{firstCategoryName}</b>{(firstCategoryName && secondCategoryName) && <span>/</span>}
                    <b>{secondCategoryName}</b>{secondCategoryName && thirdCategoryName && <span>/</span>}
                    <b>{thirdCategoryName}</b>
                </div>
                <div className="text-right">
                    <button type="button" onClick={cancelCategoryHanlder} className="btn btn-light mr-2">Cancel</button>
                    <button type="button" onClick={clearCategoryHanlder} className="btn btn-light mr-2">Clear</button>
                    <button onClick={confirmCategoryHandler} type="button" className="btn btn-success" disabled={lastCategoryList}>Confirm</button>
                </div>
            </div >
            <div className="main-mdcategory">
                <div className="main-categoryblock">
                    <ul className="main-navigation scrollbar">
                        {categories && categories.map(cat =>
                            cat.children.length ?
                                <li key={cat._id} className="dropdown-mdsubmenu" >
                                    <a
                                        className={activeCat === cat._id ? "active" : ''}
                                        onClick={() => showSubCatHandler(cat)}
                                    >
                                        {cat.name}
                                        <ChevronRight className="fR" />
                                    </a>
                                    <ul className={`dropdown-menu scrollbar ${activeCat === cat._id ? "active" : ''}`}>
                                        {subCategories}
                                    </ul>
                                </li >
                                :
                                <li key={cat._id}>
                                    <a
                                        className={activeCat === cat._id ? "active" : ''}
                                        onClick={(e) => showSubCatHandler(cat)}
                                    >
                                        {cat.name}
                                    </a>
                                </li>
                        )}
                    </ul>
                </div>
            </div>

        </div >
    );
}

export default MobileChooseCategory;
