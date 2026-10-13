// File: src/components/Icons.jsx
// Compatibility map over Lucide (tree-shaken named imports). New code should import from 'lucide-react' directly.
import React from 'react';
import {
    MessageSquare, UsersRound, BookOpen, Image, Send, Copy, CircleCheck, Zap, Trash2, Pencil, Brain, Plus,
    Search, FileSpreadsheet, TriangleAlert, Bell, Settings2, Calendar, ShieldCheck, ExternalLink,
    Calculator, KeyRound
} from 'lucide-react';

const withDefaults = (Icon, size = 16) => {
    const Wrapped = (props) => <Icon size={size} strokeWidth={1.9} aria-hidden="true" {...props} />;
    Wrapped.displayName = `Icons.${Icon.displayName || 'Icon'}`;
    return Wrapped;
};

export const Icons = {
    MessageSquare: withDefaults(MessageSquare),
    Users: withDefaults(UsersRound),
    BookOpen: withDefaults(BookOpen),
    Image: withDefaults(Image),
    Send: withDefaults(Send),
    Copy: withDefaults(Copy),
    CheckCircle: withDefaults(CircleCheck),
    Zap: withDefaults(Zap),
    Trash: withDefaults(Trash2),
    Edit: withDefaults(Pencil),
    Brain: withDefaults(Brain),
    Plus: withDefaults(Plus),
    Search: withDefaults(Search),
    FileSpreadsheet: withDefaults(FileSpreadsheet),
    Key: withDefaults(KeyRound),
    AlertTriangle: withDefaults(TriangleAlert),
    Bell: withDefaults(Bell),
    Settings: withDefaults(Settings2),
    Calendar: withDefaults(Calendar),
    Shield: withDefaults(ShieldCheck),
    ExternalLink: withDefaults(ExternalLink),
    Calculator: withDefaults(Calculator)
};

export const NaciraLogoIcon = ({ className = '' }) => (
    <svg viewBox="0 0 240 240" className={`h-full w-full ${className}`} fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M60,170 V100 C60,66.86 86.86,40 120,40 C153.14,40 180,66.86 180,100 V170 H150 V100 C150,83.43 136.57,70 120,70 C103.43,70 90,83.43 90,100 V170 H60 Z" />
        <circle cx="150" cy="140" r="24" />
    </svg>
);

export const RobotAiIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" className={`h-full w-full ${className}`} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 3v2.5" />
        <circle cx="12" cy="2.6" r="0.9" fill="currentColor" stroke="none" />
        <rect x="4" y="6" width="16" height="12" rx="4" />
        <path d="M2 11v3M22 11v3" />
        <circle cx="9" cy="11.5" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="15" cy="11.5" r="1.4" fill="currentColor" stroke="none" />
        <path d="M9.5 15h5" />
        <path d="M9 21h6" opacity="0.55" />
    </svg>
);

export const BrandMark = ({ size = 32 }) => (
    <span
        className="flex shrink-0 items-center justify-center rounded-sm bg-primary-subtle text-primary-text ring-1 ring-primary/20"
        style={{ width: size, height: size }}
    >
        <span style={{ width: size * 0.66, height: size * 0.66 }} className="block">
            <RobotAiIcon />
        </span>
    </span>
);
