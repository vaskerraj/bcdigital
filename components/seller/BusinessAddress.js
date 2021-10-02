import React, { useState } from 'react';

const BusinessAddress = ({
    addresses,
    formRegister, errors, reset,
    getValues,
}) => {
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);

    const addressChangeHandler = async (e, type) => {
        if (e.target.value !== "") {
            let index = e.target.selectedIndex;
            let el = e.target.childNodes[index];
            const addressesChild = el.getAttribute('subs');
            if (type === 'region') {
                setCities(JSON.parse(addressesChild));
            } else if (type === 'city') {
                setAreas(JSON.parse(addressesChild));
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
            if (type === 'city') {
                setAreas([]);
            }
        }
    }

    return (
        <>
            <div className="d-block">
                <label>Region</label>
                <div className="form-group">
                    <select defaultValue=""
                        name="businessRegion"
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
                                subs={JSON.stringify(add.children)}
                            >
                                {add.name}
                            </option>
                        )}
                    </select>
                    {errors.businessRegion && <p className="errorMsg">{errors.businessRegion.message}</p>}
                </div>
            </div>
            <div className="d-block mt-2">
                <label>City</label>
                <div className="form-group">
                    <select defaultValue=""
                        name="businessCity"
                        className="form-control"
                        onChange={(e) => addressChangeHandler(e, 'city')}
                        ref={formRegister({
                            required: "Provide your city"
                        })}
                        disabled={cities.length ? false : true}
                    >
                        <option value="">Select City</option>
                        {cities.map(city =>
                            <option
                                key={city._id}
                                value={city._id}
                                subs={JSON.stringify(city.children)}
                            >
                                {city.name}
                            </option>
                        )}
                    </select>
                    {errors.businessCity && <p className="errorMsg">{errors.businessCity.message}</p>}
                </div>
            </div>
            {areas.length !== 0 &&
                <div className="d-block mt-2">
                    <label>Area</label>
                    <div className="form-group">
                        <select defaultValue=""
                            name="businessArea"
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
                                    subs={JSON.stringify(area.children)}
                                >
                                    {area.name}
                                </option>
                            )}
                        </select>
                        {errors.businessArea && <p className="errorMsg">{errors.businessArea.message}</p>}
                    </div>
                </div>
            }
        </>
    );
}

export default BusinessAddress;
