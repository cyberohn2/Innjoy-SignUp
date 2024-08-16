require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.header('Access-Control-Allow-Methods', 'GET, POST'); // Allow GET and POST methods
  res.header('Access-Control-Allow-Headers', 'Content-Type'); // Allow Content-Type header
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// File upload handling
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to handle sign-up form submission
app.post('/submit-form', upload.fields([
    { name: 'utilityBill', maxCount: 1 },
    { name: 'ninSlip', maxCount: 1 }
]), (req, res) => {
    const formData = req.body;
    const files = req.files;
    
    // Format data for email content
    // Assuming formData is a plain object where each value is a JSON string
let formattedData = "";
let package
// Iterate through each key in formData
// ${JSON.parse(formData[formData.length][formData.length])}
Object.keys(formData).forEach((key, index) => {
    // Parse the JSON string associated with the key
    const data = JSON.parse(formData[key]);
    // If the data is an object, iterate through its properties
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
        }
        else{
            package = data[subKey]
        }
        // console.log(user)
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
        text: `You have a new user registering for ${package}. Details: ${formattedData}`,
        attachments: [{ 
            filename: files['utilityBill'][0].originalname, 
            content: files['utilityBill'][0].buffer, 
            encoding: 'base64' 
        },
        { 
            filename: files['ninSlip'][0].originalname, 
            content: files['ninSlip'][0].buffer, 
            encoding: 'base64' 
        },
        ],
    };
console.log(mailOptions)


    // Send email
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


// Route to handle sign-in form submission
app.post('/sign-in', (req, res) => {
    const formData = req.body;
    console.log(formData)
    // Format formData into a more readable string
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

    // Prepare email content
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.RECIPIENT_EMAIL,
        subject: 'Existing User Form Submission',
        text: `You have a new sign-in submission from an existing user. Details:${formattedData}`,
    };
    

    // Send email
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
