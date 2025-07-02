import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ReverseGeocode = async (lat, lon) => {
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { format: 'jsonv2', lat, lon },
    });
    return res.data.display_name || `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  } catch {
    return `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  }
};

const AutoLocationMarker = ({ pickupSet, dropSet, setPickup, setDrop }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const address = await ReverseGeocode(lat, lng);
      if (!pickupSet) {
        setPickup({ coords: [lat, lng], address });
      } else if (!dropSet) {
        setDrop({ coords: [lat, lng], address });
      }
    },
  });
  return null;
};

// Calculate haversine distance in km
const calculateDistance = (coord1, coord2) => {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
};

function App() {
  const [pickup, setPickup] = useState({ coords: null, address: '' });
  const [drop, setDrop] = useState({ coords: null, address: '' });

  const [bids, setBids] = useState([]);
  const [selectedBid, setSelectedBid] = useState(null);
  const [biddingActive, setBiddingActive] = useState(false);
  const [selectionTime, setSelectionTime] = useState(false);
  const [timer, setTimer] = useState(60);
  const [selectionTimer, setSelectionTimer] = useState(15);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const [useSuggestedPrice, setUseSuggestedPrice] = useState(false);
  const lastBidRef = React.useRef(null);
  // Scroll to last bid when bids change
  useEffect(() => {
    if (lastBidRef.current) {
      lastBidRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [bids]);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    let bidTimer;
    if (biddingActive && timer > 0) {
      bidTimer = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0 && biddingActive) {
      setBiddingActive(false);
      setSelectionTime(true);
    }
    return () => clearInterval(bidTimer);
  }, [biddingActive, timer]);

  useEffect(() => {
    let selectTimer;
    if (selectionTime && selectionTimer > 0) {
      selectTimer = setInterval(() => setSelectionTimer((prev) => prev - 1), 1000);
    } else if (selectionTimer === 0 && selectionTime && !selectedBid) {
      autoSelectLowestBid();
    }
    return () => clearInterval(selectTimer);
  }, [selectionTime, selectionTimer, selectedBid]);

  const autoSelectLowestBid = () => {
    const lowest = bids.reduce((prev, curr) => (prev.amount < curr.amount ? prev : curr));
    setSelectedBid(lowest);
    setSelectionTime(false);
    alert(`Auto-selected driver: ${lowest.driverName} (₹${lowest.amount})`);
  };

  const handleSelect = (bid) => {
    setSelectedBid(bid);
    setSelectionTime(false);
  };

  useEffect(() => {
    if (!biddingActive || !pickup.coords || !drop.coords) return;
    const distance = calculateDistance(pickup.coords, drop.coords);
    const bidInterval = setInterval(() => {
      let fare;
      if (useSuggestedPrice && suggestedPrice && !isNaN(Number(suggestedPrice))) {
        // Drivers may bid around the suggested price, +/- up to 20%
        const min = Number(suggestedPrice) * 0.8;
        const max = Number(suggestedPrice) * 1.2;
        fare = (Math.random() * (max - min) + min).toFixed(0);
      } else {
        fare = (parseFloat(distance) * (10 + Math.random() * 5)).toFixed(0);
      }
      const newBid = {
        driverName: `Driver ${Math.floor(Math.random() * 1000)}`,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        amount: fare,
        rating: (Math.random() * 2 + 3).toFixed(1),
        distance: `${distance} km`,
        eta: `${Math.floor(Math.random() * 15) + 5} mins`,
      };
      setBids((prev) => [...prev, newBid]);
    }, 5000);
    return () => clearInterval(bidInterval);
  }, [biddingActive, pickup, drop, suggestedPrice, useSuggestedPrice]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const geocodeAddress = async (address, setLocation) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { q: address, format: 'json', limit: 1 },
      });
      if (res.data[0]) {
        const { lat, lon } = res.data[0];
        setLocation({ address, coords: [parseFloat(lat), parseFloat(lon)] });
      }
    } catch (err) {
      console.warn('Geocoding failed:', err);
    }
  };

  const startBidding = () => {
    if (!pickup.address || !drop.address) {
      alert('Please set both Pickup and Drop locations.');
      return;
    }
    setBids([]);
    setSelectedBid(null);
    setTimer(60);
    setSelectionTimer(15);
    setBiddingActive(true);
    setSelectionTime(false);
  };

  return (
    <div className="App">
      <button onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
      </button>
      <h2>Cab Bidding System</h2>

      <div>
        <label>Pickup Location:</label>
        <input
          value={pickup.address}
          onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
          onBlur={() => geocodeAddress(pickup.address, setPickup)}
          placeholder="Type or click on map"
        />
      </div>
      <div>
        <label>Drop Location:</label>
        <input
          value={drop.address}
          onChange={(e) => setDrop({ ...drop, address: e.target.value })}
          onBlur={() => geocodeAddress(drop.address, setDrop)}
          placeholder="Type or click on map"
        />
      </div>
      <div style={{ margin: '10px 0' }}>
        <label>
          <input
            type="checkbox"
            checked={useSuggestedPrice}
            onChange={e => setUseSuggestedPrice(e.target.checked)}
            style={{ marginRight: 6 }}
          />
          Suggest a Price
        </label>
        {useSuggestedPrice && (
          <input
            type="number"
            min="0"
            value={suggestedPrice}
            onChange={e => setSuggestedPrice(e.target.value)}
            placeholder="e.g. 250"
            style={{ width: 120, marginLeft: 10, marginRight: 10, padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
            inputMode="numeric"
            step="1"
            autoFocus
          />
        )}
      </div>

      <MapContainer center={[28.61, 77.23]} zoom={12} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {pickup.coords && <Marker position={pickup.coords} />}
        {drop.coords && <Marker position={drop.coords} />}
        {pickup.coords && drop.coords && (
          <Polyline positions={[pickup.coords, drop.coords]} color="blue" />
        )}
        <AutoLocationMarker
          pickupSet={!!pickup.coords}
          dropSet={!!drop.coords}
          setPickup={setPickup}
          setDrop={setDrop}
        />
      </MapContainer>

      <button onClick={startBidding}>Start Bidding</button>

      {pickup.address && drop.address && (
        <p><strong>Pickup:</strong> {pickup.address} | <strong>Drop:</strong> {drop.address}</p>
      )}

      {biddingActive && <p>⏳ Bidding Time Left: {timer}s</p>}
      {selectionTime && !selectedBid && (
        <p>🕒 Select a driver within {selectionTimer}s or auto-select will occur.</p>
      )}

      {selectedBid && (
        <div className="selected-bid">
          <h3>✅ Ride Confirmed!</h3>
          <img src={selectedBid.avatar} alt="Driver" style={{ width: '60px', borderRadius: '50%' }} />
          <p><strong>Driver:</strong> {selectedBid.driverName}</p>
          <p><strong>Fare:</strong> ₹{selectedBid.amount}</p>
          <p><strong>Distance:</strong> {selectedBid.distance}</p>
          <p><strong>ETA:</strong> {selectedBid.eta}</p>
          <p><strong>Rating:</strong> {selectedBid.rating} ⭐</p>
        </div>
      )}

      <ul style={{ maxHeight: 200, overflowY: 'auto' }}>
        {bids.map((bid, index) => (
          <li
            key={index}
            ref={index === bids.length - 1 ? lastBidRef : null}
          >
            <img src={bid.avatar} alt="Driver" style={{ width: 30, borderRadius: '50%', marginRight: 10 }} />
            {bid.driverName} - ₹{bid.amount} ⭐{bid.rating} | {bid.distance} | ETA: {bid.eta}
            {!selectedBid && (
              <button onClick={() => handleSelect(bid)}>Accept Bid</button>
            )}
            {selectedBid && selectedBid.driverName === bid.driverName && (
              <span style={{ color: 'green', fontWeight: 'bold' }}> ✅ Accepted</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
