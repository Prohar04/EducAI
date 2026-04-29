export type SeoCountry = {
  slug: string;
  name: string;
  flag: string;
  headline: string;
  description: string;
  highlights: string[];
  popularDegrees: string[];
  visaType: string;
  avgTuition: string;
  topUniversities: string[];
  faqs: { q: string; a: string }[];
};

export const SEO_COUNTRIES: SeoCountry[] = [
  {
    slug: "germany",
    name: "Germany",
    flag: "🇩🇪",
    headline: "Study in Germany — Tuition-Free World-Class Universities",
    description:
      "Germany offers tuition-free education at public universities, globally ranked engineering and science programs, and a clear post-study work visa path. Explore programs, scholarships, and visa requirements for international students.",
    highlights: [
      "Most public universities charge no tuition fees for international students",
      "Home to 400+ English-taught Master's programs",
      "18-month job-seeker visa available after graduation",
      "DAAD scholarships worth up to €850/month",
      "TestDaF or DSH required for German-taught programs; IELTS/TOEFL for English programs",
    ],
    popularDegrees: [
      "MSc Computer Science",
      "MSc Mechanical Engineering",
      "MSc Data Science",
      "MBA",
      "MSc Environmental Engineering",
    ],
    visaType: "German Student Visa (National Visa Type D)",
    avgTuition: "€0–€3,000/year (semester fees only at most public universities)",
    topUniversities: [
      "Technical University of Munich (TUM)",
      "Karlsruhe Institute of Technology (KIT)",
      "RWTH Aachen University",
      "Heidelberg University",
      "Humboldt University of Berlin",
    ],
    faqs: [
      {
        q: "Is university tuition really free in Germany?",
        a: "Most German public universities charge only a semester contribution fee (€150–€350) covering admin and public transit. There is no tuition fee for most Bachelor's and Master's programs, regardless of nationality.",
      },
      {
        q: "What language do I need to study in Germany?",
        a: "English-taught programs require IELTS (usually 6.5+) or TOEFL iBT (90+). German-taught programs require TestDaF level 4 or DSH-2. Over 400 Master's programs in Germany are fully taught in English.",
      },
      {
        q: "Can I work in Germany after graduating?",
        a: "Yes. Non-EU graduates receive an 18-month job-seeker visa after graduation. Once employed, you can apply for a residence permit for qualified employment or an EU Blue Card.",
      },
      {
        q: "What scholarships are available for Germany?",
        a: "DAAD scholarships (€750–€1,200/month), Deutschlandstipendium (€300/month), and KAAD scholarships are popular options. EducAI tracks eligibility for all major Germany-specific scholarships.",
      },
    ],
  },
  {
    slug: "canada",
    name: "Canada",
    flag: "🇨🇦",
    headline: "Study in Canada — Top Universities and Clear PR Pathway",
    description:
      "Canada combines high-quality education with one of the most immigrant-friendly post-study pathways in the world. With the Post-Graduation Work Permit (PGWP) and Express Entry, many graduates transition to permanent residency.",
    highlights: [
      "Post-Graduation Work Permit (PGWP) for up to 3 years after graduation",
      "Express Entry pathway to Permanent Residency",
      "Top-ranked universities: University of Toronto, UBC, McGill",
      "Multilingual environment — English and French streams",
      "Strong co-op and internship culture embedded into programs",
    ],
    popularDegrees: [
      "MEng Computer Engineering",
      "MBA",
      "MSc Data Science",
      "MSc Nursing / Health Sciences",
      "MSc Environmental Studies",
    ],
    visaType: "Canadian Student Visa (Study Permit)",
    avgTuition: "CAD $20,000–$45,000/year depending on program and province",
    topUniversities: [
      "University of Toronto",
      "University of British Columbia (UBC)",
      "McGill University",
      "University of Waterloo",
      "McMaster University",
    ],
    faqs: [
      {
        q: "Can I get permanent residency after studying in Canada?",
        a: "Yes. Most graduates from eligible Canadian institutions can apply for a Post-Graduation Work Permit (PGWP) for up to 3 years. Working in Canada gives you Canadian Experience Class (CEC) points for Express Entry, one of the fastest PR pathways.",
      },
      {
        q: "What is the PGWP?",
        a: "The Post-Graduation Work Permit lets international graduates work for any employer in Canada for a duration equal to the length of their program (up to 3 years for programs 2+ years long).",
      },
      {
        q: "What scores do I need to apply to Canadian universities?",
        a: "Most universities require IELTS 6.5+ or TOEFL iBT 90+. For competitive programs, aim for IELTS 7.0 or TOEFL 100+. GRE/GMAT is required for some business and engineering programs.",
      },
      {
        q: "Are there scholarships for international students in Canada?",
        a: "Yes — Vanier Canada Graduate Scholarships, Ontario Graduate Scholarships, university-specific entrance awards, and the Canada-ASEAN Scholarship Program. EducAI pre-screens your eligibility across verified Canadian scholarships.",
      },
    ],
  },
  {
    slug: "united-kingdom",
    name: "United Kingdom",
    flag: "🇬🇧",
    headline: "Study in the UK — World-Class Degrees, Compact Programs",
    description:
      "UK universities offer one of the most respected degree credentials globally. Most UK Master's programs are just 1 year, making them cost-effective. The Graduate Route visa gives 2 years post-study work rights.",
    highlights: [
      "1-year Master's programs — faster and often cheaper than US/Canadian equivalents",
      "Graduate Route visa: 2 years post-study work rights (3 for PhD graduates)",
      "Oxford, Cambridge, Imperial, UCL — top 10 globally ranked universities",
      "Chevening, Commonwealth, and Gates-Cambridge scholarships available",
      "Strong research culture and industry links",
    ],
    popularDegrees: [
      "MSc Computer Science",
      "MSc Finance",
      "MSc Data Science & AI",
      "LLM (Law)",
      "MSc Public Health",
    ],
    visaType: "UK Student Visa (formerly Tier 4)",
    avgTuition: "£15,000–£35,000/year depending on program and university",
    topUniversities: [
      "University of Oxford",
      "University of Cambridge",
      "Imperial College London",
      "University College London (UCL)",
      "University of Edinburgh",
    ],
    faqs: [
      {
        q: "How long is a Master's degree in the UK?",
        a: "Most taught Master's programs in the UK are 1 year (12 months) full-time. This makes UK Master's degrees faster and often more affordable than equivalent programs in the US or Canada.",
      },
      {
        q: "What is the Graduate Route visa?",
        a: "The Graduate Route allows international students who complete a degree in the UK to stay and work for 2 years (3 years for PhD graduates) without needing a job offer upfront.",
      },
      {
        q: "What are the top scholarships for the UK?",
        a: "Chevening Scholarship (full funding, UK government), Gates-Cambridge Scholarship (full funding, PhD focus), Commonwealth Scholarship, and university-specific awards like the Edinburgh Global Scholarship.",
      },
      {
        q: "What English test do UK universities require?",
        a: "Most UK universities require IELTS Academic 6.5–7.0 (depending on the program). Some accept Duolingo English Test or TOEFL. Russel Group universities typically require higher scores.",
      },
    ],
  },
  {
    slug: "australia",
    name: "Australia",
    flag: "🇦🇺",
    headline: "Study in Australia — High-Quality Education and Work Rights",
    description:
      "Australia is a top destination for international students, offering globally ranked universities, up to 6 years of post-study work rights, and a clear pathway to permanent residency through the Skilled Migration program.",
    highlights: [
      "Temporary Graduate visa: 2–6 years of post-study work rights",
      "Skilled Migration Pathway to PR through 189/190/491 visas",
      "7 universities in global top 100",
      "Australia Awards and Research Training Program scholarships",
      "IELTS/TOEFL accepted at all major universities",
    ],
    popularDegrees: [
      "Master of Information Technology",
      "MBA",
      "Master of Engineering",
      "Master of Public Health",
      "Master of Education",
    ],
    visaType: "Australian Student Visa (Subclass 500)",
    avgTuition: "AUD $20,000–$45,000/year depending on field and institution",
    topUniversities: [
      "Australian National University (ANU)",
      "University of Melbourne",
      "University of Sydney",
      "University of Queensland",
      "Monash University",
    ],
    faqs: [
      {
        q: "How long can I work in Australia after graduating?",
        a: "Through the Temporary Graduate visa (subclass 485), you can stay and work in Australia for 2–6 years depending on your qualification level and where you studied (metropolitan vs regional areas attract longer visas).",
      },
      {
        q: "Can I get PR in Australia after studying?",
        a: "Yes. The Skilled Independent (189), Skilled Nominated (190), and Skilled Work Regional (491) visas provide pathways to PR. Points are awarded for age, English, occupation, and study in Australia.",
      },
      {
        q: "What scholarships are available in Australia?",
        a: "Australia Awards (full funding for developing country nationals), Research Training Program (RTP) for research degrees, and Destination Australia for regional study incentives.",
      },
      {
        q: "Is IELTS required to study in Australia?",
        a: "Most Australian universities require IELTS Academic 6.0–7.0 (or equivalent TOEFL/PTE). Specific programs may require higher scores. Some universities accept the Duolingo English Test.",
      },
    ],
  },
  {
    slug: "united-states",
    name: "United States",
    flag: "🇺🇸",
    headline: "Study in the USA — World's Top Research Universities",
    description:
      "The US hosts more top-ranked universities than any other country. F-1 student visa with OPT and STEM OPT extensions let graduates work for up to 3 years. Funding through TA/RA positions is common for PhD and some Master's programs.",
    highlights: [
      "OPT: 12 months work authorization; STEM OPT extension: up to 3 years total",
      "STEM PhD/MS programs often funded through TA/RA positions",
      "Harvard, MIT, Stanford, and 15+ other global top-20 universities",
      "Strong industry links especially in tech, finance, and biotech hubs",
      "GRE/GMAT + TOEFL/IELTS required for most graduate programs",
    ],
    popularDegrees: [
      "MS Computer Science",
      "MS Data Science",
      "MBA",
      "MS Electrical Engineering",
      "MS Public Policy",
    ],
    visaType: "F-1 Student Visa",
    avgTuition: "USD $25,000–$65,000/year for graduate programs",
    topUniversities: [
      "Massachusetts Institute of Technology (MIT)",
      "Stanford University",
      "Harvard University",
      "Carnegie Mellon University",
      "University of California, Berkeley",
    ],
    faqs: [
      {
        q: "What is OPT and STEM OPT?",
        a: "Optional Practical Training (OPT) gives F-1 graduates 12 months of work authorization in the US. Students with STEM degrees can apply for a 24-month STEM OPT extension, giving up to 3 years total work authorization.",
      },
      {
        q: "Can I get funding for graduate programs in the US?",
        a: "Yes. PhD programs in STEM are frequently fully funded through Teaching Assistantships (TA) or Research Assistantships (RA), covering tuition and a stipend. Some funded Master's programs also exist.",
      },
      {
        q: "What test scores do US universities require?",
        a: "Most programs require TOEFL iBT 90–100+ or IELTS 7.0+. Many STEM programs require GRE; business schools typically require GMAT or GRE. Top programs set very competitive score thresholds.",
      },
      {
        q: "Are there scholarships for international students in the US?",
        a: "Fulbright Scholarships, Hubert Humphrey Fellowships, university merit awards, and need-based grants are available. Many top PhD programs offer full funding. TA/RA positions are the most common route for STEM students.",
      },
    ],
  },
  {
    slug: "netherlands",
    name: "Netherlands",
    flag: "🇳🇱",
    headline: "Study in the Netherlands — 2,000+ English-Taught Programs",
    description:
      "The Netherlands has one of the highest concentrations of English-taught university programs in Europe. With 13 research universities and a strong startup culture, it's an ideal destination for international students.",
    highlights: [
      "2,000+ English-taught programs at Bachelor's and Master's level",
      "1-year Orientation Year visa after graduation",
      "Delft, Eindhoven, and Wageningen rank among Europe's best technical universities",
      "Holland Scholarship available for select nationalities",
      "Strong innovation ecosystem in tech, agri, and logistics",
    ],
    popularDegrees: [
      "MSc Computer Science",
      "MSc Sustainable Energy",
      "MSc Water Management",
      "MSc International Business",
      "MSc Artificial Intelligence",
    ],
    visaType: "Dutch Study Visa / MVV (Machtiging tot Voorlopig Verblijf)",
    avgTuition: "€8,000–€20,000/year for non-EU students",
    topUniversities: [
      "Delft University of Technology (TU Delft)",
      "Wageningen University & Research",
      "University of Amsterdam",
      "Eindhoven University of Technology",
      "Leiden University",
    ],
    faqs: [
      {
        q: "Are there English programs in the Netherlands?",
        a: "Yes — the Netherlands has one of the highest numbers of English-taught programs in Europe, with over 2,000 accredited programs at HBO and WO universities.",
      },
      {
        q: "What is the Orientation Year visa?",
        a: "After graduating from a Dutch university, international students can apply for a 1-year Orientation Year (Zoekjaar) visa to look for work or start a business in the Netherlands.",
      },
      {
        q: "What scholarships are available in the Netherlands?",
        a: "Holland Scholarship (€5,000 one-time grant), Orange Knowledge Programme, Nuffic Scholarships, and university-specific excellence scholarships are available for international students.",
      },
    ],
  },
  {
    slug: "france",
    name: "France",
    flag: "🇫🇷",
    headline: "Study in France — Affordable Excellence at Grandes Écoles",
    description:
      "France offers affordable tuition at public universities and access to world-renowned Grandes Écoles. With a growing number of English-taught programs and a 2-year post-study work permit, France is an attractive option for international students.",
    highlights: [
      "Public university fees as low as €170/year for EU; higher for non-EU but still affordable",
      "HEC Paris, Sciences Po, CentraleSupélec globally ranked",
      "APS visa: 12-month post-study work permit extendable to 24 months",
      "Campus France scholarships and Eiffel Excellence Scholarship",
      "Strong fashion, luxury, and culinary industry links",
    ],
    popularDegrees: [
      "MSc Management / MBA",
      "MSc Engineering",
      "MSc International Relations",
      "MSc Luxury Management",
      "PhD Research Programs",
    ],
    visaType: "French Long-Stay Student Visa (VLS-TS Étudiant)",
    avgTuition: "€2,770–€3,770/year at public universities for non-EU; €10,000–€50,000 at Grandes Écoles",
    topUniversities: [
      "École Polytechnique",
      "HEC Paris",
      "Sciences Po",
      "CentraleSupélec",
      "Sorbonne University",
    ],
    faqs: [
      {
        q: "How much does it cost to study in France?",
        a: "Public universities charge a differential fee for non-EU students (€2,770–€3,770/year), while Grandes Écoles and private schools charge significantly more. France remains one of the most affordable Western European study destinations.",
      },
      {
        q: "What is the Eiffel Scholarship?",
        a: "The Eiffel Excellence Scholarship is awarded by Campus France to outstanding international students at Master's and PhD level, covering living costs and some travel expenses.",
      },
    ],
  },
  {
    slug: "sweden",
    name: "Sweden",
    flag: "🇸🇪",
    headline: "Study in Sweden — Innovation, Sustainability, and Funded Research",
    description:
      "Sweden is a global leader in innovation, sustainability, and research. Swedish universities offer competitive Master's programs with a strong focus on collaborative learning and real-world impact.",
    highlights: [
      "KTH, Chalmers, and Lund rank among Europe's top technical universities",
      "Swedish Institute Scholarships cover full tuition and living expenses",
      "Strong focus on sustainability, clean tech, and social innovation",
      "1-year job-seeker permit after graduation",
      "Safe, progressive, and highly English-proficient country",
    ],
    popularDegrees: [
      "MSc Sustainable Energy Systems",
      "MSc Computer Science",
      "MSc Industrial Engineering",
      "MSc Environmental Science",
      "MSc Human-Computer Interaction",
    ],
    visaType: "Swedish Residence Permit for Studies",
    avgTuition: "SEK 80,000–195,000/year (€7,000–€18,000) for non-EU students",
    topUniversities: [
      "KTH Royal Institute of Technology",
      "Karolinska Institute",
      "Lund University",
      "Chalmers University of Technology",
      "Uppsala University",
    ],
    faqs: [
      {
        q: "Are there scholarships to study in Sweden?",
        a: "The Swedish Institute Scholarship for Global Professionals (SISGP) covers full tuition and a monthly stipend. University-specific merit scholarships are also widely available.",
      },
      {
        q: "What is the job-seeker permit in Sweden?",
        a: "Graduates from Swedish universities can apply for a 1-year residence permit to seek employment. If you find a job, you can transition to a work permit.",
      },
    ],
  },
  {
    slug: "ireland",
    name: "Ireland",
    flag: "🇮🇪",
    headline: "Study in Ireland — English-Speaking EU Hub for Tech and Business",
    description:
      "Ireland is the only English-speaking EU member state, making it a gateway to the European job market. Home to European headquarters of Google, Meta, Apple, and Microsoft, Ireland offers strong graduate employment prospects.",
    highlights: [
      "Only English-speaking EU country with access to the European single market",
      "EU-based graduates qualify for 2-year Third Level Graduate Scheme",
      "Home to EMEA HQs of Google, Meta, Apple, Microsoft",
      "Government of Ireland International Education Scholarships",
      "Strong fintech, pharma, and software engineering industries",
    ],
    popularDegrees: [
      "MSc Computer Science",
      "MSc Data Analytics",
      "MSc International Business",
      "MSc Pharmaceutical Science",
      "MSc Clinical Psychology",
    ],
    visaType: "Irish Study Visa (INIS Stamp 2)",
    avgTuition: "€9,850–€25,000/year for non-EU students",
    topUniversities: [
      "Trinity College Dublin",
      "University College Dublin",
      "University College Cork",
      "National University of Ireland Galway (NUIG)",
      "Dublin City University",
    ],
    faqs: [
      {
        q: "Can I work in Ireland after graduating?",
        a: "Yes. Non-EU graduates from Irish universities can apply for the Third Level Graduate Scheme, which allows you to remain in Ireland for 1 year (ordinary degree) or 2 years (honours degree or postgraduate) to seek employment.",
      },
      {
        q: "Why choose Ireland over other EU countries?",
        a: "Ireland is the only English-speaking EU country, which means graduates can access the entire EU job market while working in a fully English-language environment. It also hosts major tech company EMEA headquarters.",
      },
    ],
  },
  {
    slug: "singapore",
    name: "Singapore",
    flag: "🇸🇬",
    headline: "Study in Singapore — Asia's Premier Education Hub",
    description:
      "Singapore's NUS and NTU consistently rank in the global top 15. As Asia's leading financial and tech hub, Singapore offers strong graduate employment, globally respected degrees, and a gateway into the Asia-Pacific market.",
    highlights: [
      "NUS ranked #8 and NTU ranked #15 globally (QS 2025)",
      "Singapore's Employment Pass lets graduates work after degree completion",
      "Major fintech, biomedical, and tech hub in Asia",
      "ASEAN and Singapore government scholarships available",
      "Safe, multilingual, and highly connected to global business",
    ],
    popularDegrees: [
      "MSc Computer Science",
      "MSc Financial Engineering",
      "MBA",
      "MSc Biomedical Engineering",
      "MSc Business Analytics",
    ],
    visaType: "Singapore Student's Pass",
    avgTuition: "SGD $20,000–$50,000/year depending on program",
    topUniversities: [
      "National University of Singapore (NUS)",
      "Nanyang Technological University (NTU)",
      "Singapore Management University (SMU)",
      "Singapore University of Technology and Design (SUTD)",
      "INSEAD Asia Campus",
    ],
    faqs: [
      {
        q: "Are there scholarships to study in Singapore?",
        a: "The Singapore International Graduate Award (SINGA) funds PhD research. The ASEAN Undergraduate Scholarship and various university merit scholarships are available for Master's applicants.",
      },
      {
        q: "Can I work in Singapore after graduating?",
        a: "Yes, through the Employment Pass (EP) for professionals earning above the qualifying salary threshold, or the S Pass for mid-skilled workers. NUS and NTU graduates are highly competitive for EP applications.",
      },
    ],
  },
];

export function getCountryBySlug(slug: string): SeoCountry | undefined {
  return SEO_COUNTRIES.find((c) => c.slug === slug);
}
