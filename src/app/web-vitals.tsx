'use client';

import { umami } from '@/lib/analytics';
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

        switch (metric.name) {
            case 'FCP': {
                window.umami.track(umami.webVitals.fcp.name, metric);
            }
            case 'LCP': {
                window.umami.track(umami.webVitals.lcp.name, metric);
            }
            case 'CLS': {
                window.umami.track(umami.webVitals.cls.name, metric);
            }
            case 'FID': {
                window.umami.track(umami.webVitals.fid.name, metric);
            }
            case 'INP': {
                window.umami.track(umami.webVitals.inp.name, metric);
            }
        }
    });

    return null;
}
