import React, { useState } from 'react';
import { useRouter } from 'next/router';

const SettingTab = () => {
    const [activeTab, setActiveTab] = useState('common');

    const router = useRouter();

    const activeTabHandler = tab => {
        setActiveTab(tab);
        switch (tab) {
            case 'common':
                router.push('/admin/setting');
                break;
            case 'defaultAddress':
                router.push('/admin/setting/default-address');
                break;
            case 'pushEmail':
                router.push('/admin/setting/email-setup');
                break;
            default:
                break;
        }
    }
    return (
        <div className="d-flex" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
            <div className="filter-tab cp" onClick={() => activeTabHandler('common')}>
                Common
                <div className={`activebar ${activeTab === 'common' ? 'active' : ''}`}></div>
            </div>
            <div className="filter-tab ml-4 cp" onClick={() => activeTabHandler('defaultAddress')}>
                Default Address
                <div className={`activebar ${activeTab === 'defaultAddress' ? 'active' : ''}`}></div>
            </div>
            <div className="filter-tab ml-4 cp" onClick={() => activeTabHandler('pushEmail')}>
                Email Setup
                <div div className={`activebar ${activeTab === 'pushEmail' ? 'active' : ''}`}></div>
            </div>
        </div >
    );
}

export default SettingTab;
