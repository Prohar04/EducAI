import type { Metadata } from "next"
import Link from "next/link"
import LegalLayout from "@/components/layout/legal-layout"
import LegalToc from "@/components/ui/legal-toc"

export const metadata: Metadata = {
  title: "Terms of Service | EducAI Study Abroad Platform",
  description:
    "Read EducAI's Terms of Service. Learn about acceptable use, AI-generated content policies, free access, and user rights for our study abroad platform.",
  openGraph: {
    title: "Terms of Service | EducAI",
    description:
      "Terms governing your use of EducAI's AI-powered study abroad platform.",
  },
}

const TOC_ITEMS = [
  { id: "section-1", label: "1. Acceptance of Terms" },
  { id: "section-2", label: "2. Description of Service" },
  { id: "section-3", label: "3. User Accounts" },
  { id: "section-4", label: "4. AI-Generated Content" },
  { id: "section-5", label: "5. Acceptable Use" },
  { id: "section-6", label: "6. Scholarship & University Data" },
  { id: "section-7", label: "7. Subscription and Payments" },
  { id: "section-8", label: "8. Intellectual Property" },
  { id: "section-9", label: "9. Privacy" },
  { id: "section-10", label: "10. Disclaimers & Liability" },
  { id: "section-11", label: "11. Governing Law" },
  { id: "section-12", label: "12. Contact" },
]

