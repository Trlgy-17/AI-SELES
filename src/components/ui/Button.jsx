// File: src/components/ui/Button.jsx
import React, { forwardRef } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '../../js/utils/cn.js';

const VARIANTS = {
    primary: 'bg-primary text-primary-fg hover:bg-primary-hover font-semibold shadow-sm',
    secondary: 'bg-surface-3 text-fg hover:bg-surface-hover border border-border hover:border-border-strong',
    outline: 'bg-transparent text-fg-2 border border-border-strong hover:bg-surface-hover hover:text-fg',
    ghost: 'bg-transparent text-fg-2 hover:bg-surface-hover hover:text-fg',
    danger: 'bg-danger/10 text-red-400 border border-danger/25 hover:bg-danger/20',
    'danger-solid': 'bg-danger text-white hover:bg-red-600 font-semibold'
};

const SIZES = {
    sm: 'h-8 px-3 text-body-sm gap-1.5 rounded-sm',
    md: 'min-h-[44px] sm:min-h-0 sm:h-10 px-4 text-body gap-2 rounded-sm',
    lg: 'min-h-[48px] sm:h-11 px-5 text-body gap-2 rounded-sm'
};

export const Button = forwardRef(function Button(
    { variant = 'secondary', size = 'md', icon: Icon, iconRight: IconRight, loading = false, className, children, disabled, type = 'button', ...rest },
    ref
) {
    const iconSize = size === 'sm' ? 14 : 16;
    return (
        <button
            ref={ref}
            type={type}
            disabled={disabled || loading}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors duration-150 select-none',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                VARIANTS[variant],
                SIZES[size],
                className
            )}
            {...rest}
        >
            {loading ? <LoaderCircle size={iconSize} className="animate-spin" aria-hidden="true" /> : Icon ? <Icon size={iconSize} strokeWidth={2} aria-hidden="true" /> : null}
            {children}
            {IconRight && !loading && <IconRight size={iconSize} strokeWidth={2} aria-hidden="true" />}
        </button>
    );
});

export const IconButton = forwardRef(function IconButton(
    { icon: Icon, label, variant = 'ghost', size = 'md', className, iconSize, active = false, type = 'button', ...rest },
    ref
) {
    const dims = size === 'sm' ? 'h-8 w-8' : 'h-11 w-11 sm:h-9 sm:w-9';
    return (
        <button
            ref={ref}
            type={type}
            aria-label={label}
            title={label}
            className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-sm transition-colors duration-150',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                dims,
                active ? 'bg-primary-subtle text-primary-text' : VARIANTS[variant],
                className
            )}
            {...rest}
        >
            <Icon size={iconSize || (size === 'sm' ? 15 : 17)} strokeWidth={1.9} aria-hidden="true" />
        </button>
    );
});
