import React from 'react';
import { Radio, Space } from 'antd';
import { Plus } from 'react-feather';

const ShippingAddress = ({ data, addNewAddress, isDefaultAddress, changeShippingAddress, onAddressChangeCancel, saveNewDefaultAddress }) => {
    return (
        <div className="d-block">
            <div className="row">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h3>Shipping Address</h3>
                    <button type="button" className="btn btn-info btn-sm"
                        onClick={addNewAddress}
                    >
                        <Plus size={15} />
                        Add New Address
                    </button>
                </div>
                <Radio.Group
                    style={{ width: '100%' }}
                    onChange={changeShippingAddress}
                    defaultValue={isDefaultAddress}
                >
                    <Space direction="vertical">
                        {data.map(address => (
                            <div key={address._id} className="d-block border-bottom pt-2 pb-2">
                                <Radio value={address._id}>
                                    <div className="d-inline-flex">
                                        <div className="d-block ">
                                            <div className="font-weight-bold">
                                                {address.name}
                                                <span className="badge bg-warning ml-3">{address.label}</span>
                                            </div>
                                            <div>
                                                {address.street}
                                                {address.area ? ',' + address.area.name : ''}
                                                {',' + address.city.name + ',' + address.region.name}
                                            </div>
                                        </div>
                                    </div>
                                </Radio>
                            </div>
                        ))
                        }
                    </Space>
                </Radio.Group>
            </div>
            <div className="d-block text-right mt-2">
                <button type="button" onClick={onAddressChangeCancel} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                    Cancel
                </button>
                <button type="button" className="btn btn-lg c-btn-primary font16 mt-4"
                    onClick={saveNewDefaultAddress}
                >
                    SAVE CHANGES
                </button>
            </div>
        </div >
    );
}

export default ShippingAddress;
