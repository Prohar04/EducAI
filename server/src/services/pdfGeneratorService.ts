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

function buildCVHtml(opts: PDFOptions): string {
  const isUS = opts.template === "us_standard" || opts.template === "google_faang"
  const fontFamily = isUS ? "'Arial', 'Helvetica', sans-serif" : "Georgia, 'Times New Roman', serif"
  const fontSize = isUS ? "10.5pt" : "11pt"

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: ${fontFamily};
    font-size: ${fontSize};
    line-height: 1.4;
    color: #1a1a1a;
    padding: ${isUS ? "54pt 54pt" : "72pt 72pt"};
  }
  h1 { font-size: ${isUS ? "18pt" : "20pt"}; font-weight: bold; margin-bottom: 4pt; }
  h2 {
    font-size: ${isUS ? "11pt" : "12pt"};
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-bottom: 1pt solid #ddd;
    padding-bottom: 4pt;
    margin: 16pt 0 8pt 0;
  }
  pre {
    white-space: pre-wrap;
    font-family: inherit;
    font-size: inherit;
    line-height: 1.5;
  }
</style>
</head>
<body>
  <pre>${opts.content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
</body>
</html>`
}

export async function generatePDF(opts: PDFOptions): Promise<Buffer> {
  const html = opts.documentType === "sop" ? buildSOPHtml(opts) : buildCVHtml(opts)

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
