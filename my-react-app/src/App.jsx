import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Auth states
  const [phoneNumber, setPhoneNumber] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone') // 'phone' or 'otp'
  const [isNewUser, setIsNewUser] = useState(false)
  
  // Bid states
  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [bids, setBids] = useState([])
const [showBids, setShowBids] = useState(false)
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken')
    if (token) {
      fetchUserProfile(token)
    }
  }, [])

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(response.data.user)
    } catch (error) {
      localStorage.removeItem('authToken')
      console.error('Profile fetch error:', error)
    }
  }

  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        phoneNumber,
        name
      })
      
      setSuccess(response.data.message)
      setIsNewUser(response.data.isNewUser)
      setStep('otp')
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        phoneNumber,
        otp
      })
      
      const { token, user } = response.data
      localStorage.setItem('authToken', token)
      setUser(user)
      setSuccess('Phone number verified successfully!')
      setStep('phone')
      setOtp('')
    } catch (error) {
      setError(error.response?.data?.error || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await axios.post(`${API_BASE_URL}/auth/resend-otp`, {
        phoneNumber
      })
      setSuccess('OTP resent successfully!')
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleBidSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    setBids([])

    try {
      const token = localStorage.getItem('authToken')
      const response = await axios.post(`${API_BASE_URL}/bid`, {
        pickup,
        drop
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setBids(response.data.bids)
      setShowBids(true)
      setSuccess('Bids received successfully!')
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to get bids')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    setPhoneNumber('')
    setName('')
    setOtp('')
    setStep('phone')
    setPickup('')
    setDrop('')
    setBids([])
    setShowBids(false)
    setError('')
    setSuccess('')
  }

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '')
    
    // Add + prefix if not present
    if (cleaned.length > 0 && !value.startsWith('+')) {
      return '+' + cleaned
    }
    return value
  }

  if (user) {
    return (
      <div className="app">
        <div className="container">
          <nav className={`menubar ${isDarkMode ? 'dark' : ''}`}>
            <div className="logo">🚗 Cab Bidding System</div>
            <ul className={`menu ${isMobileMenuOpen ? 'open' : ''}`}>
              <li><a href="#">🏠 Home</a></li>
              <li><a href="#">👤 Profile</a></li>
              <li><a href="#">🎯 Bids</a></li>
            </ul>
            <div className="user-dropdown">
              <div 
                className="user-avatar" 
                onClick={() => setUserDropdownOpen(!isUserDropdownOpen)}
              >
                <span className="user-initials">
                  {user.name.split(' ').map(name => name[0]).join('').toUpperCase()}
                </span>
              </div>
              {isUserDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-item user-info">
                    <span className="user-name">👋 {user.name}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item toggle-item">
                    <span>{isDarkMode ? '☀️' : '🌙'} Dark Mode</span>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={isDarkMode} 
                        onChange={() => setIsDarkMode(!isDarkMode)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item logout-item" onClick={handleLogout}>
                    <span>🚪 Logout</span>
                  </div>
                </div>
              )}
            </div>
            <div className="hamburger" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
              <div className="line"></div>
              <div className="line"></div>
              <div className="line"></div>
            </div>
          </nav>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <div className="bid-section">
            <h2>Request a Cab</h2>
            <form onSubmit={handleBidSubmit} className="bid-form">
              <div className="form-group">
                <label htmlFor="pickup">Pickup Location:</label>
                <input
                  type="text"
                  id="pickup"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="Enter pickup location"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="drop">Drop Location:</label>
                <input
                  type="text"
                  id="drop"
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                  placeholder="Enter drop location"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Getting Bids...' : 'Get Bids'}
              </button>
            </form>
          </div>

          {showBids && bids.length > 0 && (
            <div className="bids-section">
              <h2>Available Drivers</h2>
              <div className="bids-grid">
                {bids.map((bid) => (
                  <div key={bid.id} className="bid-card">
                    <h3>{bid.name}</h3>
                    <p>⭐ Rating: {bid.rating}</p>
                    <p>💰 Bid Amount: ₹{bid.bidAmount}</p>
                    <p>📱 {bid.phoneNumber}</p>
                    <button className="btn-secondary">
                      Select Driver
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="container">
        <div className="auth-container">
          <h1>🚗 Cab Bidding System</h1>
          <p className="subtitle">Secure authentication with phone number</p>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          {step === 'phone' && (
            <div className="auth-form">
              <h2>{isNewUser ? 'Create Account' : 'Login'}</h2>
              <form onSubmit={handlePhoneSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name:</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number:</label>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                    placeholder="+1234567890"
                    required
                  />
                  <small>Format: +[country code][number] (e.g., +1234567890)</small>
                </div>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            </div>
          )}

          {step === 'otp' && (
            <div className="auth-form">
              <h2>Verify Phone Number</h2>
              <p>Enter the 6-digit OTP sent to {phoneNumber}</p>
              <form onSubmit={handleOtpSubmit}>
                <div className="form-group">
                  <label htmlFor="otp">OTP:</label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    required
                  />
                </div>
                <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary">
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
              <div className="otp-actions">
                <button onClick={handleResendOtp} disabled={loading} className="btn-secondary">
                  Resend OTP
                </button>
                <button onClick={() => setStep('phone')} className="btn-secondary">
                  Change Number
                </button>
              </div>
            </div>
          )}

          <div className="features">
            <h3>Features:</h3>
            <ul>
              <li>✅ Secure phone number authentication</li>
              <li>✅ OTP verification for security</li>
              <li>✅ Real-time bid system</li>
              <li>✅ Driver rating system</li>
              <li>✅ JWT token-based sessions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
