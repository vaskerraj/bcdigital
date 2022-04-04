import React from 'react';
import Link from 'next/link';
import { Menu } from 'antd';
import {
    DesktopOutlined,
    TeamOutlined,
    ShoppingCartOutlined,
    PicCenterOutlined
} from '@ant-design/icons';

const SlidebarMenu = ({ onActive, deliveryRole }) => {
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
            <Menu.Item key="deliveries" icon={<ShoppingCartOutlined />}>
                <Link href={
                    deliveryRole === "main" ?
                        "/delivery/deliveries/"
                        : deliveryRole === "branch" ?
                            "/delivery/deliveries/branch"
                            : deliveryRole === "rider" ?
                                "/delivery/deliveries/rider"
                                : ""
                }>
                    Deliveries
                </Link>
            </Menu.Item>
            {(deliveryRole === "main" || deliveryRole === "branch") &&
                <Menu.Item key="manageRider" icon={<TeamOutlined />}>
                    <Link href="/delivery/rider">Manage Riders</Link>
                </Menu.Item >
            }

            {deliveryRole === "main" &&
                <Menu.Item key="manageBranch" icon={<PicCenterOutlined />}>
                    <Link href="/delivery/branch">Manage Branchs</Link>
                </Menu.Item>
            }
        </Menu >
    );
}

export default SlidebarMenu;
