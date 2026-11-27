import React from 'react';
import { LuLoaderCircle } from 'react-icons/lu';

export default function LoadingSpinner({ text = 'Memuat data...' }) {
    return (
        <div className="max-w-md mx-auto py-12 text-center">
            <LuLoaderCircle className="w-8 h-8 animate-spin text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-600 font-medium">{text}</p>
        </div>
    );
}
