import { Head, Link } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';
import { Calendar, Play } from 'lucide-react';
import { imageUrl } from '@/lib/image-url';
import { useState } from 'react';

interface CalendarEpisode {
    id: number;
    number: number;
    title: string | null;
    thumbnail: string;
    release_date: string;
    season_number: number;
    anime: {
        id: number;
        title: string;
        slug: string;
        cover_image: string;
    };
}

interface DayGroup {
    date: string;
    label: string;
    short: string;
    is_today: boolean;
    episodes: CalendarEpisode[];
}

export default function UserCalendar({ schedule, isMyCalendar }: { schedule: DayGroup[]; isMyCalendar?: boolean }) {
    const [selectedDay, setSelectedDay] = useState(() => {
        const today = schedule.find((d) => d.is_today);
        return today?.date ?? schedule[0]?.date ?? '';
    });

    const currentWeek = schedule.slice(0, 7);
    const nextWeek = schedule.slice(7, 14);
    const activeDay = schedule.find((d) => d.date === selectedDay);

    const weekDays = [
        { short: 'L', full: 'Lunes' },
        { short: 'M', full: 'Martes' },
        { short: 'X', full: 'Miércoles' },
        { short: 'J', full: 'Jueves' },
        { short: 'V', full: 'Viernes' },
        { short: 'S', full: 'Sábado' },
        { short: 'D', full: 'Domingo' },
    ];

    return (
        <SiteLayout>
            <Head title={isMyCalendar ? 'Mi Calendario - Kairo' : 'Calendario de Estrenos - Kairo'} />

            <div className="pt-20 px-4 max-w-5xl mx-auto pb-10 sm:px-6 lg:px-8 lg:pt-24 lg:pb-16">
                <div className="mb-8 flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-[hsl(217,91%,60%)]" />
                    <h1 className="text-3xl font-bold text-foreground">{isMyCalendar ? 'Mi Calendario' : 'Calendario de Estrenos'}</h1>
                </div>
                <div className="mt-2 h-px bg-gradient-to-r from-[hsl(217,91%,60%)]/40 via-[hsl(217,91%,60%)]/10 to-transparent" />

                <div className="space-y-6">
                    {/* Week 1 */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Esta semana</p>
                        <div className="grid grid-cols-7 gap-2">
                            {currentWeek.map((day, idx) => {
                                return (
                                    <button
                                        key={day.date}
                                        onClick={() => setSelectedDay(day.date)}
                                        className={`relative flex flex-col items-center rounded-lg px-2 py-3 text-center transition-colors ${
                                            selectedDay === day.date
                                                ? 'bg-gradient-to-br from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] text-white shadow-[0_0_16px_hsl(217,91%,60%,0.3)]'
                                                : day.is_today
                                                    ? 'border border-[hsl(217,91%,60%)]/50 bg-[hsl(217,91%,60%)]/10 text-foreground'
                                                    : 'bg-muted/50 text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        <span className="text-[10px] font-medium uppercase">{weekDays[idx]?.short}</span>
                                        <span className="mt-0.5 text-lg font-bold">{day.date.split('-')[2].replace(/^0/, '')}</span>
                                        {day.episodes.length > 0 && (
                                            <span className={`mt-1 text-[10px] ${selectedDay === day.date ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                {day.episodes.length}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Week 2 */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Siguiente semana</p>
                        <div className="grid grid-cols-7 gap-2">
                            {nextWeek.map((day, idx) => {
                                return (
                                    <button
                                        key={day.date}
                                        onClick={() => setSelectedDay(day.date)}
                                        className={`relative flex flex-col items-center rounded-lg px-2 py-3 text-center transition-colors ${
                                            selectedDay === day.date
                                                ? 'bg-gradient-to-br from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] text-white shadow-[0_0_16px_hsl(217,91%,60%,0.3)]'
                                                : 'bg-muted/50 text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        <span className="text-[10px] font-medium uppercase">{weekDays[idx]?.short}</span>
                                        <span className="mt-0.5 text-lg font-bold">{day.date.split('-')[2].replace(/^0/, '')}</span>
                                        {day.episodes.length > 0 && (
                                            <span className={`mt-1 text-[10px] ${selectedDay === day.date ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                {day.episodes.length}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Episodes for selected day */}
                <div className="mt-8">
                    {activeDay && (
                        <>
                            <h2 className="mb-4 text-lg font-semibold text-foreground">{activeDay.label}</h2>
                            {activeDay.episodes.length === 0 ? (
                                <div className="rounded-xl bg-[hsl(217,91%,60%)]/5 py-12 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(217,91%,60%)]/10">
                                        <Calendar className="h-8 w-8 text-[hsl(217,91%,60%)]/20" />
                                    </div>
                                    <p className="mt-3 text-sm text-muted-foreground">
                                        {isMyCalendar ? 'No tienes favoritos en emisión este día' : 'Sin estrenos este día'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {activeDay.episodes.map((ep) => (
                                        <Link
                                            key={ep.id}
                                            href={route('watch.show', ep.id)}
                                            className="group flex items-center gap-4 rounded-xl bg-[hsl(217,91%,60%)]/5 p-3 transition-all border border-[hsl(217,91%,60%)]/10 hover:bg-[hsl(217,91%,60%)]/10 hover:border-[hsl(217,91%,60%)]/20"
                                        >
                                            <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded">
                                                <img
                                                    src={imageUrl(ep.anime.cover_image)}
                                                    alt={ep.anime.title}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                                                    <Play className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100 fill-current" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground group-hover:text-[hsl(217,91%,60%)] truncate">{ep.anime.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    S{ep.season_number}E{ep.number}
                                                    {ep.title && ` — ${ep.title}`}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </SiteLayout>
    );
}
