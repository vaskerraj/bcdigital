import React from 'react';
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;

const DiscountPopover = ({ index, Controller, register, control, errors, trigger, getValues, setError, rangePickerDateFormat, discountConfirmHandler, onDiscountCancelHandler }) => {
    return (
        <>
            <div className="d-block" style={{ width: '33.2rem' }}>
                <label className="cat-label">Discount(%)</label>
                <input type="number" name={`product[${index}].rawdiscount`}
                    step="1" min="1" max="100"
                    className="form-control"
                    ref={register({
                        required: "Provide discount",
                        min: {
                            value: 1,
                            message:
                                "Discount must be between 1 - 100"
                        },
                        max: {
                            value: 100,
                            message:
                                "Discount must be between 1 - 100"
                        }
                    })}
                />
                <p className="errorMsg">
                    {errors.product?.[index]?.rawdiscount &&
                        errors.product?.[index]?.rawdiscount.message}
                </p>
                <div className="text-muted">
                    Discount is  for Product Promotion. Discount percentage must be between 1 and 100 without '% sign'
                </div>
                <div className="mt-2">
                    <label className="cat-label"> Promotion Date</label>
                    <Controller
                        name={`product[${index}].rawpromodate`}
                        defaultValue=""
                        control={control}
                        render={({ onChange, ref }) => (
                            <RangePicker
                                allowClear={false}
                                format={rangePickerDateFormat}
                                onChange={(date) => {
                                    onChange(date);
                                }
                                }
                                className="form-control"
                            />
                        )}
                        rules={{ required: "Provide promo date" }}
                    />
                    <p className="errorMsg">
                        {errors.product?.[index]?.rawpromodate &&
                            errors.product?.[index]?.rawpromodate.message}
                    </p>
                </div>
            </div>
            <div className="d-block text-right mt-3">
                <button className="btn btn-lg btn-light"
                    onClick={() => {
                        onDiscountCancelHandler()
                    }}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="btn btn-lg btn-warning ml-3"
                    onClick={() => {
                        trigger([`product[${index}].rawdiscount`, `product[${index}].rawpromodate`]),
                            getValues(`product[${index}].rawdiscount`) !== ''
                                && getValues(`product[${index}].rawpromodate`) !== ''
                                ?
                                discountConfirmHandler(index, getValues(`product[${index}].rawdiscount`), getValues(`product[${index}].rawpromodate`))
                                :
                                null
                    }
                    }
                >
                    Confirm
                </button>
            </div>
        </>
    );
}

export default DiscountPopover;
