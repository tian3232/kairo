import { useMemo } from 'react';
import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

const zxcvbn = new ZxcvbnFactory({
    dictionary: {
        ...zxcvbnCommonPackage.dictionary,
        ...zxcvbnEnPackage.dictionary,
    },
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    translations: zxcvbnEnPackage.translations,
});

const LABELS = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte'];
const COLORS = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

export function PasswordStrength({ password }: { password: string }) {
    const score = useMemo(() => {
        if (!password) return -1;
        return zxcvbn.check(password).score;
    }, [password]);

    if (score === -1) return null;

    return (
        <div className="mt-2 space-y-1">
            <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${i <= score ? COLORS[score] : 'bg-muted'}`}
                    />
                ))}
            </div>
            <p className="text-xs text-muted-foreground">{LABELS[score]}</p>
        </div>
    );
}
