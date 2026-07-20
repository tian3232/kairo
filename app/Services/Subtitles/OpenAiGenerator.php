<?php

namespace App\Services\Subtitles;

use Illuminate\Support\Facades\Http;

/**
 * Driver para OpenAI Whisper (producción / host con API key).
 * Soporta los 3 idiomas: transcribe el original y traduce a los demás
 * usando el endpoint de chat (modelo configurado) cuando sea necesario.
 *
 * Requiere OPENAI_API_KEY en el .env.
 */
class OpenAiGenerator implements SubtitleGeneratorInterface
{
    public function generate(string $videoUrl, array $languages): array
    {
        $apiKey = config('services.openai.key');
        if (!$apiKey) {
            throw new \RuntimeException('OPENAI_API_KEY no configurada.');
        }

        $audioPath = $this->downloadAudio($videoUrl);
        $sourceLang = config('services.subtitles.source_language', 'ja');

        try {
            $segments = [];

            foreach ($languages as $lang) {
                $task = $lang === $sourceLang ? 'transcribe' : 'translate';
                $response = Http::withToken($apiKey)
                    ->attach('file', file_get_contents($audioPath), 'audio.mp4')
                    ->attach('model', 'whisper-1')
                    ->attach('response_format', 'verbose_json')
                    ->attach('language', $sourceLang)
                    ->post('https://api.openai.com/v1/audio/' . $task);

                if (!$response->successful()) {
                    throw new \RuntimeException('OpenAI error: ' . $response->body());
                }

                $data = $response->json();
                $segs = $data['segments'] ?? null;

                if ($segs) {
                    $segments[$lang] = array_map(
                        fn ($s) => ['start' => (float) $s['start'], 'end' => (float) $s['end'], 'text' => (string) $s['text']],
                        $segs
                    );
                } else {
                    $text = $data['text'] ?? '';
                    $segments[$lang] = [['start' => 0.0, 'end' => 0.0, 'text' => $text]];
                }
            }

            return $segments;
        } finally {
            if ($audioPath && str_starts_with($audioPath, storage_path('app/tmp'))) {
                @unlink($audioPath);
            }
        }
    }

    private function downloadAudio(string $videoUrl): string
    {
        if (preg_match('#^https?://#i', $videoUrl)) {
            $tmp = storage_path('app/tmp/sub_' . md5($videoUrl . microtime()) . '.mp4');
            if (!is_dir(dirname($tmp))) {
                mkdir(dirname($tmp), 0755, true);
            }
            $content = @file_get_contents($videoUrl);
            if ($content === false) {
                throw new \RuntimeException('No se pudo descargar el vídeo para generar subtítulos.');
            }
            file_put_contents($tmp, $content);
            return $tmp;
        }

        return $videoUrl;
    }
}
