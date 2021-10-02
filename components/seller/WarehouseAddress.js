import React, { useState, useEffect } from 'react';

const WarehouseAddress = ({
    addresses,
    formRegister, errors, reset,
    getValues,
    defaultRegion,
    defaultCity,
    defaultArea
}) => {
    console.log(defaultArea)
    const [areas, setAreas] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        if (defaultRegion) {
            const initCities = addresses.find(c => c._id === defaultRegion).children;
            console.log(initCities)
            setCities(initCities);

            setAreas(initCities.find(c => c._id === defaultCity).children)
        }
    }, [defaultRegion])

    const addressChangeHandler = async (e, type) => {
        if (e.target.value !== "") {

            if (type === 'region') {
                const selCities = addresses.find(c => c._id === e.target.value).children;

                setCities(selCities);
            } else if (type === 'city') {
                const selAreas = cities.find(c => c._id === e.target.value).children;

                setAreas(selAreas);

                reset({
                    ...getValues(),
                    area: ''
                });
            }
        } else {
            if (type === 'region') {
                setCities([]);
                setAreas([]);
            }
            if (type === 'city') setAreas([]);
        }
    }

    return (
        <>
            <div className="d-block">
                <label>Region</label>
                <div className="form-group">
                    <select
                        name="warehouseRegion"
                        className="form-control"
                        onChange={(e) => addressChangeHandler(e, 'region')}
                        ref={formRegister({
                            required: "Provide your region"
                        })}
                    >
                        <option value="">Select Region</option>
                        {addresses.map(add =>
                            <option
                                key={add._id}
                                value={add._id}
                            >
                                {add.name}
                            </option>
                        )}
                    </select>
                    {errors.warehouseRegion && <p className="errorMsg">{errors.warehouseRegion.message}</p>}
                </div>
            </div>
            <div className="d-block mt-2">
                <label>City</label>
                <div className="form-group">

                    {cities.length !== 0 &&
                        <select
                            defaultValue={defaultCity ? defaultCity : ''}
                            name="warehouseCity"
                            className="form-control"
                            onChange={(e) => addressChangeHandler(e, 'city')}
                            ref={formRegister({
                                required: "Provide your area"
                            })}
                            disabled={cities.length ? false : true}
                        >
                            <option value="">Select Area</option>
                            {cities.map(city =>
                                <option
                                    key={city._id}
                                    value={city._id}
                                >
                                    {city.name}
                                </option>
                            )}
                        </select>
                    }
                    {cities.length === 0 &&
                        <select
                            name="warehouseCity"
                            className="form-control"
                            ref={formRegister({
                                required: "Provide your area"
                            })}
                            disabled={cities.length ? false : true}
                        >
                            <option value="">Select Area</option>
                        </select>
                    }
                    {errors.warehouseCity && <p className="errorMsg">{errors.warehouseCity.message}</p>}
                </div>
            </div>
            {areas.length !== 0 &&
                <div className="d-block mt-2">
                    <label>Area</label>
                    <div className="form-group">
                        <select
                            defaultValue={defaultArea ? defaultArea : ''}
                            name="warehouseArea"
                            className="form-control"
                            onChange={(e) => addressChangeHandler(e, 'area')}
                            ref={formRegister({
                                required: "Provide your area"
                            })}
                            disabled={areas.length ? false : true}
                        >
                            <option value="">Select Area</option>
                            {areas.map(area =>
                                <option
                                    key={area._id}
                                    value={area._id}
                                >
                                    {area.name}
                                </option>
                            )}
                        </select>
                        {errors.warehouseArea && <p className="errorMsg">{errors.warehouseArea.message}</p>}
                    </div>
                </div>
            }
        </>
    );
}

export default WarehouseAddress;
