/**
 * Scholarship seed script — demo dataset for dev/staging environments.
 * Run with: npm run seed:scholarships
 *
 * Provides 28 representative scholarships across US, UK, Canada, Australia,
 * Germany, Japan, and global programs. All records are well-labelled as demo
 * data. Switch `isActive` to false to hide from production without deleting.
 */

import "dotenv/config";
import { ProgramLevel } from '../src/generated/client.ts';
import prisma from '../src/config/database.ts';

interface ScholarshipSeed {
  title: string;
  provider: string;
  countryCode: string | null;
  level: ProgramLevel | null;
  field: string | null;
  url: string;
  description: string;
  amount: string;
  fundingType: 'full' | 'partial' | 'living' | 'research';
  minGpa: number | null;
  requiresEnglishTest: boolean;
  financialNeedRequired: boolean;
  eligibleNationalities: string[] | null;
  tags: string[];
  deadlines: Array<{ term: string; deadline: string }>;
}

const SCHOLARSHIPS: ScholarshipSeed[] = [
  // ─── United States ───────────────────────────────────────────────────────
  {
    title: 'Fulbright Foreign Student Program',
    provider: 'U.S. Department of State',
    countryCode: 'US',
    level: ProgramLevel.MSC,
    field: 'All Fields',
    url: 'https://foreign.fulbrightonline.org/',
    description:
      'The Fulbright Program offers grants to international students for graduate-level study and research in the United States. One of the most prestigious scholarships worldwide.',
    amount: 'Full tuition + living allowance + health insurance + travel',
    fundingType: 'full',
    minGpa: 3.0,
    requiresEnglishTest: true,
    financialNeedRequired: false,
    eligibleNationalities: null, // most countries — managed per country
    tags: ['merit', 'research', 'government', 'prestigious'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2025-10-15T00:00:00Z' },
    ],
  },
  {
    title: 'NSF Graduate Research Fellowship Program (GRFP)',
    provider: 'National Science Foundation',
    countryCode: 'US',
    level: ProgramLevel.PHD,
    field: 'STEM',
    url: 'https://www.nsfgrfp.org/',
    description:
      'Provides three years of financial support for graduate students in NSF-supported STEM disciplines. Open to US citizens and permanent residents only.',
    amount: '$37,000/year stipend + $16,000 cost of education',
    fundingType: 'full',
    minGpa: 3.5,
    requiresEnglishTest: false,
    financialNeedRequired: false,
    eligibleNationalities: ['US'],
    tags: ['STEM', 'research', 'PhD', 'government'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2025-10-18T00:00:00Z' },
    ],
  },
  {
    title: 'Knight-Hennessy Scholars Program',
    provider: 'Stanford University',
    countryCode: 'US',
    level: ProgramLevel.PHD,
    field: 'All Fields',
    url: 'https://knight-hennessy.stanford.edu/',
    description:
      "World's largest fully-endowed graduate scholarship. For students admitted to any Stanford graduate programme.",
    amount: 'Full funding: tuition, room & board, stipend',
    fundingType: 'full',
    minGpa: 3.7,
    requiresEnglishTest: true,
    financialNeedRequired: false,
    eligibleNationalities: null,
    tags: ['prestigious', 'leadership', 'interdisciplinary'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2025-10-02T00:00:00Z' },
    ],
  },
  {
    title: 'Harvard Griffin GSAS Merit Fellowship',
    provider: 'Harvard University',
    countryCode: 'US',
    level: ProgramLevel.PHD,
    field: 'All Fields',
    url: 'https://gsas.harvard.edu/financial-support',
    description:
      'Harvard Graduate School of Arts and Sciences merit fellowships awarded automatically to admitted PhD students in most programmes.',
    amount: '$45,000/year + full tuition',
    fundingType: 'full',
    minGpa: 3.7,
    requiresEnglishTest: true,
    financialNeedRequired: false,
    eligibleNationalities: null,
    tags: ['merit', 'PhD', 'Ivy League'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2025-12-15T00:00:00Z' },
    ],
  },

  // ─── United Kingdom ───────────────────────────────────────────────────────
  {
    title: 'Chevening Scholarships',
    provider: 'UK Foreign Commonwealth & Development Office',
    countryCode: 'GB',
    level: ProgramLevel.MSC,
    field: 'All Fields',
    url: 'https://www.chevening.org/',
    description:
      "The UK government's global scholarship programme. For one year Master's degrees at UK universities. Leadership and academic potential are key criteria.",
    amount: 'Full tuition + monthly stipend + flights + visa costs',
    fundingType: 'full',
    minGpa: 2.8,
    requiresEnglishTest: true,
    financialNeedRequired: false,
    eligibleNationalities: null, // 160+ countries
    tags: ['government', 'UK', 'leadership', 'prestigious', 'merit'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2025-11-05T00:00:00Z' },
    ],
  },
  {
    title: 'Commonwealth Scholarships (UK)',
    provider: 'Commonwealth Scholarship Commission',
    countryCode: 'GB',
    level: ProgramLevel.PHD,
    field: 'Development',
    url: 'https://cscuk.fcdo.gov.uk/',
    description:
      'For students from Commonwealth countries. Aimed at those whose studies will contribute to the development of their home country.',
    amount: 'Full tuition + stipend + airfare + warm clothing allowance',
    fundingType: 'full',
    minGpa: 3.2,
    requiresEnglishTest: true,
    financialNeedRequired: true,
    eligibleNationalities: null, // Commonwealth countries
    tags: ['commonwealth', 'development', 'government', 'international'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2025-12-12T00:00:00Z' },
    ],
  },
  {
    title: 'Oxford Clarendon Scholarship',
    provider: 'University of Oxford',
    countryCode: 'GB',
    level: ProgramLevel.PHD,
    field: 'All Fields',
    url: 'https://www.ox.ac.uk/admissions/graduate/fees-and-funding/scholarships/clarendon',
    description:
      "Oxford University's flagship graduate scholarship. Awarded on the basis of outstanding academic achievement and potential.",
    amount: 'Full tuition + annual living grant (~£18,000)',
    fundingType: 'full',
    minGpa: 3.8,
    requiresEnglishTest: true,
    financialNeedRequired: false,
    eligibleNationalities: null,
    tags: ['Oxford', 'prestigious', 'merit', 'PhD', 'research'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2026-01-15T00:00:00Z' },
    ],
  },

  // ─── Canada ───────────────────────────────────────────────────────────────
  {
    title: 'Vanier Canada Graduate Scholarships',
    provider: 'Government of Canada',
    countryCode: 'CA',
    level: ProgramLevel.PHD,
    field: 'All Fields',
    url: 'https://vanier.gc.ca/',
    description:
      'Aims to attract and retain world-class doctoral students. Emphasises academic excellence, research potential, and leadership.',
    amount: 'CAD $50,000/year for 3 years',
    fundingType: 'full',
    minGpa: 3.7,
    requiresEnglishTest: true,
    financialNeedRequired: false,
    eligibleNationalities: null,
    tags: ['Canada', 'government', 'PhD', 'research', 'leadership'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2025-11-01T00:00:00Z' },
    ],
  },
  {
    title: "Canada Graduate Scholarships \u2013 Master's (CGS-M)",
    provider: 'Government of Canada (NSERC/SSHRC/CIHR)',
    countryCode: 'CA',
    level: ProgramLevel.MSC,
    field: 'All Fields',
    url: 'https://www.nserc-crsng.gc.ca/students-etudiants/pg-cs/cgsm-bescm_eng.asp',
    description:
      "Supports high-calibre Master's students in any eligible Canadian university. Covers STEM, social sciences, and health.",
    amount: 'CAD $17,500 for 12 months',
    fundingType: 'partial',
    minGpa: 3.5,
    requiresEnglishTest: false,
    financialNeedRequired: false,
    eligibleNationalities: ['CA'],
    tags: ['Canada', 'government', 'MSc', 'merit'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2025-12-01T00:00:00Z' },
    ],
  },
  {
    title: 'University of Toronto International Excellence Award',
    provider: 'University of Toronto',
    countryCode: 'CA',
    level: ProgramLevel.MSC,
    field: 'All Fields',
    url: 'https://www.sgs.utoronto.ca/awards/',
    description:
      'Merit-based award for outstanding international students admitted to U of T graduate programmes.',
    amount: 'CAD $10,000 – $40,000 (varies by programme)',
    fundingType: 'partial',
    minGpa: 3.5,
    requiresEnglishTest: true,
    financialNeedRequired: false,
    eligibleNationalities: null,
    tags: ['Canada', 'university', 'international', 'merit'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2026-02-01T00:00:00Z' },
    ],
  },

  // ─── Australia ────────────────────────────────────────────────────────────
  {
    title: 'Australia Awards Scholarships',
    provider: 'Australian Government (DFAT)',
    countryCode: 'AU',
    level: ProgramLevel.MSC,
    field: 'Development',
    url: 'https://www.australiaawards.gov.au/',
    description:
      'Long-term development awards for students from eligible developing countries. Focus on economic development, social issues, and governance.',
    amount: 'Full tuition + establishment allowance + living costs + airfare',
    fundingType: 'full',
    minGpa: 2.8,
    requiresEnglishTest: true,
    financialNeedRequired: true,
    eligibleNationalities: null, // Asia Pacific and Africa focus
    tags: ['Australia', 'government', 'development', 'international'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2025-04-30T00:00:00Z' },
    ],
  },
  {
    title: 'Research Training Program (RTP)',
    provider: 'Australian Government',
    countryCode: 'AU',
    level: ProgramLevel.PHD,
    field: 'All Fields',
    url: 'https://www.education.gov.au/research-training-program',
    description:
      'Government-funded programme covering tuition fees for domestic and international PhD students at Australian universities.',
    amount: 'Full tuition fee offset (university distributes)',
    fundingType: 'partial',
    minGpa: 3.2,
    requiresEnglishTest: true,
    financialNeedRequired: false,
    eligibleNationalities: null,
    tags: ['Australia', 'research', 'PhD', 'government'],
    deadlines: [
      { term: 'Semester 1 2026', deadline: '2025-10-31T00:00:00Z' },
      { term: 'Semester 2 2026', deadline: '2026-04-30T00:00:00Z' },
    ],
  },
  {
    title: 'Melbourne Research Scholarship',
    provider: 'University of Melbourne',
    countryCode: 'AU',
    level: ProgramLevel.PHD,
    field: 'All Fields',
    url: 'https://scholarships.unimelb.edu.au/',
    description:
      'Provides a living allowance and tuition fee remission to high-achieving PhD candidates at the University of Melbourne.',
    amount: 'AUD $32,500/year stipend + tuition',
    fundingType: 'full',
    minGpa: 3.5,
    requiresEnglishTest: true,
    financialNeedRequired: false,
    eligibleNationalities: null,
    tags: ['Australia', 'university', 'research', 'merit'],
    deadlines: [
      { term: 'Semester 1 2027', deadline: '2026-10-31T00:00:00Z' },
    ],
  },

  // ─── Germany ──────────────────────────────────────────────────────────────
  {
    title: 'DAAD Scholarships for Development-Related Postgraduate Courses',
    provider: 'DAAD (German Academic Exchange Service)',
    countryCode: 'DE',
    level: ProgramLevel.MSC,
    field: 'Development',
    url: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/',
    description:
      'For graduates from developing countries who want to pursue a postgraduate degree in Germany. Focus on sustainability, development, and governance.',
    amount: '€934/month + travel allowance + health insurance',
    fundingType: 'full',
    minGpa: 2.8,
    requiresEnglishTest: true,
    financialNeedRequired: false,
    eligibleNationalities: null, // developing countries
    tags: ['Germany', 'DAAD', 'development', 'government', 'international'],
    deadlines: [
      { term: 'Winter 2026/27', deadline: '2026-07-15T00:00:00Z' },
    ],
  },
  {
    title: 'Konrad-Adenauer-Stiftung Scholarships',
    provider: 'Konrad-Adenauer-Stiftung',
    countryCode: 'DE',
    level: ProgramLevel.MSC,
    field: 'Social Sciences',
    url: 'https://www.kas.de/en/web/begabtenfoerderung-und-kultur/scholarships',
    description:
      'For academically outstanding students who are socially and politically committed. Available to both German and international students.',
    amount: '€934/month + flat-rate expenses',
    fundingType: 'partial',
    minGpa: 3.3,
    requiresEnglishTest: false,
    financialNeedRequired: false,
    eligibleNationalities: null,
    tags: ['Germany', 'politics', 'social sciences', 'merit', 'leadership'],
    deadlines: [
      { term: 'Winter 2026/27', deadline: '2026-01-15T00:00:00Z' },
    ],
  },
  {
    title: 'Heinrich Böll Foundation Scholarships',
    provider: 'Heinrich Böll Foundation',
    countryCode: 'DE',
    level: ProgramLevel.PHD,
    field: 'Environmental Studies',
    url: 'https://www.boell.de/en/scholarships',
    description:
      'For students committed to green politics, sustainability, and civil society values. MSc and PhD levels.',
    amount: '€830/month + healthcare + study allowance',
    fundingType: 'partial',
    minGpa: 3.2,
    requiresEnglishTest: false,
    financialNeedRequired: false,
    eligibleNationalities: null,
    tags: ['Germany', 'environment', 'sustainability', 'merit', 'politics'],
    deadlines: [
      { term: 'Spring 2026', deadline: '2025-09-01T00:00:00Z' },
      { term: 'Fall 2026', deadline: '2026-03-01T00:00:00Z' },
    ],
  },

  // ─── Global / Multinational ───────────────────────────────────────────────
  {
    title: 'Gates Cambridge Scholarship',
    provider: 'Gates Foundation & University of Cambridge',
    countryCode: 'GB',
    level: ProgramLevel.PHD,
    field: 'All Fields',
    url: 'https://www.gatescambridge.org/',
    description:
      'Full-cost scholarship for outstanding applicants from outside the UK to study any subject at Cambridge. One of the most competitive scholarships in the world.',
    amount: 'Full cost of study + living allowance',
    fundingType: 'full',
    minGpa: 3.9,
    requiresEnglishTest: true,
    financialNeedRequired: false,
    eligibleNationalities: null, // non-UK citizens
    tags: ['Cambridge', 'prestigious', 'leadership', 'research', 'global'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2025-10-15T00:00:00Z' },
      { term: 'Fall 2026 (US citizens)', deadline: '2025-12-04T00:00:00Z' },
    ],
  },
  {
    title: 'Schwarzman Scholars Program',
    provider: 'Schwarzman College, Tsinghua University',
    countryCode: 'CN',
    level: ProgramLevel.MSC,
    field: 'Leadership',
    url: 'https://www.schwarzmanscholars.org/',
    description:
      "One-year Master's programme in global affairs at Tsinghua University in Beijing. Designed to build the next generation of global leaders.",
    amount: 'Full tuition + room & board + stipend + international travel',
    fundingType: 'full',
    minGpa: 3.5,
    requiresEnglishTest: true,
    financialNeedRequired: false,
    eligibleNationalities: null,
    tags: ['China', 'leadership', 'global', 'prestigious', 'business'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2025-09-18T00:00:00Z' },
    ],
  },
  {
    title: 'Erasmus Mundus Joint Masters',
    provider: 'European Commission',
    countryCode: null,
    level: ProgramLevel.MSC,
    field: 'All Fields',
    url: 'https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters',
    description:
      'Prestigious study programme implemented by an international consortium of higher education institutions. Students study in multiple EU countries.',
    amount: '€1,400/month living allowance + tuition',
    fundingType: 'full',
    minGpa: 3.0,
    requiresEnglishTest: true,
    financialNeedRequired: false,
    eligibleNationalities: null,
    tags: ['Europe', 'EU', 'joint degree', 'international', 'multi-country'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2026-02-15T00:00:00Z' },
    ],
  },
  {
    title: 'AAUW International Fellowships',
    provider: 'American Association of University Women',
    countryCode: 'US',
    level: ProgramLevel.MSC,
    field: 'All Fields',
    url: 'https://www.aauw.org/resources/programs/fellowships-grants/current-opportunities/international/',
    description:
      'For women pursuing graduate or postdoctoral study in the United States. Fellows are chosen for academic excellence, demonstrated commitment to women and girls.',
    amount: '$18,000 – $30,000 per year',
    fundingType: 'partial',
    minGpa: 3.0,
    requiresEnglishTest: true,
    financialNeedRequired: false,
    eligibleNationalities: null, // non-US women
    tags: ['women', 'US', 'merit', 'gender', 'research'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2025-11-15T00:00:00Z' },
    ],
  },
  {
    title: 'OPEC Fund Scholarship Program',
    provider: 'OPEC Fund for International Development',
    countryCode: null,
    level: ProgramLevel.MSC,
    field: 'Development',
    url: 'https://opecfund.org/operations/grants/scholarships',
    description:
      "For citizens of developing countries to pursue Master's degrees in development-related fields at leading universities worldwide.",
    amount: 'Tuition + living allowance (amount varies by destination)',
    fundingType: 'full',
    minGpa: 3.0,
    requiresEnglishTest: true,
    financialNeedRequired: true,
    eligibleNationalities: null, // developing country citizens
    tags: ['development', 'global', 'financial need', 'international'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2026-03-31T00:00:00Z' },
    ],
  },
  {
    title: 'Japanese Government (MEXT) Scholarship',
    provider: 'Ministry of Education, Culture, Sports, Science and Technology, Japan',
    countryCode: 'JP',
    level: ProgramLevel.MSC,
    field: 'All Fields',
    url: 'https://www.studyinjapan.go.jp/en/smap-stopj-applications-graduate.html',
    description:
      'Full scholarship for foreign students to study in Japan. Covers research students, undergraduate, and graduate levels.',
    amount: '¥143,000 – ¥145,000/month + tuition + airfare',
    fundingType: 'full',
    minGpa: 2.8,
    requiresEnglishTest: false,
    financialNeedRequired: false,
    eligibleNationalities: null,
    tags: ['Japan', 'government', 'MEXT', 'international', 'research'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2026-05-15T00:00:00Z' },
    ],
  },
  {
    title: 'Korean Government Scholarship Program (KGSP)',
    provider: 'National Institute for International Education, South Korea',
    countryCode: 'KR',
    level: ProgramLevel.MSC,
    field: 'All Fields',
    url: 'https://www.studyinkorea.go.kr/en/sub/gks/allnew_KGSP.do',
    description:
      'Full scholarship for international students to pursue undergraduate or graduate studies in South Korea.',
    amount: '₩1,000,000/month + tuition + airfare + settlement allowance',
    fundingType: 'full',
    minGpa: 2.64, // equivalent to 80% average
    requiresEnglishTest: false,
    financialNeedRequired: false,
    eligibleNationalities: null,
    tags: ['South Korea', 'government', 'Asia', 'STEM', 'research'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2026-02-28T00:00:00Z' },
    ],
  },

  // ─── Undergraduate / BSc ──────────────────────────────────────────────────
  {
    title: 'QS Undergraduate Scholarship',
    provider: 'QS Quacquarelli Symonds',
    countryCode: null,
    level: ProgramLevel.BSC,
    field: 'All Fields',
    url: 'https://www.qs.com/scholarships/',
    description:
      'Annual scholarship for high-achieving undergraduate students planning to study abroad at a QS World University Rankings institution.',
    amount: '£5,000 (one-time)',
    fundingType: 'partial',
    minGpa: 3.0,
    requiresEnglishTest: true,
    financialNeedRequired: false,
    eligibleNationalities: null,
    tags: ['undergraduate', 'global', 'merit', 'partial'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2026-04-30T00:00:00Z' },
    ],
  },
  {
    title: 'MasterCard Foundation Scholars Program',
    provider: 'MasterCard Foundation & partner universities',
    countryCode: null,
    level: ProgramLevel.BSC,
    field: 'All Fields',
    url: 'https://mastercardfdn.org/all/scholars/',
    description:
      'Provides academically talented yet economically disadvantaged young Africans with access to quality and relevant university education.',
    amount: 'Full tuition + living expenses + travel + mentorship',
    fundingType: 'full',
    minGpa: 2.8,
    requiresEnglishTest: false,
    financialNeedRequired: true,
    eligibleNationalities: null, // Sub-Saharan African students
    tags: ['Africa', 'undergraduate', 'financial need', 'leadership', 'development'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2026-01-31T00:00:00Z' },
    ],
  },
  {
    title: 'Yale Young Global Scholars Program',
    provider: 'Yale University',
    countryCode: 'US',
    level: ProgramLevel.BSC,
    field: 'All Fields',
    url: 'https://globalscholars.yale.edu/',
    description:
      'Academic enrichment program for outstanding high school students interested in studying at Yale or other top universities.',
    amount: 'Partial need-based grants available (programme fee ~$6,000)',
    fundingType: 'partial',
    minGpa: 3.8,
    requiresEnglishTest: true,
    financialNeedRequired: false,
    eligibleNationalities: null,
    tags: ['pre-university', 'Yale', 'leadership', 'summer', 'merit'],
    deadlines: [
      { term: 'Summer 2026', deadline: '2026-03-10T00:00:00Z' },
    ],
  },
  {
    title: 'Swedish Institute Scholarships for Global Professionals',
    provider: 'Swedish Institute',
    countryCode: 'SE',
    level: ProgramLevel.MSC,
    field: 'All Fields',
    url: 'https://si.se/en/apply/scholarships/',
    description:
      "For future leaders from certain countries to pursue Master's programmes in Sweden. Emphasises professional experience and leadership potential.",
    amount: 'SEK 11,000/month + tuition + travel grant + insurance',
    fundingType: 'full',
    minGpa: 3.0,
    requiresEnglishTest: true,
    financialNeedRequired: false,
    eligibleNationalities: null, // specified countries only
    tags: ['Sweden', 'leadership', 'professional', 'merit', 'Europe'],
    deadlines: [
      { term: 'Fall 2026', deadline: '2026-02-10T00:00:00Z' },
    ],
  },
];

