#!/usr/bin/env python3
"""Rebuild the five Gravity Report Field Sheet PDFs with readable text and links."""
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "site/assets/downloads"
TEAL = colors.HexColor("#173f3b")
INK = colors.HexColor("#243331")
GOLD = colors.HexColor("#b88a39")
PALE = colors.HexColor("#f2f5f3")
MUTED = colors.HexColor("#5c6b67")
FONT_DIR = Path(__file__).resolve().parent / "fonts"
pdfmetrics.registerFont(TTFont("GravitySans", str(FONT_DIR / "LiberationSans-Regular.ttf")))
pdfmetrics.registerFont(TTFont("GravitySans-Bold", str(FONT_DIR / "LiberationSans-Bold.ttf")))

SHEETS = [
    {
        "file": "gravity-field-sheet-01-manager-excuses.pdf",
        "number": "01",
        "revision": "2026-10-29",
        "title": "The Missed Commitment",
        "companion": "Why Do My Restaurant Managers Keep Making Excuses?",
        "url": "https://gravityleadershipsystem.com/gravity-report/why-do-my-restaurant-managers-keep-making-excuses",
        "problem": "An important management task was not completed. A reason was offered, but no confirmed recovery plan exists.",
        "remember": [
            "A real interruption can explain a miss without closing the responsibility.",
            "Investigate the assignment and resources before judging the manager.",
            "Every unfinished task needs an owner, a recovery decision, and verification.",
        ],
        "notice": [
            "Look for a disappearing task, an impossible assignment, or a repeated avoidable miss.",
            "Check the original expectation, actual workload, authority, and who was informed.",
        ],
        "steps": [
            "Choose one recurring missed commitment that actually matters.",
            "Ask what was agreed, what interrupted it, what remains open, and who was told.",
            "Assign a feasible recovery action, owner, deadline, and verification check.",
        ],
        "records": [
            "Original task / expected finish",
            "Interruption or evidence",
            "Recovery owner / new deadline",
        ],
        "proof": [
            "At the next check, confirm the task is finished, not just explained.",
            "If the same obstacle recurs, correct workload, handoff, or accountability controls.",
        ],
        "note": "For practical coaching, not automatic discipline. Use facts and protect employee dignity.",
    },
    {
        "file": "gravity-field-sheet-02-food-cost.pdf",
        "number": "02",
        "revision": "2026-10-29",
        "title": "Find the Food-Cost Cause",
        "companion": "Why Is My Restaurant Food Cost So High?",
        "url": "https://gravityleadershipsystem.com/gravity-report/why-is-my-restaurant-food-cost-so-high",
        "problem": "Food cost is above target, but the percentage alone does not identify which operating process caused it.",
        "remember": [
            "A food-cost percentage is a signal to investigate, not a diagnosis.",
            "Check counts, purchases, sales, pricing, portions, and waste before assigning blame.",
            "Fix the proven cause and compare a consistent period before calling it solved.",
        ],
        "notice": [
            "Look for count errors, unexplained inventory movement, high waste, or recipe drift.",
            "Compare like-for-like periods and distinguish price changes from usage changes.",
        ],
        "steps": [
            "Confirm the dates and source accuracy for sales, purchases, and inventory.",
            "Select one high-value ingredient and trace count, receiving, prep, and portion.",
            "Correct one verified variance, then repeat the measurement.",
        ],
        "records": [
            "Ingredient / period",
            "Expected vs. actual usage (same units)",
            "Observed cause / correction owner",
        ],
        "proof": [
            "Recount and compare usage or waste after the correction, using the same method.",
            "If evidence is incomplete, write ‘not proven’ and keep investigating.",
        ],
        "note": "Use safe food handling and approved recipes. Do not infer theft from a variance.",
    },
    {
        "file": "gravity-field-sheet-03-manager-follow-through.pdf",
        "number": "03",
        "remember_numbered": True,
        "title": "Close the Promise-to-Proof Loop",
        "companion": "",
        "url": "https://gravityleadershipsystem.com/gravity-report",
        "problem": "A manager agrees to a task, but no one can show what complete means or whether it stayed complete.",
        "remember": [
            "Agreement is not evidence. Give each significant task an owner, deadline and completion standard.",
            "Keep material open actions in one authorized register and carry them across shift handoffs.",
            "Apply the same rules to owners and managers; check authority, resources and workload first.",
        ],
        "notice": [
            "Tasks repeated in conversation but missing from the register.",
            "Items marked done without evidence; overdue tasks with no approved change.",
        ],
        "steps": [
            "Choose up to five material open items, not every small duty.",
            "For each: specify action, one owner, achievable due date and proof of done.",
            "Review obstacles at the next shift handoff; document any approved change.",
            "Verify the actual result at the due date, and reopen it if the result fails.",
        ],
        "records": [
            "Task / owner / deadline",
            "Evidence seen / reviewer / date",
            "Blocker or approved change",
        ],
        "proof": [
            "Compare overdue items and reopened ‘completed’ items at the next weekly review. A smaller list is not success if tasks were simply removed.",
        ],
        "note": "Keep personnel-sensitive details in restricted records. Do not close work merely because somebody says it was done.",
    },
    {
        "file": "gravity-field-sheet-04-food-waste.pdf",
        "number": "04",
        "remember_numbered": True,
        "title": "Trace Waste Back to the Decision",
        "companion": "",
        "url": "https://gravityleadershipsystem.com/gravity-report",
        "problem": "Food is thrown away at closing, but the preventable cause may be ordering, storage, prep or service.",
        "remember": [
            "A waste dollar total is not a diagnosis; code the actual loss type.",
            "Trace the item backward to the decision that made the loss likely.",
            "Test one adjustment; protect food safety, product quality and guest service.",
        ],
        "notice": [
            "Overproduction, spoilage, trim/yield, mistakes, remakes or damage.",
            "Outdated pars, poor rotation, inaccurate forecasts or rushed prep.",
        ],
        "steps": [
            "Select one recurring high-dollar waste item, not the entire menu.",
            "Record losses as they occur for seven days with quantity and reason.",
            "Trace receiving, storage, prep and sale to identify a supported cause.",
            "Adjust one par or control with an approved backup, then repeat the check.",
        ],
        "records": [
            "Item / waste type / estimated value",
            "Likely upstream decision / evidence",
            "Test change / owner / review date",
        ],
        "proof": [
            "Compare next week’s waste, stockouts, quality and service together. If waste falls while outages rise, revise the control.",
        ],
        "note": "Never extend safe-use limits or serve unsafe food to reduce waste. Avoid double-counting transfers, comps and remakes.",
    },
    {
        "file": "gravity-field-sheet-05-employee-retention.pdf",
        "number": "05",
        "remember_numbered": True,
        "title": "Keep the Promise Before the Exit",
        "companion": "",
        "url": "https://gravityleadershipsystem.com/gravity-report",
        "problem": "A valued employee leaves; a generic ‘people do not stay’ explanation hides what management could verify.",
        "remember": [
            "Not every departure is preventable; investigate patterns rather than motives.",
            "Test whether schedules, training, standards and respect match what was promised.",
            "Fairness means consistent, defensible decisions, not identical treatment.",
        ],
        "notice": [
            "Turnover concentrated in a station, supervisor or recurring shift pattern.",
            "Repeated last-minute changes, inconsistent training or unanswered concerns.",
        ],
        "steps": [
            "Review a small set of departures using legitimate operational facts only.",
            "Hold two private, voluntary stay conversations and listen without arguing.",
            "Choose one specific correctable condition; name an owner and due date.",
            "Check the condition over the next month without pressuring employees.",
        ],
        "records": [
            "Observed pattern / time period",
            "One issue staff identified (no names)",
            "Owner / action / follow-up date",
        ],
        "proof": [
            "Confirm the promised condition changed and seek fresh voluntary feedback. One person staying another week does not establish retention improvement.",
        ],
        "note": "Protect privacy. Do not imply a resignation’s cause without evidence or promise changes beyond your authority.",
    },
]


