const nodemailer = require('nodemailer');
const config = require('config.json');

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: config.smtpOptions.host,
    port: config.smtpOptions.port,
    secure: false,
    auth: {
        user: config.smtpOptions.auth.user,
        pass: config.smtpOptions.auth.pass
    }
});

// verify connection configuration
transporter.verify(function(error, success) {
    if (error) {
        console.log('SMTP connection error:', error);
    } else {
        console.log('SMTP server is ready to send emails');
    }
});

async function send({ to, subject, html, from = config.emailFrom }) {
    try {
        const info = await transporter.sendMail({
            from: `"Angular Auth" <${from}>`,
            to,
            subject,
            html
        });
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

module.exports = {
    send
}; 