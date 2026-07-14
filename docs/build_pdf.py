"""Render docs/5th_era_thrift_retention_case.md to PDF using ReportLab Platypus.

Handles: h1-h4, paragraphs (with **bold** and *italic*), bulleted lists,
ordered lists, GitHub-flavoured markdown tables (with alignment row),
fenced code blocks, horizontal rules, and inline `code`.
"""

from __future__ import annotations

import html
import re
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

import os
MD_PATH = Path(os.environ.get("MD_PATH", "/Users/syedfaezhasan/Downloads/project/docs/5th_era_thrift_retention_case.md"))
PDF_PATH = Path(os.environ.get("PDF_PATH", "/Users/syedfaezhasan/Downloads/project/docs/5th_era_thrift_retention_case.pdf"))
DOC_TITLE = os.environ.get("DOC_TITLE", "5th Era Thrift — Supplier Retention Analysis")
FOOTER_OVERRIDE = os.environ.get("FOOTER_TEXT")


# ---------- inline markdown rendering ----------

def _escape(text: str) -> str:
    """HTML-escape for ReportLab Paragraph minilanguage."""
    return html.escape(text, quote=False)


def render_inline(text: str) -> str:
    """Convert inline markdown to ReportLab's Paragraph minilanguage."""
    # Protect inline code first
    code_spans: list[str] = []

    def _code_sub(m):
        code_spans.append(m.group(1))
        return f"\x00CODE{len(code_spans) - 1}\x00"

    text = re.sub(r"`([^`]+)`", _code_sub, text)

    # Escape the rest
    text = _escape(text)

    # Bold + italic ***x***
    text = re.sub(r"\*\*\*([^*]+)\*\*\*", r"<b><i>\1</i></b>", text)
    # Bold **x**
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    # Italic *x* (avoid **)
    text = re.sub(r"(?<!\*)\*(?!\*)([^*\n]+?)\*(?!\*)", r"<i>\1</i>", text)

    # Markdown links [text](href) -> blue link
    def _link_sub(m):
        label, href = m.group(1), m.group(2)
        return f'<link href="{html.escape(href, quote=True)}" color="#1351B4">{label}</link>'

    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", _link_sub, text)

    # Strikethrough ~~x~~
    text = re.sub(r"~~([^~]+)~~", r"<strike>\1</strike>", text)

    # Restore code spans
    def _restore(m):
        idx = int(m.group(1))
        raw = code_spans[idx]
        return f'<font name="Courier" backColor="#F1F1F4">{_escape(raw)}</font>'

    text = re.sub(r"\x00CODE(\d+)\x00", _restore, text)
    # Replace remaining check/cross emojis with text-safe markers
    text = text.replace("✅", "<font color=\"#2E7D32\"><b>OK</b></font>")
    text = text.replace("→", "&#8594;")
    text = text.replace("×", "&#215;")
    text = text.replace("≥", "&#8805;")
    text = text.replace("≤", "&#8804;")
    text = text.replace("£", "&#163;")
    return text


# ---------- styles ----------

styles = getSampleStyleSheet()

BASE_FONT = "Helvetica"
BOLD_FONT = "Helvetica-Bold"

style_h1 = ParagraphStyle(
    "H1", parent=styles["Heading1"], fontName=BOLD_FONT, fontSize=20,
    leading=24, spaceBefore=4, spaceAfter=6, textColor=colors.HexColor("#0E1A33"),
)
style_h2 = ParagraphStyle(
    "H2", parent=styles["Heading2"], fontName=BOLD_FONT, fontSize=14,
    leading=18, spaceBefore=14, spaceAfter=6, textColor=colors.HexColor("#0E1A33"),
)
style_h3 = ParagraphStyle(
    "H3", parent=styles["Heading3"], fontName=BOLD_FONT, fontSize=11.5,
    leading=15, spaceBefore=10, spaceAfter=4, textColor=colors.HexColor("#0E1A33"),
)
style_h4 = ParagraphStyle(
    "H4", parent=styles["Heading4"], fontName=BOLD_FONT, fontSize=10.5,
    leading=14, spaceBefore=8, spaceAfter=3, textColor=colors.HexColor("#0E1A33"),
)
style_body = ParagraphStyle(
    "Body", parent=styles["BodyText"], fontName=BASE_FONT, fontSize=9.5,
    leading=13.5, spaceAfter=5, textColor=colors.HexColor("#1A1A1A"),
    alignment=TA_LEFT,
)
style_bullet = ParagraphStyle(
    "Bullet", parent=style_body, leftIndent=14, bulletIndent=2, spaceAfter=2,
)
style_blockquote = ParagraphStyle(
    "Quote", parent=style_body, leftIndent=16, rightIndent=8,
    textColor=colors.HexColor("#4A5568"), fontName="Helvetica-Oblique",
    borderPadding=(2, 6, 2, 6),
)
style_code = ParagraphStyle(
    "Code", parent=style_body, fontName="Courier", fontSize=8.5, leading=11,
    backColor=colors.HexColor("#F1F1F4"), borderPadding=(4, 6, 4, 6),
    leftIndent=2, rightIndent=2,
)
style_table_header = ParagraphStyle(
    "TH", parent=style_body, fontName=BOLD_FONT, fontSize=8.5, leading=11,
    textColor=colors.white, alignment=TA_LEFT, spaceAfter=0,
)
style_table_cell = ParagraphStyle(
    "TD", parent=style_body, fontSize=8.5, leading=11, spaceAfter=0,
)
style_table_cell_right = ParagraphStyle(
    "TDR", parent=style_table_cell, alignment=TA_RIGHT,
)


