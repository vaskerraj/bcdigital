import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';

import { Affix, Menu, Dropdown } from 'antd';
import { UserOutlined, ShoppingOutlined, CloseCircleOutlined, StarOutlined } from '@ant-design/icons';
import { Search, ShoppingCart, User as UserIcon, ChevronDown, LogOut } from 'react-feather';

import { userSignOut } from '../../redux/actions/userAction';

// css
import styles from '../../styles/Header.module.css';

import HeaderMenu from './HeaderMenu';
import SearchBar from '../helpers/SearchBar';

const MainHeadSection = ({ mobileTabBar }) => {
    const { userInfo } = useSelector(state => state.userAuth);
    const { regUserInfo } = useSelector(state => state.userRegister);
    const loginUser = regUserInfo ? regUserInfo : userInfo;

    // cart total
    const { cartItem } = useSelector(state => state.cartItems);
    const totalCartItems = cartItem.reduce((a, c) => a + c.productQty, 0);

    const dispatch = useDispatch();

    const signOutHandler = () => {
        dispatch(userSignOut());
    }
    const router = useRouter();

    const handleSearchSubmit = e => {
        e.preventDefault()
        const { q } = e.target.elements
        const searchedQueryValue = q.value;
        const trimSearchedQueryValue = searchedQueryValue.trim();

        if (trimSearchedQueryValue !== " ") {
            router.push('/search?q=' + trimSearchedQueryValue + '&type=search');
        } else {
            router.reload();
        }
    }
    const menu = (
        <Menu style={{ fontSize: '1.6rem' }}>
            <Menu.Item className="pl-5 pr-5">
                <Link href="user/profile">
                    <a target="_blank" rel="noopener noreferrer">
                        <UserOutlined style={{ fontSize: '2rem', marginRight: '1.7rem' }} />
                        Manage Account
                    </a>
                </Link>
            </Menu.Item>
            <Menu.Item className="pl-5 pr-5">
                <Link href="user/orders">
                    <a target="_blank" rel="noopener noreferrer">
                        <ShoppingOutlined style={{ fontSize: '2rem', marginRight: '1.7rem' }} />
                        Oders
                    </a>
                </Link>
            </Menu.Item>
            <Menu.Item className="pl-5 pr-5">
                <Link href="/user/return/orders">
                    <a target="_blank" rel="noopener noreferrer" >
                        <CloseCircleOutlined style={{ fontSize: '2rem', marginRight: '1.7rem' }} />
                        Returns & Cancel Order
                    </a>
                </Link>
            </Menu.Item >
            <Menu.Item className="pl-5 pr-5">
                <Link href="user/reviews">
                    <a target="_blank" rel="noopener noreferrer" >
                        <StarOutlined style={{ fontSize: '2rem', marginRight: '1.7rem' }} />
                        Review
                    </a>
                </Link>
            </Menu.Item >
            <Menu.Item className="pl-5 pr-5">
                <a onClick={signOutHandler} target="_blank" rel="noopener noreferrer">
                    <LogOut style={{ marginRight: '1.6rem' }} />
                    Logout
                </a>
            </Menu.Item>
        </Menu>
    );
    return (
        <>
            <Affix>
                <div className="container-fluid header">
                    <div className="container">
                        <div className={`${styles.topnav} row align-items-center`} >
                            <div className={` ${mobileTabBar !== "hide" ? 'col-12' : 'col-6'} col-sm-4 col-lg-3 order-first`}>
                                <div className="d-flex">
                                    <Link className="" href="/">
                                        <a>
                                            <img src="/logo192.png" height="53px" />
                                        </a>
                                    </Link>
                                </div>
                            </div>
                            <div className={` ${mobileTabBar !== "hide" ? 'd-none d-sm-block' : 'col-6'} col-sm-3 col-lg-3 col-xl-3`}>
                                <div className="d-flex fR mr-5" style={{ fontSize: '1.4rem' }}>
                                    <div className="d-block d-sm-none mr-4">
                                        <Link href="/searchbar">
                                            <a className="cp">
                                                <Search />
                                            </a>
                                        </Link>
                                    </div>
                                    {
                                        loginUser ? (<>
                                            <Dropdown overlay={menu} trigger={['click']} placement="bottomRight" arrow>
                                                <a className="ant-dropdown-link text-dark mr-4" onClick={e => e.preventDefault()}>
                                                    <span className="d-none d-md-block">
                                                        Hello, {loginUser.user ? loginUser.user.split(" ")[0] : loginUser.user}
                                                        <ChevronDown size={14} />
                                                    </span>
                                                    <span className="d-block d-md-none">
                                                        <UserIcon />
                                                        <ChevronDown size={14} />
                                                    </span>
                                                </a>
                                            </Dropdown>
                                        </>) :
                                            (<>
                                                <div className="d-inline-block text-right text-dark">
                                                    <span className="d-none d-md-block">
                                                        <Link href={{
                                                            pathname: '/login',
                                                            query:
                                                                (router.pathname !== '/login' && router.pathname !== '/register')
                                                                    ?
                                                                    { redirect: router.pathname }
                                                                    : null
                                                        }}>
                                                            <a className="text-dark mr-4">
                                                                Hello, Login
                                                                <ChevronDown size={14} />
                                                            </a>
                                                        </Link>
                                                    </span>
                                                    <span className="d-block d-md-none">
                                                        <Link href={{
                                                            pathname: '/login',
                                                            query:
                                                                (router.pathname !== '/login' && router.pathname !== '/register')
                                                                    ?
                                                                    { redirect: router.pathname }
                                                                    : null
                                                        }}>
                                                            <a className="text-dark mr-4">
                                                                <UserIcon />
                                                            </a>
                                                        </Link>
                                                    </span>
                                                </div>
                                            </>
                                            )
                                    }

                                    <Link href="/cart">
                                        <a className="text-dark position-relative">
                                            <ShoppingCart />
                                            {totalCartItems !== 0 &&
                                                <div className={`${styles.topnav_cartBadge} bg-warning`}
                                                    style={{ fontSize: '1.3rem' }}
                                                >
                                                    {totalCartItems}
                                                </div>
                                            }
                                        </a>
                                    </Link>
                                </div>
                            </div>
                            <div className="topnav_searchBarCol col-sm-5 col-lg-6 col-xl-6 order-sm-first d-none d-sm-block">
                                <form onSubmit={handleSearchSubmit} className="form-inline position-relative">
                                    <SearchBar
                                        screen="large"
                                        searchInputClass={styles.topnav_searchProduct}
                                        searchBtnClass={styles.topnav_searchBtn}
                                    />
                                </form>
                            </div>

                        </div >
                    </div >
                </div >
            </Affix >
            {
                mobileTabBar !== "hide" &&
                <HeaderMenu loginUser={loginUser} totalCartItems={totalCartItems} />
            }
        </>
    );
}

export default MainHeadSection;
