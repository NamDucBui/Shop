const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const sendOrderConfirmation = async (userEmail, orderData) => {
    const mailOptions = {
        from: "Shop",
        to: userEmail,
        subject: "Xác nhận đơn hàng thành công",
        html: `
            <h1>Cảm ơn bạn đã mua hàng!</h1>
            <p>Đơn hàng #${orderData.id} của bạn đã được xác nhận.</p>
            <p>Tổng tiền: ${orderData.total} VNĐ</p>
        `
    }

    return await transporter.sendMail(mailOptions)
}

module.exports = {sendOrderConfirmation}