const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/user');

const app = express();

// configure the middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// set up the database connection
mongoose.connect('mongodb+srv://pattamu:iKHwECgQCaYNVpge@sandeepcluster.9rzkh.mongodb.net/my-DB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected'))
  .catch(err => console.log('Error connecting database', err));

// API endpoint for user registration
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, phone });
    const savedUser = await user.save();

    // API endpoint for user login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // compare the password hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // generate a token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

    // send verification email to the user
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const verificationLink = `http://localhost:3000/verify-email/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email address',
      html: `<p>Please click the following link to verify your email address:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// API endpoint for email verification
app.get('/verify-email/:token', async (req, res) => {
  try {
    const { email } = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findOneAndUpdate({ email }, { verificationStatus: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.redirect('http://localhost:3000/login');
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// API endpoint for user update
app.put('/update-user/:id', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { name, email, phone }, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});