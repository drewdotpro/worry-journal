const STORAGE_KEY = 'worryJournal.store';
const SCHEMA_VERSION = 1;

class StorageManager {
    constructor() {
        this.isAvailable = this.checkAvailability();
    }

    checkAvailability() {
        try {
            const testKey = '__localStorage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('localStorage is not available:', e);
            return false;
        }
    }

    loadAll() {
        if (!this.isAvailable) {
            return [];
        }

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                return [];
            }

            const data = JSON.parse(stored);
            
            if (data.schemaVersion !== SCHEMA_VERSION) {
                console.warn('Schema version mismatch, migrating data');
                return this.migrate(data);
            }

            return data.entries || [];
        } catch (error) {
            console.error('Failed to load worries:', error);
            this.handleCorruption();
            return [];
        }
    }

    saveAll(entries) {
        if (!this.isAvailable) {
            console.warn('Cannot save: localStorage is not available');
            return false;
        }

        try {
            const data = {
                schemaVersion: SCHEMA_VERSION,
                entries: entries
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save worries:', error);
            return false;
        }
    }

    upsert(worry) {
        const entries = this.loadAll();
        const existingIndex = entries.findIndex(w => w.id === worry.id);
        
        worry.updatedAt = new Date().toISOString();
        
        if (existingIndex >= 0) {
            entries[existingIndex] = worry;
        } else {
            worry.createdAt = worry.createdAt || worry.updatedAt;
            entries.push(worry);
        }
        
        return this.saveAll(entries);
    }
    
    hasContent(worry) {
        // Check if worry has meaningful content
        if (worry.title && worry.title.trim()) return true;
        
        if (worry.reasonsFor && worry.reasonsFor.some(r => r && r.trim())) return true;
        
        if (worry.reasonsAgainst && worry.reasonsAgainst.some(r => r && r.trim())) return true;
        
        return false;
    }

    remove(id) {
        const entries = this.loadAll();
        const filtered = entries.filter(w => w.id !== id);
        
        if (filtered.length === entries.length) {
            return false;
        }
        
        return this.saveAll(filtered);
    }

    migrate(data) {
        if (Array.isArray(data)) {
            return data;
        }
        return [];
    }

    handleCorruption() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            const event = new CustomEvent('storage-corrupted', {
                detail: { message: "We couldn't read your saved worries, so we started fresh." }
            });
            window.dispatchEvent(event);
        } catch (error) {
            console.error('Failed to handle corruption:', error);
        }
    }

    clearAll() {
        if (!this.isAvailable) return false;
        
        try {
            localStorage.removeItem(STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }
    
    cleanupEmptyWorries() {
        if (!this.isAvailable) return;
        
        try {
            const entries = this.loadAll();
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            const cleaned = entries.filter(worry => {
                // Keep if has content
                if (this.hasContent(worry)) return true;
                
                // Keep if created recently (less than 24 hours old)
                const createdAt = new Date(worry.createdAt);
                if (createdAt > oneDayAgo) return true;
                
                // Remove old empty worries
                console.log(`Cleaning up empty worry from ${worry.createdAt}`);
                return false;
            });
            
            if (cleaned.length < entries.length) {
                this.saveAll(cleaned);
                console.log(`Cleaned up ${entries.length - cleaned.length} empty worries`);
            }
        } catch (error) {
            console.error('Failed to cleanup empty worries:', error);
        }
    }
}

export const storage = new StorageManager();