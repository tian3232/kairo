<?php

namespace App\Services\Subtitles;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;

/**
 * Driver local usando faster-whisper (Python).
 *
 * Requisitos en la máquina (ver .env SUBTITLE_PYTHON / SUBTITLE_SCRIPT):
 *   - ffmpeg instalado y en PATH
 *   - pip install faster-whisper
 *
 * El script scripts/generate_subtitles.py recibe el audio y los idiomas,
 * y devuelve por stdout un JSON: { "ja": [[start,end,text], ...], "en": [...] }.
 * Whisper sólo traduce al inglés de forma nativa; los idiomas adicionales
 * (ej. es) requieren un traductor y se omiten si no está configurado.
 */
class LocalWhisperGenerator implements SubtitleGeneratorInterface
{
    public function generate(string $videoUrl, array $languages): array
    {
        $python = config('services.subtitles.python', 'python');
        $script = config('services.subtitles.script', base_path('scripts/generate_subtitles.py'));
        $sourceLang = config('services.subtitles.source_language', 'ja');

        $audioPath = $this->downloadAudio($videoUrl);

        try {
            $result = Process::timeout(1800)->run([
                $python,
                $script,
                '--audio', $audioPath,
                '--langs', implode(',', $languages),
                '--source', $sourceLang,
            ]);

            if (!$result->successful()) {
                throw new \RuntimeException('Fallo al generar subtítulos: ' . $result->errorOutput());
            }

            $json = json_decode(trim($result->output()), true);

            if (!is_array($json)) {
                throw new \RuntimeException('Salida inválida del generador de subtítulos.');
            }

            $segments = [];
            foreach ($languages as $lang) {
                if (isset($json[$lang]) && is_array($json[$lang])) {
                    $segments[$lang] = array_map(
                        fn ($s) => ['start' => (float) $s[0], 'end' => (float) $s[1], 'text' => (string) $s[2]],
                        $json[$lang]
                    );
                }
            }

            return $segments;
        } finally {
            if ($audioPath && str_starts_with($audioPath, Storage::disk('local')->path('tmp'))) {
                File::delete($audioPath);
            }
        }
    }

    private function downloadAudio(string $videoUrl): string
    {
        if (preg_match('#^https?://#i', $videoUrl)) {
            $tmp = Storage::disk('local')->path('tmp/sub_' . md5($videoUrl . microtime()) . '.mp4');
            File::ensureDirectoryExists(dirname($tmp));
            $content = @file_get_contents($videoUrl);
            if ($content === false) {
                throw new \RuntimeException('No se pudo descargar el vídeo para generar subtítulos.');
            }
            File::put($tmp, $content);
            return $tmp;
        }

        return $videoUrl;
    }
}
