from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse, urlunparse
from xml.etree import ElementTree as ET
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "src" / "data" / "film-firms.json"
NAMESPACES = {
    "a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}
INVALID_WEBSITE_VALUES = {"", "-", "--", "n/a", "na", "none", "null"}
FOCUS_LABELS = {
    "NY": "New York production",
    "CA": "California production",
    "Other": "General film production",
}


def normalize_website(value: str | None) -> str | None:
    cleaned = (value or "").strip()
    if not cleaned or cleaned.lower() in INVALID_WEBSITE_VALUES:
        return None

    if not re.match(r"^[a-z]+://", cleaned, re.I):
        cleaned = f"https://{cleaned.lstrip('/')}"

    parsed = urlparse(cleaned)
    hostname = (parsed.netloc or parsed.path).lower().strip().removeprefix("www.")
    if not hostname or "." not in hostname:
        return None

    path = parsed.path if parsed.netloc else ""
    if path in {"", "/"}:
        path = ""
    else:
        path = path.rstrip("/")

    return urlunparse(("https", hostname, path, "", "", ""))


def create_slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-") or "film-firm"


def parse_workbook_rows(source_path: Path, sheet_name: str) -> list[dict[str, str]]:
    with ZipFile(source_path) as workbook:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in workbook.namelist():
            shared_root = ET.fromstring(workbook.read("xl/sharedStrings.xml"))
            for string_item in shared_root.findall("a:si", NAMESPACES):
                shared_strings.append(
                    "".join(text.text or "" for text in string_item.findall(".//a:t", NAMESPACES))
                )

        workbook_root = ET.fromstring(workbook.read("xl/workbook.xml"))
        rels_root = ET.fromstring(workbook.read("xl/_rels/workbook.xml.rels"))
        target_map = {
            relation.attrib["Id"]: relation.attrib["Target"].lstrip("/")
            for relation in rels_root
        }

        worksheet_root = None
        for sheet in workbook_root.find("a:sheets", NAMESPACES):
            if sheet.attrib["name"] != sheet_name:
                continue
            relation_id = sheet.attrib[
                "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
            ]
            worksheet_root = ET.fromstring(workbook.read(target_map[relation_id]))
            break

        if worksheet_root is None:
            raise ValueError(f"Sheet '{sheet_name}' not found in {source_path}")

        def cell_value(cell: ET.Element) -> str:
            cell_type = cell.attrib.get("t")
            value_node = cell.find("a:v", NAMESPACES)
            inline_node = cell.find("a:is", NAMESPACES)

            if cell_type == "s" and value_node is not None and value_node.text is not None:
                return shared_strings[int(value_node.text)]

            if cell_type == "inlineStr" and inline_node is not None:
                return "".join(text.text or "" for text in inline_node.findall(".//a:t", NAMESPACES))

            return value_node.text or "" if value_node is not None else ""

        rows = worksheet_root.findall(".//a:sheetData/a:row", NAMESPACES)
        if not rows:
            return []

        headers = [cell_value(cell) for cell in rows[0].findall("a:c", NAMESPACES)]
        records: list[dict[str, str]] = []

        for row in rows[1:]:
            values = [cell_value(cell) for cell in row.findall("a:c", NAMESPACES)]
            if not any(values):
                continue

            records.append(dict(zip(headers, values)))

        return records


def build_dataset(source_path: Path) -> list[dict]:
    records = parse_workbook_rows(source_path, "Firms")
    dataset: list[dict] = []

    for record in records:
        website = normalize_website(record.get("Website"))
        if not website:
            continue

        name = (record.get("Company Name") or "").strip()
        if not name:
            continue

        city = (record.get("City") or "").strip() or "City not provided"
        state = (record.get("State") or "").strip() or "State not provided"
        region = (record.get("Region") or "").strip() or "Region not provided"
        raw_focus = (record.get("Focus") or "").strip() or "Other"
        focus = FOCUS_LABELS.get(raw_focus, raw_focus)
        size = ((record.get("Size") or "").strip() or "Small").lower()
        notes = (record.get("Notes") or "").strip() or None
        source_url = normalize_website(record.get("Source URL"))
        summary = (
            f"{name} is listed in Innovare's film database as a {size} film company in "
            f"{city}, {state}, with {focus.lower()} and {region.lower()} coverage."
        )

        dataset.append(
            {
                "id": create_slug(name),
                "name": name,
                "website": website,
                "domain": urlparse(website).netloc.lower().removeprefix("www."),
                "size": "large" if size == "large" else "small",
                "sizeBasis": (record.get("Size Basis") or "").strip() or "size not specified",
                "city": city,
                "state": state,
                "region": region,
                "focus": focus,
                "address": (record.get("Address") or "").strip() or None,
                "summary": summary,
                "notes": notes,
                "sourceUrl": source_url,
            }
        )

    return sorted(dataset, key=lambda item: item["name"].lower())


def main() -> None:
    if len(sys.argv) > 1:
        source_path = Path(sys.argv[1]).expanduser().resolve()
    else:
        raise SystemExit("Usage: python scripts/build_film_dataset.py /path/to/workbook.xlsx")

    film_firms = build_dataset(source_path)
    OUTPUT_PATH.write_text(json.dumps(film_firms, indent=2) + "\n")
    print(f"Wrote {len(film_firms)} film firms to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
