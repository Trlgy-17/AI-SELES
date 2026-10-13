export const PERMISSIONS = {
    'client.read': 'Lihat klien & lead',
    'client.create': 'Buat klien & lead',
    'client.update': 'Ubah klien & lead',
    'client.delete': 'Arsipkan klien & lead',
    'lead.assign': 'Tugaskan lead ke anggota tim',
    'task.manage': 'Kelola tugas follow-up',
    'estimate.create': 'Buat estimasi RAB',
    'estimate.approve': 'Setujui estimasi RAB',
    'knowledge.edit': 'Kelola knowledge base',
    'brand.switch': 'Berpindah dan melihat semua brand',
    'user.manage': 'Kelola user & role',
    'audit.view': 'Lihat audit log',
    'settings.manage': 'Kelola pengaturan & integrasi',
    'ai.use': 'Gunakan Sales AI',
    'data.import': 'Impor data lama'
} as const;

export type Permission = keyof typeof PERMISSIONS;

const ALL = Object.keys(PERMISSIONS) as Permission[];
const SALES_BASE: Permission[] = ['client.read', 'client.create', 'client.update', 'task.manage', 'estimate.create', 'ai.use', 'data.import'];

export const ROLES: Record<string, { label: string; permissions: Permission[] }> = {
    SUPER_ADMIN: { label: 'Super Admin', permissions: ALL },
    OWNER: { label: 'Owner', permissions: ALL.filter((p) => p !== 'user.manage') },
    SUPERVISOR: {
        label: 'Supervisor',
        permissions: [...SALES_BASE, 'client.delete', 'lead.assign', 'estimate.approve', 'audit.view']
    },
    MARKETING_ADMIN: { label: 'Admin Marketing', permissions: SALES_BASE },
    SALES: { label: 'Sales', permissions: SALES_BASE.filter((p) => p !== 'data.import') }
};

// Stage codes in the database ↔ labels used by the existing UI (constants.js LEAD_STATUS_OPTIONS).
export const STAGE_LABELS = {
    PROSPECT_SURVEY: 'Prospek / Survey',
    DESIGN_REVIEW: 'Design Review',
    QUOTATION: 'Penawaran RAB',
    CLOSING_DP: 'Closing / DP Masuk',
    COMPLETED: 'Selesai / Terpasang',
    LOST: 'Batal'
} as const;

export type StageCode = keyof typeof STAGE_LABELS;

const LABEL_ALIASES: Record<string, StageCode> = {
    'prospek / survey': 'PROSPECT_SURVEY',
    prospek: 'PROSPECT_SURVEY',
    survey: 'PROSPECT_SURVEY',
    'design review': 'DESIGN_REVIEW',
    desain: 'DESIGN_REVIEW',
    'penawaran rab': 'QUOTATION',
    penawaran: 'QUOTATION',
    'closing / dp masuk': 'CLOSING_DP',
    closing: 'CLOSING_DP',
    'selesai / terpasang': 'COMPLETED',
    selesai: 'COMPLETED',
    batal: 'LOST',
    'batal / unqualified': 'LOST',
    lost: 'LOST'
};

export const stageFromLabel = (label: unknown): StageCode | null => {
    if (typeof label !== 'string') return null;
    if (label in STAGE_LABELS) return label as StageCode;
    return LABEL_ALIASES[label.trim().toLowerCase()] ?? null;
};
