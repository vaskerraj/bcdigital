import React from 'react';
import Link from 'next/link';
import HeaderMenu from './nav/HeaderMenu';
import { Layout, Row, Col } from 'antd';
const { Header, Content, Footer } = Layout;

import { Search, ShoppingCart, User as UserIcon } from 'react-feather';

// css
import styles from '../styles/Header.module.css';

const Wrapper = ({ children }) => {
    return (
        <div className="main">
            <div className="container">
                <div className={`${styles.topnav} row align-items-center`} >
                    <div className="col-7 col-sm-4 col-lg-3 order-first">
                        <div className="d-flex">
                            <div className="mobileMenuToggle d-lg-none">
                                <div>
                                    <svg viewBox="0 0 800 600">
                                        <path d="M300,220 C300,220 520,220 540,220 C740,220 640,540 520,420 C440,340 300,200 300,200" id="top"></path>
                                        <path d="M300,320 L540,320" id="middle"></path>
                                        <path d="M300,210 C300,210 520,210 540,210 C740,210 640,530 520,410 C440,330 300,190 300,190" id="bottom" transform="translate(480, 320) scale(1, -1) translate(-480, -318)">
                                        </path>
                                    </svg>
                                </div>
                            </div>
                            <Link className="" href="/">
                                <a>
                                    <img src="/logo192.png" height="53px" />
                                </a>
                            </Link>
                        </div>
                    </div>
                    <div className="col-5 col-sm-3 col-lg-3 col-xl-3">
                        <div className="d-flex fR mr-3" style={{ fontSize: '1.4rem' }}>
                            <div className="d-block d-sm-none mr-4">
                                <Search />
                            </div>
                            <Link href="/signin" className="text-dark"><a>Hello, Sign In</a></Link>
                            <Link href="/cart" className="text-dark position-relative">
                                <a>
                                    <ShoppingCart />
                                    <div className={`${styles.topnav_cartBadge} bg-warning`} style={{ fontSize: '1.3rem' }}>0</div>
                                </a>
                            </Link>
                        </div>
                    </div>
                    <div className="topnav_searchBarCol col-sm-5 col-lg-6 col-xl-6 order-sm-first d-none d-sm-block">
                        <form method="GET" className="form-inline position-relative">
                            <input className={`form-control ${styles.topnav_searchProduct}`} type="search" placeholder="Search" />
                            <button className={`btn ${styles.topnav_searchBtn}`} >
                                <Search />
                            </button>
                        </form>
                    </div>

                </div>
            </div>
            <HeaderMenu />
            <Content>
                {children}
            </Content>
            <Footer>

            </Footer>
        </div >
    );
}

export default Wrapper;
