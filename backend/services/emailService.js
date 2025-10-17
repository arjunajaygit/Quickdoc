import nodemailer from 'nodemailer';

// Create a reusable transporter object using the SMTP transport with Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL,       // Your Gmail address from .env file
        pass: process.env.GMAIL_APP_PASSWORD // Your 16-digit App Password from .env file
    }
});

/**
 * Sends an email using the pre-configured transporter.
 * @param {object} mailOptions - The mail options object (from, to, subject, html).
 */
const sendEmail = async (mailOptions) => {
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        // Depending on your app's needs, you might want to throw the error
        // or handle it gracefully without stopping the server.
    }
};

// Make sure to export the function so it can be imported elsewhere
export { sendEmail };