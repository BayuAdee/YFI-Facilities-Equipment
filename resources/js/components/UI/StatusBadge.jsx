import React from 'react';
import {
    LuCircleCheck,
    LuTriangleAlert,
    LuClock,
    LuCircleAlert,
} from 'react-icons/lu';

export default function StatusBadge({ status, size = 'md' }) {
    const config = {
        OK: {
            bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-500/10',
            dot: 'bg-emerald-500',
            icon: LuCircleCheck,
            label: 'OK / Normal',
        },
        'Perlu Tindak Lanjut': {
            bg: 'bg-amber-50 text-amber-800 border-amber-200/80 ring-amber-500/10',
            dot: 'bg-amber-500',
            icon: LuTriangleAlert,
            label: 'Perlu Tindak Lanjut',
        },
        Overdue: {
            bg: 'bg-orange-50 text-orange-800 border-orange-200/80 ring-orange-500/10',
            dot: 'bg-orange-500 animate-pulse',
            icon: LuClock,
            label: 'Terlambat Inspeksi',
        },
        Expired: {
            bg: 'bg-rose-50 text-rose-800 border-rose-200/80 ring-rose-500/10',
            dot: 'bg-rose-500',
            icon: LuCircleAlert,
            label: 'Kedaluwarsa',
        },
    }[status] || {
        bg: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10',
        dot: 'bg-slate-400',
        icon: LuCircleCheck,
        label: status || 'Unknown',
    };

    const Icon = config.icon;
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5 gap-1',
        md: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5',
        lg: 'text-sm sm:text-base px-3.5 py-1.5 gap-2 font-semibold',
    }[size];

    return (
        <span className={`inline-flex items-center font-medium rounded-full border ring-1 ${config.bg} ${sizeClasses}`}>
            <span className={`w-2 h-2 rounded-full ${config.dot}`} />
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{config.label}</span>
        </span>
    );
}
