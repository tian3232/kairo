import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { ToastProvider } from './components/toast';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const pages = import.meta.glob('./pages/**/*.tsx');

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const page = pages[`./pages/${name}.tsx`];
        if (!page) throw new Error(`Page not found: ${name}`);
        return page();
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        router.on('success', (event) => {
            const pageProps = (event.detail.page as { props: Record<string, unknown> }).props;
            if (typeof pageProps.csrf === 'string') {
                const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
                if (meta) meta.content = pageProps.csrf;
            }
        });

        root.render(
            <ToastProvider>
                <App {...props} />
            </ToastProvider>
        );
    },
    progress: {
        color: 'hsl(217, 91%, 60%)',
    },
});
