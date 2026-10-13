// File: src/components/ui/Surface.jsx
import React from 'react';
import { cn } from '../../js/utils/cn.js';

const BADGE_VARIANTS = {
    neutral: 'bg-surface-3 text-fg-2 border-border',
    primary: 'bg-primary-subtle text-primary-text border-primary/20',
    success: 'bg-success/10 text-emerald-400 border-success/20',
    warning: 'bg-warning/10 text-amber-400 border-warning/20',
    danger: 'bg-danger/10 text-red-400 border-danger/20',
    purple: 'bg-ai/10 text-violet-400 border-ai/20'
};

export const Badge = ({ variant = 'neutral', icon: Icon, className, children, ...rest }) => (
    <span
        className={cn(
            'inline-flex items-center gap-1 rounded-xs border px-1.5 py-0.5 text-caption font-medium whitespace-nowrap',
            BADGE_VARIANTS[variant],
            className
        )}
        {...rest}
    >
        {Icon && <Icon size={12} strokeWidth={2} aria-hidden="true" />}
        {children}
    </span>
);

export const Panel = ({ as: Tag = 'section', className, children, padded = true, ...rest }) => (
    <Tag className={cn('rounded-lg border border-border bg-surface', padded && 'p-4 sm:p-5', className)} {...rest}>
        {children}
    </Tag>
);

export const SectionTitle = ({ title, description, actions, icon: Icon, step, className, id }) => (
    <div className={cn('flex items-start justify-between gap-3', className)}>
        <div className="flex min-w-0 items-start gap-2.5">
            {step != null && (
                <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-xs bg-surface-3 text-caption font-semibold text-fg-3 tabular">
                    {step}
                </span>
            )}
            {Icon && step == null && <Icon size={16} className="mt-0.5 shrink-0 text-fg-3" aria-hidden="true" />}
            <div className="min-w-0">
                <h3 id={id} className="text-h3 font-semibold text-fg">{title}</h3>
                {description && <p className="mt-0.5 text-body-sm text-fg-3">{description}</p>}
            </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
    </div>
);

export const PageHeader = ({ title, description, actions, meta, className }) => (
    <header className={cn('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
        <div className="min-w-0">
            {meta && <div className="mb-1.5 flex flex-wrap items-center gap-2">{meta}</div>}
            <h1 className="text-h1 font-semibold tracking-tight text-fg">{title}</h1>
            {description && <p className="mt-1 text-body text-fg-3">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
);

export const EmptyState = ({ icon: Icon, title, description, action, className, children }) => (
    <div className={cn('flex flex-col items-center justify-center px-6 py-10 text-center', className)}>
        {Icon && (
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-border bg-surface-2 text-fg-3">
                <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
            </div>
        )}
        <h3 className="text-h3 font-semibold text-fg">{title}</h3>
        {description && <p className="mt-1.5 max-w-sm text-body-sm text-fg-3">{description}</p>}
        {children}
        {action && <div className="mt-5">{action}</div>}
    </div>
);

export const Skeleton = ({ className }) => (
    <div className={cn('animate-pulse rounded-xs bg-surface-3', className)} aria-hidden="true" />
);

export const MetricCard = ({ label, value, hint, icon: Icon, tone = 'neutral' }) => {
    const toneClass = {
        neutral: 'text-fg-3',
        primary: 'text-primary-text',
        success: 'text-emerald-400',
        warning: 'text-amber-400'
    }[tone];
    return (
        <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
                <span className="text-label font-medium text-fg-3">{label}</span>
                {Icon && <Icon size={16} className={toneClass} aria-hidden="true" />}
            </div>
            <div className="mt-2 truncate text-h2 font-semibold text-fg tabular">{value}</div>
            {hint && <div className="mt-0.5 truncate text-caption text-fg-muted">{hint}</div>}
        </div>
    );
};

export const SegmentedControl = ({ options, value, onChange, label, size = 'md', className, fullWidth = false }) => (
    <div
        role="radiogroup"
        aria-label={label}
        className={cn('inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 p-1', fullWidth && 'flex w-full', className)}
    >
        {options.map((opt) => {
            const selected = opt.value === value;
            const Icon = opt.icon;
            return (
                <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onChange(opt.value)}
                    className={cn(
                        'inline-flex items-center justify-center gap-1.5 rounded-xs font-medium transition-colors duration-150 whitespace-nowrap',
                        size === 'sm' ? 'h-7 px-2.5 text-label' : 'min-h-[40px] sm:min-h-0 sm:h-8 px-3 text-body-sm',
                        fullWidth && 'flex-1',
                        selected ? 'bg-surface-3 text-fg shadow-sm ring-1 ring-border-strong' : 'text-fg-3 hover:text-fg'
                    )}
                >
                    {Icon && <Icon size={14} className={selected ? 'text-primary-text' : ''} aria-hidden="true" />}
                    {opt.label}
                </button>
            );
        })}
    </div>
);

export const SelectableCard = ({ selected, onClick, title, description, meta, icon: Icon, className, disabled, badge }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
        className={cn(
            'group relative flex w-full min-h-[44px] items-start gap-2.5 rounded-md border px-3 py-2.5 text-left transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:cursor-not-allowed',
            selected ? 'border-primary/60 bg-primary-subtle' : 'border-border bg-surface-2 hover:border-border-strong hover:bg-surface-hover',
            className
        )}
    >
        {Icon && <Icon size={16} className={cn('mt-0.5 shrink-0', selected ? 'text-primary-text' : 'text-fg-3')} aria-hidden="true" />}
        <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
                <span className={cn('text-body-sm font-medium', selected ? 'text-fg' : 'text-fg-2')}>{title}</span>
                {badge}
            </span>
            {description && <span className="mt-0.5 block text-caption text-fg-muted">{description}</span>}
        </span>
        {meta && <span className={cn('shrink-0 text-caption font-medium tabular', selected ? 'text-primary-text' : 'text-fg-3')}>{meta}</span>}
    </button>
);

export const Chip = ({ active, onClick, icon: Icon, children, className, ...rest }) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(
            'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-sm border px-3 text-body-sm font-medium transition-colors duration-150 whitespace-nowrap',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            active ? 'border-primary/50 bg-primary-subtle text-primary-text' : 'border-border bg-surface-2 text-fg-2 hover:border-border-strong hover:text-fg',
            className
        )}
        {...rest}
    >
        {Icon && <Icon size={14} aria-hidden="true" />}
        {children}
    </button>
);
