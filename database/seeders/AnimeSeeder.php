<?php

namespace Database\Seeders;

use App\Models\Anime;
use App\Models\Episode;
use App\Models\Genre;
use App\Models\Season;
use App\Models\Studio;
use App\Models\HeroBanner;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AnimeSeeder extends Seeder
{
    public function run(): void
    {
        // --- Genres ---
        $genres = collect([
            'Acción', 'Aventura', 'Comedia', 'Drama', 'Fantasía',
            'Horror', 'Misterio', 'Romance', 'Sci-Fi', 'Slice of Life',
            'Sobrenatural', 'Deporte', 'Mecha', 'Musical', 'Psicológico',
        ])->mapWithKeys(fn ($name) => [
            $name => Genre::create(['name' => $name, 'slug' => Str::slug($name)])->id,
        ]);

        // --- Studios ---
        $studios = collect([
            'MAPPA' => Studio::create(['name' => 'MAPPA', 'slug' => 'mappa']),
            'Ufotable' => Studio::create(['name' => 'Ufotable', 'slug' => 'ufotable']),
            'Wit Studio' => Studio::create(['name' => 'Wit Studio', 'slug' => 'wit-studio']),
            'Madhouse' => Studio::create(['name' => 'Madhouse', 'slug' => 'madhouse']),
            'Kyoto Animation' => Studio::create(['name' => 'Kyoto Animation', 'slug' => 'kyoto-animation']),
        ]);

        // =============================================
        // ANIME 1: Kimetsu no Yaiba (En emisión)
        // =============================================
        $anime1 = Anime::create([
            'title' => 'Kimetsu no Yaiba',
            'slug' => 'kimetsu-no-yaiba-' . Str::random(5),
            'synopsis' => 'Tanjiro Kamado, cuya familia fue masacrada por un demonio, se embarca en un peligroso viaje para vengar a su familia y encontrar una cura para su hermana Nezuko, quien ha sido transformada en demonio.',
            'type' => 'tv',
            'status' => 'airing',
            'age_rating' => 'R',
            'release_year' => 2019,
            'broadcast_season' => 'summer',
            'broadcast_year' => 2026,
            'studio_id' => $studios['Ufotable']->id,
            'cover_image' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg',
            'banner_image' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg',
            'logo_image' => '',
            'trailer_url' => 'https://www.youtube.com/watch?v=VQGIF5NQhGU',
            'is_active' => true,
            'created_by' => 1,
        ]);
        $anime1->genres()->attach([$genres['Acción'], $genres['Sobrenatural'], $genres['Drama']]);

        // Season 1
        $s1 = $anime1->seasons()->create(['type' => 'season', 'number' => 1, 'title' => 'Temporada 1', 'order' => 1]);
        $episodes1 = [
            ['number' => 1, 'title' => 'Crueldad', 'duration_seconds' => 1410, 'intro_start' => 32, 'intro_end' => 62, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg'],
            ['number' => 2, 'title' => 'Trainer Urokodaki', 'duration_seconds' => 1410, 'intro_start' => 28, 'intro_end' => 58, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg'],
            ['number' => 3, 'title' => 'Sabito y Makomo', 'duration_seconds' => 1410, 'intro_start' => 25, 'intro_end' => 55, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg'],
            ['number' => 4, 'title' => '¡Final del entrenamiento!', 'duration_seconds' => 1410, 'intro_start' => 30, 'intro_end' => 60, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg'],
            ['number' => 5, 'title' => 'Mi hermana Nezuko', 'duration_seconds' => 1410, 'intro_start' => 28, 'intro_end' => 58, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg'],
            ['number' => 6, 'title' => 'Escuadrón de demonios', 'duration_seconds' => 1410, 'intro_start' => 25, 'intro_end' => 55, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg'],
            ['number' => 7, 'title' => 'Mushizu', 'duration_seconds' => 1410, 'intro_start' => 30, 'intro_end' => 60, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg'],
            ['number' => 8, 'title' => 'El trueno del bosque', 'duration_seconds' => 1410, 'intro_start' => 28, 'intro_end' => 58, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg'],
            ['number' => 9, 'title' => 'Sueños de espuma', 'duration_seconds' => 1410, 'intro_start' => 25, 'intro_end' => 55, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg'],
            ['number' => 10, 'title' => 'El baile de la casa abandonada', 'duration_seconds' => 1410, 'intro_start' => 30, 'intro_end' => 60, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg'],
            ['number' => 11, 'title' => '¡A por el pilar!?', 'duration_seconds' => 1410, 'intro_start' => 28, 'intro_end' => 58, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg'],
            ['number' => 12, 'title' => 'El pilar del agua', 'duration_seconds' => 1410, 'intro_start' => 25, 'intro_end' => 55, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg'],
            ['number' => 13, 'title' => 'La danza del hada de fuego', 'duration_seconds' => 1440, 'intro_start' => 30, 'intro_end' => 60, 'credits_start' => 1300, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg'],
        ];
        foreach ($episodes1 as $ep) {
            $thumb = $ep['thumbnail'];
            unset($ep['thumbnail']);
            $s1->episodes()->create(array_merge($ep, [
                'video_path' => 'https://files.vidstack.io/sprite-fight/720p.mp4',
                'thumbnail' => $thumb,
                'release_date' => now()->subWeeks(13)->addWeeks($ep['number']),
            ]));
        }

        // Season 2
        $s2 = $anime1->seasons()->create(['type' => 'season', 'number' => 2, 'title' => 'Temporada 2: Pilar Unificado', 'order' => 2]);
        $episodes2 = [
            ['number' => 1, 'title' => 'El sonido de la espada', 'duration_seconds' => 1410, 'intro_start' => 28, 'intro_end' => 58, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg'],
            ['number' => 2, 'title' => 'Los pilar se reúnen', 'duration_seconds' => 1410, 'intro_start' => 25, 'intro_end' => 55, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg'],
            ['number' => 3, 'title' => 'La entrenadora de la casa de la mariposa', 'duration_seconds' => 1410, 'intro_start' => 30, 'intro_end' => 60, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg'],
        ];
        foreach ($episodes2 as $ep) {
            $thumb = $ep['thumbnail'];
            unset($ep['thumbnail']);
            $s2->episodes()->create(array_merge($ep, [
                'video_path' => 'https://files.vidstack.io/sprite-fight/720p.mp4',
                'thumbnail' => $thumb,
                'release_date' => now()->subWeeks(3)->addWeeks($ep['number']),
            ]));
        }

        HeroBanner::create(['anime_id' => $anime1->id, 'order' => 1, 'duration_seconds' => 8]);

        // =============================================
        // ANIME 2: Shingeki no Kyojin (Completado)
        // =============================================
        $anime2 = Anime::create([
            'title' => 'Shingeki no Kyojin',
            'slug' => 'shingeki-no-kyojin-' . Str::random(5),
            'synopsis' => 'La humanidad vive confinada dentro de enormes muros para protegerse de los titanes, enormes humanoides que devoran personas sin razón aparente. Eren Jäger jura exterminar a todos los titanes tras la destrucción de su ciudad natal.',
            'type' => 'tv',
            'status' => 'finished',
            'age_rating' => 'R',
            'release_year' => 2013,
            'broadcast_season' => 'spring',
            'broadcast_year' => 2025,
            'studio_id' => $studios['Wit Studio']->id,
            'cover_image' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg',
            'banner_image' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg',
            'logo_image' => '',
            'trailer_url' => '',
            'is_active' => true,
            'created_by' => 1,
        ]);
        $anime2->genres()->attach([$genres['Acción'], $genres['Drama'], $genres['Fantasía']]);

        $s3 = $anime2->seasons()->create(['type' => 'season', 'number' => 1, 'title' => 'Temporada 1', 'order' => 1]);
        $episodes3 = [
            ['number' => 1, 'title' => 'A ti, 2000 años después', 'duration_seconds' => 1410, 'intro_start' => 64, 'intro_end' => 94, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg'],
            ['number' => 2, 'title' => 'Ese día', 'duration_seconds' => 1410, 'intro_start' => 60, 'intro_end' => 90, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg'],
            ['number' => 3, 'title' => 'La muralla de Shiganshina', 'duration_seconds' => 1410, 'intro_start' => 58, 'intro_end' => 88, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg'],
            ['number' => 4, 'title' => 'La noche del batallón de exploración', 'duration_seconds' => 1410, 'intro_start' => 62, 'intro_end' => 92, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg'],
            ['number' => 5, 'title' => 'Primer combate', 'duration_seconds' => 1410, 'intro_start' => 60, 'intro_end' => 90, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg'],
        ];
        foreach ($episodes3 as $ep) {
            $thumb = $ep['thumbnail'];
            unset($ep['thumbnail']);
            $s3->episodes()->create(array_merge($ep, [
                'video_path' => 'https://files.vidstack.io/sprite-fight/720p.mp4',
                'thumbnail' => $thumb,
                'release_date' => now()->subWeeks(5)->addWeeks($ep['number']),
            ]));
        }

        HeroBanner::create(['anime_id' => $anime2->id, 'order' => 2, 'duration_seconds' => 8]);

        // =============================================
        // ANIME 3: Jujutsu Kaisen (En emisión)
        // =============================================
        $anime3 = Anime::create([
            'title' => 'Jujutsu Kaisen',
            'slug' => 'jujutsu-kaisen-' . Str::random(5),
            'synopsis' => 'Yuji Itadori, un chico con habilidades sobrehumanas, se une a una organización secreta de exorcistas después de tragar un dedo maldito, convirtiéndose en el recipiente del Rey de las Maldiciones, Ryomen Sukuna.',
            'type' => 'tv',
            'status' => 'airing',
            'age_rating' => 'R',
            'release_year' => 2020,
            'broadcast_season' => 'summer',
            'broadcast_year' => 2026,
            'studio_id' => $studios['MAPPA']->id,
            'cover_image' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg',
            'banner_image' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg',
            'logo_image' => '',
            'trailer_url' => '',
            'is_active' => true,
            'created_by' => 1,
        ]);
        $anime3->genres()->attach([$genres['Acción'], $genres['Sobrenatural'], $genres['Psicológico']]);

        $s4 = $anime3->seasons()->create(['type' => 'season', 'number' => 1, 'title' => 'Temporada 1', 'order' => 1]);
        $episodes4 = [
            ['number' => 1, 'title' => 'Ryomen Sukuna', 'duration_seconds' => 1410, 'intro_start' => 30, 'intro_end' => 60, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg'],
            ['number' => 2, 'title' => 'Cosa maldita / Lugar maldito', 'duration_seconds' => 1410, 'intro_start' => 28, 'intro_end' => 58, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg'],
            ['number' => 3, 'title' => 'La espada quebrada', 'duration_seconds' => 1410, 'intro_start' => 25, 'intro_end' => 55, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg'],
            ['number' => 4, 'title' => 'Lazo púrpura', 'duration_seconds' => 1410, 'intro_start' => 30, 'intro_end' => 60, 'credits_start' => 1280, 'thumbnail' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg'],
        ];
        foreach ($episodes4 as $ep) {
            $thumb = $ep['thumbnail'];
            unset($ep['thumbnail']);
            $s4->episodes()->create(array_merge($ep, [
                'video_path' => 'https://files.vidstack.io/sprite-fight/720p.mp4',
                'thumbnail' => $thumb,
                'release_date' => now()->subWeeks(4)->addWeeks($ep['number']),
            ]));
        }

        HeroBanner::create(['anime_id' => $anime3->id, 'order' => 3, 'duration_seconds' => 8]);

        // =============================================
        // SIMULCAST TEST ANIMES - 2026
        // =============================================

        // --- VERANO 2026 (temporada actual) ---
        $simulcastData = [
            ['title' => 'Blue Lock Season 3', 'synopsis' => 'La competencia por convertirse en el mejor delantero del mundo continúa con retos aún más intensos.', 'type' => 'tv', 'status' => 'airing', 'season' => 'summer', 'year' => 2026, 'studio' => '8bit', 'cover' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx137822-U8naszP96vzC.png', 'genres' => ['Deporte', 'Acción'], 'rating' => 8.45],
            ['title' => 'Dandadan', 'synopsis' => 'Okarun y Momo descubren mundos sobrenaturales mientras buscan recuperar sus partes perdidas del cuerpo.', 'type' => 'tv', 'status' => 'airing', 'season' => 'summer', 'year' => 2026, 'studio' => 'Science SARU', 'cover' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-60q1B6GK2Ghb.jpg', 'genres' => ['Acción', 'Comedia', 'Sobrenatural'], 'rating' => 8.72],
            ['title' => 'Oshi no Ko Season 3', 'synopsis' => 'La industria del entretenimiento revela su lado más oscuro mientras Aqua continúa su búsqueda de venganza.', 'type' => 'tv', 'status' => 'airing', 'season' => 'summer', 'year' => 2026, 'studio' => 'MAPPA', 'cover' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png', 'genres' => ['Drama', 'Sobrenatural'], 'rating' => 8.60],
            ['title' => 'My Hero Academia: Vigilantes', 'synopsis' => 'En un mundo de héroes, civiles deciden tomar la justicia por su mano.', 'type' => 'tv', 'status' => 'airing', 'season' => 'summer', 'year' => 2026, 'studio' => 'Bones', 'cover' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21459-nYh85uj2Fuwr.jpg', 'genres' => ['Acción', 'Aventura'], 'rating' => 8.10],
            ['title' => 'Mashle Season 3', 'synopsis' => 'Mash continúa aplastando la magia con pura fuerza física en el imperio mágico.', 'type' => 'tv', 'status' => 'airing', 'season' => 'summer', 'year' => 2026, 'studio' => 'A-1 Pictures', 'cover' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151801-XxVf22Le6C8o.png', 'genres' => ['Comedia', 'Fantasía'], 'rating' => 7.95],
            ['title' => 'Vinland Saga Season 3', 'synopsis' => 'Thorfinn viaja hacia el oeste en busca de Vinland, la tierra prometida de paz.', 'type' => 'tv', 'status' => 'airing', 'season' => 'summer', 'year' => 2026, 'studio' => 'MAPPA', 'cover' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101348-2fhDFPCuMNiz.jpg', 'genres' => ['Aventura', 'Drama'], 'rating' => 9.00],

            // --- PRIMAVERA 2026 ---
            ['title' => 'Demon Slayer: Infinity Castle', 'synopsis' => 'El enfrentamiento final contra Muzan Kibutsuji en el Castillo Infinito.', 'type' => 'tv', 'status' => 'finished', 'season' => 'spring', 'year' => 2026, 'studio' => 'Ufotable', 'cover' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg', 'genres' => ['Acción', 'Sobrenatural'], 'rating' => 9.10],
            ['title' => 'Chainsaw Man Season 2', 'synopsis' => 'Denji enfrenta nuevos Diablos en la Academia de Cazadores.', 'type' => 'tv', 'status' => 'finished', 'season' => 'spring', 'year' => 2026, 'studio' => 'MAPPA', 'cover' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-DdP4vAdssLoz.png', 'genres' => ['Acción', 'Horror'], 'rating' => 8.85],
            ['title' => 'Spy x Family Season 3', 'synopsis' => 'La familia Forger continúa con sus misiones mientras Anya sigue escondiendo sus poderes telepáticos.', 'type' => 'tv', 'status' => 'finished', 'season' => 'spring', 'year' => 2026, 'studio' => 'Wit Studio', 'cover' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg', 'genres' => ['Comedia', 'Aventura'], 'rating' => 8.55],
            ['title' => 'Solo Leveling Season 3', 'synopsis' => 'Sung Jinwoo se enfrenta a las mazmorras más peligrosas mientras su poder crece sin límites.', 'type' => 'tv', 'status' => 'finished', 'season' => 'spring', 'year' => 2026, 'studio' => 'A-1 Pictures', 'cover' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png', 'genres' => ['Acción', 'Fantasía'], 'rating' => 8.70],

            // --- INVIERNO 2026 ---
            ['title' => 'Attack on Titan: Final Season Part 3', 'synopsis' => 'La guerra final por la supervivencia de la humanidad llega a su clímax.', 'type' => 'tv', 'status' => 'finished', 'season' => 'winter', 'year' => 2026, 'studio' => 'MAPPA', 'cover' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg', 'genres' => ['Acción', 'Drama'], 'rating' => 9.20],
            ['title' => 'Mob Psycho 100 Season 4', 'synopsis' => 'Reigen y Mob enfrentan amenazas psíquicas mientras crecen como personas.', 'type' => 'tv', 'status' => 'finished', 'season' => 'winter', 'year' => 2026, 'studio' => 'Bones', 'cover' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21507-6YUSbh2m0N1p.jpg', 'genres' => ['Acción', 'Comedia'], 'rating' => 8.90],
            ['title' => 'The Apothecary Diaries Season 2', 'synopsis' => 'Maomao continúa resolviendo misterios en la corte imperial con su conocimiento de medicina.', 'type' => 'tv', 'status' => 'finished', 'season' => 'winter', 'year' => 2026, 'studio' => 'Olive', 'cover' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx161645-QLbzHXiYRgV2.jpg', 'genres' => ['Drama', 'Misterio'], 'rating' => 8.65],

            // --- OTOÑO 2026 ---
            ['title' => 'Bleach: Thousand Year Blood War Part 4', 'synopsis' => 'Ichigo Kurosaki enfrenta la guerra definitiva contra los Quincy.', 'type' => 'tv', 'status' => 'upcoming', 'season' => 'fall', 'year' => 2026, 'studio' => 'Studio Pierrot', 'cover' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx116674-p3zK4PUX2Aag.jpg', 'genres' => ['Acción', 'Sobrenatural'], 'rating' => 8.80],
            ['title' => 'One Piece: Final Saga', 'synopsis' => 'Luffy y su tripulación se acercan al One Piece en la saga final.', 'type' => 'tv', 'status' => 'upcoming', 'season' => 'fall', 'year' => 2026, 'studio' => 'Toei Animation', 'cover' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg', 'genres' => ['Aventura', 'Acción'], 'rating' => 9.05],

            // --- PRIMAVERA 2025 ---
            ['title' => 'Frieren: Beyond Journey\'s End S2', 'synopsis' => 'Frieren continúa su viaje aprendiendo sobre los sentimientos humanos.', 'type' => 'tv', 'status' => 'finished', 'season' => 'spring', 'year' => 2025, 'studio' => 'Madhouse', 'cover' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg', 'genres' => ['Aventura', 'Fantasía'], 'rating' => 9.15],

            // --- VERANO 2025 ---
            ['title' => 'Jujutsu Kaisen Season 3', 'synopsis' => 'El Culling Game escala a nivel global con consecuencias devastadoras.', 'type' => 'tv', 'status' => 'finished', 'season' => 'summer', 'year' => 2025, 'studio' => 'MAPPA', 'cover' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg', 'genres' => ['Acción', 'Sobrenatural'], 'rating' => 8.75],
            ['title' => 'Hell\'s Paradise Season 2', 'synopsis' => 'Los criminal continúan luchando por sobrevivir en la isla Shinsenkyo.', 'type' => 'tv', 'status' => 'finished', 'season' => 'summer', 'year' => 2025, 'studio' => 'MAPPA', 'cover' => 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx128893-Gc2t8b8M0mVu.jpg', 'genres' => ['Acción', 'Sobrenatural'], 'rating' => 8.20],
        ];

        foreach ($simulcastData as $data) {
            $genreIds = [];
            foreach ($data['genres'] as $gName) {
                if (isset($genres[$gName])) $genreIds[] = $genres[$gName];
            }

            $studioObj = null;
            if (isset($studios[$data['studio']])) {
                $studioObj = $studios[$data['studio']];
            }

            $a = Anime::create([
                'title' => $data['title'],
                'slug' => Str::slug($data['title']) . '-' . Str::random(5),
                'synopsis' => $data['synopsis'],
                'type' => $data['type'],
                'status' => $data['status'],
                'age_rating' => 'PG-13',
                'release_year' => $data['year'],
                'broadcast_season' => $data['season'],
                'broadcast_year' => $data['year'],
                'studio_id' => $studioObj?->id,
                'cover_image' => $data['cover'],
                'banner_image' => $data['cover'],
                'logo_image' => '',
                'trailer_url' => '',
                'average_rating' => $data['rating'],
                'ratings_count' => rand(50, 500),
                'is_active' => true,
                'created_by' => 1,
            ]);

            if ($genreIds) {
                $a->genres()->attach($genreIds);
            }

            $s = $a->seasons()->create(['type' => 'season', 'number' => 1, 'title' => 'Temporada 1', 'order' => 1]);
            for ($i = 1; $i <= min(4, rand(4, 12)); $i++) {
                $s->episodes()->create([
                    'number' => $i,
                    'title' => "Episodio $i",
                    'duration_seconds' => 1410,
                    'intro_start' => 30,
                    'intro_end' => 60,
                    'credits_start' => 1280,
                    'video_path' => 'https://files.vidstack.io/sprite-fight/720p.mp4',
                    'thumbnail' => $data['cover'],
                    'release_date' => now()->subWeeks(12 - $i),
                ]);
            }
        }
    }
}
