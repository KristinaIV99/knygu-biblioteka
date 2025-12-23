// PWA Installation and Update handling

let deferredPrompt;
let newWorker;

// Check if already installed
function isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
}

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    newWorker = registration.installing;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available, show update prompt
                            showUpdatePrompt();
                        }
                    });
                });
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });

        // Check for updates periodically
        setInterval(() => {
            navigator.serviceWorker.getRegistration().then(reg => {
                if (reg) reg.update();
            });
        }, 60000); // Check every minute
    });
}

// Install Prompt
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default browser install prompt
    e.preventDefault();
    deferredPrompt = e;

    // Don't show if already installed
    if (!isAppInstalled()) {
        showInstallPrompt();
    }
});

function showInstallPrompt() {
    const installPrompt = document.getElementById('pwaInstallPrompt');
    const installBtn = document.getElementById('pwaInstallBtn');
    const dismissBtn = document.getElementById('pwaDismissBtn');

    installPrompt.classList.add('show');

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('User accepted install prompt');
            }

            deferredPrompt = null;
            installPrompt.classList.remove('show');
        }
    });

    dismissBtn.addEventListener('click', () => {
        installPrompt.classList.remove('show');
    });
}

// Update Prompt
function showUpdatePrompt() {
    const updatePrompt = document.getElementById('pwaUpdatePrompt');
    const updateBtn = document.getElementById('pwaUpdateBtn');
    const dismissBtn = document.getElementById('pwaUpdateDismissBtn');

    updatePrompt.classList.add('show');

    updateBtn.addEventListener('click', () => {
        if (newWorker) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
        }
        updatePrompt.classList.remove('show');
        window.location.reload();
    });

    dismissBtn.addEventListener('click', () => {
        updatePrompt.classList.remove('show');
    });
}

// Listen for controller change (new service worker activated)
navigator.serviceWorker?.addEventListener('controllerchange', () => {
    console.log('New service worker activated');
});

// Handle app installed event
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    const installPrompt = document.getElementById('pwaInstallPrompt');
    installPrompt.classList.remove('show');
});
