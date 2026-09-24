// File: src/js/services/ai/ConversationAnalyzer.js

/**
 * 26 Standar Intent Penjualan Interior Custom
 */
export const SALES_INTENTS = [
    'ASK_PRICE_KITCHEN',
    'ASK_PRICE_WARDROBE',
    'ASK_PRICE_LIVING',
    'ASK_PRICE_GENERAL',
    'ASK_MATERIAL_MULTIPLEKS',
    'ASK_MATERIAL_PVC',
    'ASK_MATERIAL_FINISHING',
    'ASK_WORKSHOP_LOCATION',
    'ASK_SERVICE_AREA',
    'ASK_SURVEY_SCHEDULE',
    'ASK_DESIGN_3D',
    'ASK_PRODUCTION_LEADTIME',
    'ASK_INSTALLATION_PROCESS',
    'ASK_WARRANTY_TERMS',
    'ASK_PAYMENT_TERMS',
    'ASK_CIVIL_WORK',
    'PRICE_OBJECTION_EXPENSIVE',
    'PRICE_OBJECTION_COMPETITOR',
    'BUDGET_CONSTRAINED',
    'FOLLOW_UP_WARM',
    'FOLLOW_UP_COLD',
    'GHOSTING_REENGAGE',
    'CLOSING_READY_TO_DP',
    'CLOSING_SPK_REQUEST',
    'GREETING_NEW_LEAD',
    'UNKNOWN_INQUIRY'
];

/**
 * 15 Tahapan Siklus Penjualan Interior
 */
export const SALES_STAGES = [
    'AWARENESS',
    'INITIAL_CONTACT',
    'DISCOVERY',
    'SPECIFICATION_REVIEW',
    'ESTIMATION_REQUESTED',
    'SURVEY_OFFERED',
    'SURVEY_SCHEDULED',
    'SURVEY_COMPLETED',
    '3D_DESIGN_IN_PROGRESS',
    'QUOTATION_REVIEW',
    'OBJECTION_HANDLING',
    'NEGOTIATION',
    'COMMITTED_DP',
    'IN_PRODUCTION',
    'COMPLETED'
];

/**
 * 20 Rekomendasi Tindakan Terbaik (Next Best Action)
 */
export const NEXT_BEST_ACTIONS = [
    'OFFER_DIRECT_PRICE_RANGE',
    'INVITE_FREE_SURVEY_ALTERNATIVE_TIME',
    'SEND_MATERIAL_SPEC_EDUCATION',
    'OFFER_WORKSHOP_VISIT_SAMPLE_INSPECTION',
    'PROVIDE_3D_DESIGN_PORTFOLIO',
    'ASK_ROOM_DIMENSIONS_GENTLY',
    'CONFIRM_CITY_LOCATION_FOR_PRICELIST',
    'OFFER_BUDGET_OPTIMIZED_SPEC_DOWNGRADE',
    'EXPLAIN_SOLID_PLYWOOD_VS_CHEAP_MDF',
    'EXPLAIN_PVC_BOARD_FOR_WET_SINK_ZONE',
    'EXPLAIN_SAFE_MILESTONE_PAYMENT_TERMS',
    'CONFIRM_SURVEY_TEAM_TIME_SLOT',
    'REQUEST_COMPLETE_ADDRESS_AND_SHARELOC',
    'SEND_WARM_NO_PRESSURE_FOLLOW_UP',
    'OFFER_FREE_BONUS_ACCESSORY_CLOSING',
    'DRAFT_SPK_AND_INVOICE_FOR_DOWN_PAYMENT',
    'REASSURE_OFFICIAL_MAINTENANCE_WARRANTY',
    'EXPLAIN_PRODUCTION_TIMELINE_14_21_DAYS',
    'REQUEST_ARCHITECTURAL_FLOOR_PLAN',
    'CLARIFY_CUSTOMER_CORE_NEED'
];

export const ConversationAnalyzer = {
    // Analisis awal berbasis aturan teks cepat (instant heuristic) untuk routing & pre-filtering
    heuristicAnalyze: (text = '') => {
        const lower = text.toLowerCase();
        
        let detectedIntent = 'GREETING_NEW_LEAD';
        let detectedTemperature = 'WARM';
        let detectedStage = 'DISCOVERY';

        // Deteksi Intent Cepat
        if (/dapur|kitchen|kitchen set|sink|kompor|kabinet/i.test(lower)) {
            detectedIntent = 'ASK_PRICE_KITCHEN';
        } else if (/lemari|wardrobe|baju|dipan|ranjang/i.test(lower)) {
            detectedIntent = 'ASK_PRICE_WARDROBE';
        } else if (/tv|backdrop|living|partisi|sekat|panel/i.test(lower)) {
            detectedIntent = 'ASK_PRICE_LIVING';
        } else if (/harga|berapa|kisaran|biaya|tarif|meter/i.test(lower)) {
            detectedIntent = 'ASK_PRICE_GENERAL';
        } else if (/survei|survey|jadwal|kapan|jam|datang|ngukur/i.test(lower)) {
            detectedIntent = 'ASK_SURVEY_SCHEDULE';
            detectedTemperature = 'HOT';
            detectedStage = 'SURVEY_OFFERED';
        } else if (/workshop|lokasi|alamat|studio|toko|kantor/i.test(lower)) {
            detectedIntent = 'ASK_WORKSHOP_LOCATION';
            detectedTemperature = 'WARM';
        } else if (/garansi|rusak|service|maintenance/i.test(lower)) {
            detectedIntent = 'ASK_WARRANTY_TERMS';
        } else if (/termin|dp|bayar|cicil|pembayaran/i.test(lower)) {
            detectedIntent = 'ASK_PAYMENT_TERMS';
            detectedTemperature = 'HOT';
        } else if (/mahal|kurang|diskon|bisa nego|kemahalan|toko sebelah/i.test(lower)) {
            detectedIntent = 'PRICE_OBJECTION_EXPENSIVE';
            detectedTemperature = 'WARM';
            detectedStage = 'OBJECTION_HANDLING';
        } else if (/dp|spk|deal|transfer|rekening|kunci antrian/i.test(lower)) {
            detectedIntent = 'CLOSING_READY_TO_DP';
            detectedTemperature = 'HOT';
            detectedStage = 'NEGOTIATION';
        }

        // Ekstraksi Lokasi Heuristik
        let extractedLocation = null;
        if (/bandung|cimahi|padalarang/i.test(lower)) extractedLocation = 'Bandung (PL DK)';
        else if (/tasik|tasikmalaya|ciamis|garut/i.test(lower)) extractedLocation = 'Tasikmalaya & Priangan (PL DK)';
        else if (/jakarta|jaksel|jakbar|jaktim|jakut|jakpus/i.test(lower)) extractedLocation = 'DKI Jakarta (PL LK)';
        else if (/tangerang|tangsel|bsd|gading serpong/i.test(lower)) extractedLocation = 'Tangerang (PL LK)';
        else if (/bekasi|cikarang/i.test(lower)) extractedLocation = 'Bekasi (PL LK)';
        else if (/bogor|depok/i.test(lower)) extractedLocation = 'Bogor/Depok (PL LK)';

        return {
            detectedIntent,
            detectedStage,
            detectedTemperature,
            extractedLocation
        };
    }
};