def make_styles():
    base = getSampleStyleSheet()
    return {
        "body": ParagraphStyle("Body", parent=base["BodyText"], fontName="GravitySans", fontSize=9.2,
                               leading=12, textColor=INK, spaceAfter=3, alignment=TA_LEFT),
        "bullet": ParagraphStyle("Bullet", parent=base["BodyText"], fontName="GravitySans", fontSize=9.0,
                                  leading=11.4, textColor=INK, leftIndent=13, firstLineIndent=-9,
                                  bulletIndent=0, spaceAfter=2),
        "section": ParagraphStyle("Section", parent=base["Heading4"], fontName="GravitySans-Bold", fontSize=8.7,
                                  leading=10, textColor=TEAL, spaceBefore=6, spaceAfter=3),
        "note": ParagraphStyle("Note", parent=base["BodyText"], fontName="GravitySans", fontSize=8.3,
                               leading=10.5, textColor=INK),
        "record": ParagraphStyle("Record", parent=base["BodyText"], fontName="GravitySans", fontSize=8.7,
                                 leading=13, textColor=INK),
    }


def decorate(canvas, doc, sheet):
    width, height = letter
    canvas.saveState()
    canvas.setFillColor(TEAL)
    canvas.rect(0, height - 118, width, 118, stroke=0, fill=1)
    canvas.setFillColor(GOLD)
    canvas.rect(doc.leftMargin, height - 128, 42, 4, stroke=0, fill=1)
    canvas.setFillColor(colors.HexColor("#f5e8c9"))
    canvas.setFont("GravitySans-Bold", 8)
    canvas.drawString(doc.leftMargin, height - 34, f"THE GRAVITY REPORT  /  FIELD SHEET {sheet['number']}")
    canvas.setFillColor(colors.white)
    canvas.setFont("GravitySans-Bold", 19)
    canvas.drawString(doc.leftMargin, height - 62, sheet["title"])
    canvas.setFillColor(colors.HexColor("#e6efeb"))
    canvas.setFont("GravitySans", 9.3)
    canvas.drawString(doc.leftMargin, height - 82, "We took the notes. You put them to work.")
    if sheet["companion"]:
        canvas.setFont("GravitySans", 8)
        canvas.drawString(doc.leftMargin, height - 99, f"Companion to: {sheet['companion']}")

    canvas.setStrokeColor(colors.HexColor("#d7dfdc"))
    canvas.line(doc.leftMargin, 48, width - doc.rightMargin, 48)
    canvas.setFillColor(MUTED)
    canvas.setFont("GravitySans-Bold", 7.2)
    revision = f"REV {sheet['revision']}  |  " if sheet.get("revision") else ""
    canvas.drawString(doc.leftMargin, 35, f"FREE  |  {revision}FIELD SHEET {sheet['number']}  |  By Thomas Butler")
    canvas.setFont("GravitySans", 7.3)
    link_text = "Back to Gravity Report: gravityleadershipsystem.com/gravity-report"
    x, y = doc.leftMargin, 22
    canvas.drawString(x, y, link_text)
    text_width = canvas.stringWidth(link_text, "GravitySans", 7.3)
    canvas.linkURL(sheet["url"], (x, y - 2, x + text_width, y + 9), relative=0, thickness=0)
    canvas.restoreState()


