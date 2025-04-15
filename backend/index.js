const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css"
/>


let drivers = [
  { id: 1, name: "Amit", rating: 4.5 },
  { id: 2, name: "Sara", rating: 4.8 },
  { id: 3, name: "Ravi", rating: 4.2 }
];

app.post('/bid', (req, res) => {
  const { pickup, drop } = req.body;
  const bids = drivers.map(driver => ({
    ...driver,
    bidAmount: Math.floor(Math.random() * 200) + 100
  }));

  res.json(bids);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
