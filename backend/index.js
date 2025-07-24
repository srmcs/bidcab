const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key'; // In production, use environment variables

app.use(cors());
app.use(bodyParser.json());

// In-memory storage for demo purposes (replace with database in production)
let users = [];
let otpStore = new Map();

let drivers = [
  { id: 1, name: "Amit", rating: 4.5, phoneNumber: "+1234567890" },
  { id: 2, name: "Sara", rating: 4.8, phoneNumber: "+1234567891" },
  { id: 3, name: "Ravi", rating: 4.2, phoneNumber: "+1234567892" }
];

// Validation schemas
const phoneValidationSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required().messages({
    'string.pattern.base': 'Phone number must be in valid E.164 format (e.g., +1234567890)',
    'any.required': 'Phone number is required'
  }),
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must be at most 50 characters long',
    'any.required': 'Name is required'
  })
});

const otpValidationSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
    'string.length': 'OTP must be exactly 6 digits',
    'string.pattern.base': 'OTP must contain only numbers',
    'any.required': 'OTP is required'
  })
});

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Simulate SMS sending (replace with actual SMS service like Twilio)
function sendOTP(phoneNumber, otp) {
  console.log(`\n📱 SMS Simulation:`);
  console.log(`   To: ${phoneNumber}`);
  console.log(`   Message: Your OTP is: ${otp}`);
  console.log(`   Valid for: 5 minutes\n`);
  
  // In production, integrate with Twilio or other SMS service
  // const twilio = require('twilio');
  // const client = twilio(accountSid, authToken);
  // return client.messages.create({
  //   body: `Your OTP is: ${otp}`,
  //   from: '+your-twilio-number',
  //   to: phoneNumber
  // });
  return Promise.resolve({ success: true });
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Register/Login with phone number
app.post('/auth/register', async (req, res) => {
  try {
    const { error, value } = phoneValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { phoneNumber, name } = value;
    
    // Check if user already exists
    let existingUser = users.find(user => user.phoneNumber === phoneNumber);
    if (existingUser) {
      // User exists, generate new OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      
      // Store OTP in memory for demo
      otpStore.set(phoneNumber, { otp, expiry: otpExpiry });
      
      await sendOTP(phoneNumber, otp);
      
      return res.json({ 
        message: 'OTP sent successfully', 
        phoneNumber,
        isNewUser: false
      });
    }
    
    // Create new user
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    const user = {
      id: users.length + 1,
      phoneNumber,
      name,
      otp,
      otpExpiry,
      isVerified: false,
      createdAt: new Date()
    };
    
    users.push(user);
    
    // Store OTP in memory for demo
    otpStore.set(phoneNumber, { otp, expiry: otpExpiry });
    
    await sendOTP(phoneNumber, otp);
    
    res.json({ 
      message: 'User registered successfully. OTP sent to your phone.', 
      phoneNumber,
      isNewUser: true
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP
app.post('/auth/verify-otp', async (req, res) => {
  try {
    const { error, value } = otpValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { phoneNumber, otp } = value;
    
    // Check OTP from memory store (for demo)
    const storedOtpData = otpStore.get(phoneNumber);
    if (!storedOtpData) {
      return res.status(400).json({ error: 'OTP not found. Please request a new OTP.' });
    }
    
    if (new Date() > storedOtpData.expiry) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({ error: 'OTP has expired. Please request a new OTP.' });
    }
    
    if (storedOtpData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }
    
    // OTP is valid, update user
    const user = users.find(user => user.phoneNumber === phoneNumber);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    
    // Clear OTP from memory
    otpStore.delete(phoneNumber);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phoneNumber: user.phoneNumber },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Phone number verified successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified
      }
    });
    
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend OTP
app.post('/auth/resend-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    const user = users.find(user => user.phoneNumber === phoneNumber);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    
    // Store OTP in memory for demo
    otpStore.set(phoneNumber, { otp, expiry: otpExpiry });
    
    await sendOTP(phoneNumber, otp);
    
    res.json({ message: 'OTP resent successfully' });
    
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile (protected route)
app.get('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = users.find(user => user.id === req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected bid endpoint
app.post('/bid', authenticateToken, async (req, res) => {
  try {
    const { pickup, drop } = req.body;
    
    if (!pickup || !drop) {
      return res.status(400).json({ error: 'Pickup and drop locations are required' });
    }
    
    // Verify user is authenticated and verified
    const user = users.find(user => user.id === req.user.userId);
    if (!user || !user.isVerified) {
      return res.status(403).json({ error: 'User not verified' });
    }
    
    const bids = drivers.map(driver => ({
      ...driver,
      bidAmount: Math.floor(Math.random() * 200) + 100
    }));

    res.json({
      bids,
      user: {
        name: user.name,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error('Bid error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Cab Bidding System Server running at http://localhost:${PORT}`);
  console.log('\n📋 Available endpoints:');
  console.log('   POST /auth/register - Register/Login with phone number');
  console.log('   POST /auth/verify-otp - Verify OTP');
  console.log('   POST /auth/resend-otp - Resend OTP');
  console.log('   GET /auth/profile - Get user profile (protected)');
  console.log('   POST /bid - Place bid (protected)');
  console.log('   GET /health - Health check');
  console.log('\n🔐 Authentication required for protected routes');
  console.log('   Add Authorization header: Bearer <token>\n');
});
