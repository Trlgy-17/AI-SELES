// File: src/components/layout/navigation.js
import { MessageSquareText, UsersRound, Calculator, BookOpen } from 'lucide-react';

export const PAGE_META = {
    workspace: { title: 'Sales AI', short: 'Sales AI', icon: MessageSquareText, description: 'Balas chat calon klien dengan rekomendasi AI.' },
    crm: { title: 'CRM Leads', short: 'CRM', icon: UsersRound, description: 'Kelola prospek dan pipeline brand aktif.' },
    estimator: { title: 'Estimator', short: 'Estimator', icon: Calculator, description: 'Hitung estimasi RAB proyek interior.' },
    knowledge: { title: 'Knowledge Base', short: 'Knowledge', icon: BookOpen, description: 'SOP, harga, dan material untuk tim sales.' }
};
