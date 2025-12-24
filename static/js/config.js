// Backend API Configuration
// TAILSCALE SERVE setup su custom path:
// - PC (lokaliai): localhost:5123
// - Telefonas/GitHub Pages: Tailscale Serve su HTTPS + custom path!

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5123'                                              // PC lokaliai (Docker)
    : 'https://desktop-cnopv70.taild60bf0.ts.net/knygu-biblioteka';       // Tailscale Serve (HTTPS!)

// PRIVALUMAI:
// ✅ HTTPS automatiškai (Tailscale Serve)
// ✅ Custom path "/knygu-biblioteka" - aiškus projekto pavadinimas
// ✅ Galima turėti kelis projektus skirtingais path'ais:
//    /knygu-biblioteka - ši programa
//    /nuotraukos       - kitas projektas
//    /uzrasai          - dar vienas projektas
// ✅ Saugus - veikia tik per Tailscale VPN
