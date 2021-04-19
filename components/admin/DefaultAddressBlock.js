import React from 'react';
import { Popconfirm } from 'antd';
import { Edit3, PlusSquare, Trash2 } from 'react-feather';

const DefaultAddressBlock = (props) => {
    const {
        addresses, addAddress, addressInfo,
        subAddressHandler, editHandler, popConfirm, activeAdd
    } = props;
    return (
        <div className="category-block d-block border">
            <div className="d-flex justify-content-between align-items-center p-2 pt-3 pb-3 border-bottom">
                <div className="font-weight-bold font14">
                    Region
                </div>
                <div className="mr-2">
                    <PlusSquare size={24} onClick={() => addAddress(addresses, "Region")} className="cp" />
                </div>
            </div>
            <div className="d-block">
                <ul className="list-unstyled">
                    {!addresses.length &&
                        <div onClick={() => addAddress(addresses, "Region")}
                            className="p-4 text-center text-decoration-underline text-info cp"
                        >
                            Add New Region
                        </div>
                    }
                    {addresses.map(add =>
                        add.children.length ?
                            <li key={add._id}
                                onClick={() => subAddressHandler(add, add.children)}
                                className={activeAdd === add._id ? "active" : null}
                            >
                                {add.name}
                                <span className="editcategory fR cp" onClick={() => editHandler(add, add.children, "Region")}>
                                    <Edit3 size={18} />
                                </span>
                                <span className="deletecategory fR cp mr-2">
                                    <Popconfirm
                                        title="Are you sure to delete this category?"
                                        onConfirm={() => popConfirm(add._id)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Trash2 size={18} />
                                    </Popconfirm>
                                </span>
                            </li>
                            :
                            <li key={add._id} className="non-clickable">
                                {add.name}
                                <span className="editcategory fR cp" onClick={() => editHandler(add, add.children, "Region")}>
                                    <Edit3 size={18} />
                                </span>
                                <span className="deletecategory fR cp mr-2">
                                    <Popconfirm
                                        title="Are you sure to delete this category?"
                                        onConfirm={() => popConfirm(add._id, "Region")}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Trash2 size={18} />
                                    </Popconfirm>
                                </span>
                            </li>
                    )}
                </ul>
            </div>
        </div >
    );
}

export default DefaultAddressBlock;
