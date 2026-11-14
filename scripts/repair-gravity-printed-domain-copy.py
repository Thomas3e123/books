#!/usr/bin/env python3
"""Remove stale publisher-domain copy from public Gravity PDF resources.

The original editable sources for these archived PDFs are not stored in this
repository. This targeted pass redacts only the affected PDF text and redraws
the corrected copy in place, keeping page design, existing links, and other
content intact.
"""
from __future__ import annotations

import io
import hashlib
import re
import zipfile
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
OLD = "thomasmonroebooks.com"
NEW = "gravityleadershipsystem.com"

COMPANIONS = [
    "assets/downloads/book-companion-tools/BAR_BEVERAGE_INVENTORY_ORDERING_FORMS_COMPANION_PACK_v1.0.pdf",
    "assets/downloads/book-companion-tools/SYSTEMS_OF_SERVICE_PLANNING_TEAM_TOOLS_COMPANION_PACK_v1.0.pdf",
    "assets/downloads/book-companion-tools/EMPLOYEE_TRAINING_SOP_FORMS_COMPANION_PACK_v1.0.pdf",
    "assets/downloads/book-companion-tools/QUIET_GRAVITY_MANAGER_REFLECTIONS_COMPANION_PACK_v1.0.pdf",
    "assets/downloads/book-companion-tools/THE_OWNERS_CHAIR_LEADERSHIP_TOOLS_COMPANION_PACK_v1.0.pdf",
    "assets/downloads/book-companion-tools/SOP_STATION_OPERATIONS_FORMS_COMPANION_PACK_v1.0.pdf",
    "assets/downloads/book-companion-tools/FOOD_COST_WASTE_INVENTORY_FORMS_COMPANION_PACK_v1.0.pdf",
    "assets/downloads/book-companion-tools/BAR_BEVERAGE_POUR_COST_FORMS_COMPANION_PACK_v1.0.pdf",
]
GENERAL = [
    "assets/free-resources/ai/RESTAURANT_AI_PROMPTS_AND_SYSTEMS_WORKBOOK_325_PROMPTS_2026-10-20.pdf",
    "assets/customer-resources/current/Gravity_System_Overview_v1.8_2026-10-10.pdf",
    "assets/customer-resources/current/Gravity_Start_Here_v2.6_2026-10-10.pdf",
]
ONE_PAGE_AD = "assets/samples/the-complete-gravity-system-one-page-ad.pdf"
CUSTOMER_OVERVIEW = "assets/customer-resources/master/The_Gravity_System_Customer_Overview_Booklet_v1.7_2026-09-23.pdf"
BACKLINK_LABEL = "More Gravity resources: gravityleadershipsystem.com"

