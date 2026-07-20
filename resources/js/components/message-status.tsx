interface MessageStatusProps {
    read_at: string | null;
    delivered_at: string | null;
    className?: string;
}

export default function MessageStatus({ read_at, delivered_at, className = '' }: MessageStatusProps) {
    const status = read_at ? 'read' : delivered_at ? 'delivered' : 'sent';

    return (
        <span className={`inline-flex items-center gap-0 ${className}`} title={status === 'read' ? 'Visto' : status === 'delivered' ? 'Recibido' : 'Enviado'}>
            {status === 'sent' ? (
                <svg viewBox="0 0 16 11" className="h-[11px] w-[14px]" fill="none">
                    <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.46.46 0 0 0-.659-.003.462.462 0 0 0-.003.66l2.37 2.47c.093.096.213.143.333.143a.458.458 0 0 0 .352-.174l6.552-8.075a.448.448 0 0 0-.059-.64z" fill="currentColor" opacity="0.5"/>
                </svg>
            ) : (
                <svg viewBox="0 0 16 11" className="h-[11px] w-[18px]" fill="none">
                    <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.46.46 0 0 0-.659-.003.462.462 0 0 0-.003.66l2.37 2.47c.093.096.213.143.333.143a.458.458 0 0 0 .352-.174l6.552-8.075a.448.448 0 0 0-.059-.64z" fill="currentColor" opacity="0.5"/>
                    <path d="M15.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.2-1.25-.334.413 1.201 1.251c.093.096.213.143.333.143a.458.458 0 0 0 .352-.174l6.552-8.075a.448.448 0 0 0-.059-.64l-.369-.373z" fill={status === 'read' ? 'hsl(var(--primary))' : 'currentColor'} opacity="0.5"/>
                </svg>
            )}
        </span>
    );
}
