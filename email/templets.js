const paymentTypeTextAtServer = (type) => {
    switch (type) {
        case 'cashondelivery':
            return 'Cash On Delivery';
        case 'esewa':
            return 'e-Sewa';
        case 'card':
            return 'Card';
        default:
            return type;
    }
}

const discountRow = (discount) => {
    if (discount !== 0) {
        return `
            <tr>
                <td>Discount:</td>
                <td>Rs.${discount}</td>
            </tr>
            `
    } else {
        return '';
    }
}

const productsOfPackages = (products) => {
    return products && products.map(item =>
        `<table>
            <tr>
                <td>
                    <img src="${process.env.NEXT_PUBLIC_CUSTOM_IMAGECDN}/uploads/products/${item.colour[0].images[0]}" height="95" />
                </td>
                <td colSpan="3"></td>
                <td>
                    ${item.name}
                    <div style="color: #f33535">
                        Rs. ${item.price}
                    </div>
                    <div>
                        Quantity: ${item.productQty}
                    </div>
                </td>
            </tr>
        </table>`
    )
}

const packageWithProductList = (packages) => {
    return packages && packages.map((item, index) =>
        `<div>
            <div>Package ${index + 1}</div>
            ${productsOfPackages(item.products)}
            <br />
        </div>`
    )
}

const orderConfirm = (user_fullname, orderId, orderPackages, orderSummery) => (

    `<div style="background-color: #f3f3f3; padding :15px">
        <center style="font-size: 16px; font-weight: '400'">
            Your Order Is Confirm
        </center>
        <br />
        <div>Hello, <b>${user_fullname}</b></div>
        <br />
        <div>Thank you for your order! We hope you enjoyed shopping with us.</div>
        <div style="margin-top: 15px">You can view the status of your order <b style="text-transform: uppercase">#${orderId}</b>.Orders from multiple seller will be deliver in separate packages and we’ll let you know once package(s) have dispatched..</div>
        <br />
        <div>
            <strong>Order Summery</strong>
            ${packageWithProductList(orderPackages)}
            <table>
                <tr>
                    <td>Order Id:</td>
                    <td><div style="text-transform: uppercas">#${orderId}</div></td>
                </tr>
                <tr>
                    <td>Sub Total:</td>
                    <td>Rs.${orderSummery.subtotal}</td>
                </tr>
                <tr>
                    <td>Shipping Charge:</td>
                    <td>Rs.${orderSummery.shippingCharge}</td>
                </tr>
                ${discountRow(orderSummery.couponDiscount)}
                <tr>
                    <td><b>Order Total:</b></td>
                    <td>Rs.${orderSummery.grandTotal}</td>
                </tr>
                <tr>
                    <td>Selected Payment Method:</td>
                    <td>${paymentTypeTextAtServer(orderSummery.paymentMethod)}</td>
                </tr>
            </table>
        </div>
        <br />
        <strong></strong>
        <br />
        <div>BC Digital</div>
    </div>`

)

const orderShipped = (user_fullname, orderId, orderPackages, orderSummery) => (

    `<div style="background-color: #f3f3f3; padding :15px">
        <center style="font-size: 16px; font-weight: '400'">
            Expect to see your package soon
        </center>
        <br/>
        <div>Hello, <b>${user_fullname}</b></div>
        <br/>
        <div>
        Items(s) from order id #<b style="text-transform: uppercase">${orderId}</b> has been <b>shipped</b>! Your order is on the way, and can no longer be changed.
        </div>
        <br/>
        <div>
            <strong>Product(s) inside package</strong>
            ${productsOfPackages(orderPackages)}
        </div>
        <br/>
        <div>
            <strong>Package Summery</strong>
            <table>
            <tr>
                <td>Order Id:</td>
                <td><div style="text-transform: uppercase">#${orderId}</div></td>
            </tr>
            <tr>
                <td>Sub Total:</td>
                <td>Rs.${orderSummery.subtotal}</td>
            </tr>
            <tr>
                <td>Shipping Charge:</td>
                <td>Rs.${orderSummery.shippingCharge}</td>
            </tr>
            ${discountRow(orderSummery.couponDiscount)}
            <tr>
                <td><b>Order Total:</b></td>
                <td>Rs.${orderSummery.grandTotal}</td>
            </tr>
            <tr>
                <td>Selected Payment Method:</td>
                <td>${paymentTypeTextAtServer(orderSummery.paymentMethod)}</td>
            </tr>
        </table>
        </div>
        <div>BC Digital</div>
    </div>`
)


const orderCancelled = (user_fullname, orderId, orderPackages) => (
    `<div style="background-color: #f3f3f3; padding :15px">
        <center style="font-size: 16px; font-weight: '400'">
            Expect to see your package soon
        </center>
        <br/>
        <div>Hello, <b>${user_fullname}</b></div>
        <br/>
        <div>
            ssdsd
        </div>
    </div>`
)

const orderDelivered = (user_fullname, orderId, orderPackages, orderSummery) => (

    `<div style="background-color: #f3f3f3; padding :15px">
        <center style="font-size: 16px; font-weight: '400'">
            Your package has been delivered!
        </center>
        <br/>
        <div>Hello, <b>${user_fullname}</b></div>
        <br/>
        <div>
            Items(s) from order id #${orderId} has been delivered.
        </div>
        <div>
            Thanks again for shopping with Bc Digital.
        </div>
        <br/>
        <div>
            <strong>Product(s) inside package</strong>
            ${productsOfPackages(orderPackages)}
        </div>
        <br/>
        <div>
            <strong>Package Summery</strong>
            <table>
            <tr>
                <td>Sub Total:</td>
                <td>Rs.${orderSummery.subtotal}</td>
            </tr>
            <tr>
                <td>Shipping Charge:</td>
                <td>Rs.${orderSummery.shippingCharge}</td>
            </tr>
            ${discountRow(orderSummery.couponDiscount)}
            <tr>
                <td><b>Order Total:</b></td>
                <td>Rs.${orderSummery.grandTotal}</td>
            </tr>
            <tr>
                <td>Selected Payment Method:</td>
                <td>${paymentTypeTextAtServer(orderSummery.paymentMethod)}</td>
            </tr>
        </table>
        </div>
        <div>We hope to see you again soon.</div>
        <div>BC Digital</div>
    </div>`
)

module.exports = {
    orderConfirm,
    orderShipped,
    orderCancelled,
    orderDelivered
}