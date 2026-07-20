import { Head } from '@inertiajs/react';
import { HeroCarousel, type HeroBanner } from '@/components/hero-carousel';
import { ContentRow } from '@/components/content-row';
import { ContinueWatchingRow, type ContinueWatchingData } from '@/components/continue-watching-row';
import { NewEpisodesRow, type EpisodeCardData } from '@/components/new-episodes-row';
import type { AnimeCardData } from '@/components/anime-card';
import SiteLayout from '@/layouts/site-layout';

interface HomeProps {
    heroBanners: HeroBanner[];
    trending: AnimeCardData[];
    newEpisodes: EpisodeCardData[];
    genreRows: GenreRow[];
    continueWatching: ContinueWatchingData[];
    recommendations: AnimeCardData[];
    userLists: { watchlist: number[]; favorites: number[] };
}

interface GenreRow {
    title: string;
    animes: AnimeCardData[];
}

export default function Home({ heroBanners, trending, newEpisodes, genreRows, continueWatching, recommendations, userLists }: HomeProps) {
    return (
        <>
            <Head title="Inicio" />
            <HeroCarousel banners={heroBanners} />
            <div className="relative bg-background pb-12">
                <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.03] blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 translate-x-1/3 rounded-full bg-kairo/[0.04] blur-3xl" />
                {recommendations.length > 0 && (
                    <ContentRow title="Recomendados para ti" animes={recommendations} userLists={userLists} compact />
                )}
                <ContinueWatchingRow items={continueWatching} />
                <NewEpisodesRow title="Nuevos Episodios" episodes={newEpisodes} />
                <ContentRow title="Tendencias" animes={trending} userLists={userLists} />
                {genreRows.map((row) => (
                    <ContentRow key={row.title} title={row.title} animes={row.animes} userLists={userLists} />
                ))}
            </div>
        </>
    );
}

Home.layout = (page: React.ReactNode) => <SiteLayout>{page}</SiteLayout>;
