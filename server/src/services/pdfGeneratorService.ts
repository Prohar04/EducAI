interface PDFOptions {
  content: string
  documentType: "sop" | "cv" | "resume"
  template: string
  authorName: string
  targetUniversity?: string
}

function buildSOPHtml(opts: PDFOptions): string {
  const paragraphs = opts.content
    .split("\n\n")
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("\n")

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #1a1a1a;
    padding: 72pt 72pt 72pt 72pt;
  }
  .header {
    text-align: right;
    margin-bottom: 36pt;
    font-size: 10pt;
    color: #444;
  }
  .title {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    margin-bottom: 24pt;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .target {
    text-align: center;
    font-size: 11pt;
    color: #444;
    margin-bottom: 32pt;
  }
  .content p {
    margin-bottom: 16pt;
    text-align: justify;
    text-indent: 24pt;
  }
  .content p:first-child { text-indent: 0; }
  .footer {
    margin-top: 48pt;
    font-size: 10pt;
    color: #666;
    text-align: right;
  }
</style>
</head>
<body>
  <div class="header">Statement of Purpose</div>
  <div class="title">Statement of Purpose</div>
  ${opts.targetUniversity ? `<div class="target">${opts.targetUniversity}</div>` : ""}
  <div class="content">${paragraphs}</div>
  <div class="footer">${opts.authorName} · ${new Date().getFullYear()}</div>
</body>
</html>`
}

function _isSectionHeader(line: string): boolean {
  const t = line.trim()
  if (!t) return false
  if (t.length >= 3 && t === t.toUpperCase() && /^[A-Z\s\/&()\-─]+$/.test(t)) return true
  if (/^[A-Z][A-Za-z\s&\/\-()]{2,39}:$/.test(t)) return true
  return false
}

function _isContactLine(line: string): boolean {
  const t = line.trim()
  return t.includes("@") || t.includes("|") || /\+?[\d\s()\-]{8,}/.test(t) || t.startsWith("http")
}

function _isUnderlineSep(line: string): boolean {
  return /^[=\-─]{3,}$/.test(line.trim())
}

function buildCVHtml(opts: PDFOptions): string {
  const templateStyles: Record<string, { font: string; accentColor: string; nameSize: string; bodySize: string; lineHeight: string }> = {
    "minimal-academic": { font: "Georgia, 'Times New Roman', serif", accentColor: "#4A90D9", nameSize: "18pt", bodySize: "10.5pt", lineHeight: "1.55" },
    "research-focused": { font: "Georgia, serif", accentColor: "#3D6B9F", nameSize: "17pt", bodySize: "10.5pt", lineHeight: "1.6" },
    "modern-professional": { font: "Arial, Helvetica, sans-serif", accentColor: "#4A90D9", nameSize: "20pt", bodySize: "10.5pt", lineHeight: "1.5" },
    "scholarship-focused": { font: "Georgia, serif", accentColor: "#2563EB", nameSize: "18pt", bodySize: "10.5pt", lineHeight: "1.6" },
    "technical-engineering": { font: "Arial, Helvetica, sans-serif", accentColor: "#475569", nameSize: "18pt", bodySize: "10pt", lineHeight: "1.45" },
    "business-management": { font: "Arial, Helvetica, sans-serif", accentColor: "#2563EB", nameSize: "20pt", bodySize: "10.5pt", lineHeight: "1.5" },
    "clean-classic": { font: "'Times New Roman', Georgia, serif", accentColor: "#374151", nameSize: "18pt", bodySize: "11pt", lineHeight: "1.55" },
    "compact-one-page": { font: "Arial, Helvetica, sans-serif", accentColor: "#4A90D9", nameSize: "16pt", bodySize: "9.5pt", lineHeight: "1.4" },
    "phd-research": { font: "Georgia, serif", accentColor: "#3D6B9F", nameSize: "18pt", bodySize: "10.5pt", lineHeight: "1.6" },
    "international-student": { font: "Arial, Helvetica, sans-serif", accentColor: "#4A90D9", nameSize: "18pt", bodySize: "10.5pt", lineHeight: "1.5" },
  }

  const s = templateStyles[opts.template] ?? templateStyles["modern-professional"]!

  const lines = opts.content.split("\n")
  const htmlLines: string[] = []
  let nameAdded = false

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const trimmed = raw.trim()

    if (!trimmed) { htmlLines.push("<div style='height:6pt'></div>"); continue }
    if (_isUnderlineSep(trimmed)) continue

    if (!nameAdded && !_isSectionHeader(trimmed) && !_isContactLine(trimmed)) {
      nameAdded = true
      htmlLines.push(`<div style="text-align:center;font-size:${s.nameSize};font-weight:700;color:#0f172a;margin-bottom:4pt">${trimmed}</div>`)
      continue
    }
    if (!nameAdded) nameAdded = true

    if (_isContactLine(trimmed) && i < 5) {
      htmlLines.push(`<div style="text-align:center;font-size:9.5pt;color:#475569;margin-bottom:2pt">${trimmed}</div>`)
      continue
    }
    if (_isSectionHeader(trimmed)) {
      htmlLines.push(`<div style="margin-top:12pt;margin-bottom:4pt;font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#0f172a;border-bottom:1.5pt solid ${s.accentColor};padding-bottom:2pt">${trimmed.replace(/:$/, "")}</div>`)
      continue
    }
    if (/^\s{2,}[-•*]/.test(raw) || /^\s{4,}/.test(raw)) {
      htmlLines.push(`<div style="display:flex;gap:6pt;padding-left:16pt;margin-bottom:1.5pt"><span style="color:${s.accentColor};font-weight:700">–</span><span style="font-size:${s.bodySize};line-height:${s.lineHeight};color:#1e293b">${trimmed.replace(/^[-•*]\s*/, "")}</span></div>`)
      continue
    }
    if (/^[-•*]\s/.test(trimmed)) {
      htmlLines.push(`<div style="display:flex;gap:6pt;padding-left:6pt;margin-bottom:1.5pt"><span style="color:${s.accentColor};font-weight:700">·</span><span style="font-size:${s.bodySize};line-height:${s.lineHeight};color:#1e293b">${trimmed.replace(/^[-•*]\s*/, "")}</span></div>`)
      continue
    }
    htmlLines.push(`<div style="font-size:${s.bodySize};line-height:${s.lineHeight};color:#1e293b;margin-bottom:2pt">${trimmed}</div>`)
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: ${s.font};
    font-size: ${s.bodySize};
    line-height: ${s.lineHeight};
    color: #1e293b;
    padding: 52pt 58pt;
    background: #ffffff;
  }
</style>
</head>
<body>
  ${htmlLines.join("\n  ")}
</body>
</html>`
}

