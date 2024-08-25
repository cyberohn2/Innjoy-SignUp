require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// File upload handling (if needed in other routes)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Example recipient emails
const recipientEmails = [
    process.env.RECIPIENT_EMAIL_1,
    process.env.RECIPIENT_EMAIL_2,
    process.env.RECIPIENT_EMAIL_3
].join(',');

// Route to handle contact form submission
app.post('/contact', (req, res) => {
    const { name, message } = req.body;

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Prepare email content
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: [recipientEmails[0], recipientEmails[1]].join(','),
        subject: 'New Contact Form Submission',
        html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Message:</strong> ${message}</p>
        `
,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).send({ message: 'Failed to send Message', error });
        } else {
            console.log('Email sent:', info.response);
            res.status(200).send({ message: 'Message sent successfully' });
        }
    });
});

// Route to handle review form submission
app.post('/submit-review', (req, res) => {
    const { name, title, content } = req.body;

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Prepare email content
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmails[0],
        subject: 'New Review Submission',
        html: `
            <p>You have received a new review:</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Content:</strong> ${content}</p>
            <p>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <a
                        href="https://innjoytelcom.com.ng/send-review?name=${encodeURIComponent(name)}&title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}"
                        style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
                        Accept and Send
                    </a>
                    
                </div>
            </p>
        `
,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).send({ message: 'Failed to send review', error });
        } else {
            console.log('Email sent:', info.response);
            res.status(200).send({ message: 'Review submitted successfully' });
        }
    });
});

// Existing route to handle sign-up form submission
app.post('/submit-form', upload.fields([
    { name: 'utilityBill', maxCount: 1 },
    { name: 'ninSlip', maxCount: 1 }
]), (req, res) => {
    const formData = req.body;
    const files = req.files;

    // Format data for email content
    let formattedData = "";
    let packageInfo = "";

    Object.keys(formData).forEach((key, index) => {
        const data = JSON.parse(formData[key]);
        Object.keys(data).forEach((subKey) => {
            if (subKey !== "package") {
                const user = data[subKey];
                formattedData += `
                <p><strong>${index === 0 ? "Pilot Details" : "Number " + index}</strong></p>
                <p><strong>First Name:</strong> ${user.firstName}</p>
                <p><strong>Last Name:</strong> ${user.lastName}</p>
                <p><strong>Phone Number:</strong> ${user.phoneNumber}</p>
                <p><strong>NIN:</strong> ${user.nin}</p>
                `;
;
            } else {
                packageInfo = data[subKey];
            }
        });
    });

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Prepare email content
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: [recipientEmails[0], recipientEmails[1]].join(','),
        subject: 'New Signup Form Submission',
        html: `
        <p>You have a new user registering for <strong>${packageInfo}</strong>.</p>
        <p><strong>Details:</strong></p>
        ${formattedData}
        `
,
        attachments: [
            { filename: files['utilityBill'][0].originalname, content: files['utilityBill'][0].buffer, encoding: 'base64' },
            { filename: files['ninSlip'][0].originalname, content: files['ninSlip'][0].buffer, encoding: 'base64' },
        ],
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).send({ message: 'Failed to send email', error });
        } else {
            console.log('Email sent:', info.response);
            res.status(200).send({ message: 'Sign-up form submitted successfully' });
        }
    });
});

// Existing route to handle sign-in form submission
app.post('/sign-in', (req, res) => {
    const formData = req.body;

    let formattedData = "";
    Object.keys(formData).forEach((key, index) => {
        const data = formData[key];
        formattedData += `
        <p><strong>${index === 0 ? "Pilot Details" : "User " + index}</strong></p>
        <p><strong>First Name:</strong> ${data.firstName}</p>
        <p><strong>Last Name:</strong> ${data.lastName}</p>
        <p><strong>Phone Number:</strong> ${data.phoneNumber}</p>
        ${index === 0 ? "" : `<p><strong>NIN:</strong> ${data.nin}</p>`}
        `;

    });

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: [recipientEmails[0], recipientEmails[1]].join(','),
        subject: 'Existing User Form Submission',
        html: `
        <p>You have a new sign-in submission from an existing user.</p>
        <p><strong>Details:</strong></p>
        ${formattedData}
        `
,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).send({ message: 'Failed to send email', error });
        } else {
            console.log('Email sent:', info.response);
            res.status(200).send({ message: 'Sign-in form submitted successfully' });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
