class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.params = {};
        
        window.addEventListener('hashchange', () => this.handleRouteChange());
        window.addEventListener('load', () => this.handleRouteChange());
    }

    on(pattern, handler) {
        this.routes.set(pattern, handler);
        return this;
    }

    navigate(path) {
        window.location.hash = path;
    }

    handleRouteChange() {
        const hash = window.location.hash.slice(1) || '/';
        
        for (const [pattern, handler] of this.routes) {
            const match = this.matchRoute(pattern, hash);
            if (match) {
                this.currentRoute = pattern;
                this.params = match.params;
                handler(match.params);
                return;
            }
        }
        
        this.navigate('/');
    }

    matchRoute(pattern, path) {
        const patternParts = pattern.split('/').filter(Boolean);
        const pathParts = path.split('/').filter(Boolean);
        
        if (patternParts.length !== pathParts.length && !pattern.includes('*')) {
            return null;
        }
        
        const params = {};
        
        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const pathPart = pathParts[i];
            
            if (patternPart.startsWith(':')) {
                const paramName = patternPart.slice(1);
                params[paramName] = decodeURIComponent(pathPart);
            } else if (patternPart !== pathPart) {
                return null;
            }
        }
        
        return { params };
    }

    getParams() {
        return this.params;
    }

    getCurrentRoute() {
        return this.currentRoute;
    }

    back() {
        window.history.back();
    }
}

export const router = new Router();