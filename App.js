const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Manual CORS Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.header('Access-Control-Allow-Methods', 'GET, POST'); // Allow GET and POST methods
  res.header('Access-Control-Allow-Headers', 'Content-Type'); // Allow Content-Type header
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Route to handle form submission with file uploads
app.post('/submit-form', upload.fields([
  { name: 'utilityBill', maxCount: 5 },
  { name: 'ninSlip', maxCount: 5 }
]), async (req, res) => {
  try {
    const users = req.body;
    const files = req.files;

    let emailBody = '';

    // Prepare the email body by concatenating all users' data
    users.forEach((user, index) => {
      emailBody += `
      User ${index + 1}:
      First Name: ${user.firstName}
      Last Name: ${user.lastName}
      Phone Number: ${user.phoneNumber}
      NIN: ${user.nin}
      `;
    });

    // Combine all user files into one attachment array
    const attachments = [];
    if (files['utilityBill']) {
      attachments.push(...files['utilityBill'].map(file => ({
        filename: file.originalname,
        path: file.path,
      })));
    }
    if (files['ninSlip']) {
      attachments.push(...files['ninSlip'].map(file => ({
        filename: file.originalname,
        path: file.path,
      })));
    }

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.RECIPIENT_EMAIL, // Your recipient email address
      subject: 'New User Accounts Submission',
      text: emailBody,
      attachments: attachments,
    };

    // Send email with all users' data and attachments
    await transporter.sendMail(mailOptions);
    console.log('Email sent with all users’ data');

    res.status(200).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).json({ error: 'Failed to process form submission' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
