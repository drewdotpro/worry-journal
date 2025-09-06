import { storage } from '../storage.js';
import { router } from '../router.js';
import { createElement, debounce } from '../utils.js';

export class FormPage {
    constructor(container) {
        this.container = container;
        this.worry = null;
        this.autosave = debounce(() => this.save(), 400);
    }

    render(worryId, options = {}) {
        const worries = storage.loadAll();
        this.worry = worries.find(w => w.id === worryId);
        
        if (!this.worry) {
            router.navigate('/');
            return;
        }
        
        this.container.innerHTML = '';
        
        const form = createElement('form', { 
            className: 'worry-form',
            onSubmit: (e) => e.preventDefault()
        });
        
        form.appendChild(this.renderBackButton());
        form.appendChild(this.renderTitleField());
        form.appendChild(this.renderReasonsFor());
        form.appendChild(this.renderReasonsAgainst());
        form.appendChild(this.renderSummary());
        form.appendChild(this.renderFeelingField());
        form.appendChild(this.renderHelperText());
        form.appendChild(this.renderDoneButton());
        
        this.container.appendChild(form);
        
        // Only focus title on initial load, not on re-renders
        if (options.initialLoad) {
            const titleInput = form.querySelector('#worry-title');
            if (titleInput) {
                titleInput.focus();
            }
        }
    }

    renderBackButton() {
        return createElement('button', {
            type: 'button',
            className: 'btn btn-back',
            onClick: () => this.handleBack()
        }, ['Back']);
    }

    renderTitleField() {
        const container = createElement('div', { className: 'form-group' });
        
        const label = createElement('label', { 
            htmlFor: 'worry-title',
            className: 'form-label'
        }, ['What are you worried about?']);
        
        const input = createElement('input', {
            type: 'text',
            id: 'worry-title',
            className: 'form-input',
            value: this.worry.title || '',
            onInput: (e) => this.handleTitleChange(e.target.value)
        });
        
        container.appendChild(label);
        container.appendChild(input);
        return container;
    }

    renderReasonsFor() {
        const container = createElement('div', { className: 'form-group' });
        
        const label = createElement('label', { className: 'form-label' }, 
            ['What are the things that make you think this worry is real?']);
        
        container.appendChild(label);
        
        const list = createElement('div', { className: 'reason-list' });
        
        this.worry.reasonsFor.forEach((reason, index) => {
            list.appendChild(this.renderReasonItem(reason, index, 'reasonsFor'));
        });
        
        const addButton = createElement('button', {
            type: 'button',
            className: 'btn btn-add',
            onClick: () => this.addReason('reasonsFor')
        }, ['Add something']);
        
        container.appendChild(list);
        container.appendChild(addButton);
        return container;
    }

    renderReasonsAgainst() {
        const container = createElement('div', { className: 'form-group' });
        
        const label = createElement('label', { className: 'form-label' }, 
            ['What evidence is there that makes you think this worry is NOT real?']);
        
        container.appendChild(label);
        
        const list = createElement('div', { className: 'reason-list' });
        
        this.worry.reasonsAgainst.forEach((reason, index) => {
            list.appendChild(this.renderReasonItem(reason, index, 'reasonsAgainst'));
        });
        
        const addButton = createElement('button', {
            type: 'button',
            className: 'btn btn-add',
            onClick: () => this.addReason('reasonsAgainst')
        }, ['Add something']);
        
        container.appendChild(list);
        container.appendChild(addButton);
        return container;
    }

    renderReasonItem(reason, index, field) {
        const container = createElement('div', { className: 'reason-item' });
        
        const input = createElement('input', {
            type: 'text',
            className: 'form-input reason-input',
            value: reason,
            placeholder: 'Enter a reason...',
            onInput: (e) => this.handleReasonChange(field, index, e.target.value)
        });
        
        const removeButton = createElement('button', {
            type: 'button',
            className: 'btn btn-remove',
            onClick: () => this.removeReason(field, index),
            'aria-label': 'Remove this reason'
        }, ['Remove this']);
        
        container.appendChild(input);
        
        if (this.worry[field].length > 1) {
            container.appendChild(removeButton);
        }
        
        return container;
    }

