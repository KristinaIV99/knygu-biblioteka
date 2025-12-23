// Backend API Configuration
// TAILSCALE setup:
// - PC (lokaliai): localhost:5123
// - Telefonas/GitHub Pages: Tailscale IP (100.100.151.123:5123)

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5123'              // PC lokaliai (Docker)
    : 'http://100.100.151.123:5123';       // Telefonas per Tailscale

// Kaip veikia:
// - Atidari index.html PC → jungiasi prie localhost:5123
// - Atidari GitHub Pages telefone → jungiasi prie 100.100.151.123:5123 (per Tailscale VPN)
