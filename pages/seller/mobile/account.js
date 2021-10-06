import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import { Avatar } from 'antd';
import {
    UserOutlined,
    LockOutlined
} from '@ant-design/icons';

import { signout } from '../../../redux/actions/sellerAuthAction'

const Account = () => {

    const dispatch = useDispatch();
    const { sellerAuth } = useSelector(state => state.sellerAuth);

    return (
        <>
            <div className="container">
                <div className="d-flex align-items-center justify-content-between" style={{ height: '7rem' }}>
                    {sellerAuth &&
                        <div>
                            {sellerAuth.picture ?
                                <Avatar
                                    src={`/sellers/${sellerAuth.picture}`}
                                    className="mr-2"
                                />
                                :
                                <Avatar
                                    className="mr-2"
                                    style={{ backgroundColor: '#87d068' }}
                                >
                                    {sellerAuth.user.charAt(0).toUpperCase()}
                                </Avatar>
                            }
                            {sellerAuth.user}
                        </div>
                    }
                </div>
            </div>
            <ul className="list-group list-group-flush">
                <Link href="/seller/mobile/profile">
                    <li className="list-group-item">
                        <UserOutlined style={{ fontSize: '2rem', marginLeft: '1rem', marginRight: '1rem' }} />
                        Profile
                    </li>
                </Link>
                <Link href="/seller/mobile/change-password">
                    <li className="list-group-item">
                        <LockOutlined style={{ fontSize: '2rem', marginLeft: '1rem', marginRight: '1rem' }} />
                        Change Password
                    </li>
                </Link>
            </ul>
            <div className="container mt-5 mb-3">
                <button type="button" className="btn btn-block btn-lg btn-outline-primary"
                    onClick={() => dispatch(signout('mobile'))}
                >
                    Log out
                </button>
            </div>
        </>
    );
}

export default Account;
