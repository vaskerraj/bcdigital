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
                        name="returnRegion"
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
                    {errors.returnRegion && <p className="errorMsg">{errors.returnRegion.message}</p>}
                </div>
            </div>
            <div className="d-block mt-2">
                <label>City</label>
                <div className="form-group">

                    {cities.length !== 0 &&
                        <select
                            defaultValue={defaultCity ? defaultCity : ''}
                            name="returnCity"
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
                            name="returnCity"
                            className="form-control"
                            ref={formRegister({
                                required: "Provide your area"
                            })}
                            disabled={cities.length ? false : true}
                        >
                            <option value="">Select Area</option>
                        </select>
                    }
                    {errors.returnCity && <p className="errorMsg">{errors.returnCity.message}</p>}
                </div>
            </div>
            {areas.length !== 0 &&
                <div className="d-block mt-2">
                    <label>Area</label>
                    <div className="form-group">
                        <select
                            defaultValue={defaultArea ? defaultArea : ''}
                            name="returnArea"
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
                        {errors.returnArea && <p className="errorMsg">{errors.returnArea.message}</p>}
                    </div>
                </div>
            }
        </>
    );
}

export default WarehouseAddress;
