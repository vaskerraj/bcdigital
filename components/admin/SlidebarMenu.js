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
    SettingOutlined
} from '@ant-design/icons';

const { SubMenu } = Menu;
const SlidebarMenu = ({ onActive }) => {
    return (
        <Menu theme="dark" defaultSelectedKeys={[onActive]} mode="inline">
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
                Banners
            </Menu.Item>
            <Menu.Item key="coupon" icon={<GiftOutlined />}>
                Coupon
            </Menu.Item>
            <Menu.Item key="sellers" icon={<TeamOutlined />}>
                Sellers
        </Menu.Item>
            <SubMenu key="sub1" icon={<UserOutlined />} title="Own Shop">
                <Menu.Item key="manageOwnSeller">Manage Seller</Menu.Item>
                <Menu.Item key="addOwnSeller">Add Seller</Menu.Item>
            </SubMenu>
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
            <SubMenu key="sub3" icon={<UserOutlined />} title="Sub Admin">
                <Menu.Item key="manageSubAdmin">Manage</Menu.Item>
                <Menu.Item key="addSubAdmin">Add</Menu.Item>
            </SubMenu>
            <Menu.Item key="setting" icon={<SettingOutlined />}>
                Setting
        </Menu.Item>
        </Menu>
    );
}

export default SlidebarMenu;
