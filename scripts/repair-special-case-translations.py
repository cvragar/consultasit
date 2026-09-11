#!/usr/bin/env python3
"""Repair selected ES translations in the exported catalog using the built-in LLM.

This script only updates exports/special_cases_catalog.json. It never writes to the DB.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
from pathlib import Path

import requests


DEFAULT_INPUT = Path("exports/special_cases_catalog.json")
DEFAULT_IDS = [300001, 30001, 30002]
MODEL = "gpt-5-mini"


def normalize_spanish_translation(value: str) -> str:
    replacements = [
        (r"\bMÚTUA\b", "MUTUA"),
        (r"\bmútua\b", "mutua"),
        (r"\bLlei\b", "Ley"),
        (r"\bpluriocupació\b", "pluriempleo"),
        (r"\bpartes de baja\b", "comunicados de baja"),
        (r"\bparte de baja\b", "comunicado de baja"),
        (r"\bpartes de confirmación\b", "comunicados de confirmación"),
        (r"\bemite el parte\b", "emite el comunicado de baja"),
        (r"\bemite un parte\b", "emite un comunicado de baja"),
    ]
    for pattern, replacement in replacements:
        value = re.sub(pattern, replacement, value, flags=re.IGNORECASE)
    return value


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--ids", nargs="*", type=int, default=DEFAULT_IDS)
    return parser.parse_args()


def translate_record(record: dict, endpoint: str, api_key: str) -> dict:
    schema = {
        "type": "object",
        "properties": {
            "title_es": {"type": "string"},
            "summary_es": {"type": "string"},
            "content_es": {"type": "string"},
        },
        "required": ["title_es", "summary_es", "content_es"],
        "additionalProperties": False,
    }
    source = {
        "title": record["title"],
        "summary": record["summary"],
        "content": record["content"],
    }
    response = requests.post(
        endpoint,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Eres un traductor profesional catalán-español especializado en normativa de "
                        "incapacidad temporal. Traduce fielmente, sin resumir, añadir, interpretar ni "
                        "corregir el contenido jurídico. Conserva toda la estructura Markdown, listas, "
                        "tablas, cifras, artículos, sentencias, siglas y ejemplos. Usa 'comunicado de baja' "
                        "y 'comunicado de alta' para 'comunicat de baixa' y 'comunicat d'alta'. Mantén sin "
                        "traducir eCap, ICAM, INSS, RETA, RGSS, LGSS e IS3. Traduce 'Llei' como 'Ley', "
                        "'pluriocupació' como 'pluriempleo' y 'pluriactivitat' como 'pluriactividad'. "
                        "Conserva nombres propios oficiales. Devuelve "
                        "exclusivamente el JSON solicitado."
                    ),
                },
                {
                    "role": "user",
                    "content": "Traduce al español los tres campos de este caso:\n" + json.dumps(source, ensure_ascii=False),
                },
            ],
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": "special_case_translation",
                    "strict": True,
                    "schema": schema,
                },
            },
            "max_completion_tokens": 80000,
        },
        timeout=240,
    )
    response.raise_for_status()
    payload = response.json()
    content = payload["choices"][0]["message"]["content"]
    if not content:
        raise ValueError(f"Empty translation for case {record['id']}")
    translated = json.loads(content)
    # Existing Spanish titles are curated labels used by the application.
    # Repair only the long text while preserving those stable names.
    translated["title_es"] = record.get("title_es") or translated["title_es"]
    translated["summary_es"] = normalize_spanish_translation(translated["summary_es"])
    translated["content_es"] = normalize_spanish_translation(translated["content_es"])
    validate_translation(record, translated)
    return translated


def validate_translation(source: dict, translated: dict) -> None:
    for source_key, target_key in [
        ("title", "title_es"),
        ("summary", "summary_es"),
        ("content", "content_es"),
    ]:
        source_text = str(source.get(source_key) or "")
        target_text = str(translated.get(target_key) or "")
        if not target_text.strip():
            raise ValueError(f"Missing {target_key} for case {source['id']}")
        if source_key != "title" and len(target_text) < len(source_text) * 0.72:
            raise ValueError(f"Suspiciously short {target_key} for case {source['id']}")
        source_numbers = set(re.findall(r"\d+(?:[.,]\d+)?", source_text))
        target_numbers = set(re.findall(r"\d+(?:[.,]\d+)?", target_text))
        missing_numbers = sorted(source_numbers - target_numbers)
        if missing_numbers:
            raise ValueError(
                f"Translation for case {source['id']} lost numbers in {target_key}: {missing_numbers}"
            )


def main() -> None:
    args = parse_args()
    api_base = os.environ.get("OPENAI_API_BASE", "").rstrip("/")
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_base or not api_key:
        raise RuntimeError("OPENAI_API_BASE/OPENAI_API_KEY are not available")
    endpoint = f"{api_base}/chat/completions"

    records = json.loads(args.input.read_text(encoding="utf-8"))
    by_id = {int(record["id"]): record for record in records}
    missing_ids = [case_id for case_id in args.ids if case_id not in by_id]
    if missing_ids:
        raise ValueError(f"Cases not found: {missing_ids}")

    repaired = {}
    for case_id in args.ids:
        print(f"Translating case {case_id} with {MODEL}...")
        repaired[case_id] = translate_record(by_id[case_id], endpoint, api_key)

    backup = args.input.with_suffix(".before_translation.json")
    shutil.copy2(args.input, backup)
    for case_id, translation in repaired.items():
        by_id[case_id].update(translation)
    args.input.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {len(repaired)} records in {args.input}")
    print(f"Backup: {backup}")


if __name__ == "__main__":
    main()
