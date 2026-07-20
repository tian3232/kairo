import { Head, Link, router } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';
import { imageUrl } from '@/lib/image-url';
import { Snowflake, Flower2, Sun, Leaf, Tv } from 'lucide-react';
import { AnimeCard, type AnimeCardData } from '@/components/anime-card';

interface SimulcastProps {
    animes: Record<string, AnimeCardData[]>;
    selectedYear: number;
    allYears: number[];
    currentSeason: string;
    currentYear: number;
    userLists: { watchlist: number[]; favorites: number[] };
}

const SEASONS = [
    { key: 'winter', label: 'Invierno', months: 'Ene - Mar', icon: Snowflake, color: 'from-blue-500/20 to-cyan-500/20', accent: 'text-blue-400', border: 'border-blue-500/30' },
    { key: 'spring', label: 'Primavera', months: 'Abr - Jun', icon: Flower2, color: 'from-pink-500/20 to-rose-500/20', accent: 'text-pink-400', border: 'border-pink-500/30' },
    { key: 'summer', label: 'Verano', months: 'Jul - Sep', icon: Sun, color: 'from-orange-500/20 to-yellow-500/20', accent: 'text-orange-400', border: 'border-orange-500/30' },
    { key: 'fall', label: 'Otoño', months: 'Oct - Dic', icon: Leaf, color: 'from-amber-600/20 to-red-500/20', accent: 'text-amber-400', border: 'border-amber-500/30' },
];

function changeYear(year: number) {
    router.get(route('simulcast'), { year }, { preserveState: true, replace: true });
}

export default function SimulcastIndex({ animes, selectedYear, allYears, currentSeason, currentYear, userLists }: SimulcastProps) {
    const hasData = Object.keys(animes).length > 0;

    return (
        <SiteLayout>
            <Head title="Simulcast - Kairo" />

            <div className="pt-20 px-4 sm:px-6 lg:px-8 lg:pt-24 pb-16">
                <div className="">
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Simulcast</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Anime organizado por temporada de emisión</p>
                        <div className="mt-2 h-px bg-gradient-to-r from-[hsl(217,91%,60%)]/40 via-[hsl(217,91%,60%)]/10 to-transparent" />
                    </div>

                    <div className="flex items-center gap-2 mb-8">
                        {allYears.map((year) => (
                            <button
                                key={year}
                                onClick={() => changeYear(year)}
                                className={`shrink-0 rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                                    year === selectedYear
                                        ? 'bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] text-white shadow-[0_0_16px_hsl(217,91%,60%,0.3)]'
                                        : 'border border-border/60 text-muted-foreground hover:border-[hsl(217,91%,60%)]/30 hover:bg-[hsl(217,91%,60%)]/5 hover:text-foreground'
                                }`}
                            >
                                {year}
                                {year === currentYear && (
                                    <span className="ml-1.5 text-[10px] opacity-70">actual</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {!hasData && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="rounded-2xl bg-[hsl(217,91%,60%)]/5 p-6 mb-4">
                                <Tv className="h-12 w-12 text-[hsl(217,91%,60%)]/20" />
                            </div>
                            <p className="text-lg font-medium text-foreground">Sin animes para {selectedYear}</p>
                            <p className="mt-1 text-sm text-muted-foreground">Asigna temporada y año de emisión a los animes desde el panel de admin</p>
                        </div>
                    )}

                    <div className="space-y-12">
                        {SEASONS.map(({ key, label, months, icon: Icon, color, accent, border }) => {
                            const seasonAnimes = animes[key] || [];
                            const isCurrent = key === currentSeason && selectedYear === currentYear;

                            return (
                                <section key={key}>
                                    <div className={`flex items-center gap-3 mb-4 ${isCurrent ? '' : 'opacity-70'}`}>
                                        <div className={`flex items-center gap-2 rounded-lg bg-gradient-to-r ${color} px-3 py-1.5`}>
                                            <Icon className={`h-4 w-4 ${accent}`} />
                                            <span className={`text-sm font-semibold ${accent}`}>{label}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{months}</span>
                                        {isCurrent && (
                                            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">Temporada actual</span>
                                        )}
                                        <span className="text-xs text-muted-foreground/60">{seasonAnimes.length} {seasonAnimes.length === 1 ? 'anime' : 'animes'}</span>
                                    </div>

                                    {seasonAnimes.length > 0 ? (
                                        <div className="flex flex-wrap gap-4 sm:gap-5">
                                            {seasonAnimes.map((anime: AnimeCardData) => (
                                                <div key={anime.id} className="w-36 flex-shrink-0 sm:w-52 md:w-56 lg:w-60 xl:w-64 2xl:w-72">
                                                    <AnimeCard anime={anime} userLists={userLists} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground/50 py-4">Sin animes en esta temporada</p>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                </div>
            </div>
        </SiteLayout>
    );
}
