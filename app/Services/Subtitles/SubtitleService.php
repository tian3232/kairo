<?php

namespace App\Services\Subtitles;

use Illuminate\Support\Facades\Config;

class SubtitleService
{
    public function generator(): SubtitleGeneratorInterface
    {
        $driver = Config::get('services.subtitles.driver', 'local_whisper');

        return match ($driver) {
            'local_whisper' => new LocalWhisperGenerator(),
            'openai' => new OpenAiGenerator(),
            default => throw new \RuntimeException("Driver de subtítulos desconocido: {$driver}"),
        };
    }

    /**
     * Convierte segmentos [start,end,text] a contenido WebVTT.
     */
    public static function toVtt(array $segments): string
    {
        $lines = ["WEBVTT", ""];
        $i = 1;

        foreach ($segments as $seg) {
            $lines[] = (string) $i;
            $lines[] = self::formatTimestamp($seg['start']) . ' --> ' . self::formatTimestamp($seg['end']);
            $lines[] = $seg['text'];
            $lines[] = "";
            $i++;
        }

        return implode("\n", $lines);
    }

    private static function formatTimestamp(float $seconds): string
    {
        $ms = (int) round(($seconds - floor($seconds)) * 1000);
        $s = (int) $seconds;
        $h = intdiv($s, 3600);
        $m = intdiv($s % 3600, 60);
        $s = $s % 60;

        return sprintf('%02d:%02d:%02d.%03d', $h, $m, $s, $ms);
    }
}
