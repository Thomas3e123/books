#!/usr/bin/env python3
"""Check the published Free Resources filenames AND their basic file integrity.

No third-party packages are required. This test reads local release assets only;
it never fetches URLs, modifies downloads, or uses customer information.
"""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urljoin, urlsplit
import zipfile


ROOT = Path(__file__).resolve().parents[1] / "site"
CATALOG = ROOT / "free-resources.html"
SITE_BASE = "https://gravityleadershipsystem.com/free-resources"


class DownloadLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return
        attrs = dict(attrs)
        if "download" in attrs and attrs.get("href"):
            self.links.append(attrs["href"])


def local_asset(href: str) -> Path:
    url = urlsplit(urljoin(SITE_BASE, href))
    if url.scheme != "https" or url.netloc != "gravityleadershipsystem.com":
        raise AssertionError(f"Unapproved external download: {href}")
    path = PurePosixPath(unquote(url.path))
    if ".." in path.parts:
        raise AssertionError(f"Unsafe resource filename: {href}")
    result = (ROOT / str(path).lstrip("/")).resolve()
    if not result.is_relative_to(ROOT.resolve()):
        raise AssertionError(f"Download escapes the public site: {href}")
    return result


def verify_zip(filename: Path, *, word_document=False) -> None:
    with zipfile.ZipFile(filename) as archive:
        infos = archive.infolist()
        if not infos:
            raise AssertionError(f"Empty ZIP: {filename}")
        names = set()
        for item in infos:
            name = item.filename.replace("\\", "/")
            parts = PurePosixPath(name).parts
            if name.startswith("/") or ".." in parts:
                raise AssertionError(f"Unsafe path inside {filename.name}: {item.filename}")
            names.add(name)
        if word_document:
            for required in ("[Content_Types].xml", "word/document.xml"):
                if required not in names:
                    raise AssertionError(f"Missing DOCX component {required}: {filename.name}")
        bad_member = archive.testzip()
        if bad_member:
            raise AssertionError(f"Invalid ZIP CRC in {filename.name}: {bad_member}")


def run() -> None:
    parser = DownloadLinks()
    parser.feed(CATALOG.read_text(encoding="utf-8"))
    targets = {local_asset(href) for href in parser.links}
    if len(targets) < 34:
        raise AssertionError(f"Expected at least 34 distinct downloads, got {len(targets)}")
    counts = {"zip": 0, "pdf": 0, "docx": 0, "other": 0}
    for filename in sorted(targets):
        if not filename.is_file():
            raise AssertionError(f"Missing downloadable file: {filename}")
        if filename.stat().st_size < 32:
            raise AssertionError(f"Download is empty or implausibly short: {filename}")
        ext = filename.suffix.lower()
        if ext == ".zip":
            verify_zip(filename)
            counts["zip"] += 1
        elif ext == ".docx":
            verify_zip(filename, word_document=True)
            counts["docx"] += 1
        elif ext == ".pdf":
            with filename.open("rb") as fp:
                if b"%PDF-" not in fp.read(1024):
                    raise AssertionError(f"Missing PDF header: {filename.name}")
                fp.seek(max(0, filename.stat().st_size - 4096))
                if b"%%EOF" not in fp.read():
                    raise AssertionError(f"Missing PDF EOF marker: {filename.name}")
            counts["pdf"] += 1
        else:
            raise AssertionError(f"Unexpected download format requiring an audit: {filename.name}")
    print(f"PASS: {len(parser.links)} Free Resources links, {len(targets)} unique real files; "
          f"ZIP files passed CRC and path checks, DOCX structure and CRC verified, "
          f"PDF headers and trailers verified. Formats: {counts}")


if __name__ == "__main__":
    run()
