#!/usr/bin/env python3
"""Repair legacy Thomas Monroe Books URLs in Gravity customer downloads.

The source PDFs are retained as the visual baseline. This script updates their
printed customer links, QR codes, and PDF link annotations, then replaces those
PDFs and old text-guide references inside the published ZIP packages.
"""
from __future__ import annotations

import io
import hashlib
import json
import re
import subprocess
import zipfile
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

import fitz
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, TextStringObject
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
GRAVITY = "https://gravityleadershipsystem.com"
OLD = "https://thomasmonroebooks.com"
NODE = r"""
const fs=require('fs'),vm=require('vm');
const w={}; const d={readyState:'loading',addEventListener(){}};
vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8'),{window:w,document:d,console});
const urls=JSON.parse(process.argv[2]);
const result={};
for(const url of urls){const q=w.GravityQR.makeMatrix(url,'Q'),n=q.getModuleCount(),m=[];for(let r=0;r<n;r++){m[r]=[];for(let c=0;c<n;c++)m[r][c]=q.isDark(r,c)?1:0;}result[url]=m;}
process.stdout.write(JSON.stringify(result));
"""


def matrices(urls: list[str]) -> dict[str, list[list[int]]]:
    qr_js = SITE / "assets/js/gravity-qr.js"
    p = subprocess.run(
        ["node", "-e", NODE, str(qr_js), json.dumps(urls)],
        check=True, capture_output=True, text=True,
    )
    return json.loads(p.stdout)


def draw_qr(c: canvas.Canvas, matrix: list[list[int]], x: float, y: float,
            size: float, quiet: int = 4) -> None:
    count = len(matrix)
    cells = count + quiet * 2
    unit = size / cells
    c.setFillColor(white)
    c.rect(x, y, size, size, fill=1, stroke=0)
    c.setFillColor(black)
    for row, line in enumerate(matrix):
        for col, dark in enumerate(line):
            if dark:
                c.rect(x + (col + quiet) * unit,
                       y + (cells - row - quiet - 1) * unit,
                       unit + .02, unit + .02, fill=1, stroke=0)


def make_feedback_overlay(m: dict[str, list[list[int]]]) -> bytes:
    out = io.BytesIO()
    c = canvas.Canvas(out, pagesize=(612, 792))
    # Replace the three original QR images while preserving their labels/cards.
    for x, url in zip((56, 231, 406), (
        GRAVITY + "/review", GRAVITY + "/contact", "https://square.link/u/MBgyxk2x"
    )):
        c.setFillColor(HexColor("#12314d"))
        c.rect(x - 1, 309, 41, 42, fill=1, stroke=0)
        draw_qr(c, m[url], x, 311, 38, quiet=3)
    # Replace the printed publisher-domain sentence with the current Gravity path.
    c.setFillColor(white)
    c.rect(57, 224, 498, 36, fill=1, stroke=0)
    c.setFillColor(HexColor("#4b5563"))
    c.setFont("Helvetica", 5.3)
    c.drawCentredString(306, 247,
        "Founding Year: Finished digital Gravity products are free through October 1, 2027. Registration is required."
    )
    c.drawCentredString(306, 238,
        "No purchase, donation, credit card, paid subscription, or positive review is required. Current versions: gravityleadershipsystem.com/releases."
    )
    c.save()
    return out.getvalue()


def make_start_overlay(m: dict[str, list[list[int]]]) -> bytes:
    out = io.BytesIO()
    c = canvas.Canvas(out, pagesize=(612, 792))
    # Page 21: remove the old publisher web address after the publisher credit.
    c.setFillColor(white)
    c.rect(326, 380, 96, 12, fill=1, stroke=0)
    # Page 22: replace old domain in the promise and navigation lines.
    c.showPage()
    c.setFillColor(white)
    c.rect(57, 584, 499, 39, fill=1, stroke=0)
    c.setFillColor(HexColor("#263447"))
    c.setFont("Helvetica", 7.6)
    c.drawString(59, 609, "Every finished digital Gravity System product released on the Gravity website is free through October 1, 2027.")
    c.drawString(59, 598, "Registration is required before digital downloads. No purchase, donation, credit card, paid subscription, or positive review is required.")
    c.drawString(59, 587, "Physical supplies, if offered later, remain optional.")
    c.setFillColor(white)
    for x in (56, 488):
        c.rect(x, 267, 68, 68, fill=1, stroke=0)
    draw_qr(c, m[GRAVITY + "/review"], 61, 272, 58, quiet=4)
    draw_qr(c, m[GRAVITY + "/contact"], 493, 272, 58, quiet=4)
    c.setFillColor(HexColor("#102a45"))
    c.rect(128, 289, 260, 35, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica", 7.1)
    c.drawString(132, 313, "Public review: gravityleadershipsystem.com/review")
    c.drawString(132, 296, "Private feedback: gravityleadershipsystem.com/contact")
    c.setFillColor(HexColor("#f5f3ec"))
    c.rect(83, 226, 450, 17, fill=1, stroke=0)
    c.setFillColor(HexColor("#263447"))
    c.setFont("Helvetica", 7.4)
    c.drawString(87, 232, "Use the current version. Product updates and revisions: gravityleadershipsystem.com/releases")
    c.save()
    return out.getvalue()


URL_MAP = {
    OLD + "/review": GRAVITY + "/review",
    OLD + "/contact": GRAVITY + "/contact",
    OLD + "/releases": GRAVITY + "/releases",
    "http://thomasmonroebooks.com/review": GRAVITY + "/review",
    "http://thomasmonroebooks.com/contact": GRAVITY + "/contact",
    "http://thomasmonroebooks.com/releases": GRAVITY + "/releases",
}


def patch_pdf(data: bytes, feedback_overlay: bytes, start_overlay: bytes,
              filename: str = "") -> tuple[bytes, bool]:
    try:
        text_cleaned = False
        doc = fitz.open(stream=data, filetype="pdf")
        for page in doc:
            page_text = page.get_text().upper()
            known_insert = ("HELP IMPROVE GRAVITY" in page_text or
                            "THE FOUNDING YEAR PROMISE" in page_text)
            if known_insert or "START_HERE_GUIDE" in filename.upper():
                hits = page.search_for("thomasmonroebooks.com")
                if hits:
                    text_cleaned = True
                    for rect in hits:
                        page.add_redact_annot(rect, fill=(1, 1, 1))
                    page.apply_redactions(images=0, graphics=0, text=0)
        if text_cleaned:
            cleaned = io.BytesIO()
            doc.save(cleaned, garbage=4, deflate=True)
            data = cleaned.getvalue()
        doc.close()
        name = filename.lower()
        reader = PdfReader(io.BytesIO(data))
        if not reader.pages:
            return data, False
        writer = PdfWriter()
        writer.clone_document_from_reader(reader)
        changed = text_cleaned
        for page in writer.pages:
            for annot_ref in page.get("/Annots", []):
                annot = annot_ref.get_object()
                action = annot.get("/A")
                if action and action.get("/URI"):
                    uri = str(action["/URI"])
                    replacement = URL_MAP.get(uri)
                    parts = urlsplit(uri)
                    if parts.netloc.lower().removeprefix("www.") == "thomasmonroebooks.com":
                        replacement = urlunsplit(("https", "gravityleadershipsystem.com",
                                                  parts.path, parts.query, parts.fragment))
                    if replacement:
                        action[NameObject("/URI")] = TextStringObject(replacement)
                        changed = True
        overlay_bytes = feedback_overlay if "feedback_and_reviews_insert" in name else None
        if "start_here_guide" in name:
            overlay_bytes = start_overlay
        if overlay_bytes:
            overlay = PdfReader(io.BytesIO(overlay_bytes))
            if "start_here_guide" in name:
                for idx in (20, 21):
                    if idx < len(writer.pages):
                        writer.pages[idx].merge_page(overlay.pages[idx - 20])
            else:
                writer.pages[0].merge_page(overlay.pages[0])
            changed = True
        else:
            for page in writer.pages:
                text = (page.extract_text() or "").upper()
                if "HELP IMPROVE GRAVITY" in text:
                    page.merge_page(PdfReader(io.BytesIO(feedback_overlay)).pages[0])
                    changed = True
                elif "THE FOUNDING YEAR PROMISE" in text:
                    page.merge_page(PdfReader(io.BytesIO(start_overlay)).pages[1])
                    changed = True
        if not changed:
            return data, False
        for page in writer.pages:
            page.compress_content_streams()
        result = io.BytesIO()
        writer.write(result)
        return result.getvalue(), True
    except Exception:
        return data, False


def repair_text(data: bytes) -> tuple[bytes, bool]:
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError:
        return data, False
    original = text
    for old, new in URL_MAP.items():
        text = text.replace(old, new)
    # These file-guide sentences identify the publisher's old support domain.
    text = text.replace(
        "Any Square support link on ThomasMonroeBooks.com is for optional voluntary support only.",
        "Any Square support link is for optional voluntary support only and is never required for access."
    )
    text = text.replace("ThomasMonroeBooks.com", "gravityleadershipsystem.com")
    text = text.replace("thomasmonroebooks.com", "gravityleadershipsystem.com")
    return text.encode("utf-8"), text != original


def patch_zip(path: Path, fb_overlay: bytes, start_overlay: bytes) -> bool:
    with zipfile.ZipFile(path, "r") as src:
        entries = src.infolist()
        changed = False
        payloads = []
        for info in entries:
            data = src.read(info.filename)
            lower = info.filename.lower()
            if lower.endswith(".pdf"):
                data, did = patch_pdf(data, fb_overlay, start_overlay, info.filename)
            elif lower.endswith((".txt", ".md", ".html")):
                data, did = repair_text(data)
            else:
                did = False
            changed |= did
            payloads.append((info, data))
        members = {info.filename: data for info, data in payloads}
        for index, (info, data) in enumerate(payloads):
            if "sha256_manifest" not in info.filename.lower():
                continue
            try:
                lines = data.decode("utf-8").splitlines()
            except UnicodeDecodeError:
                continue
            updated = []
            manifest_changed = False
            for line in lines:
                match = re.match(r"^([0-9a-fA-F]{64})(\s+)(.+)$", line)
                if match and match.group(3) in members:
                    digest = hashlib.sha256(members[match.group(3)]).hexdigest()
                    updated.append(digest + match.group(2) + match.group(3))
                    manifest_changed |= digest != match.group(1).lower()
                else:
                    updated.append(line)
            if manifest_changed:
                data = ("\n".join(updated) + "\n").encode("utf-8")
                payloads[index] = (info, data)
                members[info.filename] = data
                changed = True
    if not changed:
        return False
    temp = path.with_suffix(path.suffix + ".repair-tmp")
    with zipfile.ZipFile(temp, "w") as out:
        for info, data in payloads:
            out.writestr(info, data)
    temp.replace(path)
    return True


def main() -> None:
    urls = [GRAVITY + "/review", GRAVITY + "/contact", "https://square.link/u/MBgyxk2x"]
    matrices_by_url = matrices(urls)
    fb_overlay = make_feedback_overlay(matrices_by_url)
    start_overlay = make_start_overlay(matrices_by_url)
    changed_files = []
    for path in SITE.rglob("*.pdf"):
        data, changed = patch_pdf(path.read_bytes(), fb_overlay, start_overlay, path.name)
        if changed:
            path.write_bytes(data)
            changed_files.append(path.relative_to(ROOT).as_posix())
    for path in SITE.rglob("*.zip"):
        if patch_zip(path, fb_overlay, start_overlay):
            changed_files.append(path.relative_to(ROOT).as_posix())
    print(json.dumps({"changed": changed_files}, indent=2))


if __name__ == "__main__":
    main()
