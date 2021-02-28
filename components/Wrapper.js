import React from 'react';
import Link from 'next/link';
import HeaderMenu from './nav/HeaderMenu';
import { Layout, Row, Col } from 'antd';
const { Header, Content, Footer } = Layout;

// css
import '../styles/Header.module.css'

const Wrapper = ({ children }) => {
    return (
        <div className="container">
            <div className="container">
                <div className="TopNav row align-items-center">
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
                            <Link className="navbar-brand " href="/">
                                <img src="/logo192.png" height="53px" />
                            </Link>
                        </div>
                    </div>
                    <div className="col-5 col-sm-3 col-lg-3 col-xl-3">
                        <div className="d-flex fR mr-3" style={{ fontSize: '1.4rem' }}>
                            <div className="d-block d-sm-none mr-4">
                            </div>
                            <Link href="/signin" className=" text-dark">Hello, Sign In</Link>
                            <Link href="/cart" className="text-dark position-relative">
                                <div className="cartBadge badge-warning" style={{ fontSize: '1.3rem' }}>0</div>
                            </Link>
                        </div>
                    </div>
                    <div className="SearchBarCol col-sm-5 col-lg-6 col-xl-6 order-sm-first d-none d-sm-block">
                        <form method="GET" className="form-inline position-relative">
                            <input className="form-control SearchProduct" type="search" placeholder="Search" />
                            <button className="btn searchBtn">
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
        </div>
    );
}

export default Wrapper;
