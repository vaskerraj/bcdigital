export const orderStatusText = (status) => {
    switch (status) {
        case 'not_confirmed':
            return "Not Confirmed"
        case 'confirmed':
            return "Confirmed"
        case 'packed':
            return "Packed"
        case 'shipped':
            return "Shipped"
        case 'for_delivery':
            return "For Delivery"
        case 'delivered':
            return "Delivered"
        default:
            status;
    }
}

export const paymentTypeText = (type) => {
    switch (type) {
        case 'cashondelivery':
            return 'Cash On Delivery';
        case 'eswea':
            return 'e-Sewa';
        case 'card':
            return 'Card';
        default:
            return type;
    }
}

export const generateTrackingId = (id) => {
    const hex = "0123456789";
    const model = "xxxxxxxxx";
    var str = "";
    for (var i = 0; i < model.length; i++) {
        var rnd = Math.floor(Math.random() * hex.length);
        str += model[i] == "x" ? hex[rnd] : model[i];
    }
    document.getElementById(id).value = process.env.TRACKINGID_PREFIX + str;
}

export const sellerStatusText = (status) => {
    switch (status) {
        case 'pending':
            return 'Under Review';
        case 'verified':
            return 'Verified';
        case 'not_verified':
            return 'Not Verified';
        case 're_uploaded':
            return 'Under Review';
        default:
            return status;
    }
}