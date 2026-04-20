from __future__ import annotations

import json
import re
import zlib
from pathlib import Path
from typing import Iterable
from urllib.parse import urlparse, urlunparse


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "src" / "data" / "finance-firms.json"
SOURCE_FILES = [
    ROOT / "firm-list-1.pdf",
    ROOT / "firm-list-2.pdf",
]

PDF_TEXT_SHIFT = 29
INVALID_WEBSITE_VALUES = {"", "-", "--", "n/a", "na", "none", "null", "tbd"}
LEGAL_SUFFIXES = {
    "co",
    "company",
    "corp",
    "corporation",
    "inc",
    "incorporated",
    "limited",
    "llc",
    "llp",
    "lp",
    "ltd",
    "plc",
}
INSTITUTIONAL_KEYWORDS = (
    "bank of america",
    "barclays",
    "bbva",
    "bnp paribas",
    "cibc",
    "citigroup",
    "credit suisse",
    "deutsche bank",
    "goldman sachs",
    "hsbc",
    "jpmorgan",
    "morgan stanley",
    "nomura",
    "santander",
    "societe generale",
    "ubs",
    "wells fargo",
)

TEXT_BLOCK_PATTERN = re.compile(
    rb"BT\s+0\s+Tr\s+/[^\s]+\s+[0-9.]+\s+Tf\s+1\.0\s+0\s+0\s+-1\.0\s+([0-9.]+)\s+([0-9.]+)\s+Tm\s+0\s+0\s+Td\s+(.*?)\s+(Tj|TJ)\s+ET",
    re.S,
)


def parse_pdf_literal_strings(chunk: bytes) -> list[bytes]:
    parts: list[bytes] = []
    index = 0

    while index < len(chunk):
        if chunk[index:index + 1] != b"(":
            index += 1
            continue

        index += 1
        depth = 1
        buffer = bytearray()

        while index < len(chunk) and depth > 0:
            value = chunk[index]

            if value == 0x5C:
                index += 1
                if index >= len(chunk):
                    break

                escaped = chunk[index]
                simple_map = {
                    ord("n"): b"\n",
                    ord("r"): b"\r",
                    ord("t"): b"\t",
                    ord("b"): b"\b",
                    ord("f"): b"\f",
                    ord("("): b"(",
                    ord(")"): b")",
                    ord("\\"): b"\\",
                }
                if escaped in simple_map:
                    buffer.extend(simple_map[escaped])
                elif 48 <= escaped <= 55:
                    octal = bytes([escaped])
                    octal_length = 0
                    while index + 1 < len(chunk) and octal_length < 2 and 48 <= chunk[index + 1] <= 55:
                        index += 1
                        octal += bytes([chunk[index]])
                        octal_length += 1
                    buffer.append(int(octal, 8))
                else:
                    buffer.append(escaped)
            elif value == 0x28:
                depth += 1
                buffer.append(value)
            elif value == 0x29:
                depth -= 1
                if depth > 0:
                    buffer.append(value)
            else:
                buffer.append(value)

            index += 1

        parts.append(bytes(buffer))

    return parts


def decode_pdf_text(raw: bytes) -> str:
    decoded = raw.decode("utf-16-be") if b"\x00" in raw else raw.decode("latin1")
    return "".join(chr(ord(character) + PDF_TEXT_SHIFT) for character in decoded)


def clean_text(value: str | None) -> str | None:
    if value is None:
        return None

    cleaned = re.sub(r"\s+", " ", value).strip()
    if not cleaned:
        return None

    return cleaned


def normalize_website(value: str | None) -> str | None:
    cleaned = clean_text(value)
    if not cleaned or cleaned.lower() in INVALID_WEBSITE_VALUES:
        return None

    candidate = cleaned
    if not re.match(r"^[a-z]+://", candidate, re.I):
        candidate = f"https://{candidate.lstrip('/')}"

    parsed = urlparse(candidate)
    hostname = (parsed.netloc or parsed.path).lower().strip()
    hostname = hostname.removeprefix("www.")
    if not hostname or "." not in hostname:
        return None

    path = parsed.path if parsed.netloc else ""
    if path in {"", "/"}:
        path = ""
    else:
        path = path.rstrip("/")

    return urlunparse(("https", hostname, path, "", "", ""))


