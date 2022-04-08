import React from 'react';
import Link from 'next/link';
import { Menu } from 'antd';
import {
    DesktopOutlined,
    BorderOutlined,
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
                    ? 'sub1' :
                    onActive === 'finance' || onActive === 'transcation'
                        ? 'sub2' : ''
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
            <SubMenu key="sub2" icon={<BarChartOutlined />} title="Finance">
                <Menu.Item key="finance">
                    <Link href="/seller/finance">Account</Link>
                </Menu.Item>
                <Menu.Item key="transcation">
                    <Link href="/seller/finance/transcation">Transaction</Link>
                </Menu.Item>
            </SubMenu>
        </Menu>
    );
}

export default SlidebarMenu;