def build_sheet(sheet, styles):
    target = OUT / sheet["file"]
    doc = BaseDocTemplate(str(target), pagesize=letter, leftMargin=48, rightMargin=48,
                          topMargin=134, bottomMargin=62, title=f"Gravity Field Sheet {sheet['number']} — {sheet['title']}",
                          author="Thomas Butler", subject="The Gravity Report field sheet")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height,
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0, id="body")
    doc.addPageTemplates([PageTemplate(id="field-sheet", frames=frame,
                                     onPage=lambda canvas, current_doc: decorate(canvas, current_doc, sheet))])
    story = []

    def section(label, items, bullets=False, ordered=False):
        story.append(Paragraph(label, styles["section"]))
        if bullets:
            story.extend(Paragraph(item, styles["bullet"], bulletText="•") for item in items)
        elif ordered:
            story.extend(Paragraph(f"{index}. {item}", styles["body"]) for index, item in enumerate(items, 1))
        else:
            story.extend(Paragraph(item, styles["body"]) for item in items)

    section("THE PROBLEM, NAMED", [sheet["problem"]])
    section("THREE THINGS TO REMEMBER", sheet["remember"],
            ordered=sheet.get("remember_numbered", False), bullets=not sheet.get("remember_numbered", False))
    section("WHAT TO NOTICE", sheet["notice"], bullets=True)
    section("TRY THIS NEXT SHIFT", sheet["steps"], ordered=True)
    section("RECORD ONLY YOUR ACTUAL OBSERVATIONS", [], bullets=False)
    record_rows = [[Paragraph(f"{label}:", styles["record"]), "________________________________________________________"]
                   for label in sheet["records"]]
    record_table = Table(record_rows, colWidths=[195, doc.width - 195], rowHeights=[20] * len(record_rows))
    record_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LINEBELOW", (1, 0), (1, -1), 0.45, colors.HexColor("#98a8a2")),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 1), ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    story.append(record_table)
    section("HOW TO KNOW IF IT HELPED", sheet["proof"], bullets=True)
    note = Table([[Paragraph(f"<b>KEEP IN MIND</b> &nbsp; {sheet['note']}", styles["note"])]], colWidths=[doc.width])
    note.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE), ("LINEBEFORE", (0, 0), (0, -1), 3, GOLD),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.extend([Spacer(1, 6), note])
    doc.build(story)
    return target


if __name__ == "__main__":
    styles = make_styles()
    for sheet in SHEETS:
        result = build_sheet(sheet, styles)
        print(result.relative_to(ROOT))
