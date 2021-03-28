import React from 'react';
import { Modal } from 'antd';

const ProfileModal = ({ title, visible, handleCancel, formRegister, handleSubmit, errors, }) => {

    return (
        <Modal
            title={title}
            visible={visible}
            footer={null}
            closable={false}
            destroyOnClose={true}
        >
            <form onSubmit={handleSubmit}>
                <div className="col-sm-7">
                    {(title === 'Edit Mobile Number' || title === 'Add Mobile Number') &&
                        <>
                            <label>Mobile Number</label>
                            <input type="number" className="form-control mt-1"
                                name="mobile"
                                autoComplete="off"
                                placeholder="Please enter your mobile number"
                                ref={formRegister({
                                    required: true,
                                    minLength: 10,
                                    maxLength: 10
                                })}
                            />
                        </>
                    }
                    {errors.mobile && errors.mobile.type === "required" && (
                        <p className="errorMsg">Please enter your mobile number</p>
                    )}
                    {errors.mobile && errors.mobile.type === "minLength" && (
                        <p className="errorMsg">
                            Invalid mobile number
                        </p>
                    )}
                    {errors.mobile && errors.mobile.type === "maxLength" && (
                        <p className="errorMsg">
                            Invalid mobile number
                        </p>
                    )}

                    {(title === 'Edit Email Address' || title === 'Add Email Address') &&
                        <>
                            <label>Email</label>
                            <input type="email" className="form-control mt-1"
                                name="email"
                                autoComplete="off"
                                placeholder="Please enter your email address"
                                ref={formRegister({
                                    required: "Provide your email address",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                            />
                        </>
                    }
                    {errors.email && <p className="errorMsg">{errors.email.message}</p>}
                </div>
                {/* /.col */}
                <div className="d-block border-top mt-5 text-right">
                    <button type="button" onClick={handleCancel} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                        SAVE CHANGES
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default ProfileModal;

