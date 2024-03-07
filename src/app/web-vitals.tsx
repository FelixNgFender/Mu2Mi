'use client';

import { useReportWebVitals } from 'next/web-vitals';

declare global {
    interface Window {
        umami: any;
    }
}

export function WebVitals() {
    useReportWebVitals((metric) => {
        if (!window || !window.umami) {
            return;
        }

        window.umami.track(`web-vitals-${metric.name.toLowerCase()}`, metric);
    });

    return null;
}
