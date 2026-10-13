// File: src/components/layout/BrandSwitcher.jsx
import React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Menu } from '../ui/Menu.jsx';
import { cn } from '../../js/utils/cn.js';

const BrandTile = ({ name, size = 'sm' }) => (
    <span
        className={cn(
            'flex shrink-0 items-center justify-center rounded-xs bg-surface-3 font-semibold text-fg-2 ring-1 ring-border',
            size === 'sm' ? 'h-6 w-6 text-caption' : 'h-7 w-7 text-label'
        )}
        aria-hidden="true"
    >
        {(name || '?').charAt(0)}
    </span>
);

const titleCase = (s = '') => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export const BrandSwitcher = ({ activeBrand, brands = [], canSwitch, onSwitchBrand }) => {
    const label = titleCase(activeBrand?.brandName || 'Nacira Studio');

    if (!canSwitch || brands.length === 0) {
        return (
            <div className="hidden sm:flex h-9 items-center gap-2 rounded-sm border border-border bg-surface px-2.5" title="Workspace aktif">
                <BrandTile name={label} />
                <span className="max-w-[160px] truncate text-body-sm font-medium text-fg">{label}</span>
            </div>
        );
    }

    const items = [
        { type: 'label', label: 'Workspace aktif' },
        ...brands.map((b) => ({
            id: b.id,
            label: titleCase(b.brandName),
            description: b.shortDescription,
            checked: b.id === activeBrand?.id,
            icon: null,
            trailing: b.id === activeBrand?.id ? <Check size={15} className="shrink-0 text-primary-text" aria-hidden="true" /> : null,
            onSelect: () => b.id !== activeBrand?.id && onSwitchBrand(b.id)
        }))
    ];

    return (
        <Menu
            width="w-72"
            items={items}
            trigger={({ props }) => (
                <button
                    type="button"
                    {...props}
                    aria-label={`Workspace brand: ${label}. Ganti brand`}
                    className="flex h-11 sm:h-9 min-w-0 items-center gap-2 rounded-sm border border-border bg-surface px-2 sm:px-2.5 text-left transition-colors hover:border-border-strong hover:bg-surface-hover"
                >
                    <BrandTile name={label} />
                    <span className="hidden max-w-[150px] truncate text-body-sm font-medium text-fg sm:block">{label}</span>
                    <ChevronsUpDown size={14} className="shrink-0 text-fg-muted" aria-hidden="true" />
                </button>
            )}
        />
    );
};
