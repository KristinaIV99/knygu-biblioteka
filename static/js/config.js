// Backend API Configuration
// Change this to your backend URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5123'  // Local development
    : 'http://localhost:5123'; // Production - CHANGE THIS to your deployed backend URL

// Example for deployed backend:
// const API_BASE_URL = 'https://your-backend.railway.app';
// or
// const API_BASE_URL = 'http://your-server-ip:5123';
