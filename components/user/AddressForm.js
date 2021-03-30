import React from 'react';

const AddressForm = ({ formRegister, handleSubmit, errors, onCancel }) => {
    // console.log(errors)
    return (
        <div className="d-block text-left">
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-sm-6">
                        <div className="d-block">
                            <label className="font14 font-weight-bold">Full name</label>
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="fullname"
                                    className="form-control"
                                    placeholder="Please enter your full name"
                                    ref={formRegister({
                                        required: "Provide your full name"
                                    })}
                                />
                                <div className="error-continer">
                                    {errors.fullname && <p className="errorMsg">{errors.fullname.message}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="d-block mt-2">
                            <label className="font14 font-weight-bold">Mobile number</label>
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="mobile"
                                    className="form-control"
                                    placeholder="Please enter your mobile number"
                                    ref={formRegister({
                                        required: "Provide your mobile number",
                                        minLength: {
                                            value: 10,
                                            message: "Invalid mobile number"
                                        },
                                        maxLength: {
                                            value: 10,
                                            message: "Invalid mobile number"
                                        },
                                    })}
                                />
                                <div className="error-continer">
                                    {errors.mobile && <p className="errorMsg">{errors.mobile.message}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="d-block mt-2">
                            <label className="font14 font-weight-bold">Address Lable <span className="text-muted">(Eg: Home, Office, City, Place)</span></label>
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="addLabel"
                                    className="form-control"
                                    placeholder="Please enter address label as you desire"
                                    ref={formRegister({
                                        required: "Provide address label"
                                    })}
                                />
                                <div className="error-continer">
                                    {errors.addLabel && <p className="errorMsg">{errors.addLabel.message}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="d-block">
                            <label className="font14 font-weight-bold">Region</label>
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="region"
                                    className="form-control"
                                    placeholder="Please enter your region"
                                    ref={formRegister({
                                        required: "Provide your region"
                                    })}
                                />
                                <div className="error-continer">
                                    {errors.region && <p className="errorMsg">{errors.region.message}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="d-block mt-2">
                            <label className="font14 font-weight-bold">City</label>
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="city"
                                    className="form-control"
                                    placeholder="Please enter your city"
                                    ref={formRegister({
                                        required: "Provide your city"
                                    })}
                                />
                                <div className="error-continer">
                                    {errors.city && <p className="errorMsg">{errors.city.message}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="d-block mt-2">
                            <label className="font14 font-weight-bold">Address</label>
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="address"
                                    className="form-control"
                                    placeholder="Please enter your address"
                                    ref={formRegister({
                                        required: "Provide your address"
                                    })}
                                />
                                <div className="error-continer">
                                    {errors.address && <p className="errorMsg">{errors.address.message}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="d-block">
                            <button type="button" onClick={onCancel} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                                SAVE ADDRESS
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div >
    );
}

export default AddressForm;