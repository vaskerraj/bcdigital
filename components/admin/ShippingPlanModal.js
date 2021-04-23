import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import { Modal, message, Select, Divider, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
const { Option } = Select;

import { useForm } from 'react-hook-form';

import axiosApi from '../../helpers/api';
import { addressList } from '../../redux/actions/defaultAddressAction';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const SubAdminModal = (props) => {
    const { title, visible, handleCancel, modalAction, shippingPlanData } = props;

    const [items, setItems] = useState([]);
    const [selectedShippingName, setSelectedShippingName] = useState('');
    const [newShippingName, setNewShippingName] = useState('');
    const [newPlanNameError, setNewPlanNameError] = useState('');

    const [cities, setCities] = useState('');
    const [cityDisable, setCityDisable] = useState(true);

    const [shippingAgents, setShippingAgents] = useState(true);

    useEffect(() => {
        if (modalAction === 'add_shipplan') {
            const filterdName = shippingPlanData && shippingPlanData.map(item => item.name);

            // unique name
            const uniqueShipPlan = [...new Set(filterdName)];
            setItems(uniqueShipPlan);
        }
    }, [visible, modalAction]);


    const defaultValues = {
        name: modalAction === "edit_shipplan" ? shippingPlanData.name : null,
        region: modalAction === "edit_shipplan" ? shippingPlanData.cityId.parentId : null,
        cityName: modalAction === "edit_shipplan" ? shippingPlanData.cityId.name : null,
        city: modalAction === "edit_shipplan" ? shippingPlanData.cityId._id : null,
        agent: modalAction === "edit_shipplan" ? shippingPlanData.shipAgentId._id : null,
        amount: modalAction === "edit_shipplan" ? shippingPlanData.amount : null,
        minTime: modalAction === "edit_shipplan" ? shippingPlanData.minDeliveryTime : null,
        maxTime: modalAction === "edit_shipplan" ? shippingPlanData.maxDeliveryTime : null,
    }
    const { register, handleSubmit, errors, reset } = useForm({
        defaultValues: defaultValues,
    });

    useEffect(() => {
        reset(defaultValues);
    }, [visible]);

    const router = useRouter();

    const { adminAuth } = useSelector(state => state.adminAuth);
    const { addresses } = useSelector(state => state.defaultAddress);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(addressList());
    }, [visible]);

    useEffect(async () => {
        if (adminAuth !== null) {
            const { data } = await axiosApi.get("/api/shipagent",
                {
                    headers: {
                        token: adminAuth.token
                    }
                }
            );
            setShippingAgents(data);
        }
    }, [adminAuth]);

    const onNameChange = event => {
        setNewPlanNameError('');
        setNewShippingName(event.target.value);
    };

    const addItem = () => {
        if (newShippingName !== '') {
            const checkShippPlan = items.includes(newShippingName);
            if (!checkShippPlan) {
                setItems([...items, newShippingName]);
                setNewShippingName('');
            } else {
                setNewPlanNameError("Shipping plan already exist.");
            }
        } else {
            setNewPlanNameError("Provide new shipping plan name");
        }
    };

    const changeAddressRegion = e => {
        setCityDisable(false);
        let index = e.target.selectedIndex;
        let el = e.target.childNodes[index];
        const citiesFromRegion = el.getAttribute('cities');
        setCities(JSON.parse(citiesFromRegion));
    }
    useEffect(() => {
        if (modalAction === 'edit_shipplan') {
            setCityDisable(false);
            const filterdCities = addresses && addresses.filter(item => item._id === shippingPlanData.cityId.parentId);
            setCities(filterdCities[0].children);
        }
    }, [visible, modalAction]);

    const onModalSubmit = async (inputdata) => {
        try {
            const data = await axiosApi.post("/api/shipcost",
                {
                    name: inputdata.name,
                    cityId: inputdata.city,
                    shipAgentId: inputdata.agent,
                    amount: inputdata.amount,
                    minDeliveryTime: inputdata.minTime,
                    maxDeliveryTime: inputdata.maxTime
                },
                {
                    headers: {
                        token: adminAuth.token
                    }
                }
            );
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Shipping Plan succssfully added
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.reload();
                }, 2000);
            }
        } catch (error) {
            message.warning({
                content: (
                    <div>
                        <div className="font-weight-bold">Error</div>
                        {error.response ? error.response.data.error : error.message}
                    </div>
                ),
                className: 'message-warning',
            });
        }
    }

    const onModalUpdate = async (inputdata) => {
        try {
            const { data } = await axiosApi.put("/api/shipcost",
                {
                    shipCostId: shippingPlanData._id,
                    name: inputdata.name,
                    cityId: inputdata.city,
                    shipAgentId: inputdata.agent,
                    amount: inputdata.amount,
                    minDeliveryTime: inputdata.minTime,
                    maxDeliveryTime: inputdata.maxTime
                },
                {
                    headers: {
                        token: adminAuth.token
                    }
                }
            );
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Shipping Plan succssfully updated
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.reload();
                }, 2000);
            }
        } catch (error) {
            message.warning({
                content: (
                    <div>
                        <div className="font-weight-bold">Error</div>
                        {error.response ? error.response.data.error : error.message}
                    </div>
                ),
                className: 'message-warning',
            });
        }
    }

    const commonForm = () => (
        <>
            {
                modalAction === "add_shipplan" &&
                <div className="d-block">
                    <label className="cat-label">Planning Name</label>
                    <Select
                        className="d-block"
                        style={{ width: '100%' }}
                        onChange={(value) => {
                            setSelectedShippingName(value)
                        }}
                        dropdownRender={menu => (
                            <div>
                                {menu}
                                <Divider style={{ margin: '4px 0' }} />
                                {newPlanNameError && (<p className="errorMsg ml-3">{newPlanNameError}</p>)}
                                <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                                    <Input style={{ flex: 'auto' }} value={newShippingName} onChange={onNameChange} />
                                    <a
                                        style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}
                                        onClick={addItem}
                                    >
                                        <PlusOutlined /> Add shipping plan
                                </a>
                                </div>
                            </div>
                        )}
                    >
                        {items && items.map(item => (
                            <Option key={item}>{item}</Option>
                        ))}
                    </Select>
                    <input type="hidden"
                        name="name"
                        value={selectedShippingName}
                        ref={register({
                            required: "Provide shipping plan name"
                        })}
                    />
                    {errors.name && <p className="errorMsg">{errors.name.message}</p>}
                </div>
            }
            {
                modalAction === "edit_shipplan" &&
                <div className="d-block">
                    <label className="cat-label">Planning Name</label>
                    <input type="text" name="name" className="form-control disabled"
                        ref={register()}
                    />
                </div>
            }
            <div className="col mt-2">
                <div className="row">
                    <div className="col-6">
                        <label className="cat-label">Region</label>
                        <select defaultValue="" name="region"
                            className={`form-control region ${modalAction === 'edit_shipplan' ? 'disabled' : ''}`}
                            onChange={changeAddressRegion}
                        >
                            <option value="">Select</option>
                            {
                                addresses && addresses.map(address => (
                                    <option
                                        key={address._id}
                                        value={address._id}
                                        cities={JSON.stringify(address.children)}
                                        selected={modalAction === 'edit_shipplan' ? address._id === shippingPlanData.cityId.parentId : false}
                                    >
                                        {address.name}
                                    </option>
                                ))
                            }
                        </select>
                        {errors.city && <p className="errorMsg">{errors.city.message}</p>}
                    </div>
                    <div className="col-6">
                        <label htmlFor="city" className="cat-label">City</label>
                        {
                            modalAction === "add_shipplan" &&
                            <select defaultValue="" name="city" id="city" className="form-control"
                                disabled={cityDisable}
                                ref={register({
                                    required: "Provide city"
                                })}
                            >
                                <option value="">Select</option>
                                {
                                    cities && cities.map(city => (
                                        <option
                                            key={city._id}
                                            value={city._id}
                                        >
                                            {city.name}
                                        </option>
                                    ))
                                }
                            </select>
                        }
                        {
                            modalAction === "edit_shipplan" &&
                            <>
                                <input type="text" name="cityName" className="form-control disabled" ref={register()} />
                                <input type="hidden" name="city" className="form-control disabled"
                                    ref={register()} />
                            </>
                        }
                        {errors.city && <p className="errorMsg">{errors.city.message}</p>}
                    </div>
                </div>

            </div>
            <div className="d-block mt-2">
                <label className="cat-label">Shipping Agent</label>
                <select defaultValue="" name="agent" className="form-control"
                    ref={register({
                        required: "Provide agent"
                    })}
                >
                    <option value="">Select</option>
                    {
                        shippingAgents && shippingAgents.map(agent => (
                            <option
                                key={agent._id}
                                value={agent._id}
                            >
                                {agent.name}
                            </option>
                        ))
                    }
                </select>
                {errors.agent && <p className="errorMsg">{errors.agent.message}</p>}
            </div>
            <div className="d-block mt-2">
                <label className="cat-label">
                    Amount
                    <span className="text-muted">(Rs)</span>
                </label>
                <input type="text" className="form-control mt-1"
                    name="amount"
                    autoComplete="off"
                    ref={register({
                        required: "Provide amount"
                    })}
                />
                {errors.amount && <p className="errorMsg">{errors.amount.message}</p>}
            </div>
            <div className="d-block border-top mt-5 text-right">
                <button type="button" onClick={handleCancel} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                    Cancel
                </button>
                {modalAction === 'add_shipplan' &&
                    <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                        ADD SHIPPING PLAN
                    </button>
                }
                {modalAction === 'edit_shipplan' &&
                    <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                        UPDATE SHIPPING PLAN
                    </button>
                }
            </div>
        </>
    )

    return (
        <Modal
            title={title}
            visible={visible}
            footer={null}
            closable={false}
            destroyOnClose={true}
        >
            {modalAction === 'edit_shipplan' &&
                <form onSubmit={handleSubmit(onModalUpdate)}>
                    {commonForm()}
                </form>
            }
            {modalAction === 'add_shipplan' &&
                <form onSubmit={handleSubmit(onModalSubmit)}>
                    {commonForm()}
                </form>
            }
        </Modal>
    );
}

export default SubAdminModal;

