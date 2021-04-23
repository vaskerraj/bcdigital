import React from 'react';
import Link from 'next/link';
import { Menu } from 'antd';
import {
    DesktopOutlined,
    BarsOutlined,
    TagsOutlined,
    GiftOutlined,
    FundProjectionScreenOutlined,
    TeamOutlined,
    UserOutlined,
    PieChartOutlined,
    BarChartOutlined,
    SettingOutlined,
    ShoppingCartOutlined,
} from '@ant-design/icons';

import { Truck } from 'react-feather';

const { SubMenu } = Menu;
const SlidebarMenu = ({ onActive }) => {
    return (
        <Menu theme="dark"
            defaultSelectedKeys={[onActive]}
            defaultOpenKeys={[
                onActive === 'agents' || onActive === 'shipping'
                    ? 'sub3' : ''
            ]}
            mode="inline"
        >
            <Menu.Item key="index" icon={<DesktopOutlined />}>
                <Link href="/admin/"> Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="categories" icon={<BarsOutlined />}>
                <Link href="/admin/categories">Categories</Link>
            </Menu.Item>
            <Menu.Item key="brands" icon={<TagsOutlined />}>
                <Link href="/admin/brands">Brands</Link>
            </Menu.Item>
            <Menu.Item key="banners" icon={<FundProjectionScreenOutlined />}>
                <Link href="/admin/banner">Banners</Link>
            </Menu.Item>
            <Menu.Item key="coupon" icon={<GiftOutlined />}>
                Coupon
            </Menu.Item>
            <Menu.Item key="sellers" icon={<TeamOutlined />}>
                <Link href="/admin/sellers">Sellers</Link>
            </Menu.Item>
            <Menu.Item key="ownShop" icon={<ShoppingCartOutlined />}>
                <Link href="/admin/own-shop/">Own Shop</Link>
            </Menu.Item>
            <SubMenu key="sub2" icon={<TeamOutlined />} title="Delivery">
                <Menu.Item key="manageDelivery">Manage Delivery</Menu.Item>
                <Menu.Item key="addDelivery">Add Delivery</Menu.Item>
            </SubMenu>
            <Menu.Item key="report" icon={<PieChartOutlined />}>
                Report
            </Menu.Item>
            <Menu.Item key="account" icon={<BarChartOutlined />}>
                Account
            </Menu.Item>
            <Menu.Item key="subAdmin" icon={<UserOutlined />}>
                <Link href="/admin/sub-admin/">Sub Admin</Link>
            </Menu.Item>
            <SubMenu key="sub3" icon={<Truck />} title=" Shipping">
                <Menu.Item key="shipping">
                    <Link href="/admin/shipping/">Shipping Plan</Link>
                </Menu.Item>
                <Menu.Item key="agents">
                    <Link href="/admin/shipping/agents">Agents</Link>
                </Menu.Item>
            </SubMenu>
            <Menu.Item key="setting" icon={<SettingOutlined />}>
                <Link href="/admin/setting/default-address">Setting</Link>
            </Menu.Item>
        </Menu>
    );
}

export default SlidebarMenu;
