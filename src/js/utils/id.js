// File: src/js/utils/id.js

let _idCounter = 0;

export const generateId = (prefix = 'id') => {
    _idCounter++;
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return `${prefix}_${crypto.randomUUID()}`;
    }
    const rand = Math.random().toString(36).substring(2, 10);
    const ts = Date.now().toString(36);
    return `${prefix}_${ts}_${rand}_${_idCounter}`;
};