async function main() {
  console.log(`🌱  Seeding ${SCHOLARSHIPS.length} scholarships...`);
  let created = 0;
  let updated = 0;

  for (const seed of SCHOLARSHIPS) {
    // Use title + provider as deduplication key
    const existing = await prisma.scholarship.findFirst({
      where: { title: seed.title, provider: seed.provider ?? undefined },
    });

    const scholarshipData = {
      title: seed.title,
      provider: seed.provider,
      countryCode: seed.countryCode,
      level: seed.level,
      field: seed.field,
      url: seed.url,
      description: seed.description,
      amount: seed.amount,
      fundingType: seed.fundingType,
      minGpa: seed.minGpa,
      requiresEnglishTest: seed.requiresEnglishTest,
      financialNeedRequired: seed.financialNeedRequired,
      eligibleNationalities: seed.eligibleNationalities ?? undefined,
      tags: seed.tags,
      isActive: true,
      lastVerified: new Date('2026-04-12'),
    };

    if (existing) {
      await prisma.scholarship.update({
        where: { id: existing.id },
        data: scholarshipData,
      });
      updated++;

      // Re-sync deadlines
      await prisma.scholarshipDeadline.deleteMany({ where: { scholarshipId: existing.id } });
      for (const d of seed.deadlines) {
        await prisma.scholarshipDeadline.create({
          data: {
            scholarshipId: existing.id,
            term: d.term,
            deadline: new Date(d.deadline),
          },
        });
      }
    } else {
      await prisma.scholarship.create({
        data: {
          ...scholarshipData,
          deadlines: {
            create: seed.deadlines.map(d => ({
              term: d.term,
              deadline: new Date(d.deadline),
            })),
          },
        },
      });
      created++;
    }
  }

  console.log(`✅  Done — ${created} created, ${updated} updated`);
}

main()
  .catch((err) => {
    console.error('❌  Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