def domain_key(url: str | None) -> str | None:
    if not url:
        return None

    hostname = urlparse(url).netloc.lower()
    return hostname.removeprefix("www.")


def canonical_name(name: str) -> str:
    normalized = name.lower().replace("&", " and ")
    tokens = re.findall(r"[a-z0-9]+", normalized)
    while tokens and tokens[-1] in LEGAL_SUFFIXES:
        tokens.pop()
    return " ".join(tokens)


def ends_with_legal_suffix(name: str) -> bool:
    tokens = re.findall(r"[a-z0-9]+", name.lower())
    return bool(tokens and tokens[-1] in LEGAL_SUFFIXES)


def name_score(name: str) -> tuple[int, int, int]:
    return (
        0 if ends_with_legal_suffix(name) else 1,
        0 if "," in name else 1,
        -abs(len(name) - 24),
    )


def choose_display_name(names: Iterable[str]) -> str:
    unique_names = sorted(set(names))
    return max(unique_names, key=name_score)


def token_overlap(left: str, right: str) -> float:
    left_tokens = set(left.split())
    right_tokens = set(right.split())
    if not left_tokens or not right_tokens:
        return 0.0
    return len(left_tokens & right_tokens) / len(left_tokens | right_tokens)


def is_same_firm(existing: dict, candidate: dict) -> bool:
    if existing["canonicalName"] == candidate["canonicalName"]:
        return True

    if existing["domain"] and existing["domain"] == candidate["domain"]:
        return token_overlap(existing["canonicalName"], candidate["canonicalName"]) >= 0.45

    return False


def choose_website(current: str | None, candidate: str | None) -> str | None:
    if not current:
        return candidate
    if not candidate:
        return current

    current_path = urlparse(current).path
    candidate_path = urlparse(candidate).path
    if len(candidate_path) < len(current_path):
        return candidate
    return current


def infer_boutique_status(name: str, market_symbol: str | None) -> str:
    normalized = name.lower()
    if any(keyword in normalized for keyword in INSTITUTIONAL_KEYWORDS):
        return "institutional"
    if " bank " in f" {normalized} " and "investment bank" not in normalized:
        return "institutional"
    if market_symbol and market_symbol.lower().startswith(("nyse:", "nasdaq", "otc")):
        return "boutique"
    return "boutique"


def derive_category(name: str, focus_area: str | None) -> str:
    normalized = name.lower()
    if focus_area and "investment banking" in focus_area.lower():
        return "Investment Banking"
    if "securities" in normalized or "markets" in normalized:
        return "Capital Markets"
    if "bank" in normalized:
        return "Banking"
    if any(keyword in normalized for keyword in ("capital", "partners", "advisors", "advisory")):
        return "Advisory"
    return "Finance"


def summarize_firm(name: str, location: str | None, focus_area: str | None, boutique_status: str) -> str:
    location_phrase = location or "no listed location"
    focus_phrase = focus_area.lower() if focus_area else "finance and advisory work"

    if boutique_status == "institutional":
        return (
            f"{name} appears in Innovare's directory as an institutional organization with "
            f"{location_phrase} coverage and visible activity in {focus_phrase}."
        )

    return (
        f"{name} appears in Innovare's directory as an independent organization with "
        f"{location_phrase} coverage and visible activity in {focus_phrase}."
    )


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "firm"


def extract_rows(pdf_path: Path) -> list[list[str]]:
    payload = pdf_path.read_bytes()
    page_references = [
        int(reference)
        for reference in re.findall(rb"/Type\s*/Page\b.*?/Contents\s+(\d+)\s+0\s+R", payload, re.S)
    ]

    all_rows: list[list[str]] = []

    for reference in page_references:
        stream_match = re.search(
            rb"%d\s+0\s+obj\s*<<.*?stream\n(.*?)\nendstream" % reference,
            payload,
            re.S,
        )
        if not stream_match:
            continue

        stream = zlib.decompress(stream_match.group(1))
        cells: list[tuple[float, float, str]] = []

        for x_value, y_value, raw_payload, _operator in TEXT_BLOCK_PATTERN.findall(stream):
            text = "".join(
                decode_pdf_text(fragment) for fragment in parse_pdf_literal_strings(raw_payload)
            ).strip()
            cleaned_text = clean_text(text)
            if cleaned_text:
                cells.append((float(x_value), float(y_value), cleaned_text))

        page_rows: dict[float, list[tuple[float, str]]] = {}
        for x_value, y_value, text in cells:
            page_rows.setdefault(round(y_value, 1), []).append((x_value, text))

        for y_value in sorted(page_rows):
            row = [text for _, text in sorted(page_rows[y_value])]
            all_rows.append(row)

    return all_rows


