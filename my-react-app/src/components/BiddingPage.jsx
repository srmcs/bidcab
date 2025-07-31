import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function BiddingPage({ user, onLogout }) {
  const [bids, setBids] = useState([])
  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const locPickup = sessionStorage.getItem('pickup')
    const locDrop = sessionStorage.getItem('drop')
    if (locPickup && locDrop) {
      setPickup(locPickup)
      setDrop(locDrop)
      fetchBids(locPickup, locDrop)
    } else {
      navigate('/')
    }
  }, [navigate])

  const fetchBids = async (pickup, drop) => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      const token = localStorage.getItem('authToken')
      const response = await axios.post('http://localhost:5000/bid', {
        pickup,
        drop
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBids(response.data.bids)
      setSuccess('Bids received successfully!')
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to get bids')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDriver = (bid) => {
    // Store selected bid and navigate to confirmation page
    sessionStorage.setItem('selectedBid', JSON.stringify(bid))
    navigate('/confirmation')
  }

  const goBack = () => {
    navigate('/')
  }

  return (
    <div className="app">
      <div className="container">
        <nav className="menubar">
          <div className="logo">🚗 Cab Bidding System</div>
          <ul className="menu">
            <li><a href="#">🏠 Home</a></li>
            <li><a href="#">👤 Profile</a></li>
            <li><a href="#" className="active">🎯 Bids</a></li>
            <li><a href="#">⚙️ Settings</a></li>
          </ul>
        </nav>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="bidding-page">
          <div className="page-header">
            <button onClick={goBack} className="back-btn">← Back</button>
            <h1>🎯 Available Drivers</h1>
            <div className="trip-info">
              <p><strong>From:</strong> {pickup}</p>
              <p><strong>To:</strong> {drop}</p>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Finding available drivers...</p>
            </div>
          ) : (
            <div className="bids-section">
              <div className="bids-grid">
                {bids.map((bid) => (
                  <div key={bid.id} className="bid-card">
                    <div className="driver-info">
                      <div className="driver-avatar">
                        {bid.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className="driver-details">
                        <h3>{bid.name}</h3>
                        <div className="rating">
                          <span className="stars">{'⭐'.repeat(Math.floor(bid.rating))}</span>
                          <span className="rating-text">{bid.rating}/5</span>
                        </div>
                        <p className="phone">📱 {bid.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="bid-amount">
                      <span className="currency">₹</span>
                      <span className="amount">{bid.bidAmount}</span>
                    </div>
                    <button 
                      className="btn-primary select-btn" 
                      onClick={() => handleSelectDriver(bid)}
                    >
                      Select Driver
                    </button>
                  </div>
                ))}
              </div>
              
              {bids.length === 0 && (
                <div className="no-bids">
                  <div className="no-bids-icon">🚗</div>
                  <h3>No drivers available</h3>
                  <p>Please try again later or modify your route</p>
                  <button onClick={goBack} className="btn-secondary">Change Route</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BiddingPage

