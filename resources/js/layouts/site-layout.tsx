import { PropsWithChildren } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { FloatingSupport } from '@/components/floating-support';
import { CookieConsent } from '@/components/cookie-consent';

export default function SiteLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-background">
            <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-64 bg-gradient-to-b from-primary/[0.06] to-transparent dark:from-primary/[0.04]" />
            <SiteHeader />
            {children}
            <SiteFooter />
            <FloatingSupport />
            <CookieConsent />
        </div>
    );
}
