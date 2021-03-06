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
    ShoppingOutlined,
    ShopOutlined
} from '@ant-design/icons';

import { Truck } from 'react-feather';

const { SubMenu } = Menu;
const SlidebarMenu = ({ onActive }) => {
    return (
        <Menu theme="dark"
            defaultSelectedKeys={[onActive]}
            defaultOpenKeys={[
                onActive === 'agents' || onActive === 'shipping' || onActive === 'delivery'
                    ? 'sub3'
                    : onActive === 'ownShopOrders' || onActive === 'sellerOrders'
                        ? 'sub1'
                        : onActive === 'pendingProduct' || onActive === 'liveactiveProduct' || onActive === 'liveunactiveProduct' || onActive === 'unapprovedProduct'
                            ? 'sub2'
                            : onActive === 'sellers' || onActive === 'verify'
                                ?
                                'sub4'
                                : onActive === 'cancellationList' || onActive === 'cancellationPending' || onActive === 'refundPending'
                                    || onActive === 'refundList'
                                    ? 'rrc'
                                    : ''
            ]}
            mode="inline"
        >
            <Menu.Item key="index" icon={<DesktopOutlined />}>
                <Link href="/admin/"> Dashboard</Link>
            </Menu.Item>
            <SubMenu key="sub1" icon={<ShoppingCartOutlined />} title="Oders">
                <Menu.Item key="ownShopOrders">
                    <Link href="/admin/orders/own-shop/">Own Shop Orders</Link>
                </Menu.Item>
                <Menu.Item key="sellerOrders">
                    <Link href="/admin/orders/seller">Seller Orders</Link>
                </Menu.Item>
            </SubMenu>
            <SubMenu key="sub2" icon={<ShoppingOutlined />} title="Products">
                <Menu.Item key="pendingProduct">
                    <Link href="/admin/products/pending">Pending</Link>
                </Menu.Item>
                <Menu.Item key="liveactiveProduct">
                    <Link href="/admin/products/liveactive">Live & Active</Link>
                </Menu.Item>
                <Menu.Item key="liveunactiveProduct">
                    <Link href="/admin/products/liveunactive">Live but Unactive</Link>
                </Menu.Item>
                <Menu.Item key="unapprovedProduct">
                    <Link href="/admin/products/unapproved">Unapproved</Link>
                </Menu.Item>
            </SubMenu>
            <SubMenu key="rrc" icon={<ShoppingCartOutlined />} title="RRC">
                <Menu.ItemGroup title="Refund">
                    <Menu.Item key="refundList">
                        <Link href="/admin/rcc/refund">Lists</Link>
                    </Menu.Item>
                    <Menu.Item key="refundPending">
                        <Link href="/admin/rcc/refund/pending">Pending</Link>
                    </Menu.Item>
                </Menu.ItemGroup>
                <Menu.Divider />
                <Menu.ItemGroup title="Return">
                    <Menu.Item key="returnList">
                        <Link href="/admin/rcc/return">Lists</Link>
                    </Menu.Item>
                    <Menu.Item key="returnPending">
                        <Link href="/admin/rcc/return/pending">Pending</Link>
                    </Menu.Item>
                </Menu.ItemGroup>
                <Menu.Divider />
                <Menu.ItemGroup title="Cancellation">
                    <Menu.Item key="cancellationList">
                        <Link href="/admin/rcc/cancellation/">Lists</Link>
                    </Menu.Item>
                    <Menu.Item key="cancellationPending">
                        <Link href="/admin/rcc/cancellation/pending">Pending</Link>
                    </Menu.Item>
                </Menu.ItemGroup>
            </SubMenu>
            <SubMenu key="sub4" icon={<TeamOutlined />} title="Sellers">
                <Menu.Item key="sellers">
                    <Link href="/admin/sellers">Lists</Link>
                </Menu.Item>
                <Menu.Item key="verify">
                    <Link href="/admin/sellers/verification">Pending Verification</Link>
                </Menu.Item>
            </SubMenu>
            <Menu.Item key="users" icon={<UserOutlined />}>
                <Link href="/admin/users/">Users</Link>
            </Menu.Item>
            <Menu.Item key="ownShop" icon={<ShopOutlined />}>
                <Link href="/admin/own-shop/">Own Shop</Link>
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
                <Link href="/admin/coupon/">Coupon</Link>
            </Menu.Item>
            <Menu.Item key="account" icon={<BarChartOutlined />}>
                Account
            </Menu.Item>
            <Menu.Item key="subAdmin" icon={<UserOutlined />}>
                <Link href="/admin/sub-admin/">Sub Admin</Link>
            </Menu.Item>
            <Menu.Item key="report" icon={<PieChartOutlined />}>
                Report
            </Menu.Item>
            <SubMenu key="sub3" icon={<Truck />} title=" Shipping">
                <Menu.Item key="shipping">
                    <Link href="/admin/shipping/">Shipping Plan</Link>
                </Menu.Item>
                <Menu.Item key="delivery">
                    <Link href="/admin/shipping/delivery/">Delivery Users</Link>
                </Menu.Item>
                <Menu.Item key="agents">
                    <Link href="/admin/shipping/agents">Agents</Link>
                </Menu.Item>
            </SubMenu>
            <Menu.Item key="setting" icon={<SettingOutlined />}>
                <Link href="/admin/setting/default-address">Setting</Link>
            </Menu.Item>
        </Menu >
    );
}

export default SlidebarMenu;