FONT_FILES = {
    "DejaVuSans": ("GravityFix-DejaVuSans", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    "LiberationSans": ("GravityFix-LiberationSans", "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"),
    "LiberationSans-Bold": ("GravityFix-LiberationSans-Bold", "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"),
}


def font_resource(page: fitz.Page, font: str) -> str:
    if font == "Helvetica":
        return "helv"
    if font == "Helvetica-Bold":
        return "hebo"
    name, path = FONT_FILES.get(font, ("", ""))
    if name and Path(path).exists():
        page.insert_font(fontname=name, fontfile=path)
        return name
    raise RuntimeError(f"No installed font mapping for PDF font {font!r}")


def color_tuple(value: int) -> tuple[float, float, float]:
    return (((value >> 16) & 255) / 255,
            ((value >> 8) & 255) / 255,
            (value & 255) / 255)


def page_color(page: fitz.Page, x: float, y: float) -> tuple[float, float, float]:
    pix = page.get_pixmap(matrix=fitz.Matrix(1, 1), alpha=False)
    px = min(max(int(x - pix.x), 0), pix.width - 1)
    py = min(max(int(y - pix.y), 0), pix.height - 1)
    offset = (py * pix.width + px) * pix.n
    return tuple(pix.samples[offset + i] / 255 for i in range(3))


def redact(page: fitz.Page, rect: fitz.Rect, fill: tuple[float, float, float]) -> None:
    page.add_redact_annot(rect, fill=fill, cross_out=False)


def replace_span(page: fitz.Page, span: dict, replacement: str,
                 *, centered_at: float | None = None,
                 fill: tuple[float, float, float] | None = None,
                 underline: bool = False) -> None:
    box = fitz.Rect(span["bbox"])
    if fill is None:
        fill = page_color(page, max(3, box.x0 - 3), (box.y0 + box.y1) / 2)
    redact(page, box + (-1, -0.4, 1, 1.3), fill)
    page.apply_redactions(images=0, graphics=0, text=0)
    resource = font_resource(page, span["font"])
    font_file = FONT_FILES.get(span["font"], (None, None))[1]
    font = fitz.Font(fontname=resource) if resource in ("helv", "hebo") else fitz.Font(fontfile=font_file)
    width = font.text_length(replacement, fontsize=span["size"])
    x = centered_at - width / 2 if centered_at is not None else span["origin"][0]
    baseline = span["origin"][1]
    page.insert_text((x, baseline), replacement, fontname=resource,
                     fontsize=span["size"], color=color_tuple(span["color"]))
    # Keep the displayed Gravity destination usable after PDF redaction, which
    # removes link annotations that overlap the redacted text.
    lower = replacement.casefold()
    url_start = lower.find(NEW.casefold())
    if url_start >= 0:
        tail = replacement[url_start:]
        url_text = tail.split()[0].rstrip(".,;:)")
        prefix = replacement[:url_start]
        prefix_width = font.text_length(prefix, fontsize=span["size"])
        url_width = font.text_length(url_text, fontsize=span["size"])
        visible_url = url_text
        if visible_url.casefold().startswith(NEW.casefold()):
            uri = "https://" + visible_url
        else:
            uri = "https://" + NEW
        link_rect = fitz.Rect(x + prefix_width, box.y0 - 0.2,
                              x + prefix_width + url_width, box.y1 + 2.0)
        page.insert_link({"kind": fitz.LINK_URI, "from": link_rect, "uri": uri})
        y = box.y1 + 1.0
        page.draw_line((x + prefix_width, y),
                       (x + prefix_width + url_width, y),
                       color=color_tuple(span["color"]), width=0.45)
    elif underline:
        y = box.y1 + 1.0
        page.draw_line((x, y), (x + width, y), color=color_tuple(span["color"]), width=0.45)


def domain_spans(page: fitz.Page) -> list[tuple[dict, str]]:
    found = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            for span in line["spans"]:
                if OLD.casefold() in span["text"].casefold():
                    found.append((span, span["text"]))
    return found


def patch_general(path: Path) -> bool:
    doc = fitz.open(path)
    changed = False
    for page in doc:
        spans = domain_spans(page)
        if not spans:
            continue
        links = page.get_links()
        for span, original in spans:
            new_text = original.replace("ThomasMonroeBooks.com", NEW)
            new_text = new_text.replace("THOMASMONROEBOOKS.COM", NEW.upper())
            new_text = new_text.replace(OLD, NEW)
            new_text = new_text.replace(OLD.upper(), NEW.upper())
            if new_text == original:
                continue
            box = fitz.Rect(span["bbox"])
            underline = any(fitz.Rect(link["from"]).intersects(box) for link in links)
            replace_span(page, span, new_text, underline=underline)
            changed = True
    if changed:
        data = io.BytesIO()
        doc.save(data, garbage=4, deflate=True)
        doc.close()
        path.write_bytes(data.getvalue())
    else:
        doc.close()
    return changed


def patch_companion(path: Path) -> bool:
    doc = fitz.open(path)
    page = doc[1]
    text = page.get_text()
    if OLD.casefold() not in text.casefold():
        doc.close()
        return False
    # Replace only the three-line control note. The rewritten version is more
    # direct and keeps the current-release destination on the Gravity site.
    fill = page_color(page, 10, 10)
    area = fitz.Rect(54, 325, 558, 378)
    redact(page, area, fill)
    page.apply_redactions(images=0, graphics=0, text=0)
    note = (
        "Use only the tools that solve a real operating need. Assign an owner, train the standard, and preserve required records. "
        "Current approved releases: gravityleadershipsystem.com/releases. This pack does not replace legal, safety, employment, "
        "accounting, or regulatory guidance."
    )
    page.insert_textbox(area, note, fontname="helv", fontsize=10.5,
                        color=(38 / 255, 52 / 255, 71 / 255), lineheight=1.3)
    for hit in page.search_for(NEW + "/releases"):
        page.insert_link({"kind": fitz.LINK_URI,
                          "from": fitz.Rect(hit.x0, hit.y0 - 0.2, hit.x1, hit.y1 + 2),
                          "uri": "https://" + NEW + "/releases"})
    data = io.BytesIO()
    doc.save(data, garbage=4, deflate=True)
    doc.close()
    path.write_bytes(data.getvalue())
    return True


def patch_ad(path: Path) -> bool:
    doc = fitz.open(path)
    page = doc[0]
    spans = domain_spans(page)
    if not spans:
        doc.close()
        return False
    span, _ = spans[0]
    fill = page_color(page, 58, 571)
    replace_span(page, span,
                 "START WITH ONE PROBLEM  •  GRAVITYLEADERSHIPSYSTEM.COM",
                 centered_at=306, fill=fill)
    data = io.BytesIO()
    doc.save(data, garbage=4, deflate=True)
    doc.close()
    path.write_bytes(data.getvalue())
    return True


def patch_customer_overview(path: Path) -> bool:
    doc = fitz.open(path)
    cover = doc[0]
    cover_spans = domain_spans(cover)
    if cover_spans:
        span, _ = cover_spans[0]
        replace_span(cover, span, "A Customer Overview Booklet for Gravity",
                     centered_at=309, fill=page_color(cover, 5, 5))

    last = doc[29]
    # The old source paragraph is rewritten as a short factual note so the new
    # destination does not collide with the adjacent release-history text.
    old_domain_spans = domain_spans(last)
    if old_domain_spans:
        fill = page_color(last, 5, 5)
        area = fitz.Rect(63, 449, 557, 513)
        redact(last, area, fill)
        last.apply_redactions(images=0, graphics=0, text=0)
        note = (
            "This overview was compiled from public Gravity pages and linked downloads, reviewed through September 16, 2026. "
            "Sources included books and workbooks, system manuals and forms, installation materials, improvement plans, the AI "
            "workbook, daily forms, operational logs, release notes, and supporting guides."
        )
        last.insert_textbox(area, note, fontname="helv", fontsize=10,
                            color=(0, 0, 0), lineheight=1.25)
        # Refresh the address label and value in the existing shaded box.
        for span, original in domain_spans(last):
            replacement = original.replace("CURRENT PUBLIC ADDRESS", "CURRENT GRAVITY ADDRESS")
            replacement = replacement.replace("ThomasMonroeBooks.com", NEW)
            if replacement != original:
                replace_span(last, span, replacement,
                             fill=page_color(last, 68, 575))
    changed = bool(cover_spans or old_domain_spans)
    if changed:
        data = io.BytesIO()
        doc.save(data, garbage=4, deflate=True)
        path.write_bytes(data.getvalue())
    doc.close()
    return changed


def gravity_link_count(doc: fitz.Document) -> int:
    return sum(1 for page in doc for link in page.get_links()
               if NEW in link.get("uri", "").casefold())


def make_printed_hosts_clickable(page: fitz.Page) -> bool:
    hits = page.search_for(NEW)
    if not hits:
        return False
    for hit in hits:
        rect = fitz.Rect(hit.x0 - 0.4, hit.y0 - 0.2, hit.x1 + 0.4, hit.y1 + 2)
        page.insert_link({"kind": fitz.LINK_URI, "from": rect,
                          "uri": "https://" + NEW + "/"})
        page.draw_line((hit.x0, hit.y1 + 1), (hit.x1, hit.y1 + 1),
                       color=(0.42, 0.12, 0.17), width=0.45)
    return True


def footer_slot(page: fitz.Page) -> tuple[float, float] | None:
    width, height = page.rect.width, page.rect.height
    font = fitz.Font(fontname="helv")
    label_width = font.text_length(BACKLINK_LABEL, fontsize=7.2)
    blocks = [fitz.Rect(block["bbox"])
              for block in page.get_text("dict")["blocks"]
              if "lines" in block]
    for offset in (14, 22, 30, 38, 46, 54, 64, 76, 88, 100, 114, 128, 142):
        baseline = height - offset
        for x in (36, (width - label_width) / 2, width - 36 - label_width):
            region = fitz.Rect(x, baseline - 9, x + label_width, baseline + 2)
            if x >= 20 and region.x1 <= width - 20 and not any(region.intersects(b) for b in blocks):
                return x, baseline
    return None


def ensure_pdf_backlink(data: bytes, label: str) -> tuple[bytes, bool]:
    doc = fitz.open(stream=data, filetype="pdf")
    if gravity_link_count(doc):
        doc.close()
        return data, False
    for page in doc:
        if make_printed_hosts_clickable(page):
            output = io.BytesIO()
            doc.save(output, garbage=4, deflate=True)
            doc.close()
            return output.getvalue(), True

    page = doc[-1]
    slot = footer_slot(page)
    if slot is None:
        doc.close()
        raise RuntimeError(f"No clear footer position for PDF: {label}")
    x, baseline = slot
    font = fitz.Font(fontname="helv")
    prefix = "More Gravity resources: "
    prefix_width = font.text_length(prefix, fontsize=7.2)
    url_width = font.text_length(NEW, fontsize=7.2)
    page.insert_text((x, baseline), BACKLINK_LABEL, fontname="helv", fontsize=7.2,
                     color=(0.28, 0.34, 0.39))
    page.draw_line((x + prefix_width, baseline + 1.3),
                   (x + prefix_width + url_width, baseline + 1.3),
                   color=(0.28, 0.34, 0.39), width=0.4)
    rect = fitz.Rect(x + prefix_width, baseline - 8.5,
                     x + prefix_width + url_width, baseline + 2)
    page.insert_link({"kind": fitz.LINK_URI, "from": rect,
                      "uri": "https://" + NEW + "/"})
    output = io.BytesIO()
    doc.save(output, garbage=4, deflate=True)
    doc.close()
    return output.getvalue(), True


def update_zip_manifest(payloads: list[tuple[zipfile.ZipInfo, bytes]]) -> tuple[list[tuple[zipfile.ZipInfo, bytes]], bool]:
    members = {info.filename: data for info, data in payloads}
    changed = False
    updated_payloads = list(payloads)
    for index, (info, data) in enumerate(updated_payloads):
        if "sha256_manifest" not in info.filename.casefold():
            continue
        try:
            lines = data.decode("utf-8").splitlines()
        except UnicodeDecodeError:
            continue
        new_lines = []
        manifest_changed = False
        for line in lines:
            match = re.match(r"^([0-9a-fA-F]{64})(\s+)(.+)$", line)
            if match and match.group(3) in members:
                digest = hashlib.sha256(members[match.group(3)]).hexdigest()
                new_lines.append(digest + match.group(2) + match.group(3))
                manifest_changed |= digest != match.group(1).lower()
            else:
                new_lines.append(line)
        if manifest_changed:
            data = ("\n".join(new_lines) + "\n").encode("utf-8")
            updated_payloads[index] = (info, data)
            changed = True
    return updated_payloads, changed


def ensure_zip_backlinks(path: Path) -> tuple[bool, int]:
    with zipfile.ZipFile(path, "r") as source:
        payloads = []
        changed_pdfs = 0
        for info in source.infolist():
            data = source.read(info.filename)
            if info.filename.casefold().endswith(".pdf"):
                data, changed = ensure_pdf_backlink(data, f"{path}:{info.filename}")
                changed_pdfs += int(changed)
            payloads.append((info, data))
        if not changed_pdfs:
            return False, 0
        payloads, manifest_changed = update_zip_manifest(payloads)
        target = path.with_suffix(path.suffix + ".backlink-tmp")
        with zipfile.ZipFile(target, "w") as output:
            for info, data in payloads:
                output.writestr(info, data)
        target.replace(path)
        return True, changed_pdfs


def ensure_all_site_pdf_backlinks() -> tuple[int, int]:
    direct_changed = 0
    embedded_changed = 0
    for path in SITE.rglob("*.pdf"):
        data, changed = ensure_pdf_backlink(path.read_bytes(), str(path.relative_to(ROOT)))
        if changed:
            path.write_bytes(data)
            direct_changed += 1
    for path in SITE.rglob("*.zip"):
        _, changed = ensure_zip_backlinks(path)
        embedded_changed += changed
    # Reopen every public and embedded PDF and require a Gravity link and no
    # stale Thomas Monroe Books text or link destination.
    for path in SITE.rglob("*.pdf"):
        with fitz.open(path) as doc:
            if not gravity_link_count(doc):
                raise RuntimeError(f"Missing Gravity link in {path}")
            if any(OLD in page.get_text().casefold() for page in doc):
                raise RuntimeError(f"Old publisher-domain text remains in {path}")
            if any(OLD in link.get("uri", "").casefold()
                   for page in doc for link in page.get_links()):
                raise RuntimeError(f"Old publisher-domain link remains in {path}")
    for path in SITE.rglob("*.zip"):
        with zipfile.ZipFile(path, "r") as archive:
            bad = archive.testzip()
            if bad:
                raise RuntimeError(f"ZIP CRC failure in {path}: {bad}")
            for name in archive.namelist():
                if name.casefold().endswith(".pdf"):
                    with fitz.open(stream=archive.read(name), filetype="pdf") as doc:
                        if not gravity_link_count(doc):
                            raise RuntimeError(f"Missing Gravity link in {path}:{name}")
                        if any(OLD in page.get_text().casefold() for page in doc):
                            raise RuntimeError(f"Old publisher-domain text remains in {path}:{name}")
                        if any(OLD in link.get("uri", "").casefold()
                               for page in doc for link in page.get_links()):
                            raise RuntimeError(f"Old publisher-domain link remains in {path}:{name}")
    return direct_changed, embedded_changed


def main() -> None:
    changed = []
    for relative in COMPANIONS:
        path = SITE / relative
        if patch_companion(path):
            changed.append(relative)
    for relative in GENERAL:
        path = SITE / relative
        if patch_general(path):
            changed.append(relative)
    for relative, patcher in ((ONE_PAGE_AD, patch_ad), (CUSTOMER_OVERVIEW, patch_customer_overview)):
        path = SITE / relative
        if patcher(path):
            changed.append(relative)
    targets = [SITE / item for item in COMPANIONS + GENERAL + [ONE_PAGE_AD, CUSTOMER_OVERVIEW]]
    remaining = []
    unlinked = []
    for path in targets:
        with fitz.open(path) as doc:
            for index, page in enumerate(doc):
                if OLD in page.get_text().casefold():
                    remaining.append(f"{path.relative_to(ROOT)} page {index + 1}")
                for hit in page.search_for(NEW):
                    if not any(fitz.Rect(link["from"]).intersects(hit)
                               for link in page.get_links()):
                        unlinked.append(f"{path.relative_to(ROOT)} page {index + 1}")
    if remaining:
        raise SystemExit(f"Old publisher-domain text remains in: {remaining}")
    if unlinked:
        raise SystemExit(f"Visible Gravity domain lacks a clickable PDF link in: {unlinked}")
    print(f"Updated {len(changed)} targeted copy PDFs; verified all {len(targets)} target PDFs are clear:")
    for item in changed:
        print(f"- {item}")
    direct_changed, embedded_changed = ensure_all_site_pdf_backlinks()
    print(f"Added Gravity links to {direct_changed} direct PDFs and {embedded_changed} embedded ZIP PDFs.")


if __name__ == "__main__":
    main()
