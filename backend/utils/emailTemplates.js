exports.receivedChatMessage = (messageLink) => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333;">You've received a new message!</h2>
                <p style="color: #555;">Someone has sent you a message on Faithzy. Click the button below to view and respond.</p>
                <a href="${messageLink}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Open Chat</a>
            </div>
        </div>
    `;
}

exports.receivedChatMessageFromAdmin = (messageLink) => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333;">You've received a new message from Admin!</h2>
                <p style="color: #555;">Admin has sent you a message on Faithzy. Click the button below to view and respond.</p>
                <a href="${messageLink}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Open Chat</a>
            </div>
        </div>
    `;
}

exports.receivedOfferMessage = (offerLink) => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333;">You've received an offer!</h2>
                <p style="color: #555;">A seller has sent you an offer on Faithzy. Click the button below to view and respond.</p>
                <a href="${offerLink}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">View Offer</a>
            </div>
        </div>
    `;
}

exports.receivedOrder = (offerLink) => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <h2 style="color: #333; text-align: center;">🎉 Congratulations! You've Received a New Order</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.5;">
                    We are excited to inform you that a buyer has just placed an order with you. Please review the details of the order and take the necessary actions to fulfill it.
                </p>
                <p style="color: #555; font-size: 16px; line-height: 1.5;">
                    It's a great opportunity to showcase your products/services and build strong relationships with your customers.
                </p>
                <div style="text-align: center;">
                    <a href="${offerLink}" style="display: inline-block; margin-top: 20px; padding: 12px 25px; background-color: #4CAF50; color: #fff; text-decoration: none; font-size: 16px; border-radius: 5px;">View Order Details</a>
                </div>
                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                    If you have any questions or need assistance, feel free to contact our support team. Thank you for being part of our platform!
                </p>
            </div>
        </div>
    `;
}


exports.completedOrderToBuyer = (reviewLink) => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333;">Order Successfully Completed!!</h2>
                <p style="color: #555;">We are pleased to inform you that your recent order has been completed successfully. We hope you are satisfied with your purchase!</p>
                <p>We would love to hear your feedback. Please <a href="${reviewLink}">leave a review</a> for the product you purchased to help us improve our service.</p>
                <p>If you have any questions or need further assistance, do not hesitate to contact our support team.</p>
                <p>Thank you for choosing Faithzy!</p>
                <p>Best regards,<br/>The Faithzy Team</p>
                <a href="${reviewLink}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">View Order</a>
            </div>
        </div>
    `;
}

exports.completedOrderToSeller = (totalEarnings) => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333;">Order Successfully Completed!</h2>
                <p style="color: #555;">Congratulations! Your recent order has been completed successfully. We are happy to let you know that you have earned a total of $${totalEarnings.toFixed(2)}!</p>
                <p>Please note that the funds will be transferred to your account within 12 business days.</p>
                <p>If you have any questions regarding the transaction or need further support, please reach out to our support team.</p>
                <p>Thank you for being a valued member of the Faithzy community!</p>
                <p>Best regards,<br/>The Faithzy Team</p>
            </div>
        </div>
    `;
}


exports.cancelledOrderToBuyer = () => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333;">Order Cancelled</h2>
                <p style="color: #555;">We regret to inform you that your recent order has been cancelled. We apologize for any inconvenience this may have caused.</p>
                <p>If the payment was processed, you will receive a full refund within the next few business days.</p>
                <p>If you have any questions or concerns regarding this cancellation, please don't hesitate to contact our support team.</p>
                <p>We appreciate your understanding and hope to serve you again soon.</p>
                <p>Best regards,<br/>The Faithzy Team</p>
                <a href="https://faithzy.com/orders" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">View Orders</a>
            </div>
        </div>
    `;
};

exports.cancelledOrderToSeller = () => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333;">Order Cancelled</h2>
                <p style="color: #555;">Unfortunately, the recent order from a buyer has been cancelled!</p>
                <p>If you have any questions regarding this cancellation, or if you need further assistance, please contact our support team.</p>
                <p>We hope you continue to have success selling on Faithzy, and we’re here to assist you if you have any concerns.</p>
                <p>Best regards,<br/>The Faithzy Team</p>
                <a href="https://faithzy.com/orders" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">View Orders</a>
            </div>
        </div>
    `;
};

exports.verificationEmail = (verificationLink) => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333;">Verify your Email</h2>
                <p style="color: #555;">Please click on the button below to verify your email!</p>
                <a href="${verificationLink}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a>
            </div>
        </div>
    `;
};

exports.welcomeEmail = (userName) => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333;">Welcome to Faithzy, ${userName}!</h2>
                <p style="color: #555;">We're excited to have you join our community where you can explore and sell religious products and services. Whether you're here to buy or sell, Faithzy offers a platform dedicated to faith-inspired commerce.</p>
                <p style="color: #555;">Here are a few things you can do to get started:</p>
                <ul style="color: #555; padding-left: 20px;">
                    <li>Browse products and services offered by others in our community.</li>
                    <li>List your own religious items or services for sale.</li>
                    <li>Engage with other members through chat and special offers.</li>
                </ul>
                <p style="color: #555;">We’re here to help if you need any support. Feel free to contact us anytime.</p>
                <p style="color: #555;">Thank you for being a part of Faithzy, and we look forward to seeing you thrive!</p>
                <p style="color: #555;">Best regards,<br/>The Faithzy Team</p>
            </div>
        </div>
    `;
};