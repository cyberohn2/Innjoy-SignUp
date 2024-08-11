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
  { name: 'utilityBill', maxCount: 1 },
  { name: 'ninSlip', maxCount: 1 }
]), async (req, res) => {
  try {
    const users = [];
    
    // Extract user data from the request body
    Object.keys(req.body).forEach(key => {
      if (key.startsWith('user_')) {
        users.push(JSON.parse(req.body[key]));
      }
    });

    const files = req.files;
    
    // Handle each user's data and files
    for (const [index, user] of users.entries()) {
      const userFiles = [
        files['utilityBill'] ? files['utilityBill'][0] : null,
        files['ninSlip'] ? files['ninSlip'][0] : null
      ].filter(Boolean);

      // Prepare email options for each user
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.RECIPIENT_EMAIL, // Your recipient email address
        subject: `New User Account - ${user.firstName} ${user.lastName}`,
        text: `
          First Name: ${user.firstName}
          Last Name: ${user.lastName}
          Phone Number: ${user.phoneNumber}
          NIN: ${user.nin}
        `,
        attachments: userFiles.map(file => ({
          filename: file.originalname,
          path: file.path,
        })),
      };

      // Send email for each user
      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent for user ${user.firstName} ${user.lastName}`);
      } catch (error) {
        console.error(`Error sending email for user ${user.firstName} ${user.lastName}:`, error);
      }
    }

    res.status(200).json({ message: 'Form submitted successfully for all users' });
  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).json({ error: 'Failed to process form submission' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
