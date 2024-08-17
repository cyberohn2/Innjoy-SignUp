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
        to: process.env.RECIPIENT_EMAIL,
        subject: 'New Review Submission',
        text: `You have received a new review:\n\nName: ${name}\nTitle: ${title}\nContent: ${content}`,
    };
    console.log(mailOptions)
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
                ${index === 0 ? "Pilot Details" : "Number " + index}
                First Name: ${user.firstName}
                Last Name: ${user.lastName}
                Phone Number: ${user.phoneNumber}
                NIN: ${user.nin}
                `;
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
        to: process.env.RECIPIENT_EMAIL,
        subject: 'New Signup Form Submission',
        text: `You have a new user registering for ${packageInfo}. Details: ${formattedData}`,
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
        ${index == 0 ? "Pilot Details" : "User " + (index )}
        First Name: ${data.firstName}
        Last Name: ${data.lastName}
        Phone Number: ${data.phoneNumber}
        ${index == 0 ? "" : "NIN: " + data.nin}
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
        to: process.env.RECIPIENT_EMAIL,
        subject: 'Existing User Form Submission',
        text: `You have a new sign-in submission from an existing user. Details:${formattedData}`,
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
