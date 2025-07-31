import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ConfirmationPage() {
  const [selectedBid, setSelectedBid] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const bid = sessionStorage.getItem('selectedBid')
    if (bid) {
      setSelectedBid(JSON.parse(bid))
    } else {
      navigate('/bidding')
    }
  }, [navigate])

  const handleFinish = () => {
    sessionStorage.clear()
    navigate('/')
  }

  const goBack = () => {
    navigate('/bidding')
  }

  return (
    <div className="app">
      <div className="container">
        <nav className="menubar">
          <div className="logo">🚗 Cab Bidding System</div>
          <ul className="menu">
            <li><a href="#">🏠 Home</a></li>
            <li><a href="#">👤 Profile</a></li>
            <li><a href="#">📍 My Rides</a></li>
            <li><a href="#">⚙️ Settings</a></li>
          </ul>
        </nav>

        <div className="confirmation-page">
          {selectedBid ? (
            <div className="confirmation-container">
              <div className="success-animation">
                <div className="checkmark">✓</div>
              </div>
              
              <div className="confirmation-header">
                <h1>🎉 Ride Confirmed!</h1>
                <p className="subtitle">Your cab is on the way</p>
              </div>

              <div className="confirmation-details">
                <div className="driver-card">
                  <div className="driver-avatar">
                    {selectedBid.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="driver-info">
                    <h3>{selectedBid.name}</h3>
                    <div className="rating">
                      <span className="stars">{'⭐'.repeat(Math.floor(selectedBid.rating))}</span>
                      <span className="rating-text">{selectedBid.rating}/5</span>
                    </div>
                    <p className="phone">📱 {selectedBid.phoneNumber}</p>
                  </div>
                  <div className="price-tag">
                    <span className="currency">₹</span>
                    <span className="amount">{selectedBid.bidAmount}</span>
                  </div>
                </div>

                <div className="trip-summary">
                  <h3>Trip Details</h3>
                  <div className="trip-route">
                    <div className="route-item">
                      <div className="route-icon pickup">📍</div>
                      <div className="route-details">
                        <span className="route-label">Pickup</span>
                        <span className="route-location">{sessionStorage.getItem('pickup')}</span>
                      </div>
                    </div>
                    <div className="route-divider"></div>
                    <div className="route-item">
                      <div className="route-icon drop">🎯</div>
                      <div className="route-details">
                        <span className="route-label">Drop</span>
                        <span className="route-location">{sessionStorage.getItem('drop')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="action-buttons">
                  <button onClick={goBack} className="btn-secondary">
                    Back to Bids
                  </button>
                  <button onClick={handleFinish} className="btn-primary finish-btn">
                    Finish Ride
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <h3>Loading confirmation...</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfirmationPage

