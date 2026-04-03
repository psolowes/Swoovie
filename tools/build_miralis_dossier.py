#!/usr/bin/env python3
"""Generate a dealer-oriented Miralis cabinetry dossier from structured source data."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


def money_band(label: str) -> str:
    bands = {
        "entry": "$",
        "mid": "$$",
        "upper_mid": "$$$",
        "premium": "$$$$",
        "ultra": "$$$$$",
    }
    return bands[label]


def build_markdown(payload: dict) -> str:
    meta = payload["meta"]
    offering = payload["product_offering"]
    analysis = payload["commercial_analysis"]

    lines: list[str] = []
    lines.append(f"# {meta['brand']} Dealer-Level Product Dossier")
    lines.append("")
    lines.append(f"- Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    lines.append(f"- Source dataset date: {meta['generated_on']}")
    lines.append("- Audience: enthusiast / pre-dealer research")
    lines.append("")

    lines.append("## Source Register")
    for src in payload["sources"]:
      lines.append(f"### {src['title']}")
      lines.append(f"- URL: {src['url']}")
      lines.append("- Highlights:")
      for h in src["highlights"]:
          lines.append(f"  - {h}")
      lines.append(f"- Evidence markers: {', '.join(src['evidence_lines'])}")
      lines.append("")

    lines.append("## Product Offering Map")
    lines.append("### Door and Collection Matrix")
    for row in offering["door_models"]:
      lines.append(f"- **{row['collection']}**: {', '.join(row['models'])}")
    lines.append("")

    lines.append("### Color Program (Examples)")
    for color in offering["color_examples"]:
      lines.append(f"- {color}")
    lines.append("")

    lines.append("### Construction and Configuration Options")
    for item in offering["construction_options"]:
      lines.append(f"- {item}")
    lines.append("")

    lines.append("### Hardware and Accessory Program")
    for item in offering["hardware_and_accessories"]:
      lines.append(f"- {item}")
    lines.append("")

    lines.append("## Price / Cost / Durability / Value Assessment")
    lines.append("### Price Driver Heuristics")
    for item in analysis["price_drivers"]:
      lines.append(f"- {item}")
    lines.append("")

    lines.append("### Durability Signals")
    for item in analysis["durability_factors"]:
      lines.append(f"- {item}")
    lines.append("")

    lines.append("### Value Ladder")
    lines.append("| Tier | Typical Program | Relative Price Band | Value Summary |")
    lines.append("|---|---|---:|---|")
    lines.append(f"| Entry | Laminate | {money_band('entry')} | Broad color map, practical durability, best budget efficiency. |")
    lines.append(f"| Mid | Similacquer | {money_band('mid')} | Better visual finish depth + humidity claim, balanced investment. |")
    lines.append(f"| Upper Mid | Lacquer | {money_band('upper_mid')} | Premium finish process and design flexibility. |")
    lines.append(f"| Premium | Advanced Engineering / FENIX | {money_band('premium')} | High-end tactile/surface positioning with curated colorways. |")
    lines.append(f"| Ultra | Wood + custom integrations | {money_band('ultra')} | Material prestige and customization intensity. |")
    lines.append("")

    lines.append("### Missing Inputs Required for True Dealer-Level Quoting")
    for item in analysis["missing_for_true_dealer_pricing"]:
      lines.append(f"- {item}")
    lines.append("")

    lines.append("## Next Data Pull Checklist")
    lines.append("- Ask an authorized Miralis dealer for current order workbook and line-item price book export.")
    lines.append("- Capture modification code pricing (reduced depth, custom fillers, special panel dimensions).")
    lines.append("- Capture lead-time tiers and freight policy by region.")
    lines.append("- Normalize all data to a spreadsheet model for comparable project-level quotes.")

    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default="data/miralis/dealer_sources.json")
    parser.add_argument("--output", default="reports/miralis_dealer_dossier.md")
    args = parser.parse_args()

    payload = json.loads(Path(args.input).read_text())
    markdown = build_markdown(payload)
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(markdown)
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
