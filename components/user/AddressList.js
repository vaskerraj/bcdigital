import React from 'react';

import { Checkbox } from 'antd';
import { Trash, Edit2, User, Smartphone, Book } from 'react-feather';

const AddressList = ({ data, makeDefault }) => {
    return (
        <div className="d-block">
            <div className="row">
                <div className="col-sm-4 col-md-3 mt-2">
                    <div className="address-container">
                        <div className="d-flex justify-content-between">
                            <span className="default-address">
                                DEFAULT
                            </span>
                            <div className="address-action mt-2">
                                <Trash size={18} className="mr-3 cp" />
                                <Edit2 size={18} className="mr-3 cp" />
                            </div>
                        </div>
                        <div className="d-block p-4">
                            <h2><span className="border-bottom mt-4">Home</span></h2>
                            <div className="d-block font-weight-bold" style={{ marginTop: '2.5rem' }}>
                                <User size={16} className="text-muted mr-1" />
                                Full name
                            </div>
                            <div className="d-block mt-3">
                                <div className="d-flex">
                                    <Book size={18} className="text-muted mt-2" />
                                    <div className="ml-2">Pokhara -7, Bagar, Kaski, Gandaki</div>
                                </div>
                            </div>
                            <div className="d-block mt-3">
                                <Smartphone size={16} className="text-muted mr-1" />
                                Phone Number
                            </div>
                            <div className="d-block text-center mt-5 mb-3">
                                <Checkbox onChange={makeDefault} style={{ height: '2.5rem' }}>Make default address</Checkbox>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddressList;
