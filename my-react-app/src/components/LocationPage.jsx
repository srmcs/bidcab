import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function LocationPage({ user, onLogout }) {
  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [error, setError] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setIsDarkMode(savedDarkMode)
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
    localStorage.setItem('darkMode', isDarkMode.toString())
  }, [isDarkMode])

  const handleLocationSubmit = (e) => {
    e.preventDefault()
    if (!pickup || !drop) {
      setError('Please enter both pickup and drop locations')
      return
    }
    
    // Store locations in sessionStorage to pass to next page
    sessionStorage.setItem('pickup', pickup)
    sessionStorage.setItem('drop', drop)
    
    // Navigate to bidding page
    navigate('/bidding')
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setPickup(`Current Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`)
      }, (error) => {
        console.error('Error getting location:', error)
        setError('Unable to get your location. Please enter manually.')
      })
    } else {
      setError('Geolocation is not supported by this browser.')
    }
  }

  return (
    <div className="app">
      <div className="container">
        <nav className={`menubar ${isDarkMode ? 'dark' : ''}`}>
          <div className="logo">🚗 Cab Bidding System</div>
          <ul className={`menu ${isMobileMenuOpen ? 'open' : ''}`}>
            <li><a href="#" className="active">🏠 Home</a></li>
            <li><a href="#">👤 Profile</a></li>
            <li><a href="#">📍 My Rides</a></li>
            <li><a href="#">⚙️ Settings</a></li>
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
                <div className="dropdown-item logout-item" onClick={onLogout}>
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

        <div className="location-page">
          <div className="page-header">
            <h1>📍 Where would you like to go?</h1>
            <p className="subtitle">Enter your pickup and destination locations</p>
          </div>

          <div className="location-form-container">
            <form onSubmit={handleLocationSubmit} className="location-form">
              <div className="location-inputs-container">
                <div className="form-group pickup-group">
                  <label htmlFor="pickup" className="location-label">
                    <span className="label-icon">📍</span>
                    Pickup Location
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="pickup"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      placeholder="Where are you?"
                      required
                      className="location-input pickup-input"
                    />
                    <div className="location-icon" onClick={getCurrentLocation}>
                      📍
                    </div>
                    <div className="input-underline"></div>
                  </div>
                </div>
                
                <div className="location-divider">
                  <div className="divider-line"></div>
                  <div className="divider-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="divider-line"></div>
                </div>
                
                <div className="form-group drop-group">
                  <label htmlFor="drop" className="location-label">
                    <span className="label-icon">🎯</span>
                    Drop Location
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="drop"
                      value={drop}
                      onChange={(e) => setDrop(e.target.value)}
                      placeholder="Where to go?"
                      required
                      className="location-input drop-input"
                    />
                    <div className="input-underline"></div>
                  </div>
                </div>
              </div>
              
              <button type="submit" className="btn-primary continue-btn">
                <span className="btn-icon">🚗</span>
                <span className="btn-text">Find Rides</span>
              </button>
            </form>
          </div>

          {/* Map placeholder - you can integrate with Google Maps or other map services */}
          <div className="map-container">
            <div className="map-placeholder">
              <div className="map-icon">🗺️</div>
              <p>Map view will be displayed here</p>
              <small>Integration with maps service required</small>
            </div>
          </div>

          <div className="location-features">
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <h3>Precise Location</h3>
              <p>Get accurate pickup and drop locations</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <h3>Quick Selection</h3>
              <p>Use current location or search for places</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🗺️</div>
              <h3>Route Preview</h3>
              <p>See your route before booking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationPage
