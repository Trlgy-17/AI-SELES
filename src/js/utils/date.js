// File: src/js/utils/date.js

export const getAsiaJakartaDate = (dateObj = new Date()) => {
    try {
        const formatter = new Intl.DateTimeFormat('en-CA', { 
            timeZone: 'Asia/Jakarta', 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        });
        return formatter.format(dateObj); // Returns "YYYY-MM-DD"
    } catch (e) {
        return dateObj.toISOString().slice(0, 10);
    }
};

export const getAsiaJakartaIso = () => {
    return new Date().toISOString();
};

export const addDaysToDate = (dateStr, days) => {
    try {
        // Parse YYYY-MM-DD as Asia/Jakarta midnight to prevent UTC drift
        const d = new Date(dateStr + 'T00:00:00+07:00');
        d.setDate(d.getDate() + days);
        return getAsiaJakartaDate(d);
    } catch (e) {
        return dateStr;
    }
};
