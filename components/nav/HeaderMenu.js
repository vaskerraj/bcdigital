import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { allCategories } from '../../redux/actions/categoryAction';
import { Home, List, Search, ShoppingCart, User, ChevronDown, ChevronRight } from 'react-feather';
import MobileMenuDrawer from './MobileMenuDrawer';

const HeaderMenu = ({ loginUser, totalCartItems }) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
    const [cateogoriesList, setCateogoriesList] = useState(false);

    const router = useRouter();

    const dispatch = useDispatch();
    const { categories } = useSelector(state => state.categoryList);
    useEffect(async () => {
        dispatch(allCategories());
    }, []);

    useEffect(() => {
        if (categories.length) setCateogoriesList(true)
    }, [categories]);

    const mobileMenuVisibleHandler = (showHide) => {
        const bodyEl = document.body;
        if (showHide === false) {
            bodyEl.classList.remove('offcanvas-open');
        } else {
            bodyEl.classList.add('offcanvas-open');
        }
        setMobileMenuVisible(showHide)
    }

    const showSubmenHandler = (e) => {
        e.stopPropagation();
        if (e.currentTarget.classList.contains('active')) {
            e.currentTarget.classList.remove("active");
        } else {
            e.currentTarget.classList.add("active");
        }
    };
    return (
        <>
            <div className="bg-white pt-2 pb-2">
                <div className="vertical-menu container d-none d-sm-block">
                    <div className="d-flex justify-content-around" style={{ fontWeight: 500 }}>
                        <div className="ml-3 cp" onClick={() => setMenuVisible(prevCheck => !prevCheck)}>
                            All Categories
                            <ChevronDown size={20} className="mt-1" />
                        </div>
                        <div>
                            <Link href="/bcshop">
                                BC Shop
                            </Link>
                        </div>
                        <div>
                            <Link href="/seller">
                                Seller Pannel
                            </Link>
                        </div>
                        <div>
                            Customer Care
                        </div>
                        <div>
                            Hotels
                        </div>
                    </div>
                    <ul className="vmenu-content" style={{ display: !menuVisible ? "none" : "block" }}>
                        {categories.map(mainCat => (
                            <li key={mainCat._id} className="menu-item">
                                {mainCat.children.length !== 0 ?
                                    (
                                        <a> {mainCat.name}
                                            <i><ChevronRight size={15} /></i>
                                        </a>
                                    ) :
                                    (
                                        <Link href={`/search?q=${mainCat.slug}&type=cat`}>
                                            <a>
                                                {mainCat.name}
                                                <i><ChevronRight size={15} /></i>
                                            </a>
                                        </Link>
                                    )
                                }
                                {
                                    mainCat.children.length !== 0 &&
                                    <ul className="verticale-mega-menu flex-wrap">
                                        {mainCat.children.map(subCat => (
                                            <li key={subCat._id}>
                                                <Link href={`/search?q=${subCat.slug}&type=cat`}>
                                                    <a>
                                                        <span>{subCat.name}</span>
                                                        {subCat.children.length !== 0 &&
                                                            <i><ChevronRight size={15} /></i>
                                                        }
                                                    </a>
                                                </Link>
                                                {
                                                    subCat.children.length !== 0 &&
                                                    <ul className="submenu-item">
                                                        {
                                                            subCat.children.map(subSubCat => (
                                                                <li key={subSubCat._id}>
                                                                    <Link href={`/search?q=${subSubCat.slug}&type=cat`}>
                                                                        <a>{subSubCat.name}</a>
                                                                    </Link>
                                                                </li>
                                                            ))
                                                        }
                                                    </ul>
                                                }
                                            </li>
                                        ))}
                                    </ul>
                                }
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <MobileMenuDrawer
                categories={categories}
                cateogoriesList={cateogoriesList}
                mobileMenuVisibleHandler={mobileMenuVisibleHandler}
                mobileMenuVisible={mobileMenuVisible}
                showSubmenHandler={showSubmenHandler}
            />
            <div className="mobiletab-container d-block d-sm-none">
                <nav className="mobile-tabbar">
                    <Link href="/">
                        <a className="menu-item">
                            <span className="menu-icons">
                                <Home />
                            </span>
                            <span className="menu-item-label">Home</span>
                        </a>
                    </Link>
                    <div className="menu-item" onClick={() => mobileMenuVisibleHandler(true)}>
                        <span className="menu-icons">
                            <List />
                        </span>
                        <span className="menu-item-label">Categories</span>
                    </div>
                    <Link href="/searchbar">
                        <div className="menu-item">
                            <span className="menu-icons">
                                <Search />
                            </span>
                            <span className="menu-item-label">Search</span>
                        </div>
                    </Link>
                    <Link href="/cart" >
                        <a className="menu-item position-relative">
                            <span className="menu-icons">
                                <ShoppingCart />
                            </span>
                            <span className="menu-item-label">Cart</span>
                            {totalCartItems !== 0 &&
                                <div className="cart-badge bg-warning" style={{ fontSize: '1.3rem' }}>
                                    {totalCartItems}
                                </div>
                            }
                        </a>
                    </Link>
                    <Link href={loginUser ? "/user/account" : "/login?redirect=/user/account"}>
                        <a className="menu-item">
                            <span className="menu-icons">
                                <User />
                            </span>
                            <span className="menu-item-label">Account</span>
                        </a>
                    </Link>
                </nav>
            </div >
        </>
    );
}

export default React.memo(HeaderMenu);
