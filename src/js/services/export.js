// File: src/js/services/export.js
import { formatDisplayPhone } from '../utils/phone.js';

export const ExportService = {
    exportToCsv: (crmLeads, filename = 'Nacira_CRM_Export_2026.csv') => {
        if (!crmLeads || crmLeads.length === 0) {
            return { success: false, reason: 'empty_data' };
        }

        const sanitizeCell = (val) => {
            if (val === null || val === undefined) return '""';
            let str = String(val);
            // Mitigasi Formula Injection (CSV Injection)
            if (/^[=+\-@\t\r]/.test(str)) {
                str = "'" + str;
            }
            return `"${str.replace(/"/g, '""')}"`;
        };

        const headers = ["ID", "Nama Klien", "Nomor WhatsApp (Raw)", "Nomor WhatsApp (E.164)", "Proyek Interior", "Estimasi Nilai (Rp)", "Status Prospek", "Tgl Dibuat", "Tgl Diperbarui"];
        
        const rows = crmLeads.map(l => [
            sanitizeCell(l.id),
            sanitizeCell(l.name),
            sanitizeCell(l.phoneRaw || formatDisplayPhone(l.phoneRaw, l.phoneNormalized)),
            sanitizeCell(l.phoneNormalized ? `+${l.phoneNormalized}` : ''),
            sanitizeCell(l.project),
            sanitizeCell(l.value !== null && l.value !== undefined ? l.value : ''),
            sanitizeCell(l.status),
            sanitizeCell(l.createdAt || ''),
            sanitizeCell(l.updatedAt || '')
        ].join(','));

        const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return { success: true };
    }
};
