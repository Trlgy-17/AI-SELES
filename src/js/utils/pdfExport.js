// File: src/js/utils/pdfExport.js
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Menentukan teks garansi dinamis berdasarkan spesifikasi:
 * - Jika project di atas 200 juta: 1 tahun
 * - Jika material blockboard: 3 bulan
 * - Jika material multipleks & pvc (atau lainnya): 6 bulan
 * Menghasilkan hanya satu klausul spesifik yang relevan (tidak semua dikeluarkan sekaligus).
 */
export const getApplicableWarrantyText = (estimate) => {
    const total = Number(estimate?.grandTotal || 0);
    const material = String(estimate?.material || '').toUpperCase();

    // Prioritas 1: Nilai project di atas Rp 200 Juta
    if (total > 200000000) {
        return 'Garansi Pemeliharaan unit resmi diberikan selama 1 (satu) tahun penuh pasca serah terima pekerjaan (Project Eksklusif di atas Rp 200 Juta).';
    }

    // Prioritas 2: Material Blockboard
    if (material.includes('BLOCKBOARD')) {
        return 'Garansi Pemeliharaan unit resmi diberikan selama 3 (tiga) bulan pasca serah terima pekerjaan (Spesifikasi Material Blockboard).';
    }

    // Prioritas 3: Multipleks, PVC, Duco, dll.
    return 'Garansi Pemeliharaan unit resmi diberikan selama 6 (enam) bulan penuh pasca serah terima pekerjaan (Spesifikasi Material Multipleks & PVC).';
};

/**
 * Ekspor Estimasi RAB ke File PDF Modern & Elegan
 * Disesuaikan otomatis dengan identitas brand aktif
 */
