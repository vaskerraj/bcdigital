import React, { useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Menu, Breadcrumb, Dropdown } from 'antd';
const { Header, Content, Footer, Sider } = Layout;
import {
    MenuOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { User as UserIcon, ChevronDown, LogOut } from 'react-feather';

import { signout } from '../../redux/actions/adminAuthAction';
import SlidebarMenu from './SlidebarMenu';

const MainSlider = ({ onActive, breadcrumb, children }) => {
    const [collapsed, setCollapsed] = useState(false);

    const onCollapse = () => {
        collapsed ? setCollapsed(false) : setCollapsed(true);
    };

    const { adminAuth } = useSelector(state => state.adminAuth);
    console.log(adminAuth)
    const dispatch = useDispatch();
    const signOutHandler = () => {
        dispatch(signout());
    }

    const dropdownMenu = (
        <Menu style={{ fontSize: '1.6rem' }}>
            <Menu.Item className="pl-5 pr-5">
                <Link href="/admin/profile">
                    <a rel="noopener noreferrer">
                        <UserIcon style={{ fontSize: '2rem', marginRight: '1.7rem' }} />
                        Profile
                    </a>
                </Link>
            </Menu.Item>
            <Menu.Item className="pl-5 pr-5">
                <Link href="/admin/acccount-setting">
                    <a rel="noopener noreferrer">
                        <SettingOutlined style={{ fontSize: '2rem', marginRight: '1.7rem' }} />
                    Account Setting
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
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <Link href="/admin/">
                    <div className="logo">BC Digital</div>
                </Link>
                <SlidebarMenu onActive={onActive} />
            </Sider>
            <Layout className="site-layout">
                <Header className="site-layout-background" style={{ padding: 0 }}>
                    <div className="d-flex justify-content-between align-items-center" style={{ height: '6rem' }}>
                        <div className="trigger" onClick={onCollapse}>
                            <MenuOutlined />
                        </div>
                        <div className="position-relative mr-5" style={{ marginTop: '2.1rem' }}>
                            {adminAuth &&
                                <Dropdown overlay={dropdownMenu} trigger={['click']} placement="bottomRight" arrow style={{ top: '4.5rem' }}>
                                    <a className="ant-dropdown-link text-dark mr-4" onClick={e => e.preventDefault()}>
                                        <span className="d-none d-md-block">
                                            {adminAuth.user ? adminAuth.user.split(" ")[0] : adminAuth.user}
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
                    <Breadcrumb style={{ margin: '16px 0' }}>
                        {breadcrumb.map(breadList =>
                            <Breadcrumb.Item key={breadList}>{breadList}</Breadcrumb.Item>
                        )}
                    </Breadcrumb>
                    <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                        {children}
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}></Footer>
            </Layout>
        </Layout >
    );
}

export default MainSlider;