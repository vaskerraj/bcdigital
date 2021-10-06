import React, { useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Menu, Breadcrumb, Dropdown, Avatar } from 'antd';
const { Header, Content, Footer, Sider } = Layout;
import {
    MenuOutlined,
    LockOutlined,
    CameraOutlined
} from '@ant-design/icons';
import { User as UserIcon, ChevronDown, LogOut } from 'react-feather';

import { signout } from '../../redux/actions/sellerAuthAction';
import SlidebarMenu from './SlidebarMenu';

const MainSlider = ({ onActive, breadcrumb, planView, children }) => {
    const [collapsed, setCollapsed] = useState(false);

    const onCollapse = () => {
        collapsed ? setCollapsed(false) : setCollapsed(true);
    };

    const { sellerAuth } = useSelector(state => state.sellerAuth);
    console.log(sellerAuth);

    const dispatch = useDispatch();
    const signOutHandler = () => {
        dispatch(signout());
    }

    const dropdownMenu = (
        <Menu style={{ fontSize: '1.6rem' }}>
            <Menu.Item className="pl-5 pr-5">
                <Link href="/seller/profile">
                    <a rel="noopener noreferrer">
                        <UserIcon style={{ fontSize: '2rem', marginRight: '1.7rem' }} />
                        Profile
                    </a>
                </Link>
            </Menu.Item>
            <Menu.Item className="pl-5 pr-5">
                <Link href="/seller/logo">
                    <a rel="noopener noreferrer">
                        <CameraOutlined style={{ fontSize: '2rem', marginRight: '1.7rem' }} />
                        Your Logo
                    </a>
                </Link>
            </Menu.Item>
            <Menu.Item className="pl-5 pr-5">
                <Link href="/seller/change-password">
                    <a rel="noopener noreferrer">
                        <LockOutlined style={{ fontSize: '2rem', marginRight: '1.7rem' }} />
                        Change Password
                    </a>
                </Link>
            </Menu.Item>
            <Menu.Item className="pl-5 pr-5">
                <a onClick={signOutHandler} target="_blank" rel="noopener noreferrer">
                    <LogOut style={{ marginRight: '1.6rem' }} />
                    Logout
                </a>
            </Menu.Item>
        </Menu>
    );
    return (
        <Layout className="admin-wrapper" style={{ minHeight: '100vh' }}>
            {!planView &&
                <Sider trigger={null} collapsible collapsed={collapsed}>
                    <Link href="/seller/">
                        <div className="logo" style={{ height: 'auto' }}>BC Seller Center</div>
                    </Link>
                    <SlidebarMenu onActive={onActive} />
                </Sider>
            }
            <Layout className="site-layout">
                <Header className="site-layout-background" style={{ padding: 0 }}>
                    <div className="d-flex justify-content-between align-items-center" style={{ height: '6rem' }}>
                        {!planView
                            ?
                            <div className="trigger" onClick={onCollapse}>
                                <MenuOutlined />
                            </div>
                            :
                            <Link href="/">
                                <a className="d-block ml-4">
                                    <img src="/logo192.png" height="53px" />
                                </a>
                            </Link>
                        }
                        <div className="position-relative mr-5" style={{ marginTop: '2.1rem' }}>
                            {sellerAuth &&
                                <Dropdown
                                    overlay={dropdownMenu}
                                    trigger={['click']}
                                    arrow
                                    placement="bottomCenter"
                                    overlayClassName="custom-dropdown"
                                >
                                    <a className="ant-dropdown-link text-dark mr-4" onClick={e => e.preventDefault()}>
                                        <span className="d-none d-md-block">
                                            {sellerAuth.picture ?
                                                <Avatar
                                                    src={`/sellers/${sellerAuth.picture}`}
                                                    className="mr-2"
                                                />
                                                :
                                                <Avatar
                                                    className="mr-2"
                                                    style={{ backgroundColor: '#87d068' }}
                                                >
                                                    {sellerAuth.user.charAt(0).toUpperCase()}
                                                </Avatar>
                                            }
                                            {sellerAuth.user}
                                            <ChevronDown size={14} />
                                        </span>
                                        <span className="d-block d-md-none">
                                            <UserIcon />
                                            <ChevronDown size={14} />
                                        </span>
                                    </a>
                                </Dropdown>
                            }
                        </div>
                    </div>
                </Header>
                <Content style={{ margin: '0 16px' }}>
                    {!planView &&
                        <Breadcrumb style={{ margin: '16px 0' }}>
                            {breadcrumb.map(breadList =>
                                <Breadcrumb.Item key={breadList}>{breadList}</Breadcrumb.Item>
                            )}
                        </Breadcrumb>
                    }
                    <div className={`site-layout-background ${planView ? 'mt-4' : ''}`} style={{ padding: 24, minHeight: 360 }}>
                        {children}
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}></Footer>
            </Layout>
        </Layout >
    );
}

export default MainSlider;