import { Crown, Settings, User } from 'lucide-react';

interface RoleBadgeProps {
    role: string;
    className?: string;
}

export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
    if (role === 'owner') {
        return (
            <span className={`inline-flex items-center gap-0.5 text-amber-500 ${className}`} title="Owner">
                <Crown className="h-3.5 w-3.5 fill-amber-500" />
            </span>
        );
    }

    if (role === 'admin') {
        return (
            <span className={`inline-flex items-center gap-0.5 text-blue-500 ${className}`} title="Admin">
                <Settings className="h-3.5 w-3.5" />
            </span>
        );
    }

    return (
        <span className={`inline-flex items-center gap-0.5 text-muted-foreground ${className}`} title="Usuario">
            <User className="h-3.5 w-3.5" />
        </span>
    );
}