export default function TermsPage() {
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
            Terms of Service
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

        {/* Two-column layout: content + TOC */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 48 }} className="legal-grid">
          {/* Main content */}
          <div style={{ maxWidth: 680 }}>
            {/* Intro */}
            <p style={bodyStyle}>
              Welcome to EducAI. These Terms of Service govern your use of our AI-powered study abroad platform, including all features related to university program matching, scholarship discovery, document generation, visa guidance, career planning, and job finding. By creating an account or using any EducAI service, you agree to these terms. Please read them carefully.
            </p>

            {/* Section 1 */}
            <section id="section-1" style={sectionStyle}>
              <SectionDecor num="1" />
              <h2 style={h2Style}>1. Acceptance of Terms</h2>
              <p style={bodyStyle}>
                By accessing or using EducAI (&ldquo;the Platform&rdquo;, &ldquo;our Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), operated by EducAI, you (&ldquo;User&rdquo;, &ldquo;you&rdquo;, &ldquo;your&rdquo;) agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you may not use our Service.
              </p>
              <p style={bodyStyle}>
                You must be at least 16 years of age to use EducAI. By using our Service, you represent that you meet this requirement.
              </p>
              <p style={bodyStyle}>
                We reserve the right to update these terms at any time. We will notify registered users of material changes via email. Continued use of the platform after changes constitutes acceptance.
              </p>
            </section>

            {/* Section 2 */}
            <section id="section-2" style={sectionStyle}>
              <SectionDecor num="2" />
              <h2 style={h2Style}>2. Description of Service</h2>
              <p style={bodyStyle}>EducAI provides an AI-powered platform designed to assist international students with:</p>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}>University and program discovery and matching based on your academic profile, test scores, and preferences</li>
                <li style={liStyle}>Scholarship identification, eligibility checking, and deadline tracking across 28+ real-world scholarship programs</li>
                <li style={liStyle}>AI-generated application documents including Statements of Purpose (SOP) and Curriculum Vitae (CV)</li>
                <li style={liStyle}>Research supervisor discovery and cold email templates</li>
                <li style={liStyle}>Application timeline planning and strategy generation</li>
                <li style={liStyle}>Career outcome prediction and employability analysis</li>
                <li style={liStyle}>Visa and immigration guidance for study destinations</li>
                <li style={liStyle}>Part-time and full-time job search for international students</li>
                <li style={liStyle}>An AI advisor chatbot for personalized guidance</li>
              </ul>
              <p style={bodyStyle}>
                Our AI features use third-party language model providers (including OpenAI, Groq, and Google Gemini) to generate content. All AI-generated content is clearly labeled within the platform.
              </p>
            </section>

            {/* Section 3 */}
            <section id="section-3" style={sectionStyle}>
              <SectionDecor num="3" />
              <h2 style={h2Style}>3. User Accounts</h2>
              <h3 style={h3Style}>3.1 Account Creation</h3>
              <p style={bodyStyle}>
                To access most features, you must create an account using a valid email address or Google OAuth. You are responsible for maintaining the confidentiality of your credentials and all activity under your account.
              </p>
              <h3 style={h3Style}>3.2 Account Security</h3>
              <p style={bodyStyle}>
                You must notify us immediately at{" "}
                <a href="mailto:support.educai@gmail.com" style={linkStyle}>support.educai@gmail.com</a>{" "}
                of any unauthorized use of your account. We implement industry-standard security measures including JWT authentication, bcrypt password hashing, and rate limiting.
              </p>
              <h3 style={h3Style}>3.3 Accurate Information</h3>
              <p style={bodyStyle}>
                You agree to provide accurate, current, and complete information during registration and to keep your profile information updated. Inaccurate profile data will result in less accurate AI-generated recommendations and documents.
              </p>
              <h3 style={h3Style}>3.4 Account Termination</h3>
              <p style={bodyStyle}>
                We may suspend or terminate accounts that violate these terms, engage in fraudulent activity, or remain inactive for over 12 consecutive months.
              </p>
            </section>

            {/* Section 4 */}
            <section id="section-4" style={sectionStyle}>
              <SectionDecor num="4" />
              <h2 style={h2Style}>4. AI-Generated Content</h2>
              <h3 style={h3Style}>4.1 Nature of AI Content</h3>
              <p style={bodyStyle}>
                EducAI uses artificial intelligence to generate Statements of Purpose, CVs, emails, career predictions, and other content. This content is generated based on your profile data and is clearly labeled as &ldquo;AI-Generated&rdquo; within the platform.
              </p>
              <h3 style={h3Style}>4.2 No Guarantee of Accuracy</h3>
              <p style={bodyStyle}>
                AI-generated content may contain errors, inaccuracies, or outdated information. University requirements, scholarship eligibility criteria, visa regulations, and job market data change frequently. You are solely responsible for verifying all information before relying on it for academic, legal, financial, or career decisions.
              </p>
              <h3 style={h3Style}>4.3 Document Ownership</h3>
              <p style={bodyStyle}>
                Documents generated through EducAI using your personal data belong to you. You may use, modify, and submit them freely. We do not claim ownership of AI-generated documents created from your personal academic information.
              </p>
              <h3 style={h3Style}>4.4 Prohibited Use of Generated Content</h3>
              <p style={bodyStyle}>
                You may not use AI-generated content to misrepresent yourself in academic applications, commit academic fraud, or submit false information to visa authorities or educational institutions. Such use violates our terms and may have serious legal consequences.
              </p>
            </section>

            {/* Section 5 */}
            <section id="section-5" style={sectionStyle}>
              <SectionDecor num="5" />
              <h2 style={h2Style}>5. Acceptable Use</h2>
              <p style={bodyStyle}>You agree <strong style={{ color: "#B8CCE8", fontWeight: 500 }}>NOT</strong> to:</p>
              <ul style={listStyle} className="legal-list">
                <li style={liStyle}>Use EducAI for any unlawful purpose or in violation of any applicable laws or regulations</li>
                <li style={liStyle}>Submit false academic credentials, test scores, or personal information to manipulate AI recommendations</li>
                <li style={liStyle}>Attempt to reverse engineer, scrape, or copy our platform, algorithms, or AI models</li>
                <li style={liStyle}>Share your account credentials with other individuals</li>
                <li style={liStyle}>Use automated bots or scripts to access our services</li>
                <li style={liStyle}>Attempt to circumvent our rate limiting, authentication, or security measures</li>
                <li style={liStyle}>Upload malicious files, code, or content to our platform</li>
                <li style={liStyle}>Use our service to harass, spam, or harm other users</li>
                <li style={liStyle}>Violate the terms of service of any connected third-party services including OpenAI, Google, or Serper</li>
              </ul>
              <p style={bodyStyle}>
                Violations may result in immediate account suspension.
              </p>
            </section>

            {/* Section 6 */}
            <section id="section-6" style={sectionStyle}>
              <SectionDecor num="6" />
              <h2 style={h2Style}>6. Scholarship and University Data</h2>
              <h3 style={h3Style}>6.1 Data Sources</h3>
              <p style={bodyStyle}>
                Our scholarship database includes information about real-world scholarship programs including Fulbright, Chevening, DAAD, Erasmus+, and others. This information is sourced from public sources and is provided for informational purposes only.
              </p>
              <h3 style={h3Style}>6.2 No Affiliation</h3>
              <p style={bodyStyle}>
                EducAI is not affiliated with, endorsed by, or a representative of any university, scholarship body, embassy, or immigration authority. We are an independent software platform.
              </p>
              <h3 style={h3Style}>6.3 Deadline Alerts</h3>
              <p style={bodyStyle}>
                Our scholarship deadline alert system sends automated email reminders. We make reasonable efforts to maintain accurate deadline information but cannot guarantee accuracy. Always verify deadlines directly with the awarding organization.
              </p>
              <h3 style={h3Style}>6.4 Job Listings</h3>
              <p style={bodyStyle}>
                Job listings are sourced from third-party APIs including Adzuna and JSearch. EducAI does not verify the accuracy, availability, or legitimacy of job listings. Always research employers independently before applying.
              </p>
            </section>

            {/* Section 7 */}
            <section id="section-7" style={sectionStyle}>
              <SectionDecor num="7" />
              <h2 style={h2Style}>7. Pricing and Plans</h2>
              <h3 style={h3Style}>7.1 Free Access</h3>
              <p style={bodyStyle}>
                EducAI is currently free to use. All core features — including program matching, scholarship discovery, AI strategy, SOP builder, CV builder, job finder, and timeline planner — are available at no cost and require no payment information.
              </p>
              <h3 style={h3Style}>7.2 Future Paid Plans</h3>
              <p style={bodyStyle}>
                We may introduce optional premium features in the future. Any paid features will be clearly labelled, optional, and will not remove access to the current free feature set. We will provide advance notice before introducing any charges.
              </p>
              <h3 style={h3Style}>7.3 No Surprise Charges</h3>
              <p style={bodyStyle}>
                We will never charge you without explicit prior consent. No payment information is collected or stored by EducAI at this time.
              </p>
            </section>

            {/* Section 8 */}
            <section id="section-8" style={sectionStyle}>
              <SectionDecor num="8" />
              <h2 style={h2Style}>8. Intellectual Property</h2>
              <h3 style={h3Style}>8.1 Our IP</h3>
              <p style={bodyStyle}>
                EducAI, its logo, design, features, code, and AI models are the intellectual property of EducAI and its licensors. You may not copy, reproduce, distribute, or create derivative works without our explicit written permission.
              </p>
              <h3 style={h3Style}>8.2 Your Content</h3>
              <p style={bodyStyle}>
                You retain ownership of personal information, academic records, and documents you upload or create through our platform. By using EducAI, you grant us a limited license to process your content for the purpose of providing our services.
              </p>
              <h3 style={h3Style}>8.3 Feedback</h3>
              <p style={bodyStyle}>
                Any feedback, suggestions, or ideas you submit to us may be used to improve our services without obligation to compensate you.
              </p>
            </section>

            {/* Section 9 */}
            <section id="section-9" style={sectionStyle}>
              <SectionDecor num="9" />
              <h2 style={h2Style}>9. Privacy</h2>
              <p style={bodyStyle}>
                Your use of EducAI is governed by our{" "}
                <Link href="/privacy" style={linkStyle}>Privacy Policy</Link>,
                which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our data practices.
              </p>
              <p style={bodyStyle}>
                By using EducAI, you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
            </section>

            {/* Section 10 */}
            <section id="section-10" style={sectionStyle}>
              <SectionDecor num="10" />
              <h2 style={h2Style}>10. Disclaimers and Limitation of Liability</h2>
              <h3 style={h3Style}>10.1 As-Is Service</h3>
              <p style={bodyStyle}>
                EducAI is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </p>
              <h3 style={h3Style}>10.2 No Admission Guarantee</h3>
              <p style={bodyStyle}>
                EducAI does not guarantee admission to any university, award of any scholarship, approval of any visa application, or success in any job application. Our platform provides tools and information to help you in your journey, not guaranteed outcomes.
              </p>
              <h3 style={h3Style}>10.3 Limitation of Liability</h3>
              <p style={bodyStyle}>
                To the maximum extent permitted by applicable law, EducAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of or inability to use our services.
              </p>
              <h3 style={h3Style}>10.4 Third-Party Services</h3>
              <p style={bodyStyle}>
                We are not responsible for the availability, accuracy, or content of third-party services, websites, or APIs integrated with EducAI.
              </p>
            </section>

            {/* Section 11 */}
            <section id="section-11" style={sectionStyle}>
              <SectionDecor num="11" />
              <h2 style={h2Style}>11. Governing Law</h2>
              <p style={bodyStyle}>
                These Terms are governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or your use of EducAI shall be subject to the exclusive jurisdiction of the courts in the applicable jurisdiction.
              </p>
              <p style={bodyStyle}>
                If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            {/* Section 12 */}
            <section id="section-12" style={sectionStyle}>
              <SectionDecor num="12" />
              <h2 style={h2Style}>12. Contact</h2>
              <p style={bodyStyle}>
                If you have questions about these Terms of Service, please contact us:
              </p>

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
                    { label: "Legal inquiries", href: "support.educai@gmail.com" },
                    { label: "General support", href: "support.educai@gmail.com" },
                  ].map(({ label, href }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 12, color: "#3D4F6B", minWidth: 120 }}>{label}</span>
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
                  We aim to respond to all legal inquiries within 5 business days.
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
  // className applied separately
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
