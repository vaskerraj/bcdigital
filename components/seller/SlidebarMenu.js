import React from 'react';
import Link from 'next/link';
import { Menu } from 'antd';
import {
    DesktopOutlined,
    BorderOutlined,
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

const { SubMenu } = Menu;
const SlidebarMenu = ({ onActive }) => {
    return (
        <Menu theme="dark"
            defaultSelectedKeys={[onActive]}
            defaultOpenKeys={[
                onActive === 'manageproduct' || onActive === 'addproduct' || onActive === 'delivery'
                    ? 'sub1' : ''
            ]}
            mode="inline"
        >
            <Menu.Item key="index" icon={<DesktopOutlined />}>
                <Link href="/seller/"> Dashboard</Link>
            </Menu.Item>
            <SubMenu key="sub1" icon={<BorderOutlined />} title="Product">
                <Menu.Item key="manageproduct">
                    <Link href="/seller/product/manage">Manage Product</Link>
                </Menu.Item>
                <Menu.Item key="addproduct">
                    <Link href="/seller/product/add">Add Product</Link>
                </Menu.Item>
            </SubMenu>
            <Menu.Item key="manageOrders" icon={<ShoppingCartOutlined />}>
                <Link href="/seller/orders"> Manage Orders</Link>
            </Menu.Item>
        </Menu>
    );
}

export default SlidebarMenu;
