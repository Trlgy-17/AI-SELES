// File: src/components/ui/Input.jsx
import React, { forwardRef } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '../../js/utils/cn.js';

export const fieldBase =
    'w-full bg-surface-2 border border-border text-fg rounded-sm text-base sm:text-sm transition-colors duration-150 ' +
    'hover:border-border-strong focus:outline-none focus:border-primary focus:ring-3 focus:ring-ring ' +
    'disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-fg-muted';

export const Input = forwardRef(function Input({ className, invalid, prefix, suffix, icon: Icon, wrapperClassName, ...rest }, ref) {
    if (!prefix && !suffix && !Icon) {
        return (
            <input
                ref={ref}
                aria-invalid={invalid || undefined}
                className={cn(fieldBase, 'min-h-[44px] sm:min-h-0 sm:h-10 px-3', invalid && 'border-danger/60 focus:border-danger focus:ring-danger/25', className)}
                {...rest}
            />
        );
    }
    return (
        <div className={cn('relative flex items-center', wrapperClassName)}>
            {Icon && <Icon size={16} className="pointer-events-none absolute left-3 text-fg-muted" aria-hidden="true" />}
            {prefix && <span className="pointer-events-none absolute left-3 text-body-sm text-fg-muted">{prefix}</span>}
            <input
                ref={ref}
                aria-invalid={invalid || undefined}
                className={cn(
                    fieldBase,
                    'min-h-[44px] sm:min-h-0 sm:h-10 px-3',
                    (Icon || prefix) && 'pl-9',
                    suffix && 'pr-12',
                    invalid && 'border-danger/60 focus:border-danger focus:ring-danger/25',
                    className
                )}
                {...rest}
            />
            {suffix && <span className="pointer-events-none absolute right-3 text-body-sm text-fg-muted">{suffix}</span>}
        </div>
    );
});

export const Textarea = forwardRef(function Textarea({ className, invalid, ...rest }, ref) {
    return (
        <textarea
            ref={ref}
            aria-invalid={invalid || undefined}
            className={cn(fieldBase, 'px-3 py-2.5 leading-relaxed resize-y', invalid && 'border-danger/60', className)}
            {...rest}
        />
    );
});

export const Select = forwardRef(function Select({ className, wrapperClassName, children, ...rest }, ref) {
    return (
        <div className={cn('relative', wrapperClassName)}>
            <select
                ref={ref}
                className={cn(fieldBase, 'appearance-none min-h-[44px] sm:min-h-0 sm:h-10 pl-3 pr-9 cursor-pointer', className)}
                {...rest}
            >
                {children}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
        </div>
    );
});

export const SearchInput = forwardRef(function SearchInput({ value, onChange, onClear, className, wrapperClassName, ...rest }, ref) {
    return (
        <div className={cn('relative flex items-center', wrapperClassName)}>
            <Search size={16} className="pointer-events-none absolute left-3 text-fg-muted" aria-hidden="true" />
            <input
                ref={ref}
                type="search"
                value={value}
                onChange={onChange}
                className={cn(fieldBase, 'min-h-[44px] sm:min-h-0 sm:h-10 pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden', className)}
                {...rest}
            />
            {value && onClear && (
                <button
                    type="button"
                    onClick={onClear}
                    aria-label="Hapus pencarian"
                    className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-xs text-fg-muted hover:text-fg hover:bg-surface-hover"
                >
                    <X size={14} aria-hidden="true" />
                </button>
            )}
        </div>
    );
});

export const Switch = ({ checked, onChange, label, description, id, disabled }) => (
    <label htmlFor={id} className={cn('flex items-start gap-3 cursor-pointer select-none min-h-[44px] sm:min-h-0 py-1', disabled && 'opacity-50 cursor-not-allowed')}>
        <span className="relative mt-0.5 inline-flex shrink-0">
            <input
                id={id}
                type="checkbox"
                role="switch"
                className="peer sr-only"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="h-5 w-9 rounded-full bg-surface-3 border border-border-strong transition-colors peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring" />
            <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-fg-2 transition-transform peer-checked:translate-x-4 peer-checked:bg-white" />
        </span>
        {(label || description) && (
            <span className="min-w-0">
                {label && <span className="block text-body-sm font-medium text-fg">{label}</span>}
                {description && <span className="block text-caption text-fg-muted">{description}</span>}
            </span>
        )}
    </label>
);