function buildResumeHtml(opts: PDFOptions): string {
  const resumeStyles: Record<string, { font: string; accentColor: string; nameSize: string; bodySize: string; lineHeight: string; headerStyle: "border" | "bg" | "underline" }> = {
    "ats-clean":              { font: "Arial, Helvetica, sans-serif", accentColor: "#374151", nameSize: "18pt", bodySize: "10pt",   lineHeight: "1.45", headerStyle: "border" },
    "google-faang":           { font: "Arial, Helvetica, sans-serif", accentColor: "#1A73E8", nameSize: "19pt", bodySize: "10.5pt", lineHeight: "1.5",  headerStyle: "border" },
    "startup-tech":           { font: "Arial, Helvetica, sans-serif", accentColor: "#4A90D9", nameSize: "20pt", bodySize: "10.5pt", lineHeight: "1.5",  headerStyle: "underline" },
    "executive-professional": { font: "Georgia, 'Times New Roman', serif", accentColor: "#1e3a5f", nameSize: "20pt", bodySize: "11pt", lineHeight: "1.55", headerStyle: "bg" },
    "data-science":           { font: "Arial, Helvetica, sans-serif", accentColor: "#0F4C81", nameSize: "18pt", bodySize: "10pt",   lineHeight: "1.45", headerStyle: "border" },
    "consulting-finance":     { font: "'Times New Roman', Georgia, serif", accentColor: "#1e3a5f", nameSize: "18pt", bodySize: "10.5pt", lineHeight: "1.5", headerStyle: "bg" },
  }

  const s = resumeStyles[opts.template] ?? resumeStyles["ats-clean"]!

  const sectionHeaderHtml = (text: string): string => {
    switch (s.headerStyle) {
      case "bg":
        return `<div style="margin-top:10pt;margin-bottom:4pt;font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;background:${s.accentColor};color:#fff;padding:3pt 6pt">${text}</div>`
      case "underline":
        return `<div style="margin-top:10pt;margin-bottom:4pt;font-size:10pt;font-weight:700;color:${s.accentColor};border-bottom:2pt solid ${s.accentColor};padding-bottom:2pt">${text}</div>`
      default: // "border"
        return `<div style="margin-top:10pt;margin-bottom:4pt;font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#0f172a;border-bottom:1.5pt solid ${s.accentColor};padding-bottom:2pt">${text}</div>`
    }
  }

  const lines = opts.content.split("\n")
  const htmlLines: string[] = []
  let nameAdded = false

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const trimmed = raw.trim()
    if (!trimmed) { htmlLines.push("<div style='height:5pt'></div>"); continue }
    if (_isUnderlineSep(trimmed)) continue

    if (!nameAdded && !_isSectionHeader(trimmed) && !_isContactLine(trimmed)) {
      nameAdded = true
      htmlLines.push(`<div style="font-size:${s.nameSize};font-weight:700;color:#0f172a;margin-bottom:3pt">${trimmed}</div>`)
      continue
    }
    if (!nameAdded) nameAdded = true

    if (_isContactLine(trimmed) && i < 5) {
      htmlLines.push(`<div style="font-size:9pt;color:#475569;margin-bottom:1.5pt">${trimmed}</div>`)
      continue
    }
    if (_isSectionHeader(trimmed)) { htmlLines.push(sectionHeaderHtml(trimmed.replace(/:$/, ""))); continue }
    if (/^\s{2,}[-•*]/.test(raw) || /^\s{4,}/.test(raw)) {
      htmlLines.push(`<div style="display:flex;gap:5pt;padding-left:14pt;margin-bottom:1.5pt"><span style="color:${s.accentColor}">–</span><span style="font-size:${s.bodySize};line-height:${s.lineHeight};color:#1e293b">${trimmed.replace(/^[-•*]\s*/, "")}</span></div>`)
      continue
    }
    if (/^[-•*]\s/.test(trimmed)) {
      htmlLines.push(`<div style="display:flex;gap:5pt;padding-left:5pt;margin-bottom:1.5pt"><span style="color:${s.accentColor}">•</span><span style="font-size:${s.bodySize};line-height:${s.lineHeight};color:#1e293b">${trimmed.replace(/^[-•*]\s*/, "")}</span></div>`)
      continue
    }
    htmlLines.push(`<div style="font-size:${s.bodySize};line-height:${s.lineHeight};color:#1e293b;margin-bottom:1.5pt">${trimmed}</div>`)
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family:${s.font}; font-size:${s.bodySize}; line-height:${s.lineHeight}; color:#1e293b; padding:48pt 52pt; background:#fff; }</style>
</head>
<body>${htmlLines.join("\n")}</body>
</html>`
}

export async function generatePDF(opts: PDFOptions): Promise<Buffer> {
  const html =
    opts.documentType === "sop" ? buildSOPHtml(opts) :
    opts.documentType === "resume" ? buildResumeHtml(opts) :
    buildCVHtml(opts)

  const htmlPdf = await import("html-pdf-node")
  const file = { content: html }

  return new Promise<Buffer>((resolve, reject) => {
    htmlPdf.default.generatePdf(file, {
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    }, (err: Error, buffer: Buffer) => {
      if (err) reject(err)
      else resolve(buffer)
    })
  })
}
