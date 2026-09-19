// File: src/js/utils/phone.js

export const normalizePhone = (phone) => {
    if (!phone || typeof phone !== 'string') return '';
    const trimmed = phone.trim();
    let cleaned = trimmed.replace(/[^0-9+]/g, '');

    if (!cleaned) return '';

    // Kasus nomor dengan awalan '+' (internasional)
    if (cleaned.startsWith('+')) {
        const withoutPlus = cleaned.slice(1);
        // Perbaiki typo Indonesia +6208... -> 628...
        if (withoutPlus.startsWith('6208')) {
            const fixed = '628' + withoutPlus.slice(4);
            return (fixed.length >= 8 && fixed.length <= 16) ? fixed : '';
        }
        // Nomor internasional non-Indonesia (+65, +1, +60, dll) — kode negara dipertahankan
        const digits = withoutPlus.replace(/[^0-9]/g, '');
        return (digits.length >= 7 && digits.length <= 16) ? digits : '';
    }

    // Kasus nomor Indonesia lokal (tanpa awalan +)
    if (cleaned.startsWith('6208')) {
        cleaned = '628' + cleaned.slice(4);
    } else if (cleaned.startsWith('08')) {
        cleaned = '62' + cleaned.slice(1);
    } else if (cleaned.startsWith('8') && cleaned.length >= 9 && cleaned.length <= 13) {
        cleaned = '62' + cleaned;
    }

    const digitsOnly = cleaned.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 8 || digitsOnly.length > 16) {
        return '';
    }
    return digitsOnly;
};

export const formatDisplayPhone = (phoneRaw, phoneNormalized) => {
    if (!phoneRaw && !phoneNormalized) return 'Belum diisi';
    return phoneRaw || (phoneNormalized ? `+${phoneNormalized}` : 'Belum diisi');
};

export const buildWaLink = (phoneNormalized, clientName = '') => {
    if (!phoneNormalized) return null;
    const encoded = clientName ? encodeURIComponent(clientName) : '';
    const text = encoded
        ? `Halo%20${encoded},%20kami%20dari%20Nacira%20Studio%20ingin%20mengonfirmasi%20terkait%20rencana%20interior%20Anda...`
        : '';
    return text
        ? `https://wa.me/${phoneNormalized}?text=${text}`
        : `https://wa.me/${phoneNormalized}`;
};
