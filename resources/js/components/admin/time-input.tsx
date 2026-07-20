import { useState } from 'react';

interface TimeInputProps {
    label: string;
    valueSeconds: number | null;
    onChange: (totalSeconds: number | null) => void;
}

function formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function parseTime(input: string): number | null {
    if (!input.trim()) return null;
    const parts = input.split(':');
    if (parts.length === 2) {
        const m = parseInt(parts[0], 10);
        const s = parseInt(parts[1], 10);
        if (isNaN(m) || isNaN(s) || m < 0 || s < 0 || s >= 60) return null;
        return m * 60 + s;
    }
    if (parts.length === 1) {
        const s = parseInt(parts[0], 10);
        if (isNaN(s) || s < 0) return null;
        return s;
    }
    return null;
}

export default function TimeInput({ label, valueSeconds, onChange }: TimeInputProps) {
    const [inputValue, setInputValue] = useState(valueSeconds != null ? formatTime(valueSeconds) : '');

    const handleChange = (raw: string) => {
        setInputValue(raw);
        const parsed = parseTime(raw);
        if (parsed !== null || raw.trim() === '') {
            onChange(parsed);
        }
    };

    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="min:seg"
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
        </div>
    );
}
