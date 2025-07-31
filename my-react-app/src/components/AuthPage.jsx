import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000'

function AuthPage({ onLogin }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Auth states
  const [phoneNumber, setPhoneNumber] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone') // 'phone' or 'otp'
  const [isNewUser, setIsNewUser] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setIsDarkMode(savedDarkMode)
  }, [])

  // Apply dark mode to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
    // Save preference
    localStorage.setItem('darkMode', isDarkMode.toString())
  }, [isDarkMode])

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
      setSuccess('Phone number verified successfully!')
      
      // Call the onLogin callback to update the parent component
      onLogin(user)
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

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '')
    
    // Add + prefix if not present
    if (cleaned.length > 0 && !value.startsWith('+')) {
      return '+' + cleaned
    }
    return value
  }

  return (
    <div className="app">
      <div className="container">
        <div className="auth-container">
          <div className="auth-header">
            <h1>🚗 Cab Bidding System</h1>
            <p className="subtitle">Secure authentication with phone number</p>
            
            <div className="dark-mode-toggle">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={isDarkMode} 
                  onChange={() => setIsDarkMode(!isDarkMode)}
                />
                <span className="slider"></span>
              </label>
              <span>{isDarkMode ? '☀️' : '🌙'} Dark Mode</span>
            </div>
          </div>

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

export default AuthPage
