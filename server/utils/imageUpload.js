const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const singleImageUpload = async (req, type) => {
    const form = new FormData();
    form.append('type', type);
    form.append('file', fs.createReadStream(req.file.path));

    const request_config = {
        headers: {
            ...form.getHeaders()
        }
    };

    return await axios.post(`${process.env.CUSTOM_IMAGECDN}/upload/single`, form, request_config);
}

const updateSingleImage = async (req, imagename, type) => {
    const form = new FormData();
    form.append('type', type);
    form.append('file', fs.createReadStream(req.file.path));
    form.append('imagename', imagename);

    const request_config = {
        headers: {
            ...form.getHeaders()
        }
    };

    return await axios.put(`${process.env.CUSTOM_IMAGECDN}/upload/single`, form, request_config);
}

const singleButDiffFieldImageUpload = async (reqFiles, type) => {
    const form = new FormData();
    form.append('type', type);
    form.append('file', fs.createReadStream(reqFiles.path));

    const request_config = {
        headers: {
            ...form.getHeaders()
        }
    };

    return await axios.post(`${process.env.CUSTOM_IMAGECDN}/upload/single`, form, request_config);
}

const updateSingleButDiffFieldImageUpload = async (reqFiles, imagename, type) => {
    const form = new FormData();
    form.append('type', type);
    form.append('file', fs.createReadStream(reqFiles.path));
    form.append('imagename', imagename);

    const request_config = {
        headers: {
            ...form.getHeaders()
        }
    };

    return await axios.put(`${process.env.CUSTOM_IMAGECDN}/upload/single`, form, request_config);
}
const multipleImageUpload = async (req, type) => {
    const form = new FormData();
    form.append('type', type);
    req.files.forEach(item => {
        form.append(
            "file", fs.createReadStream(item.path)
        );
    });

    const request_config = {
        headers: {
            ...form.getHeaders()
        }
    };

    return await axios.post(`${process.env.CUSTOM_IMAGECDN}/upload/multiple`, form, request_config);
}
const deleteImage = async (imagename, type) => {
    return await axios.post(`${process.env.CUSTOM_IMAGECDN}/upload/delete`, {
        imagename,
        type
    });
}
const moveProductImages = async (file) => {
    return await axios.post(`${process.env.CUSTOM_IMAGECDN}/move/prodcut/img`, {
        file
    });
}

module.exports = {
    singleImageUpload,
    singleButDiffFieldImageUpload,
    updateSingleButDiffFieldImageUpload,
    multipleImageUpload,
    updateSingleImage,
    deleteImage,
    moveProductImages
};