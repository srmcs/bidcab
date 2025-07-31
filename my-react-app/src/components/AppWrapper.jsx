import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import LocationPage from './LocationPage'
import BiddingPage from './BiddingPage'
import ConfirmationPage from './ConfirmationPage'
import AuthPage from './AuthPage'

const API_BASE_URL = 'http://localhost:5000'

function AppWrapper() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken')
    if (token) {
      fetchUserProfile(token)
    } else {
      setLoading(false)
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
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    // Clear any session data
    sessionStorage.clear()
  }

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LocationPage user={user} onLogout={handleLogout} />} />
        <Route path="/bidding" element={<BiddingPage user={user} onLogout={handleLogout} />} />
        <Route path="/confirmation" element={<ConfirmationPage user={user} onLogout={handleLogout} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppWrapper
