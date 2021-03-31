import React from 'react';
import { Modal } from 'antd';

const CategryModal = ({ title, categoryArray, visible, handleCancel, formRegister, handleSubmit, errors, }) => {
    console.log(categoryArray)
    return (
        <Modal
            title={title}
            visible={visible}
            footer={null}
            closable={false}
            destroyOnClose={true}
        >
            <form onSubmit={handleSubmit}>
                <div className="d-block">
                    <label>Cateogry</label>
                    <input type="text" className="form-control mt-1"
                        name="name"
                        autoComplete="off"
                        ref={formRegister({
                            required: true
                        })}
                    />
                </div>
                {categoryArray.children &&
                    <div className="d-block">
                        <input type="hidden" name="parentId"
                            value={categoryArray._id}
                            ref={formRegister()}
                        />
                    </div>
                }
                <div className="d-block border-top mt-5 text-right">
                    <button type="button" onClick={handleCancel} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                        {categoryArray.children ? 'ADD SUB-CATEGORY' : 'ADD CATEGORY'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default CategryModal;