export const exportEstimateToPDF = (estimate, activeBrand = {}) => {
    if (!estimate) return false;

    try {
        const brandName = (activeBrand?.brandName || 'PUTRA INTERIOR').toUpperCase();
        const serviceArea = activeBrand?.serviceArea || estimate.regionLabel || 'Bandung & Jabodetabek';
        const cleanBrandCode = brandName.replace(/[^A-Z0-9]/g, '').slice(0, 8);
        const today = new Date();
        const dateStr = today.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const docNo = `RAB/${cleanBrandCode}/${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}/${randomCode}`;

        // Inisialisasi Dokumen A4 Portrait
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // 1. Gold Accent Header Top Bar
        doc.setFillColor(197, 160, 89); // Luxury Gold (#c5a059)
        doc.rect(0, 0, pageWidth, 5, 'F');

        // Dark Luxury Top Header
        doc.setFillColor(24, 24, 30); // Deep Dark Slate (#18181e)
        doc.rect(0, 5, pageWidth, 28, 'F');

        // Brand Name in Header
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(brandName, 14, 18);

        // Tagline / Subtitle
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(197, 160, 89); // Gold
        doc.text('ARCHITECTURAL INTERIOR & CUSTOM FURNITURE WORKSHOP', 14, 24);

        // Right side: Document Title Badge
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text('ESTIMASI ANGGARAN BIAYA (RAB)', pageWidth - 14, 18, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200);
        doc.text(`No: ${docNo}`, pageWidth - 14, 24, { align: 'right' });

        // Thin Gold Divider
        doc.setFillColor(197, 160, 89);
        doc.rect(0, 33, pageWidth, 1, 'F');

        // 2. Info Penawaran Box (Meta Box)
        let currentY = 40;
        doc.setFillColor(248, 249, 250);
        doc.setDrawColor(225, 228, 232);
        doc.roundedRect(14, currentY, pageWidth - 28, 26, 2, 2, 'FD');

        doc.setFontSize(8.5);
        doc.setTextColor(50, 50, 50);

        // Kolom Kiri
        doc.setFont('helvetica', 'bold');
        doc.text('Tanggal Penawaran', 18, currentY + 7);
        doc.setFont('helvetica', 'normal');
        doc.text(`: ${dateStr}`, 52, currentY + 7);

        doc.setFont('helvetica', 'bold');
        doc.text('Wilayah Proyek', 18, currentY + 14);
        doc.setFont('helvetica', 'normal');
        doc.text(`: ${estimate.regionLabel}`, 52, currentY + 14);

        doc.setFont('helvetica', 'bold');
        doc.text('Kategori Item', 18, currentY + 21);
        doc.setFont('helvetica', 'normal');
        doc.text(`: ${estimate.category.replace(/_/g, ' ')}`, 52, currentY + 21);

        // Kolom Kanan
        const midColX = 115;
        doc.setFont('helvetica', 'bold');
        doc.text('Layanan Desain', midColX, currentY + 7);
        doc.setFont('helvetica', 'normal');
        doc.text(': Free Survei & 3D', midColX + 32, currentY + 7);

        doc.setFont('helvetica', 'bold');
        doc.text('Bahan & Model', midColX, currentY + 14);
        doc.setFont('helvetica', 'normal');
        doc.text(`: ${estimate.material} (${estimate.style})`, midColX + 32, currentY + 14);

        // Format Dimensi
        let dimText = `P: ${estimate.dimensions.p}m`;
        if (estimate.dimensions.t > 0) dimText += ` x T: ${estimate.dimensions.t}m`;
        if (estimate.dimensions.l > 0) dimText += ` x L: ${estimate.dimensions.l}m`;
        if (estimate.category === 'KITCHEN_SET' && (estimate.dimensions.cabinetBawah !== undefined || estimate.dimensions.cabinetAtas !== undefined)) {
            dimText = `Bawah: ${estimate.dimensions.cabinetBawah || 0}m' | Atas: ${estimate.dimensions.cabinetAtas || 0}m'`;
        }

        doc.setFont('helvetica', 'bold');
        doc.text('Ukuran / Dimensi', midColX, currentY + 21);
        doc.setFont('helvetica', 'normal');
        doc.text(`: ${dimText}`, midColX + 32, currentY + 21);

        currentY += 32;

        // 3. Itemized Table of Costs
        const tableBody = estimate.itemBreakdown.map((item, idx) => [
            idx + 1,
            item.label,
            item.detail || '-',
            `Rp ${item.amount.toLocaleString('id-ID')}`
        ]);

        autoTable(doc, {
            startY: currentY,
            margin: { left: 14, right: 14 },
            head: [['No', 'Uraian Pekerjaan & Spesifikasi', 'Perhitungan Ukuran / Ket.', 'Subtotal (Rp)']],
            body: tableBody,
            theme: 'grid',
            headStyles: {
                fillColor: [24, 24, 30],
                textColor: [197, 160, 89],
                fontStyle: 'bold',
                fontSize: 8.5,
                halign: 'left',
                cellPadding: 3
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10, fontSize: 8 },
                1: { fontStyle: 'bold', fontSize: 8.5, textColor: [30, 30, 30] },
                2: { fontSize: 8, textColor: [90, 90, 90] },
                3: { halign: 'right', fontStyle: 'bold', fontSize: 8.5, textColor: [20, 20, 20] }
            },
            styles: {
                lineColor: [225, 228, 232],
                lineWidth: 0.2,
                cellPadding: 3,
                font: 'helvetica'
            },
            alternateRowStyles: {
                fillColor: [250, 250, 252]
            }
        });

        // 4. Subtotal & Grand Total Box
        const finalY = doc.lastAutoTable.finalY + 4;
        const totalBoxWidth = 85;
        const totalBoxX = pageWidth - 14 - totalBoxWidth;

        // Subtotal row
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text('Subtotal Produksi:', totalBoxX, finalY + 4);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(`Rp ${estimate.subtotal.toLocaleString('id-ID')}`, pageWidth - 14, finalY + 4, { align: 'right' });

        // Ongkir row
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text('Ongkos Kirim & Instalasi:', totalBoxX, finalY + 10);
        doc.setFont('helvetica', 'bold');
        if (estimate.isFreeOngkir) {
            doc.setTextColor(16, 149, 93); // Emerald Green
            doc.text('100% GRATIS', pageWidth - 14, finalY + 10, { align: 'right' });
        } else {
            doc.setTextColor(30, 30, 30);
            doc.text(`Rp ${estimate.ongkirCost.toLocaleString('id-ID')}`, pageWidth - 14, finalY + 10, { align: 'right' });
        }

        // Grand Total Badge Box
        doc.setFillColor(24, 24, 30);
        doc.roundedRect(totalBoxX - 2, finalY + 14, totalBoxWidth + 2, 12, 1.5, 1.5, 'F');

        doc.setFillColor(197, 160, 89);
        doc.rect(totalBoxX - 2, finalY + 14, 2, 12, 'F'); // Left gold accent strip

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(197, 160, 89);
        doc.text('TOTAL ESTIMASI RAB:', totalBoxX + 3, finalY + 21.5);

        doc.setFontSize(10.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`Rp ${estimate.grandTotal.toLocaleString('id-ID')}`, pageWidth - 17, finalY + 21.5, { align: 'right' });

        // 5. Syarat, Ketentuan & SOP Workshop
        const termsY = finalY + 32;
        doc.setFillColor(252, 252, 254);
        doc.setDrawColor(225, 228, 232);
        doc.roundedRect(14, termsY, pageWidth - 28, 34, 2, 2, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(197, 160, 89);
        doc.text('KETENTUAN LAYANAN & KEBIJAKAN WORKSHOP:', 18, termsY + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(70, 70, 70);

        const warrantyClause = getApplicableWarrantyText(estimate);

        const termsList = [
            '1. Angka penawaran di atas adalah estimasi simulasi transparan; nilai akhir disesuaikan dengan hasil pengukuran fisik di lokasi.',
            `2. ${warrantyClause}`,
            '3. Skema Termin Pembayaran: DP 50% saat fabrikasi workshop, 40% progres sebelum pengiriman, 10% pelunasan setelah instalasi selesai.',
            '4. Bebas ongkir berlaku otomatis untuk pemenuhan batas minimum nilai proyek per wilayah.'
        ];

        termsList.forEach((term, tIdx) => {
            doc.text(term, 18, termsY + 12 + (tIdx * 5));
        });

        // 6. Sign-off / Signature section
        const signY = termsY + 40;
        if (signY + 16 < pageHeight) {
            doc.setFontSize(8);
            doc.setTextColor(90, 90, 90);
            doc.text('Disiapkan secara resmi oleh:', 14, signY);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 30, 30);
            doc.text(`${brandName}`, 14, signY + 5);
        }

        // 7. Footer Bottom Stripe
        doc.setFillColor(197, 160, 89);
        doc.rect(0, pageHeight - 4, pageWidth, 4, 'F');

        // Simpan File PDF
        const fileName = `Estimasi_RAB_${cleanBrandCode}_${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}.pdf`;
        if (typeof window !== 'undefined') {
            doc.save(fileName);
        } else if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'test') {
            doc.save(fileName);
        }
        return { success: true, fileName, doc };
    } catch (err) {
        console.error("[pdfExport] Gagal mengekspor PDF:", err);
        return { success: false, error: err };
    }
};
