import type { Metadata } from "next"
import LegalLayout from "@/components/layout/legal-layout"
import LegalToc from "@/components/ui/legal-toc"

export const metadata: Metadata = {
  title: "Privacy Policy | EducAI Study Abroad Platform",
  description:
    "EducAI's Privacy Policy. Learn how we collect, use, and protect your personal data on our AI study abroad platform. GDPR and CCPA compliant.",
  openGraph: {
    title: "Privacy Policy | EducAI",
    description:
      "How EducAI collects, uses, and protects your personal information.",
  },
}

const TOC_ITEMS = [
  { id: "section-1", label: "1. Information We Collect" },
  { id: "section-2", label: "2. How We Use Your Data" },
  { id: "section-3", label: "3. AI and Data Processing" },
  { id: "section-4", label: "4. Data Storage and Security" },
  { id: "section-5", label: "5. Data Sharing" },
  { id: "section-6", label: "6. Your Rights and Choices" },
  { id: "section-7", label: "7. Cookies and Tracking" },
  { id: "section-8", label: "8. Children's Privacy" },
  { id: "section-9", label: "9. International Transfers" },
  { id: "section-10", label: "10. Changes to This Policy" },
  { id: "section-11", label: "11. Contact Us" },
]

export default function PrivacyPage() {
  return (
    <LegalLayout>
      <div style={{ maxWidth: 1020, margin: "0 auto", padding: "100px 24px 80px" }}>
        {/* Hero header */}
        <div style={{ maxWidth: 760 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(74,144,217,0.07)",
            border: "1px solid rgba(74,144,217,0.14)",
            color: "#4A90D9",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            borderRadius: 100,
            padding: "4px 12px",
            marginBottom: 24,
          }}>
            Legal
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 700,
            color: "#E8EEF8",
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            marginBottom: 12,
          }}>
            Privacy Policy
          </h1>

          <p style={{ fontSize: 13, color: "#3D4F6B", marginBottom: 24 }}>
            Effective Date: February 1, 2026 · Last Updated: May 2026
          </p>

          <div style={{ height: 1, background: "linear-gradient(90deg, rgba(74,144,217,0.20) 0%, transparent 100%)", marginBottom: 32 }} />

          {/* Last updated box */}
          <div style={{
            background: "rgba(13,22,37,0.6)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 48,
          }}>
            <p style={{ fontSize: 13, color: "#7A8BA8", margin: 0 }}>
              <span style={{ marginRight: 8 }}>📋</span>
              <strong style={{ color: "#B8CCE8", fontWeight: 500 }}>Last Updated: May 2026</strong>
              {" · "}This document is effective as of February 1, 2026.
            </p>
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 48 }} className="legal-grid">
          {/* Main content */}
          <div style={{ maxWidth: 680 }}>
            {/* Intro */}
            <p style={bodyStyle}>
              EducAI is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our study abroad AI platform. We are transparent about our data practices and give you control over your information.
            </p>

            {/* Section 1 */}
            <section id="section-1" style={sectionStyle}>
              <SectionDecor num="1" />
              <h2 style={h2Style}>1. Information We Collect</h2>

              <h3 style={h3Style}>1.1 Information You Provide Directly</h3>
              <p style={{ ...bodyStyle, fontWeight: 500, color: "#B8CCE8" }}>Account Information:</p>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}>Full name and email address (required for registration)</li>
                <li style={liStyle}>Password (stored as a bcrypt hash — we never store plain text)</li>
                <li style={liStyle}>Google account information (if you sign in with Google)</li>
              </ul>
              <p style={{ ...bodyStyle, fontWeight: 500, color: "#B8CCE8" }}>Academic Profile:</p>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}>Current degree level and field of study</li>
                <li style={liStyle}>GPA, academic grades, and test scores (IELTS, TOEFL, GRE, GMAT)</li>
                <li style={liStyle}>Target countries and universities for study abroad</li>
                <li style={liStyle}>Work experience and extracurricular activities</li>
                <li style={liStyle}>Research interests and professor preferences</li>
                <li style={liStyle}>Current country of residence and nationality</li>
              </ul>
              <p style={{ ...bodyStyle, fontWeight: 500, color: "#B8CCE8" }}>Documents:</p>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}>Content you provide for SOP and CV generation</li>
                <li style={liStyle}>Uploaded documents and files (if applicable)</li>
              </ul>

              <h3 style={h3Style}>1.2 Information Collected Automatically</h3>
              <p style={{ ...bodyStyle, fontWeight: 500, color: "#B8CCE8" }}>Usage Data:</p>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}>Pages visited and features used within the platform</li>
                <li style={liStyle}>Time spent on each feature</li>
                <li style={liStyle}>Search queries within the platform</li>
                <li style={liStyle}>AI features accessed and generated outputs</li>
              </ul>
              <p style={{ ...bodyStyle, fontWeight: 500, color: "#B8CCE8" }}>Technical Data:</p>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}>IP address (used for rate limiting and security)</li>
                <li style={liStyle}>Browser type and version</li>
                <li style={liStyle}>Device type and operating system</li>
                <li style={liStyle}>Session tokens and authentication data</li>
              </ul>

              <h3 style={h3Style}>1.3 Information from Third Parties</h3>
              <p style={bodyStyle}>
                If you sign in with Google, we receive your Google account name and email address, and Google profile picture (if public). We do not receive your Google password or payment information.
              </p>
              <p style={bodyStyle}>
                Job search queries and results are processed through third-party job APIs (Adzuna, JSearch via RapidAPI). We store your search preferences and results to improve your experience.
              </p>
            </section>

            {/* Section 2 */}
            <section id="section-2" style={sectionStyle}>
              <SectionDecor num="2" />
              <h2 style={h2Style}>2. How We Use Your Information</h2>

              <h3 style={h3Style}>2.1 Providing Our Services</h3>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}>Matching your academic profile to relevant universities and programs</li>
                <li style={liStyle}>Generating personalized Statements of Purpose and CVs</li>
                <li style={liStyle}>Identifying scholarships you may be eligible for</li>
                <li style={liStyle}>Sending scholarship deadline reminders</li>
                <li style={liStyle}>Providing career outcome predictions based on your field</li>
                <li style={liStyle}>Powering the AI Advisor chatbot with your profile context</li>
                <li style={liStyle}>Finding relevant job listings for your location and field</li>
              </ul>

              <h3 style={h3Style}>2.2 Improving Our Platform</h3>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}>Analyzing aggregated usage patterns to improve AI accuracy</li>
                <li style={liStyle}>Identifying bugs and performance issues</li>
                <li style={liStyle}>Developing new features based on user behavior</li>
              </ul>

              <h3 style={h3Style}>2.3 Communications</h3>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}>Sending scholarship deadline alerts (you can unsubscribe)</li>
                <li style={liStyle}>Sending important account and security notifications</li>
                <li style={liStyle}>Responding to your support inquiries</li>
                <li style={liStyle}>Sending product updates (only with your consent)</li>
              </ul>

              <h3 style={h3Style}>2.4 Security and Legal Compliance</h3>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}>Detecting and preventing fraud and abuse</li>
                <li style={liStyle}>Enforcing our Terms of Service</li>
                <li style={liStyle}>Complying with legal obligations and responding to lawful requests</li>
              </ul>

              <div style={{
                background: "rgba(61,153,112,0.05)",
                border: "1px solid rgba(61,153,112,0.15)",
                borderRadius: 10,
                padding: "14px 18px",
                marginTop: 16,
              }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#3D9970", marginBottom: 6 }}>We do NOT use your data for:</p>
                <ul style={{ ...listStyle, marginBottom: 0 }} className="legal-list">
                  {["Selling to third parties", "Targeted advertising", "Building advertising profiles", "Any purpose not listed above"].map((item) => (
                    <li key={item} style={{ ...liStyle, color: "#3D9970", marginBottom: 4 }}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section-3" style={sectionStyle}>
              <SectionDecor num="3" />
              <h2 style={h2Style}>3. AI and Data Processing</h2>

              <h3 style={h3Style}>3.1 AI Model Providers</h3>
              <p style={bodyStyle}>EducAI uses the following AI providers to process your data and generate content:</p>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}><strong style={{ color: "#B8CCE8", fontWeight: 500 }}>OpenAI (GPT-4o-mini)</strong> — Primary AI for document generation, career predictions, and chatbot responses</li>
                <li style={liStyle}><strong style={{ color: "#B8CCE8", fontWeight: 500 }}>Groq</strong> — Fallback AI provider</li>
                <li style={liStyle}><strong style={{ color: "#B8CCE8", fontWeight: 500 }}>Google Gemini</strong> — Fallback AI provider</li>
                <li style={liStyle}><strong style={{ color: "#B8CCE8", fontWeight: 500 }}>OpenRouter</strong> — Additional fallback provider</li>
              </ul>
              <p style={bodyStyle}>
                When you use AI features, relevant portions of your profile are sent to these providers as part of the AI prompt. These providers process data according to their own privacy policies.
              </p>

              <h3 style={h3Style}>3.2 Data Minimization</h3>
              <p style={bodyStyle}>
                We only send the minimum necessary data to AI providers for each specific request. We do not send your full profile for every AI call — only the relevant context.
              </p>

              <h3 style={h3Style}>3.3 AI Output Storage</h3>
              <p style={bodyStyle}>
                AI-generated content (SOPs, CVs, career reports) is stored in our database associated with your account so you can access your documents later. You can delete these at any time.
              </p>
            </section>

            {/* Section 4 */}
            <section id="section-4" style={sectionStyle}>
              <SectionDecor num="4" />
              <h2 style={h2Style}>4. Data Storage and Security</h2>

              <h3 style={h3Style}>4.1 Where We Store Your Data</h3>
              <p style={bodyStyle}>
                Your data is stored in a PostgreSQL database hosted on Neon (serverless PostgreSQL, ap-southeast-1 region). Our servers are hosted on Render.com. Our frontend is hosted on Vercel.
              </p>

              <h3 style={h3Style}>4.2 Security Measures</h3>
              <p style={bodyStyle}>We implement the following security measures:</p>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}>All data transmitted over HTTPS (TLS encryption)</li>
                <li style={liStyle}>Passwords hashed using Argon2 (industry best practice)</li>
                <li style={liStyle}>JWT tokens with 15-minute expiry and secure refresh flow</li>
                <li style={liStyle}>Rate limiting on all API endpoints via Arcjet</li>
                <li style={liStyle}>Account lockout after 5 failed login attempts</li>
                <li style={liStyle}>Regular security dependency updates</li>
              </ul>

              <h3 style={h3Style}>4.3 Data Retention</h3>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}>Active accounts: data retained while account is active</li>
                <li style={liStyle}>Inactive accounts: data retained for 12 months after last login</li>
                <li style={liStyle}>Deleted accounts: data permanently deleted within 30 days</li>
                <li style={liStyle}>Scholarship deadline alerts: cron job logs retained 90 days</li>
                <li style={liStyle}>AI-generated documents: retained until you delete them</li>
              </ul>

              <h3 style={h3Style}>4.4 Security Incidents</h3>
              <p style={bodyStyle}>
                In the event of a data breach affecting your personal information, we will notify you within 72 hours as required by applicable law.
              </p>
            </section>

            {/* Section 5 */}
            <section id="section-5" style={sectionStyle}>
              <SectionDecor num="5" />
              <h2 style={h2Style}>5. Data Sharing</h2>

              <h3 style={h3Style}>5.1 We Do Not Sell Your Data</h3>
              <p style={bodyStyle}>
                EducAI does not sell, rent, or trade your personal information to third parties for commercial purposes. Ever.
              </p>

              <h3 style={h3Style}>5.2 Service Providers</h3>
              <p style={bodyStyle}>We share data with trusted service providers who help us operate:</p>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}><strong style={{ color: "#B8CCE8", fontWeight: 500 }}>Neon</strong> (database hosting) — stores your profile and documents</li>
                <li style={liStyle}><strong style={{ color: "#B8CCE8", fontWeight: 500 }}>Render.com</strong> (server hosting) — hosts our API servers</li>
                <li style={liStyle}><strong style={{ color: "#B8CCE8", fontWeight: 500 }}>Vercel</strong> (frontend hosting) — serves the web application</li>
                <li style={liStyle}><strong style={{ color: "#B8CCE8", fontWeight: 500 }}>OpenAI/Groq/Gemini</strong> (AI processing) — generates AI content</li>
                <li style={liStyle}><strong style={{ color: "#B8CCE8", fontWeight: 500 }}>Serper API</strong> (web search) — powers professor finder and news</li>
                <li style={liStyle}><strong style={{ color: "#B8CCE8", fontWeight: 500 }}>Adzuna/JSearch</strong> (job APIs) — provides job listings</li>
                <li style={liStyle}><strong style={{ color: "#B8CCE8", fontWeight: 500 }}>Resend/SMTP</strong> (email) — sends deadline alerts and notifications</li>
                <li style={liStyle}><strong style={{ color: "#B8CCE8", fontWeight: 500 }}>Google</strong> (OAuth) — optional authentication method</li>
              </ul>
              <p style={bodyStyle}>
                All service providers are contractually required to protect your data and use it only for the specified purpose.
              </p>

              <h3 style={h3Style}>5.3 Legal Requirements</h3>
              <p style={bodyStyle}>
                We may disclose your information if required by law, court order, or governmental authority, or to protect the rights and safety of EducAI, our users, or the public.
              </p>

              <h3 style={h3Style}>5.4 Business Transfers</h3>
              <p style={bodyStyle}>
                If EducAI is acquired or merges with another company, your data may be transferred as part of that transaction. We will notify you before your data is transferred and becomes subject to a different privacy policy.
              </p>
            </section>

            {/* Section 6 */}
            <section id="section-6" style={sectionStyle}>
              <SectionDecor num="6" />
              <h2 style={h2Style}>6. Your Rights and Choices</h2>

              <h3 style={h3Style}>6.1 Access Your Data</h3>
              <p style={bodyStyle}>
                You can view all personal data we hold about you by logging into your account and visiting your profile settings.
              </p>

              <h3 style={h3Style}>6.2 Update Your Data</h3>
              <p style={bodyStyle}>
                You can update your academic profile, preferences, and account information at any time from your dashboard settings.
              </p>

              <h3 style={h3Style}>6.3 Delete Your Account</h3>
              <p style={bodyStyle}>
                You can request permanent deletion of your account and all associated data by emailing{" "}
                <a href="mailto:support.educai@gmail.com" style={linkStyle}>support.educai@gmail.com</a>.
                We will process deletion requests within 30 days.
              </p>

              <h3 style={h3Style}>6.4 Data Portability</h3>
              <p style={bodyStyle}>
                You can request an export of your personal data in JSON format by contacting{" "}
                <a href="mailto:support.educai@gmail.com" style={linkStyle}>support.educai@gmail.com</a>.
              </p>

              <h3 style={h3Style}>6.5 Email Preferences</h3>
              <p style={bodyStyle}>
                You can unsubscribe from scholarship deadline alerts and marketing emails at any time using the unsubscribe link in any email or from your account settings.
              </p>

              <h3 style={h3Style}>6.6 GDPR Rights (EU/UK Users)</h3>
              <p style={bodyStyle}>If you are located in the European Union or United Kingdom, you have additional rights under GDPR:</p>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}>Right to erasure (&lsquo;right to be forgotten&rsquo;)</li>
                <li style={liStyle}>Right to restrict processing</li>
                <li style={liStyle}>Right to object to processing</li>
                <li style={liStyle}>Right to lodge a complaint with your national data authority</li>
              </ul>

              <h3 style={h3Style}>6.7 CCPA Rights (California Users)</h3>
              <p style={bodyStyle}>
                If you are a California resident, you have rights under the California Consumer Privacy Act including the right to know what personal information is collected and the right to non-discrimination for exercising your privacy rights.
              </p>
            </section>

            {/* Section 7 */}
            <section id="section-7" style={sectionStyle}>
              <SectionDecor num="7" />
              <h2 style={h2Style}>7. Cookies and Tracking</h2>

              <h3 style={h3Style}>7.1 Cookies We Use</h3>
              <p style={bodyStyle}>EducAI uses only essential cookies required for the service to function:</p>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}><strong style={{ color: "#B8CCE8", fontWeight: 500 }}>Session cookie</strong> — maintains your login state (iron-session)</li>
                <li style={liStyle}><strong style={{ color: "#B8CCE8", fontWeight: 500 }}>CSRF token</strong> — protects against cross-site request forgery</li>
              </ul>

              <div style={{
                background: "rgba(61,153,112,0.05)",
                border: "1px solid rgba(61,153,112,0.15)",
                borderRadius: 10,
                padding: "14px 18px",
                marginTop: 16,
                marginBottom: 16,
              }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#3D9970", marginBottom: 6 }}>We do NOT use:</p>
                <ul style={{ ...listStyle, marginBottom: 0 }} className="legal-list">
                  {[
                    "Advertising cookies",
                    "Third-party tracking cookies",
                    "Analytics cookies that track you across other websites",
                    "Facebook Pixel, Google Analytics, or similar trackers",
                  ].map((item) => (
                    <li key={item} style={{ ...liStyle, color: "#3D9970", marginBottom: 4 }}>{item}</li>
                  ))}
                </ul>
              </div>

              <h3 style={h3Style}>7.2 Local Storage</h3>
              <p style={bodyStyle}>We use browser localStorage to store:</p>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}>Your last job search parameters (for convenience)</li>
                <li style={liStyle}>Saved job bookmarks</li>
                <li style={liStyle}>UI preferences (sidebar state)</li>
              </ul>
              <p style={bodyStyle}>
                This data stays on your device and is never sent to our servers unless you explicitly perform an action.
              </p>
            </section>

            {/* Section 8 */}
            <section id="section-8" style={sectionStyle}>
              <SectionDecor num="8" />
              <h2 style={h2Style}>8. Children&apos;s Privacy</h2>
              <p style={bodyStyle}>
                EducAI is not intended for children under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that a child under 16 has provided us with personal information, we will delete it immediately.
              </p>
              <p style={bodyStyle}>
                If you are a parent or guardian and believe your child has provided us with personal information, please contact us at{" "}
                <a href="mailto:support.educai@gmail.com" style={linkStyle}>support.educai@gmail.com</a>.
              </p>
            </section>

            {/* Section 9 */}
            <section id="section-9" style={sectionStyle}>
              <SectionDecor num="9" />
              <h2 style={h2Style}>9. International Data Transfers</h2>
              <p style={bodyStyle}>
                EducAI operates globally and your data may be processed in countries outside your country of residence, including the United States. These countries may have different data protection laws than your country.
              </p>
              <p style={bodyStyle}>
                When we transfer data internationally, we ensure appropriate safeguards are in place, including standard contractual clauses and data processing agreements with our service providers.
              </p>
            </section>

            {/* Section 10 */}
            <section id="section-10" style={sectionStyle}>
              <SectionDecor num="10" />
              <h2 style={h2Style}>10. Changes to This Policy</h2>
              <p style={bodyStyle}>We may update this Privacy Policy periodically. We will notify you of significant changes by:</p>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}>Sending an email to your registered address</li>
                <li style={liStyle}>Displaying a prominent notice on our platform</li>
                <li style={liStyle}>Updating the &lsquo;Last Updated&rsquo; date at the top of this page</li>
              </ul>
              <p style={bodyStyle}>
                Your continued use of EducAI after changes are posted constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            {/* Section 11 */}
            <section id="section-11" style={sectionStyle}>
              <SectionDecor num="11" />
              <h2 style={h2Style}>11. Contact Us</h2>
              <p style={bodyStyle}>For privacy-related questions, requests, or concerns:</p>

              <div style={{
                background: "rgba(74,144,217,0.04)",
                border: "1px solid rgba(74,144,217,0.12)",
                borderRadius: 12,
                padding: "24px",
                marginTop: 16,
              }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#E8EEF8", marginBottom: 16 }}>Questions?</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Privacy inquiries", href: "support.educai@gmail.com" },
                    { label: "Data deletion", href: "support.educai@gmail.com" },
                    { label: "General support", href: "support.educai@gmail.com" },
                    { label: "Legal inquiries", href: "support.educai@gmail.com" },
                  ].map(({ label, href }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 12, color: "#3D4F6B", minWidth: 130 }}>{label}</span>
                      <a
                        href={`mailto:${href}`}
                        style={{
                          fontSize: 13,
                          color: "#4A90D9",
                          textDecoration: "none",
                          background: "rgba(74,144,217,0.06)",
                          border: "1px solid rgba(74,144,217,0.15)",
                          borderRadius: 6,
                          padding: "4px 12px",
                        }}
                      >
                        {href}
                      </a>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: "#3D4F6B", marginTop: 16, marginBottom: 0 }}>
                  We aim to respond to all privacy requests within 30 days. For urgent security matters, we respond within 72 hours.
                </p>
              </div>
            </section>
          </div>

          {/* TOC — desktop only */}
          <div className="legal-toc-col" style={{ display: "none" }}>
            <LegalToc items={TOC_ITEMS} />
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .legal-grid {
            grid-template-columns: 1fr 200px !important;
          }
          .legal-toc-col {
            display: block !important;
          }
        }
        .legal-back-link:hover { color: #E8EEF8 !important; }
        .legal-list li::before {
          content: "—";
          position: absolute;
          left: 0;
          color: #3D4F6B;
        }
      `}</style>
    </LegalLayout>
  )
}

function SectionDecor({ num }: { num: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        fontSize: 64,
        fontWeight: 900,
        color: "rgba(74,144,217,0.04)",
        lineHeight: 1,
        left: -8,
        top: -8,
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {num}
    </div>
  )
}

const sectionStyle: React.CSSProperties = {
  marginTop: 48,
  position: "relative",
}

const h2Style: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 500,
  color: "#E8EEF8",
  marginBottom: 16,
  marginTop: 0,
  paddingBottom: 8,
  borderBottom: "1px solid rgba(255,255,255,0.05)",
}

const h3Style: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: "#B8CCE8",
  margin: "20px 0 8px",
}

const bodyStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 300,
  color: "#7A8BA8",
  lineHeight: 1.85,
  marginBottom: 14,
  marginTop: 0,
}

const listStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: "0 0 14px 0",
}

const liStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 300,
  color: "#7A8BA8",
  lineHeight: 1.85,
  paddingLeft: 16,
  position: "relative",
  marginBottom: 6,
}

const linkStyle: React.CSSProperties = {
  color: "#4A90D9",
  textDecoration: "underline",
}
