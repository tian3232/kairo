<?php

namespace App\Services\Subtitles;

interface SubtitleGeneratorInterface
{
    /**
     * Genera los segmentos de subtítulos para un vídeo.
     *
     * @param string $videoUrl URL o ruta local del vídeo (mp4/hls)
     * @param array $languages Lista de códigos ISO (es, en, ja)
     * @return array Mapa language => lista de segmentos [['start'=>float,'end'=>float,'text'=>string], ...]
     */
    public function generate(string $videoUrl, array $languages): array;
}
