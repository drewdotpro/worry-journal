import { router } from './router.js';
import { storage } from './storage.js';
import { LandingPage } from './components/landing.js';
import { FormPage } from './components/form.js';

class App {
    constructor() {
        this.container = document.getElementById('app');
        this.landingPage = new LandingPage(this.container);
        this.formPage = new FormPage(this.container);
        
        // Clean up old empty worries on startup
        storage.cleanupEmptyWorries();
        
        this.setupRoutes();
        this.setupStorageWarning();
    }

    setupRoutes() {
        router
            .on('/', () => {
                // Clean up form listeners when navigating to landing
                this.formPage.cleanupListeners();
                this.landingPage.render();
            })
            .on('/worry/:id', (params) => {
                // Clean up landing listeners when navigating to form
                this.landingPage.cleanupListeners();
                this.formPage.render(params.id, { initialLoad: true });
            });
    }

    setupStorageWarning() {
        if (!storage.isAvailable) {
            this.showStorageWarning();
        }
        
        window.addEventListener('storage-corrupted', (e) => {
            this.showToast(e.detail.message);
        });
    }

    showStorageWarning() {
        const banner = document.createElement('div');
        banner.className = 'storage-warning';
        banner.textContent = 'Saving is disabled in this browser context.';
        document.body.insertBefore(banner, document.body.firstChild);
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('toast-show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});