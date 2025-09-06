import { createElement, focusTrap } from '../utils.js';

export function showDeleteModal(worry, onConfirm) {
    const modalRoot = document.getElementById('modal-root');
    
    const backdrop = createElement('div', {
        className: 'modal-backdrop',
        onClick: () => closeModal()
    });
    
    const modal = createElement('div', {
        className: 'modal',
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': 'modal-title',
        onClick: (e) => e.stopPropagation()
    });
    
    const title = createElement('h2', {
        id: 'modal-title',
        className: 'modal-title'
    }, ['Say goodbye to this worry?']);
    
    const worryTitle = createElement('p', {
        className: 'modal-worry-title'
    }, [worry.title || 'Untitled worry']);
    
    const message = createElement('p', {
        className: 'modal-message'
    }, ['Please confirm this worry is gone and you want to remove it from your list.']);
    
    const actions = createElement('div', { className: 'modal-actions' });
    
    const cancelButton = createElement('button', {
        type: 'button',
        className: 'btn btn-secondary',
        onClick: () => closeModal()
    }, ['Cancel']);
    
    const removeButton = createElement('button', {
        type: 'button',
        className: 'btn btn-danger',
        onClick: () => {
            onConfirm();
            closeModal();
        }
    }, ['Remove']);
    
    actions.appendChild(cancelButton);
    actions.appendChild(removeButton);
    
    modal.appendChild(title);
    modal.appendChild(worryTitle);
    modal.appendChild(message);
    modal.appendChild(actions);
    
    backdrop.appendChild(modal);
    modalRoot.appendChild(backdrop);
    
    const removeTrap = focusTrap(modal);
    
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    function closeModal() {
        document.removeEventListener('keydown', handleEscape);
        removeTrap();
        modalRoot.innerHTML = '';
    }
    
    removeButton.focus();
}