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
app.post('/submit-form', upload.fields([{ name: 'files', maxCount: 10 }]), async (req, res) => {
  try {
      const users = [];
      Object.keys(req.body).forEach(key => {
          if (key.startsWith('user_')) {
              users.push(JSON.parse(req.body[key]));
          }
      });

      const files = req.files;
      users.forEach((user, index) => {
          const userFiles = [
              files[`utilityBill_${index}`] && files[`utilityBill_${index}`][0],
              files[`ninSlip_${index}`] && files[`ninSlip_${index}`][0]
          ].filter(Boolean);

          // Handle each user's data and files here...
      });

      res.status(200).json({ message: 'Form submitted successfully for all users' });
  } catch (error) {
      console.error('Error handling form submission:', error);
      res.status(500).json({ error: 'Failed to process form submission' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