    renderSummary() {
        const container = createElement('div', { className: 'form-group summary-section' });
        
        const label = createElement('h3', { className: 'summary-title' }, ['Summary']);
        container.appendChild(label);
        
        if (this.worry.title) {
            const title = createElement('p', { className: 'summary-worry-title' }, 
                [this.worry.title]);
            container.appendChild(title);
        }
        
        const reasonsFor = this.worry.reasonsFor.filter(r => r.trim());
        if (reasonsFor.length > 0) {
            const forLabel = createElement('h4', {}, ['Reasons it might be real:']);
            const forList = createElement('ul', { className: 'summary-list' });
            reasonsFor.forEach(reason => {
                forList.appendChild(createElement('li', {}, [reason]));
            });
            container.appendChild(forLabel);
            container.appendChild(forList);
        }
        
        const reasonsAgainst = this.worry.reasonsAgainst.filter(r => r.trim());
        if (reasonsAgainst.length > 0) {
            const againstLabel = createElement('h4', {}, ['Evidence it\'s not real:']);
            const againstList = createElement('ul', { className: 'summary-list' });
            reasonsAgainst.forEach(reason => {
                againstList.appendChild(createElement('li', {}, [reason]));
            });
            container.appendChild(againstLabel);
            container.appendChild(againstList);
        }
        
        return container;
    }

    renderFeelingField() {
        const container = createElement('div', { className: 'form-group' });
        
        const fieldset = createElement('fieldset', { className: 'feeling-fieldset' });
        const legend = createElement('legend', { className: 'form-label' }, 
            ['Looking at the evidence with your adult brain, which do you think is true?']);
        
        fieldset.appendChild(legend);
        
        const options = [
            { value: 'still', label: 'I think the worry is real' },
            { value: 'less', label: 'I think the worry is not real' }
        ];
        
        options.forEach(option => {
            const label = createElement('label', { className: 'radio-label' });
            
            const input = createElement('input', {
                type: 'radio',
                name: 'feeling',
                value: option.value,
                checked: this.worry.feeling === option.value,
                onChange: (e) => this.handleFeelingChange(e.target.value)
            });
            
            label.appendChild(input);
            label.appendChild(document.createTextNode(' ' + option.label));
            fieldset.appendChild(label);
        });
        
        container.appendChild(fieldset);
        return container;
    }

    renderHelperText() {
        const container = createElement('div', { className: 'helper-text' });
        
        if (this.worry.feeling === 'still') {
            container.appendChild(createElement('p', { className: 'helper-message' }, 
                ['That\'s hard for you. Maybe you can add more reasons the worry isn\'t real and read through them to think about it more. If you\'ve done this a few times and you can\'t think of any more evidence and you\'re still worried, then you could contact Addy or Drew.']));
        } else if (this.worry.feeling === 'less') {
            container.appendChild(createElement('p', { className: 'helper-message helper-success' }, 
                ['Well done! You have thought about it and made the worry smaller. Have another read of what you put, and you can add more things if you want to. Remember, you can always come back to look at this when you\'re worried about this again.']));
        }
        
        return container;
    }

    renderDoneButton() {
        return createElement('button', {
            type: 'button',
            className: 'btn btn-primary btn-done',
            onClick: () => this.handleDone()
        }, ['I\'m done']);
    }

    handleTitleChange(value) {
        this.worry.title = value;
        this.worry.feeling = null;
        this.autosave();
        this.updateSummary();
        this.updateHelperText();
    }

    handleReasonChange(field, index, value) {
        this.worry[field][index] = value;
        this.worry.feeling = null;
        this.autosave();
        this.updateSummary();
        this.updateHelperText();
    }

    addReason(field) {
        this.worry[field].push('');
        this.save();
        this.render(this.worry.id, { skipFocus: true });
    }

    removeReason(field, index) {
        if (this.worry[field].length > 1) {
            this.worry[field].splice(index, 1);
            this.save();
            this.render(this.worry.id, { skipFocus: true });
        }
    }

    handleFeelingChange(value) {
        this.worry.feeling = value;
        this.autosave();
        this.updateHelperText();
    }

    updateSummary() {
        const summarySection = this.container.querySelector('.summary-section');
        if (summarySection) {
            const newSummary = this.renderSummary();
            summarySection.replaceWith(newSummary);
        }
    }

    updateHelperText() {
        const helperSection = this.container.querySelector('.helper-text');
        if (helperSection) {
            const newHelper = this.renderHelperText();
            helperSection.replaceWith(newHelper);
        }
        
        const feelingInputs = this.container.querySelectorAll('input[name="feeling"]');
        feelingInputs.forEach(input => {
            input.checked = input.value === this.worry.feeling;
        });
    }

    save() {
        storage.upsert(this.worry);
    }

    handleBack() {
        this.save();
        router.navigate('/');
    }

    handleDone() {
        this.save();
        router.navigate('/');
    }
}