import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layout, Menu, Card } from 'antd';
import {
    ShoppingOutlined,
    StarOutlined,
    UserOutlined,
} from '@ant-design/icons';
const { Sider } = Layout;
const { SubMenu } = Menu;

import useWindowDimensions from '../../helpers/useWindowDimensions';

const UserSidebarNav = ({ onActive }) => {
    var onActivePage = onActive.toString();
    const { height, width } = useWindowDimensions();
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (width <= 768) {
            setCollapsed(true);
        } else {
            setCollapsed(false);
        }
    }, [width]);
    return (
        <Card className="account-menu position-relative">
            <Sider trigger={null} collapsible collapsed={collapsed} style={{ backgroundColor: '#fff' }}>
                <Menu defaultSelectedKeys={[onActivePage]}
                    defaultOpenKeys={['sub1', 'sub2']}
                    mode="inline"
                    className="position-relative"
                >
                    <SubMenu key="sub1" className="position-relative" icon={<UserOutlined />} title="Manage Account">
                        <Menu.Item key="overview" className="main-menu">
                            <Link href="/user/">Manage Account</Link>
                        </Menu.Item>
                        <Menu.Item key="profile">
                            <Link href="/user/profile">Profile</Link>
                        </Menu.Item>
                        <Menu.Item key="addresses">
                            <Link href="/user/profile">Addresses</Link>
                        </Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub2" className="position-relative" icon={<ShoppingOutlined />} title="Orders" >
                        <Menu.Item key="orders" className="main-menu">
                            <Link href="/user/orders">Orders</Link>
                        </Menu.Item>
                        <Menu.Item key="return">
                            <Link href="/user/returns">
                                Returns
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="cancelOrder">
                            <Link href="/user/cancelorder">
                                Cancel Orders
                            </Link>
                        </Menu.Item>
                    </SubMenu>
                    <Menu.Item key="reviews" icon={<StarOutlined />}>
                        <Link href="/user/orders">Reviews</Link>
                    </Menu.Item>
                </Menu>
            </Sider>
        </Card >
    );
}

export default UserSidebarNav;
