"""
EducAI Project Overview PDF Generator
Produces: EducAI_Project_Overview.pdf
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.platypus import ListFlowable, ListItem
from reportlab.pdfgen import canvas
import os

# ── Palette ───────────────────────────────────────────────────────────────────

AMBER        = colors.HexColor("#D97706")   # primary brand colour
AMBER_LIGHT  = colors.HexColor("#FEF3C7")   # very light amber for table fills
AMBER_MID    = colors.HexColor("#F59E0B")
DARK         = colors.HexColor("#1C1917")   # near-black
SLATE        = colors.HexColor("#44403C")   # body text
MUTED        = colors.HexColor("#78716C")   # captions / secondary
BORDER       = colors.HexColor("#D6D3D1")   # rule / table border
BG_SECTION   = colors.HexColor("#FFFBEB")   # soft amber fill for headings
WHITE        = colors.white
GREEN        = colors.HexColor("#16A34A")
ORANGE       = colors.HexColor("#EA580C")

PAGE_W, PAGE_H = A4
MARGIN = 2.0 * cm

OUT_PATH = os.path.join(os.path.dirname(__file__), "EducAI_Project_Overview.pdf")

# ── Style helpers ─────────────────────────────────────────────────────────────

def build_styles():
    base = getSampleStyleSheet()

    styles = {}

    styles["cover_title"] = ParagraphStyle(
        "cover_title",
        fontName="Helvetica-Bold",
        fontSize=36,
        textColor=DARK,
        leading=44,
        alignment=TA_CENTER,
        spaceAfter=8,
    )
    styles["cover_subtitle"] = ParagraphStyle(
        "cover_subtitle",
        fontName="Helvetica",
        fontSize=16,
        textColor=AMBER,
        leading=22,
        alignment=TA_CENTER,
        spaceAfter=6,
    )
    styles["cover_meta"] = ParagraphStyle(
        "cover_meta",
        fontName="Helvetica",
        fontSize=11,
        textColor=MUTED,
        leading=16,
        alignment=TA_CENTER,
    )
    styles["h1"] = ParagraphStyle(
        "h1",
        fontName="Helvetica-Bold",
        fontSize=18,
        textColor=DARK,
        leading=24,
        spaceBefore=20,
        spaceAfter=6,
        borderPad=(4, 8, 4, 8),
    )
    styles["h2"] = ParagraphStyle(
        "h2",
        fontName="Helvetica-Bold",
        fontSize=13,
        textColor=AMBER,
        leading=18,
        spaceBefore=16,
        spaceAfter=4,
    )
    styles["h3"] = ParagraphStyle(
        "h3",
        fontName="Helvetica-Bold",
        fontSize=11,
        textColor=DARK,
        leading=16,
        spaceBefore=10,
        spaceAfter=3,
    )
    styles["body"] = ParagraphStyle(
        "body",
        fontName="Helvetica",
        fontSize=10,
        textColor=SLATE,
        leading=15,
        spaceAfter=5,
        alignment=TA_JUSTIFY,
    )
    styles["body_left"] = ParagraphStyle(
        "body_left",
        fontName="Helvetica",
        fontSize=10,
        textColor=SLATE,
        leading=15,
        spaceAfter=5,
        alignment=TA_LEFT,
    )
    styles["caption"] = ParagraphStyle(
        "caption",
        fontName="Helvetica-Oblique",
        fontSize=9,
        textColor=MUTED,
        leading=13,
        spaceAfter=4,
        alignment=TA_CENTER,
    )
    styles["bullet"] = ParagraphStyle(
        "bullet",
        fontName="Helvetica",
        fontSize=10,
        textColor=SLATE,
        leading=14,
        leftIndent=14,
        spaceAfter=2,
    )
    styles["toc_item"] = ParagraphStyle(
        "toc_item",
        fontName="Helvetica",
        fontSize=10,
        textColor=SLATE,
        leading=18,
    )
    styles["toc_section"] = ParagraphStyle(
        "toc_section",
        fontName="Helvetica-Bold",
        fontSize=11,
        textColor=DARK,
        leading=20,
        spaceBefore=6,
    )
    styles["status_green"] = ParagraphStyle(
        "status_green",
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=WHITE,
        alignment=TA_CENTER,
    )
    styles["table_header"] = ParagraphStyle(
        "table_header",
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=WHITE,
        leading=12,
    )
    styles["table_cell"] = ParagraphStyle(
        "table_cell",
        fontName="Helvetica",
        fontSize=9,
        textColor=SLATE,
        leading=12,
    )
    styles["viva_q"] = ParagraphStyle(
        "viva_q",
        fontName="Helvetica-Bold",
        fontSize=10,
        textColor=DARK,
        leading=14,
        spaceBefore=8,
        spaceAfter=2,
    )
    styles["viva_a"] = ParagraphStyle(
        "viva_a",
        fontName="Helvetica",
        fontSize=10,
        textColor=SLATE,
        leading=14,
        leftIndent=14,
        spaceAfter=4,
    )
    return styles


# ── Page template (header / footer) ──────────────────────────────────────────

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_footer(num_pages)
            super().showPage()
        super().save()

    def draw_page_footer(self, total):
        page_num = self._pageNumber
        if page_num <= 2:   # skip cover + TOC
            return
        self.saveState()
        self.setStrokeColor(BORDER)
        self.setLineWidth(0.5)
        self.line(MARGIN, 1.4 * cm, PAGE_W - MARGIN, 1.4 * cm)
        self.setFont("Helvetica", 8)
        self.setFillColor(MUTED)
        self.drawString(MARGIN, 0.9 * cm, "EducAI — AI-Powered Study Abroad Guidance Platform")
        self.drawRightString(PAGE_W - MARGIN, 0.9 * cm, f"Page {page_num} of {total}")
        self.restoreState()


# ── Flowable helpers ──────────────────────────────────────────────────────────

def rule(s):
    return HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceAfter=6)


def section_header(text, s, level="h1"):
    items = []
    if level == "h1":
        items.append(HRFlowable(width="100%", thickness=2, color=AMBER, spaceBefore=4, spaceAfter=6))
    items.append(Paragraph(text, s[level]))
    return items


def bullets(items_list, s, indent=14):
    rows = []
    for item in items_list:
        rows.append(Paragraph(f"<bullet>&bull;</bullet> {item}", s["bullet"]))
    return rows


def status_badge(label, color):
    data = [[Paragraph(label, ParagraphStyle("sb", fontName="Helvetica-Bold", fontSize=8, textColor=WHITE, alignment=TA_CENTER))]]
    t = Table(data, colWidths=[2.8 * cm], rowHeights=[0.45 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), color),
        ("ROUNDEDCORNERS", [3]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t


def feature_table(rows_data, col_widths, s):
    header_row = rows_data[0]
    header = [Paragraph(h, s["table_header"]) for h in header_row]
    body   = [[Paragraph(str(c), s["table_cell"]) for c in row] for row in rows_data[1:]]
    all_rows = [header] + body
    t = Table(all_rows, colWidths=col_widths, repeatRows=1)
    n = len(all_rows)
    style_cmds = [
        ("BACKGROUND",    (0, 0), (-1, 0), AMBER),
        ("TEXTCOLOR",     (0, 0), (-1, 0), WHITE),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 9),
        ("GRID",          (0, 0), (-1, -1), 0.5, BORDER),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
    ]
    for i in range(1, n):
        bg = AMBER_LIGHT if i % 2 == 0 else WHITE
        style_cmds.append(("BACKGROUND", (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t


# ── CONTENT SECTIONS ──────────────────────────────────────────────────────────

def cover_page(s):
    story = []
    story.append(Spacer(1, 3.5 * cm))

    # Amber accent bar
    bar_data = [[""]]
    bar = Table(bar_data, colWidths=[PAGE_W - 2 * MARGIN], rowHeights=[0.35 * cm])
    bar.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), AMBER)]))
    story.append(bar)
    story.append(Spacer(1, 0.8 * cm))

    story.append(Paragraph("EducAI", s["cover_title"]))
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph("AI-Powered Study Abroad Guidance Platform", s["cover_subtitle"]))
    story.append(Spacer(1, 0.6 * cm))
    story.append(Paragraph("Project Overview &amp; Presentation Handbook", s["cover_meta"]))
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph("Prepared by: Prohar Saha Polak", s["cover_meta"]))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph("April 2026", s["cover_meta"]))
    story.append(Spacer(1, 1.2 * cm))

    bar2 = Table(bar_data, colWidths=[PAGE_W - 2 * MARGIN], rowHeights=[0.35 * cm])
    bar2.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), AMBER)]))
    story.append(bar2)
    story.append(Spacer(1, 1.2 * cm))

    # Tagline box
    tagline_data = [["For: Project Overview / Viva / Interview / Presentation"]]
    tagline_t = Table(tagline_data, colWidths=[PAGE_W - 2 * MARGIN])
    tagline_t.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), AMBER_LIGHT),
        ("TEXTCOLOR",     (0, 0), (-1, -1), DARK),
        ("FONTNAME",      (0, 0), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 11),
        ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING",    (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("BOX",           (0, 0), (-1, -1), 1, AMBER),
    ]))
    story.append(tagline_t)
    story.append(PageBreak())
    return story


def toc_page(s):
    story = []
    story += section_header("Table of Contents", s)
    story.append(Spacer(1, 0.3 * cm))

    entries = [
        ("1.", "Executive Summary"),
        ("2.", "Problem Statement"),
        ("3.", "Target Users"),
        ("4.", "How the Web App Works — User Journey"),
        ("5.", "System Overview in Simple Words"),
        ("6.", "Module 1 — Smart Program Matching & Planning"),
        ("  6.1", "Smart University & Program Matching"),
        ("  6.2", "Dynamic Admission Requirement Analyzer"),
        ("  6.3", "Application Timeline Planner"),
        ("  6.4", "Application Strategy Generator"),
        ("  6.5", "SOP Builder"),
        ("  6.6", "CV Builder"),
        ("  6.7", "Professor Finder"),
        ("7.", "Module 2 — Scholarship & Funding Intelligence"),
        ("  7.1", "AI Scholarship Hunter"),
        ("  7.2", "Funding Eligibility Checker"),
        ("  7.3", "Scholarship Deadline Alert System"),
        ("  7.4", "Funding Probability Predictor"),
        ("8.", "AI Chatbot / Floating Assistant"),
        ("9.", "Technologies Used"),
        ("10.", "Data, Logic & Intelligence Layer"),
        ("11.", "Current Project Status"),
        ("12.", "Key Strengths of the Project"),
        ("13.", "Challenges & Future Improvements"),
        ("14.", "How to Explain This Project — Viva & Interview Guide"),
        ("15.", "Final Summary"),
    ]

    for num, title in entries:
        style = s["toc_section"] if not num.startswith("  ") else s["toc_item"]
        indent = 0 if not num.startswith("  ") else 18
        story.append(Paragraph(
            f'<font color="#D97706"><b>{num.strip()}</b></font>&nbsp;&nbsp;&nbsp;{title}',
            ParagraphStyle("toc_e", parent=style, leftIndent=indent)
        ))

    story.append(PageBreak())
    return story


def executive_summary(s):
    story = []
    story += section_header("1. Executive Summary", s)
    story.append(Paragraph(
        "EducAI is a full-stack web application built to help international students navigate "
        "the complex process of applying to study abroad. From finding the right programmes "
        "and scholarships to building timelines, generating application documents, and getting "
        "instant AI-powered advice — EducAI brings everything a student needs into one platform.",
        s["body"]
    ))
    story.append(Paragraph(
        "The platform is built around two core modules. <b>Module 1</b> focuses on programme "
        "discovery and planning: it matches students with real universities and degree programmes "
        "based on their academic profile, budget, and target countries. It also generates personalised "
        "application timelines, strategy reports, SOP drafts, CV drafts, and professor outreach templates. "
        "<b>Module 2</b> focuses on funding: it helps students find scholarships, check eligibility, "
        "predict success probability, and receive deadline reminders.",
        s["body"]
    ))
    story.append(Paragraph(
        "At its core, EducAI is powered by live web scraping, large language models (LLMs), and a "
        "structured database. Unlike a static directory, it fetches and ranks programmes live from "
        "the web, uses AI to generate personalised documents and advice, and adapts its responses "
        "based on each student's individual profile.",
        s["body"]
    ))
    story.append(Paragraph(
        "The project is approximately 90% feature-complete, with all twelve originally planned "
        "features implemented and a floating AI advisor chatbot available on every page.",
        s["body"]
    ))
    story.append(PageBreak())
    return story


def problem_statement(s):
    story = []
    story += section_header("2. Problem Statement", s)
    story.append(Paragraph(
        "Every year, hundreds of thousands of students attempt to apply for international study programmes. "
        "The process is fragmented, time-consuming, and often overwhelming. Here is what students typically face:",
        s["body"]
    ))
    pain_points = [
        "There is no single place to compare universities, programmes, deadlines, and tuition fees across "
        "multiple countries at once.",
        "Each university has different admission requirements — GPA thresholds, English test scores, "
        "reference letter formats, and application deadlines — and tracking all of this manually is error-prone.",
        "Scholarship information is scattered across dozens of websites, each with different eligibility "
        "criteria, funding amounts, and deadlines.",
        "Visa timelines add another layer of complexity. Many students miss visa appointment windows because "
        "they did not plan far enough in advance.",
        "Writing a Statement of Purpose (SOP) or CV tailored to specific programmes is time-consuming, "
        "and most students do not know what a strong application looks like.",
        "Getting personalised advice requires either hiring a consultant (expensive) or spending weeks "
        "browsing forums and YouTube videos (unreliable).",
    ]
    story += bullets(pain_points, s)
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(
        "<b>How EducAI addresses these pain points:</b> EducAI centralises programme discovery, "
        "scholarship search, eligibility checking, timeline generation, document drafting, and AI advice "
        "in one web application. Instead of visiting ten different websites, a student can complete "
        "their entire planning process within a single platform.",
        s["body"]
    ))
    story.append(PageBreak())
    return story


def target_users(s):
    story = []
    story += section_header("3. Target Users", s)
    story.append(Paragraph(
        "EducAI is designed for students at different stages of the study-abroad planning process:",
        s["body"]
    ))

    user_data = [
        ["User Type", "Who They Are", "How EducAI Helps"],
        ["Bachelor's Applicants", "Students applying for undergraduate programmes abroad", "Programme matching, requirement analysis, timeline planning"],
        ["Master's Applicants", "Graduates seeking postgraduate study", "All features — most prominent use case"],
        ["PhD Researchers", "Students seeking doctoral programmes and supervisors", "Professor finder, strategy reports, research-focused SOP"],
        ["Scholarship Seekers", "Students looking for funding, grants, or assistantships", "Scholarship hunter, eligibility checker, deadline alerts"],
        ["Budget-Conscious Students", "Students with specific budget constraints", "Budget-aware matching, scholarship probability prediction"],
        ["Multi-Country Comparers", "Students comparing programmes across several countries", "Side-by-side programme data, country-specific timelines"],
        ["Late Planners", "Students who started preparing close to deadlines", "Timeline planner with urgency flagging, deadline alerts"],
    ]
    story.append(feature_table(
        user_data,
        [3.5 * cm, 5.5 * cm, 7.5 * cm],
        s
    ))
    story.append(PageBreak())
    return story


def user_journey(s):
    story = []
    story += section_header("4. How the Web App Works — User Journey", s)
    story.append(Paragraph(
        "The following describes the complete experience of a new user from sign-up to using "
        "all the features of EducAI.",
        s["body"]
    ))

    steps = [
        ("Step 1: Sign Up & Verify Email",
         "A new user creates an account with their email address and sets a password. "
         "A verification email is sent automatically. Once verified, they can sign in."),
        ("Step 2: Complete the Onboarding Profile",
         "First-time users are guided through a 4-step setup wizard. They enter: "
         "(1) their study stage and target intake year; "
         "(2) academic details — GPA, institution, major, graduation year; "
         "(3) English test scores (IELTS/TOEFL/PTE) and optionally GRE or GMAT; "
         "(4) budget in their preferred currency, funding need, preferred cities, and study priorities. "
         "This profile is the foundation for all personalised features."),
        ("Step 3: Run AI Programme Match",
         "On the Match page, the student clicks 'Run Match'. The system searches live university "
         "websites based on their preferred major, level, and target countries. It extracts programme "
         "details (title, university, tuition, requirements, deadlines) and scores each programme against "
         "the student's profile. Results are shown with a match score: Strong Match (80%+), "
         "Good Match (50%+), or Stretch (<50%). Students can bookmark programmes they find interesting."),
        ("Step 4: Explore & Save Programmes",
         "The Programmes page lists all programmes discovered across runs. Students can search "
         "by country, level, or field, and view full details including requirements and deadlines. "
         "Bookmarked programmes appear in a dedicated Saved page."),
        ("Step 5: Generate an Application Timeline",
         "The Timeline Planner builds a 15-month roadmap based on the student's saved programmes "
         "and target country. It includes phases for preparation, applications, scholarship applications, "
         "visa processing, and orientation. Country-specific visa milestones are built into the timeline."),
        ("Step 6: Generate an Application Strategy",
         "The Strategy Generator produces an AI-written report that explains: why the selected "
         "country fits their profile, their estimated admission chances (e.g. 'Above Average — 65th percentile'), "
         "risk assessment (academic, budget, visa), concrete recommended actions, and a document checklist."),
        ("Step 7: Explore Scholarships",
         "The Scholarship Hunter shows 28 real-world scholarships (Fulbright, Chevening, DAAD, "
         "Erasmus+, and others). Students can filter by country, funding type, or field. "
         "Each scholarship shows eligibility requirements and an upcoming deadline. "
         "A probability score tells students their estimated chance of receiving each award."),
        ("Step 8: Build Application Documents",
         "The SOP Builder generates a Statement of Purpose draft tailored to the student's "
         "profile. Three writing tones (formal, research-focused, personal) and three SOP types "
         "(general application, scholarship, research programme) are available. "
         "The CV Builder similarly produces an ATS-friendly curriculum vitae in three styles "
         "(academic, research, industry). Both outputs can be copied or downloaded."),
        ("Step 9: Find Professors (for PhD applicants)",
         "The Professor Finder lets students search for faculty members by research interest, "
         "university, or country. It generates a personalised cold-email template for each "
         "professor automatically."),
        ("Step 10: Ask the AI Advisor",
         "A floating chat assistant is present on every page. Students can ask questions like "
         "'Which programme fits my GPA?', 'What visa do I need for Germany?', or 'Compare my saved "
         "programmes'. The assistant uses the student's profile and saved data to give contextual "
         "answers with source citations."),
    ]

    for title, desc in steps:
        story.append(KeepTogether([
            Paragraph(title, s["h3"]),
            Paragraph(desc, s["body"]),
        ]))

    story.append(PageBreak())
    return story


def system_overview(s):
    story = []
    story += section_header("5. System Overview in Simple Words", s)
    story.append(Paragraph(
        "EducAI is made up of three parts that work together. Here is what each part does in plain language:",
        s["body"]
    ))

    components = [
        ("The Web Application (Frontend)",
         "This is what the student sees and interacts with. It is a modern web application "
         "built with Next.js, which is a popular framework for building fast, dynamic websites. "
         "Every page — the dashboard, match results, timeline, scholarships, chat, and document "
         "builders — is part of this layer. It communicates with the backend to fetch and save data."),
        ("The Backend Server",
         "This is the engine behind the website. It is a Node.js/Express server that handles "
         "all business logic: user authentication, profile management, matching logic, "
         "scholarship eligibility scoring, timeline generation, deadline alert emails, "
         "and storing all data in the database. When the website needs information (e.g. "
         "a user's saved programmes or scholarship results), it asks the backend."),
        ("The AI Server",
         "This is a separate Python service that handles all AI-related tasks. It does "
         "three key things: (1) performs live web scraping to find university programmes, "
         "(2) uses a large language model (LLM) to extract structured data from scraped web pages "
         "and generate personalised text (strategy reports, SOPs, CVs, chat answers), and "
         "(3) provides the AI advisor chatbot's response logic including web search."),
        ("The Database",
         "All data is stored in a PostgreSQL database hosted on Neon (a cloud database provider). "
         "This includes: user accounts and profiles, discovered programmes and universities, "
         "scholarship information, match results, roadmaps, strategy reports, and alert history. "
         "The database ensures that results are saved and do not need to be regenerated every time."),
        ("External Services",
         "EducAI connects to a small number of external services: "
         "Serper.dev for live web search results, "
         "Firecrawl for converting live web pages into readable text, "
         "and an LLM provider (Groq/OpenRouter/Google Gemini) for AI text generation. "
         "Email alerts are sent via Nodemailer (or console-logged in development mode)."),
    ]

    for title, desc in components:
        story.append(KeepTogether([
            Paragraph(title, s["h3"]),
            Paragraph(desc, s["body"]),
        ]))

    story.append(Spacer(1, 0.3 * cm))

    # Simple architecture table
    arch_data = [
        ["Layer", "Technology", "Role"],
        ["Web App (Frontend)", "Next.js 15, React, TypeScript", "User interface — everything the student sees"],
        ["Backend API", "Node.js, Express, TypeScript", "Business logic, data handling, auth, emails"],
        ["AI Server", "Python, FastAPI", "Live scraping, LLM calls, AI responses"],
        ["Database", "PostgreSQL on Neon", "Stores all user data, programmes, results"],
        ["Search", "Serper.dev", "Google-like live web search"],
        ["Scraping", "Firecrawl", "Converts web pages into readable text"],
        ["AI Generation", "Groq / OpenRouter / Gemini", "Powers matching, strategy, SOP, chat answers"],
        ["Styling", "Tailwind CSS + shadcn/ui", "Clean, responsive design system"],
    ]
    story.append(feature_table(arch_data, [4 * cm, 5 * cm, 7.5 * cm], s))
    story.append(PageBreak())
    return story


def module1(s):
    story = []
    story += section_header("6. Module 1 — Smart Programme Matching & Planning", s)
    story.append(Paragraph(
        "Module 1 is the core of EducAI's programme discovery experience. It combines live "
        "web scraping, AI extraction, and structured scoring to match students with real "
        "degree programmes. It also provides planning tools to help students prepare "
        "a strong application.",
        s["body"]
    ))

    # 6.1
    story += section_header("6.1  Smart University & Programme Matching", s, "h2")
    story.append(Paragraph(
        "<b>What it does:</b> Given a student's major, study level, target countries, and budget, "
        "the system searches live university websites and returns a ranked list of matching programmes.",
        s["body"]
    ))
    story.append(Paragraph("<b>How it works step by step:</b>", s["body_left"]))
    story += bullets([
        "The student's profile (major, level, countries, budget, GPA, English score) is collected.",
        "The system generates 6 different search queries — using the student's major plus related synonyms "
        "and related terms from a built-in academic taxonomy (covering 40+ fields including Computer Science, "
        "Cybersecurity, Data Science, Law, Public Health, Psychology, Business, Engineering, and more).",
        "Live web search results are gathered using Serper.dev (up to 30 URLs per run).",
        "The top 10 most relevant URLs are scraped using Firecrawl, which converts HTML pages into "
        "clean readable text.",
        "An AI model reads all the scraped text and extracts structured data: university name, "
        "programme title, study level, field, tuition fees (USD), duration, GPA requirements, "
        "English score requirement, and application URL.",
        "Each programme is scored against the student's profile. Scoring factors: "
        "country match (+25), level match (+20), field match (+20), within budget (+20), "
        "GPA meets minimum (+15). Maximum score is 100.",
        "Results are sorted by score and displayed: Strong Match (80+), Good Match (50+), Stretch (<50).",
        "Results are saved to the database with a 24-hour cache. If the same search is repeated "
        "within 24 hours, results are loaded from the database instantly.",
    ], s)
    story.append(Paragraph(
        "<b>Why it is useful:</b> A student no longer needs to manually visit dozens of university "
        "websites. The system does the search, extracts the key facts, and shows only the programmes "
        "that are a realistic match based on the student's actual profile.",
        s["body"]
    ))

    # 6.2
    story += section_header("6.2  Dynamic Admission Requirement Analyzer", s, "h2")
    story.append(Paragraph(
        "<b>What it does:</b> For every programme discovered, EducAI extracts and displays the "
        "admission requirements — what the student needs to qualify.",
        s["body"]
    ))
    story += bullets([
        "Requirements extracted include: minimum GPA, required English test type and score "
        "(IELTS, TOEFL, PTE), GRE/GMAT scores if required, application deadlines per intake, "
        "and programme-specific notes.",
        "Requirements are stored in the database linked to each programme and are visible "
        "on the programme detail page.",
        "The matching algorithm uses these requirements to flag whether the student meets "
        "each threshold and reflects this in the match score.",
    ], s)
    story.append(Paragraph(
        "<b>Why it is useful:</b> Instead of reading individual university web pages, a student "
        "can see all key requirements side-by-side in a consistent format.",
        s["body"]
    ))

    # 6.3
    story += section_header("6.3  Application Timeline Planner", s, "h2")
    story.append(Paragraph(
        "<b>What it does:</b> Generates a 15-month step-by-step application roadmap tailored "
        "to the student's saved programmes and target country.",
        s["body"]
    ))
    story += bullets([
        "The timeline runs from 12 months before the target intake to 3 months after arrival.",
        "It is divided into phases: Preparation (shortlisting, test preparation, recommendation letters), "
        "Application (SOP writing, submission), Scholarship Applications, Visa Gathering, "
        "Visa Appointment Booking, and Orientation.",
        "Real programme deadlines (from saved programmes) are injected into the timeline.",
        "Country-specific visa milestones are added based on templates for UK, US, Canada, Australia, "
        "Germany, and more.",
        "Each month shows what tasks the student should be doing.",
    ], s)
    story.append(Paragraph(
        "<b>Why it is useful:</b> Most students underestimate how early visa applications must be "
        "submitted. A structured timeline removes this guesswork and helps students stay on track.",
        s["body"]
    ))

    # 6.4
    story += section_header("6.4  Application Strategy Generator", s, "h2")
    story.append(Paragraph(
        "<b>What it does:</b> Produces an AI-written personalised strategy report for a chosen "
        "target country and intake.",
        s["body"]
    ))
    story += bullets([
        "The report includes: a short executive summary of the student's profile fit, "
        "an explanation of why the target country suits them, estimated admission chances "
        "(expressed as a band like 'Above Average — 65th percentile'), "
        "a risk assessment (academic, budget, and visa risks), "
        "concrete recommended actions (e.g. 'Improve IELTS to 7.0 before applying'), "
        "a document checklist, and an honesty disclaimer.",
        "Reports are cached — if the student's profile and saved programmes have not changed, "
        "the same report is returned instantly.",
    ], s)
    story.append(Paragraph(
        "<b>Why it is useful:</b> This replaces what would typically require a consultation with "
        "a paid admissions advisor. The student gets a structured, honest, personalised plan.",
        s["body"]
    ))

    # 6.5
    story += section_header("6.5  SOP Builder", s, "h2")
    story.append(Paragraph(
        "<b>What it does:</b> Generates a draft Statement of Purpose (SOP) — the personal essay "
        "most universities require as part of an application.",
        s["body"]
    ))
    story += bullets([
        "Three writing tones: Formal & Professional, Research-Focused, and Personal & Narrative.",
        "Three SOP types: General University Application, Scholarship Application, Research Programme.",
        "The SOP is automatically personalised using the student's academic background, GPA, "
        "major, work experience, target level, and study motivation.",
        "Output is approximately 500 words — a strong starting draft that the student can edit and personalise further.",
        "Copy and download options are available.",
    ], s)

    # 6.6
    story += section_header("6.6  CV Builder", s, "h2")
    story.append(Paragraph(
        "<b>What it does:</b> Generates an ATS-friendly academic or professional CV from the student's profile.",
        s["body"]
    ))
    story += bullets([
        "Three styles: Academic (research publications focus), Research (laboratory/project emphasis), Industry (internship/work focus).",
        "Uses the student's profile data to pre-fill the CV structure.",
        "ATS-friendly format means the CV is designed to pass Applicant Tracking System filters used by many universities.",
        "Copy and download options are available.",
    ], s)

    # 6.7
    story += section_header("6.7  Professor Finder", s, "h2")
    story.append(Paragraph(
        "<b>What it does:</b> Helps PhD applicants find potential supervisors and generate "
        "cold-email outreach templates.",
        s["body"]
    ))
    story += bullets([
        "Students enter a research interest, university name, or country.",
        "The system searches the web for relevant faculty profiles.",
        "For each result, an AI-generated cold email template is produced — personalised "
        "to the professor's research area.",
    ], s)
    story.append(Paragraph(
        "<b>Current status:</b> Functional, but professor results come from live web search "
        "rather than a curated professor database. Results vary in quality.",
        s["body"]
    ))

    story.append(PageBreak())
    return story


def module2(s):
    story = []
    story += section_header("7. Module 2 — Scholarship & Funding Intelligence", s)
    story.append(Paragraph(
        "Module 2 focuses entirely on helping students find and secure funding for their studies abroad. "
        "It covers scholarship discovery, eligibility checking, probability scoring, and deadline reminders.",
        s["body"]
    ))

    # 7.1
    story += section_header("7.1  AI Scholarship Hunter", s, "h2")
    story.append(Paragraph(
        "<b>What it does:</b> Provides a searchable database of 28 real-world scholarships and "
        "funding opportunities for international students.",
        s["body"]
    ))
    story.append(Paragraph("<b>Scholarships included (examples):</b>", s["body_left"]))
    story += bullets([
        "Fulbright Program (USA)",
        "Chevening Scholarships (UK)",
        "DAAD Scholarships (Germany)",
        "Erasmus+ (EU countries)",
        "Gates Cambridge Scholarship (UK)",
        "Commonwealth Scholarships (various Commonwealth nations)",
        "Australia Awards Scholarship",
        "New Zealand Excellence Award",
        "And more — filtered by country, level, funding type, and field",
    ], s)
    story.append(Paragraph(
        "<b>How it works:</b> Students can search and filter scholarships by country, study level, "
        "academic field, and funding type (full scholarship, partial, fee waiver, living allowance). "
        "Each scholarship card shows the funding amount, eligibility summary, and upcoming deadline.",
        s["body"]
    ))

    # 7.2
    story += section_header("7.2  Funding Eligibility Checker", s, "h2")
    story.append(Paragraph(
        "<b>What it does:</b> For any scholarship, the system checks whether the student meets "
        "the stated eligibility criteria and shows a detailed breakdown.",
        s["body"]
    ))
    story += bullets([
        "Checks: GPA threshold, English test type and score, financial need requirement, "
        "study level match, and country of study.",
        "Shows which criteria the student meets, which they narrowly miss, and which are blockers.",
        "For each missed criterion, the system provides a specific improvement suggestion "
        "(e.g. 'Your IELTS score of 6.0 is below the required 6.5 — consider retaking the test').",
    ], s)
    story.append(Paragraph(
        "<b>Why it is useful:</b> Students waste time applying for scholarships they do not qualify for. "
        "This feature gives an honest, specific assessment before they invest time in an application.",
        s["body"]
    ))

    # 7.3
    story += section_header("7.3  Scholarship Deadline Alert System", s, "h2")
    story.append(Paragraph(
        "<b>What it does:</b> Sends automated email reminders to students when scholarship "
        "deadlines are approaching.",
        s["body"]
    ))
    story += bullets([
        "Alerts are sent at 30 days, 14 days, 7 days, and 1 day before each scholarship deadline.",
        "The system runs as a daily scheduled job that scans all upcoming deadlines.",
        "Each alert is sent only once per student per deadline per distance (no duplicate emails).",
        "Students can view recent alerts and unread notification counts within the app.",
    ], s)
    story.append(Paragraph(
        "<b>Why it is useful:</b> Missing a scholarship deadline is irreversible. "
        "Automated reminders at multiple intervals ensure students never lose track of important dates.",
        s["body"]
    ))

    # 7.4
    story += section_header("7.4  Funding Probability Predictor", s, "h2")
    story.append(Paragraph(
        "<b>What it does:</b> Calculates an estimated probability score for each scholarship "
        "based on how well the student's profile matches the scholarship's typical recipient profile.",
        s["body"]
    ))
    story.append(Paragraph("<b>The six scoring factors:</b>", s["body_left"]))
    story += bullets([
        "GPA score — does the student's GPA meet or exceed the scholarship threshold?",
        "English test score — how close is the student to the required English proficiency level?",
        "GRE/GMAT score — if required, does the student have a competitive score?",
        "Work experience — does the student have relevant experience that strengthens the application?",
        "Financial need — does the student demonstrate genuine need for funding?",
        "Country preference match — is the student's target country aligned with the scholarship's offering?",
    ], s)
    story.append(Paragraph(
        "Each factor is weighted and combined into a final probability percentage. "
        "This is guidance only — actual selection depends on the scholarship committee's decisions, "
        "but the score gives students a realistic sense of their competitiveness.",
        s["body"]
    ))
    story.append(PageBreak())
    return story


def chatbot_section(s):
    story = []
    story += section_header("8. AI Chatbot / Floating Assistant", s)
    story.append(Paragraph(
        "EducAI includes a floating AI advisor chatbot that is available on every page of the application. "
        "Students can open it at any time by clicking the chat icon in the bottom-right corner.",
        s["body"]
    ))

    story += section_header("What the chatbot can answer", s, "h2")
    story += bullets([
        "Questions about their saved programmes — 'Which of my saved programmes has the lowest tuition?'",
        "Visa requirements — 'What visa do I need to study in Germany?'",
        "Scholarship guidance — 'Which scholarships match my profile?'",
        "Deadline questions — 'What deadlines should I focus on this month?'",
        "Budget fit — 'Which programme fits within my $20,000 budget?'",
        "Application advice — 'How do I strengthen my application for UK universities?'",
        "Programme comparison — 'Compare my saved programmes'",
        "Country-specific guidance — living costs, popular universities, acceptance rates",
    ], s)

    story += section_header("How it works", s, "h2")
    story += bullets([
        "When the student sends a message, the app collects their full profile context: "
        "academic profile, saved programmes, most recent match results, application timeline, "
        "and strategy report.",
        "This context plus the conversation history is sent to the AI model.",
        "The model generates a structured response: a main answer, bullet-point highlights, "
        "suggested next steps, source references (with links where available), and a confidence level.",
        "The chatbot uses web search when needed to find up-to-date information.",
        "Responses are fast (typically under 5 seconds) because the system first tries Groq "
        "(a very fast LLM provider), then falls back to OpenRouter, then Gemini if needed.",
    ], s)

    story += section_header("How it is better than a normal FAQ or search", s, "h2")
    story.append(Paragraph(
        "A typical FAQ shows the same answer to everyone. EducAI's chatbot knows who the student is — "
        "their GPA, their budget, their target countries, their saved programmes. So when a student asks "
        "'Can I get into Oxford?', the system can give a contextualised answer based on their actual "
        "profile rather than a generic response.",
        s["body"]
    ))
    story.append(PageBreak())
    return story


def technologies(s):
    story = []
    story += section_header("9. Technologies Used", s)

    tech_data = [
        ["Category", "Technology / Tool", "Why It Is Used"],
        ["Frontend", "Next.js 15 + React", "Fast, modern web framework for building the user interface"],
        ["Frontend", "TypeScript", "Type-safe code reduces bugs and improves maintainability"],
        ["Frontend", "Tailwind CSS", "Utility-first styling — builds clean, responsive designs quickly"],
        ["Frontend", "shadcn/ui", "Pre-built accessible UI components (buttons, forms, cards)"],
        ["Backend", "Node.js + Express", "Handles API requests, authentication, and business logic"],
        ["Backend", "TypeScript", "Same as frontend — type-safe, consistent codebase"],
        ["Backend", "Prisma ORM", "Simplifies all database operations with a type-safe query builder"],
        ["AI Server", "Python + FastAPI", "Runs the AI logic — scraping, LLM calls, data extraction"],
        ["AI Server", "httpx", "Makes HTTP requests to LLM provider APIs and web services"],
        ["Database", "PostgreSQL (Neon)", "Relational cloud database — stores all user and programme data"],
        ["Authentication", "JWT + Argon2id", "Secure token-based auth with strong password hashing"],
        ["Search", "Serper.dev API", "Returns live web search results for programme and professor discovery"],
        ["Scraping", "Firecrawl API", "Converts live web pages into clean text for LLM processing"],
        ["AI / LLM", "Groq (primary)", "Fastest LLM API (free tier) — used for chat and extractions"],
        ["AI / LLM", "OpenRouter (secondary)", "Broad model access — fallback for heavy generation tasks"],
        ["AI / LLM", "Google Gemini (tertiary)", "Reliable fallback when other providers are unavailable"],
        ["Email", "Nodemailer", "Sends deadline alerts and auth emails"],
        ["Testing", "Jest (server)", "62 automated tests for authentication and core routes"],
        ["CI/CD", "GitHub Actions", "Automated build checks on every code push"],
    ]
    story.append(feature_table(tech_data, [3 * cm, 4.5 * cm, 9 * cm], s))
    story.append(PageBreak())
    return story


def data_logic(s):
    story = []
    story += section_header("10. Data, Logic & Intelligence Layer", s)
    story.append(Paragraph(
        "EducAI's value comes not just from its interface but from how it processes, scores, "
        "and generates information. Here is a plain-language description of each layer.",
        s["body"]
    ))

    items = [
        ("Profile Data",
         "Every student's preferences — study level, major, GPA, test scores, budget, target countries — "
         "are stored in the database after onboarding. This profile is the input to all personalised features."),
        ("Matching Logic",
         "Matching is a weighted scoring formula. Country match, level match, field match, budget fit, "
         "and GPA eligibility each contribute a defined number of points. The result is a 0–100 score "
         "used to rank programmes. Major synonyms (e.g. 'Computer Science' matching 'CS', 'Software Engineering', 'IT') "
         "ensure broad coverage."),
        ("Scholarship Eligibility Logic",
         "Eligibility is checked deterministically: each criterion (GPA, English score, financial need) "
         "is compared against a fixed threshold stored for each scholarship. No AI is involved here — "
         "it is straightforward rules-based logic."),
        ("Probability Scoring",
         "Probability is a weighted combination of six factors stored in the student's profile. "
         "Each factor receives a score and a weight. The final percentage is the weighted average. "
         "It is consistent and reproducible, not randomly generated."),
        ("Timeline Generation",
         "The 15-month roadmap is deterministic. Given the student's target intake date and saved programmes, "
         "the system calculates exact calendar dates for each task. Country-specific visa milestones "
         "(e.g. 'Apply for UK Student Visa 3 months before start date') are stored as templates in the database."),
        ("AI Text Generation",
         "Strategy reports, SOP drafts, CV drafts, and chat answers are generated by a large language model "
         "(LLM). The model receives the student's profile data and produces personalised text. "
         "The system does not simply return generic templates — the output is contextualised to each student."),
        ("Caching",
         "Programme match results are cached for 24 hours. Strategy reports are cached until "
         "the student's profile or saved programmes change. Search results (Serper) are cached for 24 hours. "
         "Scraped page content (Firecrawl) is cached for 7 days. This reduces cost, improves speed, "
         "and prevents unnecessary API calls."),
        ("Web Search & Scraping",
         "Live programme data is fetched from the internet using Serper.dev for search "
         "and Firecrawl for reading web pages. This means the database is regularly refreshed "
         "with real, current programme information rather than relying on a static dataset."),
    ]

    for title, desc in items:
        story.append(KeepTogether([
            Paragraph(title, s["h3"]),
            Paragraph(desc, s["body"]),
        ]))

    story.append(PageBreak())
    return story


def project_status(s):
    story = []
    story += section_header("11. Current Project Status", s)
    story.append(Paragraph(
        "The following is an honest assessment of the current state of each feature after "
        "direct inspection of the codebase.",
        s["body"]
    ))

    status_data = [
        ["Feature", "Status", "Notes"],
        ["User Authentication (signup, login, OAuth, verification, password reset)", "Complete", "JWT + Argon2id, account lockout, 62 tests pass"],
        ["Onboarding Profile Wizard (4-step)", "Complete", "All fields collected, currency conversion, profile saved"],
        ["AI Programme Matching (live scrape + rank)", "Complete", "Major taxonomy, synonym expansion, 6 queries, top-10 scrape"],
        ["Admission Requirement Extraction", "Complete", "GPA, English, deadlines extracted and stored per programme"],
        ["Application Timeline Planner (15-month roadmap)", "Complete", "Deterministic, country visa templates for US/UK/CA/AU/DE"],
        ["Application Strategy Generator (AI report)", "Complete", "Cached, JSON report with chances, risks, actions"],
        ["SOP Builder (3 tones × 3 types)", "Complete", "Profile-injected, copy/download output"],
        ["CV Builder (3 styles, ATS-friendly)", "Complete", "Copy/download output"],
        ["Scholarship Hunter (28 scholarships)", "Complete", "Real scholarships, searchable, filterable"],
        ["Funding Eligibility Checker", "Complete", "Rules-based, GPA/English/need checks"],
        ["Funding Probability Predictor", "Complete", "6-factor weighted score per scholarship"],
        ["Scholarship Deadline Alerts (email)", "Complete", "30/14/7/1 day alerts, idempotent cron"],
        ["AI Chatbot / Floating Assistant", "Complete", "Context-aware, source citations, fast provider fallback"],
        ["Professor Finder", "Partial", "Works via web search + LLM templates, not a curated DB"],
        ["Programme Bookmark / Saved Page", "Complete", "Save/unsave, dedicated page"],
        ["Dashboard (summary view)", "Complete", "Profile %, recent match, saved programmes, deadlines"],
        ["Google OAuth Sign-In", "Complete", "OAuth flow configured"],
        ["Email Verification & Password Reset", "Complete", "Token-based, 24h TTL"],
    ]

    # Build table with colour-coded status column
    headers = status_data[0]
    header_row = [Paragraph(h, ParagraphStyle("th", fontName="Helvetica-Bold", fontSize=9, textColor=WHITE)) for h in headers]

    rows = [header_row]
    for r in status_data[1:]:
        status_val = r[1]
        if status_val == "Complete":
            status_col = Paragraph(status_val, ParagraphStyle("sc", fontName="Helvetica-Bold", fontSize=9, textColor=GREEN))
        else:
            status_col = Paragraph(status_val, ParagraphStyle("sc", fontName="Helvetica-Bold", fontSize=9, textColor=ORANGE))
        rows.append([
            Paragraph(r[0], ParagraphStyle("tc", fontName="Helvetica", fontSize=9, textColor=SLATE, leading=12)),
            status_col,
            Paragraph(r[2], ParagraphStyle("tc", fontName="Helvetica", fontSize=9, textColor=MUTED, leading=12)),
        ])

    t = Table(rows, colWidths=[7.5 * cm, 2.2 * cm, 6.8 * cm], repeatRows=1)
    n = len(rows)
    style_cmds = [
        ("BACKGROUND",    (0, 0), (-1, 0), AMBER),
        ("GRID",          (0, 0), (-1, -1), 0.5, BORDER),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
    ]
    for i in range(1, n):
        bg = AMBER_LIGHT if i % 2 == 0 else WHITE
        style_cmds.append(("BACKGROUND", (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    story.append(t)
    story.append(PageBreak())
    return story


def strengths(s):
    story = []
    story += section_header("12. Key Strengths of the Project", s)

    items = [
        ("Solves a Real-World Problem",
         "Study abroad planning is genuinely complex and stressful. EducAI addresses a problem "
         "that affects millions of students worldwide and provides measurable time savings."),
        ("End-to-End Coverage in One Platform",
         "Most competing tools address one part of the problem — either programme search, or scholarships, "
         "or document writing. EducAI combines all of these in a single coherent workflow."),
        ("Live Data, Not Static Directories",
         "Unlike traditional programme directories that go stale quickly, EducAI scrapes live university "
         "websites for each search. Results are fresh and relevant."),
        ("Personalised to Every Student",
         "Every output — match scores, strategy reports, SOP drafts, scholarship eligibility — is "
         "generated based on the individual student's actual profile. Nothing is generic."),
        ("AI-Powered at Multiple Layers",
         "AI is used thoughtfully: for data extraction from scraped content, for personalised text "
         "generation (strategy, SOPs, CVs), and for conversational guidance. It is not used "
         "gratuitously — deterministic logic is used where it is more reliable."),
        ("Robust Architecture",
         "The three-service architecture (web + backend + AI server) separates concerns cleanly. "
         "The AI server can be upgraded or replaced independently. Caching reduces API costs "
         "and improves response times."),
        ("Multi-LLM Fallback Resilience",
         "The system tries Groq first (fastest), then OpenRouter, then Gemini. If one provider "
         "goes down, the app keeps working. This is production-grade design thinking."),
        ("Security-First Authentication",
         "Argon2id password hashing, account lockout, email verification, JWT token rotation, "
         "and Google OAuth are all implemented to modern security standards."),
        ("Comprehensive Testing",
         "62 automated server tests cover authentication, lockout, token rotation, and profile saving. "
         "This gives confidence in the reliability of the core security features."),
    ]

    for title, desc in items:
        story.append(KeepTogether([
            Paragraph(title, s["h3"]),
            Paragraph(desc, s["body"]),
        ]))

    story.append(PageBreak())
    return story


def challenges(s):
    story = []
    story += section_header("13. Challenges & Future Improvements", s)

    story += section_header("Challenges Faced During Development", s, "h2")
    challenges_list = [
        ("Data Quality from Scraping",
         "Live web scraping is inherently unpredictable. Some university pages load slowly, "
         "use JavaScript rendering, or structure their content in ways that are difficult to parse. "
         "Firecrawl handles most cases, but occasionally a scrape returns incomplete data."),
        ("LLM Rate Limits and Latency",
         "Free-tier LLM providers impose rate limits. The system addresses this with exponential "
         "backoff retries and a multi-provider fallback chain, but heavy concurrent usage could "
         "still trigger limits."),
        ("Database Schema Evolution",
         "Adding new features (like budget normalisation to USD) required adding new database columns "
         "and running migrations carefully to avoid breaking existing data."),
        ("Professor Finder Data Quality",
         "Finding real, accurate professor profiles requires either a curated database or highly "
         "reliable web scraping. The current implementation depends on web search, which means results "
         "vary in consistency."),
        ("Matching Coverage for Niche Majors",
         "Initial matching was weak for short or abbreviated majors (e.g. 'AI', 'CS', 'Law') "
         "because a word-length filter incorrectly excluded these terms. This was fixed with a "
         "major synonym taxonomy covering 40+ fields."),
    ]
    for title, desc in challenges_list:
        story.append(KeepTogether([
            Paragraph(title, s["h3"]),
            Paragraph(desc, s["body"]),
        ]))

    story += section_header("Future Improvements", s, "h2")
    future = [
        "Add an application status tracker — allowing students to mark applications as 'Draft', 'Submitted', 'Interview', 'Offered', 'Rejected'.",
        "Expand the scholarship database beyond 28 entries using live scholarship search and scraping.",
        "Build a curated professor database to replace web-search-dependent professor discovery.",
        "Add real-time in-app notifications (toast messages / push notifications) alongside email alerts.",
        "Support resume/CV upload and parsing — extract existing information to pre-fill the profile.",
        "Add a comparison view — allow students to compare two or three programmes side-by-side.",
        "Integrate live exchange rate API to replace approximate static exchange rates.",
        "Build a mobile-friendly Progressive Web App (PWA) for on-the-go use.",
        "Add community features — peer reviews, discussion forums, and shared tips.",
    ]
    story += bullets(future, s)
    story.append(PageBreak())
    return story


def viva_guide(s):
    story = []
    story += section_header("14. How to Explain This Project — Viva & Interview Guide", s)

    # 30-second pitch
    story += section_header("30-Second Explanation", s, "h2")
    story.append(Paragraph(
        "EducAI is an AI-powered web platform that helps students plan their study-abroad journey. "
        "It matches students with real university programmes based on their academic profile, "
        "finds and checks eligibility for scholarships, generates application timelines and strategy reports, "
        "and includes an AI advisor chatbot. Everything is personalised to each student's specific profile.",
        s["body"]
    ))

    # 1-minute
    story += section_header("1-Minute Explanation", s, "h2")
    story.append(Paragraph(
        "EducAI is a full-stack web application I built to solve the problem of fragmented study-abroad planning. "
        "Right now, a student who wants to study abroad has to visit dozens of websites — one for university "
        "information, another for scholarships, another for visa guidance — and try to piece it all together manually. "
        "EducAI brings all of this into one platform. "
        "Module 1 handles programme discovery and planning: it scrapes live university websites, extracts programme "
        "data using an AI model, scores programmes against the student's profile, and generates a 15-month "
        "application timeline and personalised strategy report. "
        "Module 2 handles scholarships: it shows 28 real scholarships, checks whether the student is eligible "
        "for each one, predicts their probability of success, and sends deadline reminder emails automatically. "
        "On top of all this, there is a floating AI advisor chatbot that the student can ask questions on any page. "
        "The platform is built with Next.js on the frontend, Node.js/Express on the backend, and a Python FastAPI "
        "service that handles all AI and scraping tasks.",
        s["body"]
    ))

    # 3-minute
    story += section_header("3-Minute Explanation", s, "h2")
    story.append(Paragraph(
        "EducAI is an AI-assisted study-abroad guidance platform. Let me walk you through it.",
        s["body"]
    ))
    story.append(Paragraph(
        "<b>The Problem:</b> International students face a fragmented, confusing process when planning to study abroad. "
        "There is no single tool that covers programme matching, scholarship search, visa planning, "
        "document preparation, and personalised advice. Students waste weeks searching across dozens "
        "of disconnected websites, and many miss deadlines or make avoidable application mistakes.",
        s["body"]
    ))
    story.append(Paragraph(
        "<b>My Solution:</b> EducAI is a web application where a student completes their profile once "
        "(GPA, test scores, budget, target countries, major), and then gets a personalised, AI-assisted "
        "planning experience across six categories: programme matching, timeline planning, strategy generation, "
        "scholarship discovery, document building, and advisory chat.",
        s["body"]
    ))
    story.append(Paragraph(
        "<b>The Technical Architecture:</b> The app has three services. The web frontend (Next.js) is what "
        "the student sees. The backend (Express/Node.js) handles business logic, authentication, "
        "and database operations. A separate Python AI server handles all scraping and LLM calls. "
        "The database is PostgreSQL on Neon (a cloud platform).",
        s["body"]
    ))
    story.append(Paragraph(
        "<b>How Matching Works:</b> When a student clicks Run Match, the AI server generates six search queries "
        "based on their major and target countries. It scrapes the top 10 URLs for relevant programme data "
        "using Serper.dev and Firecrawl. An LLM extracts structured facts from the scraped text. "
        "Each programme is then scored on five criteria: country, level, field, budget, and GPA requirements. "
        "Results are shown with a match band — Strong Match, Good Match, or Stretch. Results are cached "
        "for 24 hours to avoid unnecessary re-scraping.",
        s["body"]
    ))
    story.append(Paragraph(
        "<b>The Scholarship Module:</b> This is fully deterministic. I seeded 28 real scholarships "
        "into the database with eligibility criteria. The system checks the student's profile against each "
        "scholarship's criteria and computes a probability score using six weighted factors. "
        "Deadline emails go out automatically at 30, 14, 7, and 1 day before each deadline.",
        s["body"]
    ))
    story.append(Paragraph(
        "<b>Current State:</b> The project is approximately 90% feature-complete. Eleven of twelve "
        "planned features are fully implemented and working. The Professor Finder works via web search "
        "but lacks a curated database. Future improvements would include an application tracker, "
        "expanded scholarship database, and a mobile app.",
        s["body"]
    ))

    # Q&A
    story += section_header("Likely Questions & Model Answers", s, "h2")

    qa = [
        ("Q: What problem does your project solve?",
         "Students planning to study abroad have to manage programme research, scholarship applications, "
         "visa planning, and document preparation across dozens of unconnected websites. EducAI consolidates "
         "all of this into one platform with AI assistance personalised to each student's profile."),

        ("Q: Why did you use AI here? What does the AI actually do?",
         "AI is used at three distinct points. First, to extract structured data from scraped web pages — "
         "a task that is too varied for simple rules. Second, to generate personalised documents "
         "like strategy reports and SOPs — which require natural language tailored to each student. "
         "Third, for the chatbot — which needs to understand free-form questions and give contextual answers. "
         "For things that do not need AI — like eligibility checking or timeline calculation — "
         "I used deterministic logic, which is more reliable."),

        ("Q: How does the matching algorithm work?",
         "It is a weighted scoring formula. Country match earns 25 points, level match 20 points, "
         "field match 20 points, within-budget 20 points, and GPA eligibility 15 points. "
         "The maximum is 100. I also built a major synonym taxonomy — so a student who writes 'AI' "
         "will match programmes labelled 'Artificial Intelligence', 'Machine Learning', or 'Data Science'."),

        ("Q: How is this different from just searching on Google or using a tool like Uni Compare?",
         "Google returns raw links. Uni Compare shows static directory listings. EducAI does three things "
         "those do not: it personalises results to the individual student's specific profile, "
         "it extracts and normalises structured data from live pages automatically, "
         "and it integrates scholarships, timelines, documents, and advisory guidance in the same workflow."),

        ("Q: How does the scholarship module help students?",
         "It does more than list scholarships. It tells each student which scholarships they are likely "
         "eligible for, flags which criteria they fall short on, gives specific improvement suggestions, "
         "and sends automated email reminders at 30, 14, 7, and 1 day before each deadline. "
         "This is the difference between a passive directory and an active planning tool."),

        ("Q: How does the chatbot work?",
         "The chatbot collects the student's full profile and saved data as context, then sends this "
         "along with the student's question to an LLM (Groq first, then OpenRouter, then Gemini as fallbacks). "
         "The LLM returns a structured response with a main answer, bullet highlights, suggested next steps, "
         "and source citations. So if a student asks 'Which of my saved programmes is the cheapest?', "
         "the chatbot actually knows which programmes they have saved and can give a specific answer."),

        ("Q: What are the limitations of your project?",
         "Honest answer: three things. First, scraping quality — live web pages sometimes load incomplete data, "
         "so match results can occasionally miss programmes or include inaccurate fees. "
         "Second, the Professor Finder lacks a curated database and relies on web search results, "
         "which vary in quality. Third, the scholarship database covers only 28 scholarships; "
         "expanding this would require additional scraping or data sourcing work."),

        ("Q: What future improvements would you make?",
         "I would add an application status tracker, expand the scholarship database using live scraping, "
         "build a curated professor database, integrate a live exchange rate API, "
         "and develop a mobile PWA version for on-the-go planning."),

        ("Q: How did you handle security?",
         "Passwords are hashed using Argon2id, which is the current industry recommendation. "
         "Tokens use JWT with short expiry plus refresh token rotation. "
         "Account lockout activates after 5 failed login attempts. "
         "Email verification is required before the account is active. "
         "Google OAuth is also supported. I have 62 automated tests covering all these auth flows."),

        ("Q: Why did you separate the AI logic into a separate server?",
         "Separation of concerns. The AI server can be upgraded, scaled, or replaced independently. "
         "Python has much better tooling for AI tasks (httpx async, FastAPI, LLM libraries). "
         "It also means the backend stays fast for regular requests even when an AI task is slow."),
    ]

    for q, a in qa:
        story.append(KeepTogether([
            Paragraph(q, s["viva_q"]),
            Paragraph(a, s["viva_a"]),
        ]))

    story.append(PageBreak())
    return story


def final_summary(s):
    story = []
    story += section_header("15. Final Summary", s)
    story.append(Paragraph(
        "EducAI is a full-featured, production-quality web application that addresses a real and "
        "widely experienced problem: the complexity of planning study abroad as an international student.",
        s["body"]
    ))
    story.append(Paragraph(
        "The platform brings together live programme discovery, scholarship intelligence, "
        "AI-generated planning documents, deadline management, and conversational AI guidance "
        "in a single personalised workflow. It is not a prototype or a demonstration of a concept — "
        "it is a working, deployable application with a robust database, secure authentication, "
        "automated background jobs, multi-provider AI resilience, and 62 automated tests.",
        s["body"]
    ))
    story.append(Paragraph(
        "The project demonstrates competence across the full modern web stack: "
        "React/Next.js frontend development, Node.js/Express API design, Python AI microservices, "
        "PostgreSQL database engineering, LLM integration, web scraping, security practices, "
        "and system architecture.",
        s["body"]
    ))
    story.append(Spacer(1, 0.5 * cm))

    # Closing box
    closing_data = [[
        "EducAI — built by Prohar Saha Polak · April 2026 · AI-Powered Study Abroad Guidance Platform"
    ]]
    closing_t = Table(closing_data, colWidths=[PAGE_W - 2 * MARGIN])
    closing_t.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), AMBER),
        ("TEXTCOLOR",     (0, 0), (-1, -1), WHITE),
        ("FONTNAME",      (0, 0), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 10),
        ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING",    (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
    ]))
    story.append(closing_t)
    return story


# ── Build Document ─────────────────────────────────────────────────────────────

def build():
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

    doc = SimpleDocTemplate(
        OUT_PATH,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=2.0 * cm,
        title="EducAI — Project Overview",
        author="Prohar Saha Polak",
        subject="AI-Powered Study Abroad Guidance Platform",
    )

    s = build_styles()
    story = []

    story += cover_page(s)
    story += toc_page(s)
    story += executive_summary(s)
    story += problem_statement(s)
    story += target_users(s)
    story += user_journey(s)
    story += system_overview(s)
    story += module1(s)
    story += module2(s)
    story += chatbot_section(s)
    story += technologies(s)
    story += data_logic(s)
    story += project_status(s)
    story += strengths(s)
    story += challenges(s)
    story += viva_guide(s)
    story += final_summary(s)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF written to: {OUT_PATH}")


if __name__ == "__main__":
    build()