# ---------- markdown parsing ----------

TABLE_SEP_RE = re.compile(r"^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
HR_RE = re.compile(r"^\s*(?:---|\*\*\*|___)\s*$")
UL_RE = re.compile(r"^(\s*)[-*]\s+(.+)$")
OL_RE = re.compile(r"^(\s*)\d+\.\s+(.+)$")
TABLE_ROW_RE = re.compile(r"^\s*\|(.+)\|\s*$")
FENCE_RE = re.compile(r"^\s*```")


def split_row(line: str) -> list[str]:
    inner = line.strip()
    if inner.startswith("|"):
        inner = inner[1:]
    if inner.endswith("|"):
        inner = inner[:-1]
    return [c.strip() for c in inner.split("|")]


def parse_alignments(sep_line: str) -> list[str]:
    cells = split_row(sep_line)
    aligns = []
    for c in cells:
        c = c.strip()
        if c.startswith(":") and c.endswith(":"):
            aligns.append("CENTER")
        elif c.endswith(":"):
            aligns.append("RIGHT")
        else:
            aligns.append("LEFT")
    return aligns


def parse_markdown(text: str) -> list:
    lines = text.splitlines()
    i = 0
    flowables: list = []

    def flush_paragraph(buf: list[str]):
        if not buf:
            return
        joined = " ".join(s.strip() for s in buf).strip()
        if joined:
            flowables.append(Paragraph(render_inline(joined), style_body))
        buf.clear()

    para_buf: list[str] = []

    while i < len(lines):
        line = lines[i]

        # Fenced code block
        if FENCE_RE.match(line):
            flush_paragraph(para_buf)
            i += 1
            code_lines = []
            while i < len(lines) and not FENCE_RE.match(lines[i]):
                code_lines.append(lines[i])
                i += 1
            i += 1  # closing fence
            # Render as Paragraph in Courier
            code_text = "<br/>".join(_escape(cl).replace(" ", "&nbsp;") for cl in code_lines)
            flowables.append(Paragraph(code_text, style_code))
            flowables.append(Spacer(1, 4))
            continue

        # Horizontal rule
        if HR_RE.match(line):
            flush_paragraph(para_buf)
            flowables.append(Spacer(1, 4))
            flowables.append(HRFlowable(width="100%", thickness=0.5,
                                        color=colors.HexColor("#D0D5DD"),
                                        spaceBefore=2, spaceAfter=6))
            i += 1
            continue

        # Heading
        m = HEADING_RE.match(line)
        if m:
            flush_paragraph(para_buf)
            level = len(m.group(1))
            content = render_inline(m.group(2))
            style = {1: style_h1, 2: style_h2, 3: style_h3}.get(level, style_h4)
            flowables.append(Paragraph(content, style))
            i += 1
            continue

        # Table
        if TABLE_ROW_RE.match(line) and i + 1 < len(lines) and TABLE_SEP_RE.match(lines[i + 1]):
            flush_paragraph(para_buf)
            header_cells = split_row(line)
            aligns = parse_alignments(lines[i + 1])
            i += 2
            rows = []
            while i < len(lines) and TABLE_ROW_RE.match(lines[i]):
                rows.append(split_row(lines[i]))
                i += 1
            flowables.append(make_table(header_cells, rows, aligns))
            flowables.append(Spacer(1, 6))
            continue

        # Bulleted list
        m = UL_RE.match(line)
        if m:
            flush_paragraph(para_buf)
            items = []
            while i < len(lines) and UL_RE.match(lines[i]):
                content = UL_RE.match(lines[i]).group(2)
                items.append(content)
                i += 1
            for item in items:
                flowables.append(Paragraph(render_inline(item),
                                           style_bullet, bulletText="•"))
            flowables.append(Spacer(1, 3))
            continue

        # Ordered list
        m = OL_RE.match(line)
        if m:
            flush_paragraph(para_buf)
            items = []
            while i < len(lines) and OL_RE.match(lines[i]):
                content = OL_RE.match(lines[i]).group(2)
                items.append(content)
                i += 1
            for n, item in enumerate(items, start=1):
                flowables.append(Paragraph(render_inline(item),
                                           style_bullet, bulletText=f"{n}."))
            flowables.append(Spacer(1, 3))
            continue

        # Blockquote
        if line.startswith(">"):
            flush_paragraph(para_buf)
            quote_lines = []
            while i < len(lines) and lines[i].startswith(">"):
                quote_lines.append(lines[i].lstrip(">").strip())
                i += 1
            flowables.append(Paragraph(render_inline(" ".join(quote_lines)), style_blockquote))
            flowables.append(Spacer(1, 4))
            continue

        # Blank line - paragraph break
        if not line.strip():
            flush_paragraph(para_buf)
            i += 1
            continue

        # Default: accumulate paragraph
        para_buf.append(line)
        i += 1

    flush_paragraph(para_buf)
    return flowables


def make_table(headers: list[str], rows: list[list[str]], aligns: list[str]) -> Table:
    n_cols = len(headers)
    # Normalize row widths
    rows = [r + [""] * (n_cols - len(r)) if len(r) < n_cols else r[:n_cols] for r in rows]
    aligns = (aligns + ["LEFT"] * n_cols)[:n_cols]

    def cell_para(text: str, header: bool, align: str):
        if header:
            base = style_table_header
        else:
            base = style_table_cell_right if align == "RIGHT" else style_table_cell
        return Paragraph(render_inline(text), base)

    data = [[cell_para(h, True, aligns[i]) for i, h in enumerate(headers)]]
    for row in rows:
        data.append([cell_para(c, False, aligns[i]) for i, c in enumerate(row)])

    # Auto column widths: distribute, but bias first column wider for label tables
    page_width = A4[0] - 3 * cm  # account for margins
    if n_cols <= 3:
        weights = [2.2] + [1.0] * (n_cols - 1)
    else:
        # First column slightly wider; rest equal
        weights = [1.6] + [1.0] * (n_cols - 1)
    total_w = sum(weights)
    col_widths = [page_width * (w / total_w) for w in weights]

    tbl = Table(data, colWidths=col_widths, repeatRows=1, hAlign="LEFT")
    style_cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0E1A33")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW", (0, 0), (-1, 0), 0.6, colors.HexColor("#0E1A33")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
         [colors.white, colors.HexColor("#F7F8FB")]),
        ("LINEBELOW", (0, 1), (-1, -1), 0.25, colors.HexColor("#E2E5EC")),
        ("BOX", (0, 0), (-1, -1), 0.25, colors.HexColor("#D0D5DD")),
    ]
    tbl.setStyle(TableStyle(style_cmds))
    return tbl


# ---------- page chrome ----------

FOOTER_TEXT = FOOTER_OVERRIDE or "5th Era Thrift — Supplier Retention Analysis  ·  Confidential  ·  25 May 2026"


def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#667085"))
    canvas.drawString(1.5 * cm, 1.0 * cm, FOOTER_TEXT)
    canvas.drawRightString(A4[0] - 1.5 * cm, 1.0 * cm, f"Page {doc.page}")
    canvas.restoreState()


def main():
    md_text = MD_PATH.read_text(encoding="utf-8")
    flowables = parse_markdown(md_text)

    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=A4,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.6 * cm,
        title=DOC_TITLE,
        author="Business & Experience, Fleek",
        subject="Supplier retention case based on Oct 2025 – May 2026 data",
    )
    doc.build(flowables, onFirstPage=on_page, onLaterPages=on_page)
    print(f"Wrote {PDF_PATH} ({PDF_PATH.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
