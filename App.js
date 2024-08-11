const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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
app.post('/submit-form', upload.array('files', 10), async (req, res) => {
  const users = JSON.parse(req.body.users); // Parse users array from the request body
  const files = req.files;

  // Prepare the emails for each user
  const emailPromises = users.map((user, index) => {
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
      attachments: [
        {
          filename: files[index * 2]?.originalname, // Assuming 2 files per user
          path: files[index * 2]?.path,
        },
        {
          filename: files[index * 2 + 1]?.originalname,
          path: files[index * 2 + 1]?.path,
        }
      ].filter(attachment => attachment.filename && attachment.path), // Filter out undefined attachments
    };

    // Send email
    return transporter.sendMail(mailOptions);
  });

  try {
    await Promise.all(emailPromises);
    res.status(200).json({ message: 'Form submitted successfully for all users' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send one or more emails' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
