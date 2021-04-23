import React from 'react';
import { Popconfirm } from 'antd';
import { Edit3, PlusSquare, Trash2 } from 'react-feather';

const SubDefaultAddressBlock = (props) => {
    const {
        address, addressChild, subAddressClickHandler,
        editHandler, popConfirm, addAddressHandler, activeAdd
    } = props;
    const renderAndPushSubs = (addresses) => {
        let allAddresses = [];
        for (let address of addresses) {
            allAddresses.push(
                address.children.length ?
                    <li key={address._id}
                        onClick={(e) => subAddressClickHandler(e)}
                        className={activeAdd === address._id ? "active" : null}
                    >
                        {address.name}
                        <span className="editcategory fR cp" onClick={() => editHandler(address, address.children)}>
                            <Edit3 size={18} />
                        </span>
                        <span className="deletecategory fR cp mr-2">
                            <Popconfirm
                                title="Are you sure to delete this sub category?"
                                onConfirm={() => popConfirm(address._id)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Trash2 size={18} />
                            </Popconfirm>
                        </span>
                        {address.children.length > 0 ? <ul className="sub-cat">{renderSubAddress(address, address.children, "Area")}</ul> : null}
                    </li>
                    :
                    <li key={address._id} className="non-clickable">
                        {address.name}
                        <span className="editcategory fR cp" onClick={() => editHandler(address, address.children)}>
                            <Edit3 size={18} />
                        </span>
                        <span className="deletecategory fR cp mr-2">
                            <Popconfirm
                                title="Are you sure to delete this sub category?"
                                onConfirm={() => popConfirm(address._id)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Trash2 size={18} />
                            </Popconfirm>
                        </span>
                    </li>
            )
        }
        return allAddresses;
    }
    const renderSubAddress = (providedAddress, addressChild, section = 'City') => (
        <div className="category-block subs d-block border position-relative">
            <div className="d-flex justify-content-between align-items-center p-2 pt-3 pb-3 border-bottom">
                <div className="font-weight-bold font14">
                    {section}
                </div>
                <div className="mr-2">
                    <PlusSquare size={24} onClick={() => addAddressHandler(providedAddress, section)} className="addcategory cp" />
                </div>
            </div>
            <div className="d-block">
                <ul className="list-unstyled">
                    {renderAndPushSubs(addressChild)}
                </ul>
            </div>
        </div>
    )
    return renderSubAddress(address, addressChild)
}

export default SubDefaultAddressBlock;
