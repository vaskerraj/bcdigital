import React from 'react';
import Link from 'next/link';

import { Home, MessageCircle, User } from 'react-feather';

const Mobilebottomtab = ({ active }) => {

    return (
        <div className="mobiletab-container">
            <nav className="mobile-tabbar">
                <Link href="./mobile/">
                    <a className={`menu-item ${active === 'home' ? 'active' : ''}`}>
                        <span className="menu-icons">
                            <Home />
                        </span>
                        <span className="menu-item-label">Home</span>
                    </a>
                </Link>
                {/* <Link href="./mobile/notification">
                    <div className="menu-item">
                        <span className="menu-icons">
                            <MessageCircle />
                        </span>
                        <span className="menu-item-label">Notification</span>
                    </div>
                </Link> */}
                <Link href="./mobile/account">
                    <a className="menu-item">
                        <span className="menu-icons">
                            <User />
                        </span>
                        <span className="menu-item-label">Account</span>
                    </a>
                </Link>
            </nav>
        </div>
    );
}

export default Mobilebottomtab;
