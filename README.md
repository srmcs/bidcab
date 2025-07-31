# 🚗 Cab Bidding System with Phone Number Authentication

A secure cab bidding system that implements phone number authentication with OTP verification. Users must verify their phone numbers before they can request cab bids from drivers.

## 🔐 Features

- **Secure Phone Number Authentication**: Users must provide a valid phone number in E.164 format
- **OTP Verification**: 6-digit OTP sent to the user's phone for verification
- **JWT Token-based Sessions**: Secure session management with JWT tokens
- **Input Validation**: Comprehensive validation using Joi for phone numbers and OTP
- **Real-time Bid System**: Get bids from multiple drivers instantly
- **Driver Rating System**: View driver ratings and contact information
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **JWT** for authentication
- **Joi** for input validation
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests
- **In-memory storage** (can be replaced with MongoDB)

### Frontend
- **React** with Vite
- **Axios** for HTTP requests
- **Modern CSS** with responsive design
- **Local Storage** for token persistence

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A phone number in E.164 format for testing

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd cab-bidding-system
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../my-react-app
npm install
```

### 4. Start the Backend Server
```bash
cd ../backend
node index.js
```
The backend server will run on `http://localhost:5000`

### 5. Start the Frontend Application
```bash
cd ../my-react-app
npm run dev
```
The frontend will run on `http://localhost:5173`

## 📱 Usage Instructions

### Step 1: Register/Login
1. Open the application in your browser
2. Enter your full name
3. Enter your phone number in E.164 format (e.g., +1234567890)
4. Click "Send OTP"

### Step 2: Verify Phone Number
1. Check the server console for the OTP (in production, this would be sent via SMS)
2. Enter the 6-digit OTP in the verification form
3. Click "Verify OTP"

### Step 3: Request Cab Bids
1. Enter your pickup location
2. Enter your drop location
3. Click "Get Bids"
4. View available drivers with their ratings and bid amounts

## 🔧 API Endpoints

### Authentication
- `POST /auth/register` - Register/Login with phone number
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/resend-otp` - Resend OTP
- `GET /auth/profile` - Get user profile (protected)

### Bidding
- `POST /bid` - Get bids from drivers (protected)

### Health Check
- `GET /health` - Server health check

## 📋 Phone Number Format

The system requires phone numbers in E.164 format:
- Must start with `+` followed by country code
- Examples: `+1234567890`, `+919876543210`, `+447123456789`
- Invalid formats will be rejected with appropriate error messages

## 🔒 Security Features

### Input Validation
- Phone number validation using regex patterns
- OTP validation (6 digits, numbers only)
- Name validation (2-50 characters)

### Authentication
- JWT tokens with 7-day expiration
- Protected routes requiring valid tokens
- OTP expiration (5 minutes)

### Error Handling
- Comprehensive error messages
- Proper HTTP status codes
- Client-side and server-side validation

## 🧪 Testing

### Test Phone Numbers
For testing purposes, you can use these formats:
- `+1234567890` (US format)
- `+919876543210` (India format)
- `+447123456789` (UK format)

### Test Scenario
1. Register with a valid phone number
2. Check server console for OTP
3. Verify with the correct OTP
4. Request bids with pickup and drop locations
5. View driver bids and ratings

## 📈 Production Deployment

### Environment Variables
Create a `.env` file in the backend directory:
```env
JWT_SECRET=your-super-secret-jwt-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
MONGODB_URI=mongodb://localhost:27017/cab-bidding
```

### SMS Integration
To enable real SMS sending, uncomment the Twilio code in `backend/index.js`:
```javascript
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// In the sendOTP function
return client.messages.create({
  body: `Your OTP is: ${otp}`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: phoneNumber
});
```

## 🚦 Error Handling

The system handles various error scenarios:
- Invalid phone number format
- Expired OTP
- Invalid OTP
- Network errors
- Authentication failures
- Server errors

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop browsers
- Mobile phones
- Tablets

## 🔮 Future Enhancements

- Real-time notifications
- Driver tracking
- Payment integration
- Trip history
- Advanced search filters
- Push notifications

## 📞 Support

For support or questions, please refer to the code comments or create an issue in the repository.

---

**Note**: This is a demonstration project. For production use, ensure proper security measures, real SMS integration, and database persistence are implemented.
"# bidcab" 
"# bidcab" 
"# bidcab" 
