import { storage } from '../storage.js';
import { router } from '../router.js';
import { createElement, truncateText, sortByDate, formatDate, generateId } from '../utils.js';
import { showDeleteModal } from './modal.js';

export class LandingPage {
    constructor(container) {
        this.container = container;
        this.worries = [];
    }

    render() {
        this.loadWorries();
        this.container.innerHTML = '';
        
        const header = createElement('header', { className: 'landing-header' }, [
            createElement('h1', { className: 'app-title' }, ['Kirsty\'s Worry Journal'])
        ]);
        
        const newWorryButton = createElement('button', {
            className: 'btn btn-primary btn-large',
            onClick: () => this.createNewWorry()
        }, ['I have a new worry']);
        
        const worriesSection = createElement('section', { className: 'worries-section' }, [
            createElement('h2', {}, ['My Worries']),
            this.renderWorryList()
        ]);
        
        this.container.appendChild(header);
        this.container.appendChild(newWorryButton);
        this.container.appendChild(worriesSection);
    }

    loadWorries() {
        // Filter out any empty worries and sort by date
        const allWorries = storage.loadAll();
        const nonEmptyWorries = allWorries.filter(w => {
            const hasTitle = w.title && w.title.trim();
            const hasReasonsFor = w.reasonsFor && w.reasonsFor.some(r => r && r.trim());
            const hasReasonsAgainst = w.reasonsAgainst && w.reasonsAgainst.some(r => r && r.trim());
            return hasTitle || hasReasonsFor || hasReasonsAgainst;
        });
        this.worries = sortByDate(nonEmptyWorries);
    }

    renderWorryList() {
        if (this.worries.length === 0) {
            return createElement('p', { className: 'empty-state' }, 
                ['You don\'t have any worries saved yet.']);
        }
        
        const list = createElement('ul', { className: 'worry-list' });
        
        this.worries.forEach(worry => {
            const item = this.renderWorryItem(worry);
            list.appendChild(item);
        });
        
        return list;
    }

    renderWorryItem(worry) {
        const title = createElement('h3', { className: 'worry-title' }, 
            [truncateText(worry.title || 'Untitled worry', 100)]);
        
        const date = createElement('span', { className: 'worry-date' }, 
            [formatDate(worry.updatedAt)]);
        
        const goButton = createElement('button', {
            className: 'btn btn-secondary',
            onClick: () => router.navigate(`/worry/${worry.id}`)
        }, ['Go to this worry']);
        
        const deleteButton = createElement('button', {
            className: 'btn btn-tertiary',
            onClick: () => this.handleDelete(worry)
        }, ['Say goodbye to this worry']);
        
        const actions = createElement('div', { className: 'worry-actions' }, 
            [goButton, deleteButton]);
        
        return createElement('li', { className: 'worry-item' }, 
            [title, date, actions]);
    }

    createNewWorry() {
        const newWorry = {
            id: generateId(),
            title: '',
            reasonsFor: [''],
            reasonsAgainst: [''],
            feeling: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        storage.upsert(newWorry);
        router.navigate(`/worry/${newWorry.id}`);
    }

    handleDelete(worry) {
        showDeleteModal(worry, () => {
            storage.remove(worry.id);
            this.render();
        });
    }
}