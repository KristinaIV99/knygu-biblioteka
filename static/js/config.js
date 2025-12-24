// Backend API Configuration
// TAILSCALE setup su MagicDNS:
// - PC (lokaliai): localhost:5123
// - Telefonas/GitHub Pages: Tailscale hostname

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5123'                                    // PC lokaliai (Docker)
    : 'http://desktop-cnopv70.taild60bf0.ts.net:5123';          // Telefonas per Tailscale

// SAUGUMAS:
// - HTTP per Tailscale YRA SAUGUS (WireGuard šifravimas)
// - Hostname vietoj IP - gražiau ir privatiau
// - Veikia tik su Tailscale VPN - niekas kitas negali pasiekti
//
// Jei nori HTTPS: https://login.tailscale.com/admin/dns → Enable HTTPS Certificates
