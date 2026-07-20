import { Head, Link } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';
import { AnimeCard, type AnimeCardData } from '@/components/anime-card';
import { Heart } from 'lucide-react';

export default function Favorites({ animes, userLists }: { animes: AnimeCardData[]; userLists: { watchlist: number[]; favorites: number[] } }) {
    return (
        <SiteLayout>
            <Head title="Favoritos - Kairo" />

            <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-16">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Favoritos</h1>
                    <div className="mt-2 h-px bg-gradient-to-r from-[hsl(217,91%,60%)]/40 via-[hsl(217,91%,60%)]/10 to-transparent" />
                </div>

                {animes.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[hsl(217,91%,60%)]/10">
                            <Heart className="h-10 w-10 text-[hsl(217,91%,60%)]/40" />
                        </div>
                        <p className="mt-6 text-lg font-medium text-foreground">No tienes favoritos aún</p>
                        <p className="mt-1 text-sm text-muted-foreground">Marca tus animes favoritos con el corazón</p>
                        <Link href={route('explore')} className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(217,91%,50%)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_hsl(217,91%,60%,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_24px_hsl(217,91%,60%,0.4)]">
                            Explorar animes
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-6">
                        {animes.map((anime) => (
                            <AnimeCard key={anime.id} anime={anime} userLists={userLists} />
                        ))}
                    </div>
                )}
            </div>
        </SiteLayout>
    );
}