def build_records() -> list[dict]:
    raw_entries: list[dict] = []

    first_source_rows = extract_rows(SOURCE_FILES[0])
    for row in first_source_rows:
        if len(row) != 5:
            continue

        raw_entries.append(
            {
                "name": row[0],
                "marketSymbol": None if row[1] == "-" else row[1],
                "focusArea": None if row[2] == "-" else row[2],
                "location": None if row[3] == "-" else row[3],
                "website": row[4],
                "sourceFiles": [SOURCE_FILES[0].name],
            }
        )

    second_source_rows = extract_rows(SOURCE_FILES[1])
    for row in second_source_rows:
        if len(row) != 2:
            continue

        raw_entries.append(
            {
                "name": row[0],
                "marketSymbol": None,
                "focusArea": None,
                "location": None,
                "website": row[1],
                "sourceFiles": [SOURCE_FILES[1].name],
            }
        )

    normalized_entries = []
    for entry in raw_entries:
        normalized_url = normalize_website(entry["website"])
        if not normalized_url:
            continue

        normalized_entries.append(
            {
                **entry,
                "website": normalized_url,
                "domain": domain_key(normalized_url),
                "canonicalName": canonical_name(entry["name"]),
            }
        )

    merged_entries: list[dict] = []
    for entry in normalized_entries:
        match = next((item for item in merged_entries if is_same_firm(item, entry)), None)

        if not match:
            merged_entries.append(
                {
                    "names": [entry["name"]],
                    "canonicalName": entry["canonicalName"],
                    "domain": entry["domain"],
                    "website": entry["website"],
                    "marketSymbol": entry["marketSymbol"],
                    "focusArea": entry["focusArea"],
                    "location": entry["location"],
                    "sourceFiles": list(entry["sourceFiles"]),
                }
            )
            continue

        match["names"].append(entry["name"])
        match["website"] = choose_website(match["website"], entry["website"])
        match["marketSymbol"] = match["marketSymbol"] or entry["marketSymbol"]
        match["focusArea"] = match["focusArea"] or entry["focusArea"]
        match["location"] = match["location"] or entry["location"]
        match["sourceFiles"] = sorted(set(match["sourceFiles"] + entry["sourceFiles"]))

    output_records = []
    for merged in merged_entries:
        name = choose_display_name(merged["names"])
        boutique_status = infer_boutique_status(name, merged["marketSymbol"])
        category = derive_category(name, merged["focusArea"])
        aliases = sorted(alias for alias in set(merged["names"]) if alias != name)
        notes_parts = []
        if merged["marketSymbol"]:
            notes_parts.append(f"Market symbol: {merged['marketSymbol']}")
        if aliases:
            notes_parts.append("Aliases: " + ", ".join(aliases[:3]))

        output_records.append(
            {
                "id": slugify(name),
                "name": name,
                "website": merged["website"],
                "domain": merged["domain"],
                "boutiqueStatus": boutique_status,
                "marketSymbol": merged["marketSymbol"],
                "category": category,
                "focusArea": merged["focusArea"],
                "location": merged["location"] or "Location not provided",
                "summary": summarize_firm(
                    name,
                    merged["location"],
                    merged["focusArea"],
                    boutique_status,
                ),
                "notes": " | ".join(notes_parts) if notes_parts else None,
                "aliases": aliases,
                "sourceFiles": merged["sourceFiles"],
            }
        )

    output_records.sort(key=lambda item: item["name"].lower())
    return output_records


def main() -> None:
    records = build_records()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(records, indent=2) + "\n", encoding="utf-8")

    print(
        json.dumps(
            {
                "written": str(OUTPUT_PATH.relative_to(ROOT)),
                "count": len(records),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
