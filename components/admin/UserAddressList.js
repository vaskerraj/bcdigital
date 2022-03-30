import React from 'react';

import { User, Smartphone, Book } from 'react-feather';

const UserAddressList = ({ data }) => {
    return (
        <div className="d-block">
            <div className="row">
                {data.map(address => (
                    <div key={address._id} className="col-sm-6 col-md-3 mt-3">
                        <div className="address-container noheight">
                            <div className="d-flex justify-content-between">
                                <span className={`default-address ${address.isDefault === 'true' ? 'show' : 'hide'} `}>
                                    DEFAULT
                                </span>
                            </div>
                            <div className="d-block p-4">
                                <h2><span className="border-bottom mt-4">{address.label}</span></h2>
                                <div className="d-block font-weight-bold" style={{ marginTop: '2.5rem' }}>
                                    <User size={16} className="text-muted mr-1" />
                                    {address.name}
                                </div>
                                <div className="d-block mt-3">
                                    <div className="d-flex">
                                        <div style={{ width: '1.6rem' }}>
                                            <Book size={16} className="text-muted mt-2" />
                                        </div>
                                        <div className="ml-2">
                                            {address.street}
                                            {address.area ? address.area.city : ''}
                                            {',' + address.city.name + ', ' + address.region.name}
                                        </div>
                                    </div>
                                </div>
                                <div className="d-block mt-3">
                                    <Smartphone size={16} className="text-muted mr-1" />
                                    {address.mobile}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
}

export default UserAddressList;
