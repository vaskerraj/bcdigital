import React from 'react';
import Link from 'next/link';
import { Menu } from 'antd';
import {
    DesktopOutlined,
    TeamOutlined,
    ShoppingCartOutlined,
    PicCenterOutlined
} from '@ant-design/icons';

const SlidebarMenu = ({ onActive }) => {
    return (
        <Menu theme="dark"
            defaultSelectedKeys={[onActive]}
            defaultOpenKeys={[
                onActive === 'manageRider' || onActive === 'manageBranch'
                    ? 'sub1' : ''
            ]}
            mode="inline"
        >
            <Menu.Item key="index" icon={<DesktopOutlined />}>
                <Link href="/delivery/"> Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="manageDelivery" icon={<ShoppingCartOutlined />}>
                <Link href="/delivery/deliveries"> Deliveries</Link>
            </Menu.Item>
            <Menu.Item key="manageRider" icon={<TeamOutlined />}>
                <Link href="/delivery/manage-rider">Manage Rider</Link>
            </Menu.Item >
            <Menu.Item key="manageBranch" icon={<PicCenterOutlined />}>
                <Link href="/delivery/manage-branch">Manage Branch</Link>
            </Menu.Item>
        </Menu >
    );
}

export default SlidebarMenu;
