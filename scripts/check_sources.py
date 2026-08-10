#!/usr/bin/env python3
"""Detect changes in FilmRate's public source registry without publishing rates."""

from __future__ import annotations

import hashlib
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "data" / "monitored-sources.json"
STATE = ROOT / "data" / "source-state.json"
REPORT = ROOT / "source-change-report.md"


class PageDigest(HTMLParser):
    def __init__(self, base_url: str) -> None:
        super().__init__()
        self.base_url = base_url
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag != "a":
            return
        href = dict(attrs).get("href")
        if href:
            self.parts.append("LINK " + urljoin(self.base_url, href.strip()))

    def handle_data(self, data: str) -> None:
        text = re.sub(r"\s+", " ", data).strip()
        if text:
            self.parts.append(text)


def download(source: dict[str, str]) -> bytes:
    request = urllib.request.Request(
        source["url"],
        headers={"User-Agent": "FilmRate source monitor/1.0 (+https://filmrate.ru)"},
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        payload = response.read()
    if source["kind"] == "html":
        parser = PageDigest(source["url"])
        parser.feed(payload.decode("utf-8", "replace"))
        payload = "\n".join(parser.parts).encode("utf-8")
    return payload


def main() -> int:
    sources = json.loads(CONFIG.read_text(encoding="utf-8"))
    previous = json.loads(STATE.read_text(encoding="utf-8")) if STATE.exists() else {}
    current = dict(previous)
    changes: list[dict[str, str]] = []
    errors: list[str] = []
    checked_at = datetime.now(timezone.utc).isoformat(timespec="seconds")

    for source in sources:
        try:
            digest = hashlib.sha256(download(source)).hexdigest()
        except Exception as error:
            errors.append(f"- **{source['name']}**: {type(error).__name__}: {error}")
            continue

        old = previous.get(source["id"], {})
        current[source["id"]] = {
            "name": source["name"],
            "url": source["url"],
            "sha256": digest,
            "checked_at": old.get("checked_at", checked_at) if old.get("sha256") == digest else checked_at,
        }
        if old.get("sha256") and old["sha256"] != digest:
            changes.append(source)

    STATE.write_text(json.dumps(current, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = ["# Проверка источников FilmRate", "", f"Проверено: {checked_at}", ""]
    if changes:
        lines += ["## Обнаружены изменения", ""]
        for source in changes:
            lines.append(f"- [{source['name']}]({source['url']})")
        lines += [
            "",
            "> Ставки на сайте автоматически не изменены. Нужно открыть первоисточник, проверить цифры, единицы и условия, затем подтвердить обновление базы.",
        ]
    else:
        lines += ["Изменений в содержимом источников не обнаружено."]
    if errors:
        lines += ["", "## Ошибки проверки", "", *errors]
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")

    output = os.environ.get("GITHUB_OUTPUT")
    if output:
        with open(output, "a", encoding="utf-8") as file:
            file.write(f"changed={'true' if changes else 'false'}\n")
            file.write(f"errors={'true' if errors else 'false'}\n")
    print("\n".join(lines))
    return 0 if not errors else 2


if __name__ == "__main__":
    sys.exit(main())
