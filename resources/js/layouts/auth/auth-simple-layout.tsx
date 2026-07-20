import KairoLogo from '@/components/kairo-logo';
import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[hsl(217,15%,6%)] p-6 md:p-10">
            {/* Ambient glow orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[hsl(217,91%,60%)]/[0.07] blur-[120px]" />
                <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-[hsl(217,91%,60%)]/[0.05] blur-[100px]" />
                <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(217,91%,60%)]/[0.03] blur-[80px]" />
            </div>

            {/* Grid overlay */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(hsl(217,91%,60%,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(hsl(217,91%,60%,0.03)_1px,transparent_1px))] bg-[size:60px_60px]" />

            <div className="relative z-10 w-full max-w-md">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-5">
                        <Link href={route('home')} className="flex items-center gap-2 font-medium">
                            <KairoLogo size="lg" showText={true} animate={true} />
                        </Link>

                        {title && (
                            <div className="space-y-2 text-center">
                                <h1 className="text-xl font-semibold text-white">{title}</h1>
                                {description && (
                                    <p className="text-sm text-white/50">{description}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Glass card */}
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
