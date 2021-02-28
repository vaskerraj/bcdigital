import React, { useState } from 'react';
import { Menu } from 'antd';
const { SubMenu } = Menu;
const HeaderMenu = () => {
    const [current, setCurrent] = useState('');

    const handleClick = (e) => {
        setCurrent(e.key)
    };

    return (
        <Menu onClick={handleClick} selectedKeys={[current]} mode="horizontal">
            <Menu.Item key="mail">
                Home
            </Menu.Item>
            <SubMenu key="SubMenu" title="Category">
                <Menu.Item key="setting:1">Mobile</Menu.Item>
                <Menu.Item key="setting:2">Clothes</Menu.Item>
            </SubMenu>

        </Menu>
    );
}

export default HeaderMenu;
