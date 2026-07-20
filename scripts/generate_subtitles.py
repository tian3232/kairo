#!/usr/bin/env python3
"""Genera subtítulos con faster-whisper.

Uso:
  python generate_subtitles.py --audio <ruta> --langs es,en,ja --source ja

Imprime por stdout un JSON:
  {"ja": [[start, end, text], ...], "en": [[start, end, text], ...]}

Notas:
  - Whisper sólo traduce de forma nativa al INGLÉS (task='translate').
  - Para el idioma origen se usa task='transcribe'.
  - Idiomas adicionales (ej. 'es') sin traductor se omiten con un warning.
    Para habilitarlos, conecta aquí un traductor (API o modelo local).
"""
import argparse
import json
import sys


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--audio", required=True)
    parser.add_argument("--langs", default="ja,en")
    parser.add_argument("--source", default="ja")
    args = parser.parse_args()

    langs = [l.strip() for l in args.langs.split(",") if l.strip()]
    source = args.source

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print(json.dumps({}), file=sys.stderr)
        print("ERROR: faster-whisper no instalado. Ejecuta: pip install faster-whisper", file=sys.stderr)
        sys.exit(1)

    model_size = "base"
    model = WhisperModel(model_size, device="cpu", compute_type="int8")

    result = {}

    for lang in langs:
        if lang == source:
            segments, _ = model.transcribe(args.audio, language=source, task="transcribe")
        elif lang == "en":
            # Whisper traduce cualquier idioma al inglés de forma nativa.
            segments, _ = model.transcribe(args.audio, language=source, task="translate")
        else:
            # Sin traductor configurado se omite este idioma.
            print(f"ADVERTENCIA: idioma '{lang}' omitido (requiere traductor).", file=sys.stderr)
            continue

        result[lang] = [[s.start, s.end, s.text.strip()] for s in segments]

    print(json.dumps(result))


if __name__ == "__main__":
    main()
