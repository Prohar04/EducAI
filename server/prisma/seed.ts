import 'dotenv/config';
import prisma from '../src/config/database.ts';

// Guard: only run if explicitly enabled (prevents accidental data injection)
if (process.env.SEED_ENABLED !== 'true') {
  console.log('[seed] Skipped — set SEED_ENABLED=true to run.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Seed helpers
// ---------------------------------------------------------------------------
const D = (dateStr: string) => new Date(dateStr);

type ReqInput = { key: string; value: string };
type DeadlineInput = { term: string; deadline: Date };
type ProgramInput = {
  title: string;
  field: string;
  level: 'BSC' | 'MSC' | 'PHD';
  durationMonths: number;
  tuitionMinUSD: number;
  tuitionMaxUSD: number;
  description: string;
  requirements: ReqInput[];
  deadlines: DeadlineInput[];
};
type UniInput = {
  name: string;
  city: string;
  website: string;
  description: string;
  countryCode: string;
  programs: ProgramInput[];
};

// ---------------------------------------------------------------------------
// Seed dataset (5 countries, 13 universities, 70 programs)
// TODO(scraping): Replace/augment this data with scraped records from university websites
// ---------------------------------------------------------------------------
const UNIVERSITIES: UniInput[] = [
  // ──────────────── UNITED STATES ────────────────
  {
    name: 'Massachusetts Institute of Technology',
    city: 'Cambridge',
    website: 'https://web.mit.edu',
    description: 'World-leading research university known for science, technology, and engineering.',
    countryCode: 'US',
    programs: [
      {
        title: 'Master of Science in Computer Science',
        field: 'Computer Science',
        level: 'MSC',
        durationMonths: 18,
        tuitionMinUSD: 57590,
        tuitionMaxUSD: 62000,
        description: 'Advanced coursework and research in algorithms, systems, AI, and theory.',
        requirements: [
          { key: 'GPA', value: '3.7' },
          { key: 'GRE', value: '325' },
          { key: 'TOEFL', value: '90' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2025-12-15') }],
      },
      {
        title: 'Doctor of Philosophy in Computer Science',
        field: 'Computer Science',
        level: 'PHD',
        durationMonths: 60,
        tuitionMinUSD: 0,
        tuitionMaxUSD: 0,
        description: 'Fully funded PhD with stipend. Focus on original research contributions.',
        requirements: [
          { key: 'GPA', value: '3.8' },
          { key: 'GRE', value: '325' },
          { key: 'TOEFL', value: '90' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2025-12-15') }],
      },
      {
        title: 'Master of Science in Electrical Engineering',
        field: 'Electrical Engineering',
        level: 'MSC',
        durationMonths: 18,
        tuitionMinUSD: 57590,
        tuitionMaxUSD: 60000,
        description: 'Advanced study of circuits, signal processing, and embedded systems.',
        requirements: [
          { key: 'GPA', value: '3.5' },
          { key: 'GRE', value: '320' },
          { key: 'TOEFL', value: '90' },
        ],
        deadlines: [
          { term: 'Fall 2026', deadline: D('2025-12-15') },
          { term: 'Spring 2027', deadline: D('2026-09-15') },
        ],
      },
    ],
  },
  {
    name: 'Stanford University',
    city: 'Stanford',
    website: 'https://www.stanford.edu',
    description: 'Premier research university in Silicon Valley, pioneering innovation and entrepreneurship.',
    countryCode: 'US',
    programs: [
      {
        title: 'Bachelor of Science in Computer Science',
        field: 'Computer Science',
        level: 'BSC',
        durationMonths: 48,
        tuitionMinUSD: 60000,
        tuitionMaxUSD: 65000,
        description: 'Comprehensive undergraduate CS with specialisations in AI, systems, and theory.',
        requirements: [
          { key: 'GPA', value: '3.8' },
          { key: 'SAT', value: '1520' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-01-02') }],
      },
      {
        title: 'Master of Science in Computer Science',
        field: 'Computer Science',
        level: 'MSC',
        durationMonths: 18,
        tuitionMinUSD: 60000,
        tuitionMaxUSD: 65000,
        description: 'Graduate CS with flexible course selection across AI, HCI, systems, and theory.',
        requirements: [
          { key: 'GPA', value: '3.5' },
          { key: 'GRE', value: '318' },
          { key: 'TOEFL', value: '89' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2025-12-01') }],
      },
      {
        title: 'Master of Science in Data Science',
        field: 'Data Science',
        level: 'MSC',
        durationMonths: 12,
        tuitionMinUSD: 65000,
        tuitionMaxUSD: 70000,
        description: 'Intensive program in statistics, ML, and large-scale data systems.',
        requirements: [
          { key: 'GPA', value: '3.5' },
          { key: 'GRE', value: '320' },
          { key: 'TOEFL', value: '89' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2025-12-01') }],
      },
      {
        title: 'Doctor of Philosophy in Computer Science',
        field: 'Computer Science',
        level: 'PHD',
        durationMonths: 60,
        tuitionMinUSD: 0,
        tuitionMaxUSD: 0,
        description: 'Fully funded PhD. Research in AI, systems, theory, and human-computer interaction.',
        requirements: [
          { key: 'GPA', value: '3.8' },
          { key: 'GRE', value: '325' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2025-11-15') }],
      },
    ],
  },
  {
    name: 'Carnegie Mellon University',
    city: 'Pittsburgh',
    website: 'https://www.cmu.edu',
    description: 'Top-ranked university for CS, ML, and HCI programs with strong industry connections.',
    countryCode: 'US',
    programs: [
      {
        title: 'Master of Science in Computer Science',
        field: 'Computer Science',
        level: 'MSC',
        durationMonths: 16,
        tuitionMinUSD: 55000,
        tuitionMaxUSD: 58000,
        description: 'Rigorous MS covering algorithms, systems, and applied CS.',
        requirements: [
          { key: 'GPA', value: '3.5' },
          { key: 'GRE', value: '315' },
          { key: 'TOEFL', value: '84' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2025-12-15') }],
      },
      {
        title: 'Master of Science in Machine Learning',
        field: 'Machine Learning',
        level: 'MSC',
        durationMonths: 16,
        tuitionMinUSD: 57000,
        tuitionMaxUSD: 60000,
        description: 'Specialised ML program, one of the first of its kind globally.',
        requirements: [
          { key: 'GPA', value: '3.5' },
          { key: 'GRE', value: '320' },
          { key: 'TOEFL', value: '84' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2025-12-15') }],
      },
      {
        title: 'Master of Science in Human-Computer Interaction',
        field: 'Human-Computer Interaction',
        level: 'MSC',
        durationMonths: 18,
        tuitionMinUSD: 53000,
        tuitionMaxUSD: 56000,
        description: 'Graduate program bridging CS, design, and psychology for HCI research.',
        requirements: [
          { key: 'GPA', value: '3.3' },
          { key: 'TOEFL', value: '84' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-01-07') }],
      },
    ],
  },
  {
    name: 'University of Michigan',
    city: 'Ann Arbor',
    website: 'https://umich.edu',
    description: 'Leading public research university with strong engineering and business schools.',
    countryCode: 'US',
    programs: [
      {
        title: 'Bachelor of Science in Computer Science',
        field: 'Computer Science',
        level: 'BSC',
        durationMonths: 48,
        tuitionMinUSD: 49000,
        tuitionMaxUSD: 52000,
        description: 'Undergraduate CS with focus on software engineering and algorithms.',
        requirements: [
          { key: 'GPA', value: '3.7' },
          { key: 'SAT', value: '1450' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-02-01') }],
      },
      {
        title: 'Master of Science in Computer Science',
        field: 'Computer Science',
        level: 'MSC',
        durationMonths: 24,
        tuitionMinUSD: 22000,
        tuitionMaxUSD: 24000,
        description: 'Flexible MS program with thesis and coursework tracks.',
        requirements: [
          { key: 'GPA', value: '3.3' },
          { key: 'GRE', value: '310' },
          { key: 'TOEFL', value: '84' },
        ],
        deadlines: [
          { term: 'Fall 2026', deadline: D('2026-01-15') },
          { term: 'Spring 2027', deadline: D('2026-09-15') },
        ],
      },
      {
        title: 'Master of Business Administration',
        field: 'Business Administration',
        level: 'MSC',
        durationMonths: 24,
        tuitionMinUSD: 65000,
        tuitionMaxUSD: 70000,
        description: 'Ross School MBA, ranked top 10 globally for management and strategy.',
        requirements: [
          { key: 'GPA', value: '3.2' },
          { key: 'GMAT', value: '700' },
          { key: 'TOEFL', value: '100' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-01-05') }],
      },
    ],
  },
  {
    name: 'New York University',
    city: 'New York',
    website: 'https://www.nyu.edu',
    description: 'Global university in the heart of Manhattan with strong data science and business programs.',
    countryCode: 'US',
    programs: [
      {
        title: 'Master of Science in Data Science',
        field: 'Data Science',
        level: 'MSC',
        durationMonths: 20,
        tuitionMinUSD: 52000,
        tuitionMaxUSD: 56000,
        description: 'Interdisciplinary program combining statistics, CS, and domain applications.',
        requirements: [
          { key: 'GPA', value: '3.0' },
          { key: 'GRE', value: '308' },
          { key: 'TOEFL', value: '90' },
        ],
        deadlines: [
          { term: 'Fall 2026', deadline: D('2026-01-15') },
          { term: 'Spring 2027', deadline: D('2026-09-01') },
        ],
      },
      {
        title: 'Master of Science in Computer Science',
        field: 'Computer Science',
        level: 'MSC',
        durationMonths: 20,
        tuitionMinUSD: 50000,
        tuitionMaxUSD: 54000,
        description: 'Graduate CS program with strengths in AI, systems, and theory.',
        requirements: [
          { key: 'GPA', value: '3.0' },
          { key: 'TOEFL', value: '85' },
        ],
        deadlines: [
          { term: 'Fall 2026', deadline: D('2026-01-15') },
          { term: 'Spring 2027', deadline: D('2026-09-01') },
        ],
      },
    ],
  },
  // ──────────────── UNITED KINGDOM ────────────────
  {
    name: 'University of Oxford',
    city: 'Oxford',
    website: 'https://www.ox.ac.uk',
    description: 'One of the oldest and most prestigious universities in the world.',
    countryCode: 'GB',
    programs: [
      {
        title: 'MSc Computer Science',
        field: 'Computer Science',
        level: 'MSC',
        durationMonths: 12,
        tuitionMinUSD: 38000,
        tuitionMaxUSD: 42000,
        description: "Intensive one-year master's covering theory, systems, and AI.",
        requirements: [
          { key: 'GPA', value: '3.5' },
          { key: 'IELTS', value: '7.5' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-01-24') }],
      },
      {
        title: 'MSc Economics',
        field: 'Economics',
        level: 'MSC',
        durationMonths: 12,
        tuitionMinUSD: 36000,
        tuitionMaxUSD: 40000,
        description: 'Rigorous quantitative economics program with access to world-class faculty.',
        requirements: [
          { key: 'GPA', value: '3.5' },
          { key: 'IELTS', value: '7.0' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-01-24') }],
      },
      {
        title: 'Doctor of Philosophy in Computer Science',
        field: 'Computer Science',
        level: 'PHD',
        durationMonths: 48,
        tuitionMinUSD: 8000,
        tuitionMaxUSD: 20000,
        description: 'Research doctorate with funding opportunities available.',
        requirements: [
          { key: 'GPA', value: '3.7' },
          { key: 'IELTS', value: '7.5' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-01-24') }],
      },
    ],
  },
  {
    name: 'Imperial College London',
    city: 'London',
    website: 'https://www.imperial.ac.uk',
    description: 'World-leading science and technology university in central London.',
    countryCode: 'GB',
    programs: [
      {
        title: 'MSc Computing',
        field: 'Computer Science',
        level: 'MSC',
        durationMonths: 12,
        tuitionMinUSD: 39000,
        tuitionMaxUSD: 43000,
        description: "Specialised computing master's with tracks in AI, security, and software engineering.",
        requirements: [
          { key: 'GPA', value: '3.5' },
          { key: 'IELTS', value: '7.0' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-05-01') }],
      },
      {
        title: 'MSc Data Science',
        field: 'Data Science',
        level: 'MSC',
        durationMonths: 12,
        tuitionMinUSD: 40000,
        tuitionMaxUSD: 44000,
        description: 'Applied data science covering ML, statistics, and data engineering.',
        requirements: [
          { key: 'GPA', value: '3.3' },
          { key: 'IELTS', value: '7.0' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-05-01') }],
      },
      {
        title: 'MSc Electrical and Electronic Engineering',
        field: 'Electrical Engineering',
        level: 'MSC',
        durationMonths: 12,
        tuitionMinUSD: 37000,
        tuitionMaxUSD: 40000,
        description: 'Advanced EE with specialisations in communications, power systems, and photonics.',
        requirements: [
          { key: 'GPA', value: '3.3' },
          { key: 'IELTS', value: '6.5' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-05-01') }],
      },
    ],
  },
  {
    name: 'University College London',
    city: 'London',
    website: 'https://www.ucl.ac.uk',
    description: 'Leading multidisciplinary research university in the heart of London.',
    countryCode: 'GB',
    programs: [
      {
        title: 'MSc Computer Science',
        field: 'Computer Science',
        level: 'MSC',
        durationMonths: 12,
        tuitionMinUSD: 36000,
        tuitionMaxUSD: 40000,
        description: 'Graduate CS program with cutting-edge research in AI, vision, and security.',
        requirements: [
          { key: 'GPA', value: '3.3' },
          { key: 'IELTS', value: '6.5' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-03-31') }],
      },
      {
        title: 'MSc Public Policy',
        field: 'Public Policy',
        level: 'MSC',
        durationMonths: 12,
        tuitionMinUSD: 30000,
        tuitionMaxUSD: 34000,
        description: 'Interdisciplinary policy program covering governance, economics, and public management.',
        requirements: [
          { key: 'GPA', value: '3.0' },
          { key: 'IELTS', value: '7.0' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-03-31') }],
      },
      {
        title: 'MSc Economics',
        field: 'Economics',
        level: 'MSC',
        durationMonths: 12,
        tuitionMinUSD: 34000,
        tuitionMaxUSD: 38000,
        description: 'Advanced applied economics with focus on econometrics and policy analysis.',
        requirements: [
          { key: 'GPA', value: '3.3' },
          { key: 'IELTS', value: '6.5' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-03-31') }],
      },
    ],
  },
  // ──────────────── CANADA ────────────────
  {
    name: 'University of Toronto',
    city: 'Toronto',
    website: 'https://www.utoronto.ca',
    description: "Canada's top university with globally recognised research programs.",
    countryCode: 'CA',
    programs: [
      {
        title: 'Bachelor of Science in Computer Science',
        field: 'Computer Science',
        level: 'BSC',
        durationMonths: 48,
        tuitionMinUSD: 40000,
        tuitionMaxUSD: 45000,
        description: 'Strong undergraduate CS with specialisations in AI and software engineering.',
        requirements: [
          { key: 'GPA', value: '3.5' },
          { key: 'IELTS', value: '6.5' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-01-15') }],
      },
      {
        title: 'Master of Science in Computer Science',
        field: 'Computer Science',
        level: 'MSC',
        durationMonths: 24,
        tuitionMinUSD: 22000,
        tuitionMaxUSD: 26000,
        description: 'Research-focused MS with ties to the Vector Institute for AI.',
        requirements: [
          { key: 'GPA', value: '3.5' },
          { key: 'IELTS', value: '6.5' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-02-01') }],
      },
      {
        title: 'Master of Science in Data Science',
        field: 'Data Science',
        level: 'MSC',
        durationMonths: 20,
        tuitionMinUSD: 24000,
        tuitionMaxUSD: 28000,
        description: 'Applied data science program focused on ML and statistical methods.',
        requirements: [
          { key: 'GPA', value: '3.3' },
          { key: 'IELTS', value: '6.5' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-02-01') }],
      },
    ],
  },
  {
    name: 'University of British Columbia',
    city: 'Vancouver',
    website: 'https://www.ubc.ca',
    description: 'World-class research university on the Pacific coast.',
    countryCode: 'CA',
    programs: [
      {
        title: 'Master of Science in Computer Science',
        field: 'Computer Science',
        level: 'MSC',
        durationMonths: 24,
        tuitionMinUSD: 20000,
        tuitionMaxUSD: 24000,
        description: 'Research-intensive MS with strengths in systems, AI, and human-centred computing.',
        requirements: [
          { key: 'GPA', value: '3.3' },
          { key: 'IELTS', value: '6.5' },
        ],
        deadlines: [
          { term: 'Fall 2026', deadline: D('2026-01-15') },
          { term: 'Spring 2027', deadline: D('2026-09-15') },
        ],
      },
      {
        title: 'Doctor of Philosophy in Computer Science',
        field: 'Computer Science',
        level: 'PHD',
        durationMonths: 48,
        tuitionMinUSD: 0,
        tuitionMaxUSD: 0,
        description: 'Fully funded PhD with stipend and teaching assistantship opportunities.',
        requirements: [
          { key: 'GPA', value: '3.7' },
          { key: 'IELTS', value: '7.0' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2025-12-15') }],
      },
      {
        title: 'Master of Business Administration',
        field: 'Business Administration',
        level: 'MSC',
        durationMonths: 20,
        tuitionMinUSD: 45000,
        tuitionMaxUSD: 50000,
        description: 'Sauder School MBA with focus on sustainability and innovation.',
        requirements: [
          { key: 'GPA', value: '3.0' },
          { key: 'GMAT', value: '620' },
          { key: 'IELTS', value: '6.5' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-02-15') }],
      },
    ],
  },
  // ──────────────── GERMANY ────────────────
  {
    name: 'Technical University of Munich',
    city: 'Munich',
    website: 'https://www.tum.de',
    description: "Germany's top technical university, ranked among the best in Europe.",
    countryCode: 'DE',
    programs: [
      {
        title: 'MSc Computer Science',
        field: 'Computer Science',
        level: 'MSC',
        durationMonths: 24,
        tuitionMinUSD: 3000,
        tuitionMaxUSD: 4000,
        description: 'Research-oriented CS with specialisations in AI, algorithms, and distributed systems.',
        requirements: [
          { key: 'GPA', value: '3.0' },
          { key: 'IELTS', value: '6.5' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-05-31') }],
      },
      {
        title: 'MSc Robotics, Cognition, Intelligence',
        field: 'Robotics',
        level: 'MSC',
        durationMonths: 24,
        tuitionMinUSD: 3000,
        tuitionMaxUSD: 4000,
        description: 'Interdisciplinary program covering robotics, computer vision, and AI planning.',
        requirements: [
          { key: 'GPA', value: '3.0' },
          { key: 'IELTS', value: '6.5' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-05-31') }],
      },
      {
        title: 'MSc Data Engineering and Analytics',
        field: 'Data Science',
        level: 'MSC',
        durationMonths: 24,
        tuitionMinUSD: 2500,
        tuitionMaxUSD: 3500,
        description: 'Engineering-focused program on big data, distributed databases, and analytics.',
        requirements: [
          { key: 'GPA', value: '3.0' },
          { key: 'IELTS', value: '6.0' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-05-31') }],
      },
      {
        title: 'Doctor of Philosophy in Computer Science',
        field: 'Computer Science',
        level: 'PHD',
        durationMonths: 48,
        tuitionMinUSD: 0,
        tuitionMaxUSD: 0,
        description: 'Fully funded PhD. Research in ML, systems, vision, and bioinformatics.',
        requirements: [
          { key: 'GPA', value: '3.5' },
          { key: 'IELTS', value: '7.0' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-04-30') }],
      },
    ],
  },
  {
    name: 'Heidelberg University',
    city: 'Heidelberg',
    website: 'https://www.uni-heidelberg.de',
    description: "Germany's oldest university, renowned for life sciences and natural sciences.",
    countryCode: 'DE',
    programs: [
      {
        title: 'MSc Molecular Biosciences',
        field: 'Biomedical Sciences',
        level: 'MSC',
        durationMonths: 24,
        tuitionMinUSD: 1500,
        tuitionMaxUSD: 2500,
        description: 'Research-intensive program in molecular biology, biochemistry, and genetics.',
        requirements: [
          { key: 'GPA', value: '3.0' },
          { key: 'IELTS', value: '6.5' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-05-15') }],
      },
      {
        title: 'Doctor of Philosophy in Biomedical Sciences',
        field: 'Biomedical Sciences',
        level: 'PHD',
        durationMonths: 48,
        tuitionMinUSD: 0,
        tuitionMaxUSD: 0,
        description: "Internationally competitive PhD in Heidelberg's HBIGS graduate school.",
        requirements: [
          { key: 'GPA', value: '3.5' },
          { key: 'IELTS', value: '7.0' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-04-01') }],
      },
      {
        title: 'MSc Physics',
        field: 'Physics',
        level: 'MSC',
        durationMonths: 24,
        tuitionMinUSD: 1500,
        tuitionMaxUSD: 2500,
        description: 'High-calibre physics MS with access to CERN and Max Planck institutes.',
        requirements: [
          { key: 'GPA', value: '3.3' },
          { key: 'IELTS', value: '6.0' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-05-15') }],
      },
    ],
  },
  // ──────────────── AUSTRALIA ────────────────
  {
    name: 'University of Melbourne',
    city: 'Melbourne',
    website: 'https://www.unimelb.edu.au',
    description: "Australia's leading university, consistently ranked in the global top 40.",
    countryCode: 'AU',
    programs: [
      {
        title: 'Master of Computer Science',
        field: 'Computer Science',
        level: 'MSC',
        durationMonths: 24,
        tuitionMinUSD: 38000,
        tuitionMaxUSD: 42000,
        description: "Flexible CS master's with AI, cloud computing, and human-computer interaction.",
        requirements: [
          { key: 'GPA', value: '3.0' },
          { key: 'IELTS', value: '6.5' },
        ],
        deadlines: [
          { term: 'Fall 2026', deadline: D('2026-07-31') },
          { term: 'Spring 2027', deadline: D('2026-10-31') },
        ],
      },
      {
        title: 'Master of Data Science',
        field: 'Data Science',
        level: 'MSC',
        durationMonths: 18,
        tuitionMinUSD: 36000,
        tuitionMaxUSD: 40000,
        description: 'Industry-aligned data science program taught by leading researchers.',
        requirements: [
          { key: 'GPA', value: '3.0' },
          { key: 'IELTS', value: '6.5' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-07-31') }],
      },
      {
        title: 'Master of Business Administration',
        field: 'Business Administration',
        level: 'MSC',
        durationMonths: 24,
        tuitionMinUSD: 47000,
        tuitionMaxUSD: 52000,
        description: 'Melbourne Business School MBA with Asia-Pacific focus.',
        requirements: [
          { key: 'GPA', value: '3.0' },
          { key: 'GMAT', value: '600' },
          { key: 'IELTS', value: '7.0' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-06-30') }],
      },
    ],
  },
  {
    name: 'University of Sydney',
    city: 'Sydney',
    website: 'https://www.sydney.edu.au',
    description: "Australia's first university with world-class engineering and science programs.",
    countryCode: 'AU',
    programs: [
      {
        title: 'Bachelor of Science in Computer Science',
        field: 'Computer Science',
        level: 'BSC',
        durationMonths: 48,
        tuitionMinUSD: 37000,
        tuitionMaxUSD: 41000,
        description: 'Undergraduate CS with strong software development and theory foundations.',
        requirements: [
          { key: 'GPA', value: '3.0' },
          { key: 'IELTS', value: '6.0' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-07-01') }],
      },
      {
        title: 'Master of Information Technology',
        field: 'Computer Science',
        level: 'MSC',
        durationMonths: 24,
        tuitionMinUSD: 39000,
        tuitionMaxUSD: 43000,
        description: "Comprehensive IT master's with specialisations in cybersecurity and data analytics.",
        requirements: [
          { key: 'GPA', value: '3.0' },
          { key: 'IELTS', value: '6.5' },
        ],
        deadlines: [
          { term: 'Fall 2026', deadline: D('2026-07-01') },
          { term: 'Spring 2027', deadline: D('2026-11-01') },
        ],
      },
      {
        title: 'Master of Engineering',
        field: 'Electrical Engineering',
        level: 'MSC',
        durationMonths: 24,
        tuitionMinUSD: 37000,
        tuitionMaxUSD: 41000,
        description: 'Professional engineering master\'s in electrical, telecommunications, or civil.',
        requirements: [
          { key: 'GPA', value: '3.0' },
          { key: 'IELTS', value: '6.5' },
        ],
        deadlines: [{ term: 'Fall 2026', deadline: D('2026-07-01') }],
      },
    ],
  },
];

  // ──────────────── ADDITIONAL US ────────────────
  {
    name: 'University of California, Los Angeles',
    city: 'Los Angeles',
    website: 'https://www.ucla.edu',
    description: 'Public research university ranked in the top 20 globally, known for engineering, film, and life sciences.',
    countryCode: 'US',
    programs: [
      { title: 'Master of Science in Computer Science', field: 'Computer Science', level: 'MSC', durationMonths: 18, tuitionMinUSD: 13000, tuitionMaxUSD: 28000, description: 'Theory, systems, and applied computing at a leading public research university.', requirements: [{ key: 'GPA', value: '3.4' }, { key: 'GRE', value: '318' }, { key: 'TOEFL', value: '87' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-01-05') }] },
      { title: 'Master of Science in Electrical and Computer Engineering', field: 'Electrical Engineering', level: 'MSC', durationMonths: 18, tuitionMinUSD: 13000, tuitionMaxUSD: 26000, description: 'Advanced electronics, signal processing, communications, and VLSI design.', requirements: [{ key: 'GPA', value: '3.3' }, { key: 'GRE', value: '315' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-01-05') }] },
      { title: 'Master of Public Health', field: 'Public Health', level: 'MSC', durationMonths: 24, tuitionMinUSD: 13000, tuitionMaxUSD: 28000, description: 'Epidemiology, biostatistics, health policy, and community health practice.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'TOEFL', value: '87' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-01-15') }] },
      { title: 'Master of Business Administration (Full-Time MBA)', field: 'Business Administration', level: 'MSC', durationMonths: 24, tuitionMinUSD: 65000, tuitionMaxUSD: 70000, description: 'Anderson School of Management full-time MBA with strong entertainment and tech industry ties.', requirements: [{ key: 'GMAT', value: '700' }, { key: 'TOEFL', value: '100' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-01-07') }] },
    ],
  },
  {
    name: 'Georgia Institute of Technology',
    city: 'Atlanta',
    website: 'https://www.gatech.edu',
    description: 'Top-ranked public technical university known for engineering, computing, and design.',
    countryCode: 'US',
    programs: [
      { title: 'Master of Science in Computer Science (Online/On-Campus)', field: 'Computer Science', level: 'MSC', durationMonths: 18, tuitionMinUSD: 9000, tuitionMaxUSD: 21000, description: 'Highly ranked MSCS with specialisations in machine learning, computing systems, and interactive intelligence.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'TOEFL', value: '90' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-02-01') }] },
      { title: 'Master of Science in Electrical and Computer Engineering', field: 'Electrical Engineering', level: 'MSC', durationMonths: 18, tuitionMinUSD: 9500, tuitionMaxUSD: 22000, description: 'Circuits, systems, signal processing, photonics, and digital design.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'GRE', value: '315' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-02-01') }] },
      { title: 'Master of Science in Analytics', field: 'Data Science', level: 'MSC', durationMonths: 18, tuitionMinUSD: 9000, tuitionMaxUSD: 21000, description: 'Interdisciplinary programme blending statistics, operations research, and computing for data-intensive problems.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'TOEFL', value: '90' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-02-01') }] },
    ],
  },
  {
    name: 'University of Washington',
    city: 'Seattle',
    website: 'https://www.uw.edu',
    description: 'Leading public research university in the Pacific Northwest with a world-class Paul G. Allen School of Computer Science.',
    countryCode: 'US',
    programs: [
      { title: 'Master of Science in Computer Science and Engineering', field: 'Computer Science', level: 'MSC', durationMonths: 18, tuitionMinUSD: 19000, tuitionMaxUSD: 36000, description: 'AI, systems, programming languages, and human-computer interaction research.', requirements: [{ key: 'GPA', value: '3.5' }, { key: 'GRE', value: '320' }, { key: 'TOEFL', value: '92' }], deadlines: [{ term: 'Fall 2026', deadline: D('2025-12-15') }] },
      { title: 'Master of Science in Data Science', field: 'Data Science', level: 'MSC', durationMonths: 12, tuitionMinUSD: 30000, tuitionMaxUSD: 38000, description: 'Intensive one-year professional programme in ML, statistics, and data engineering.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'TOEFL', value: '92' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-02-15') }] },
      { title: 'Master of Public Health', field: 'Public Health', level: 'MSC', durationMonths: 24, tuitionMinUSD: 16000, tuitionMaxUSD: 32000, description: 'Epidemiology, global health, and health systems at a top-10 school of public health.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'TOEFL', value: '88' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-02-01') }] },
    ],
  },
  // ──────────────── ADDITIONAL UK ────────────────
  {
    name: 'University of Edinburgh',
    city: 'Edinburgh',
    website: 'https://www.ed.ac.uk',
    description: 'One of Scotland\'s ancient universities, ranked in the global top 30, with world-class informatics and engineering schools.',
    countryCode: 'GB',
    programs: [
      { title: 'MSc Artificial Intelligence', field: 'Artificial Intelligence', level: 'MSC', durationMonths: 12, tuitionMinUSD: 34000, tuitionMaxUSD: 40000, description: 'Cutting-edge AI and ML research at one of Europe\'s top informatics departments.', requirements: [{ key: 'GPA', value: '3.3' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-04-30') }] },
      { title: 'MSc Data Science', field: 'Data Science', level: 'MSC', durationMonths: 12, tuitionMinUSD: 32000, tuitionMaxUSD: 38000, description: 'Statistics, machine learning, and big data engineering with strong industry links.', requirements: [{ key: 'GPA', value: '3.2' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-04-30') }] },
      { title: 'MSc Computer Science', field: 'Computer Science', level: 'MSC', durationMonths: 12, tuitionMinUSD: 32000, tuitionMaxUSD: 38000, description: 'Conversion and advanced masters covering algorithms, systems, and software engineering.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-03-31') }] },
      { title: 'MSc Global Environment and Climate Change Law', field: 'Environmental Science', level: 'MSC', durationMonths: 12, tuitionMinUSD: 28000, tuitionMaxUSD: 34000, description: 'Interdisciplinary law and policy programme addressing global climate and sustainability challenges.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '7.0' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-04-30') }] },
    ],
  },
  {
    name: 'University of Manchester',
    city: 'Manchester',
    website: 'https://www.manchester.ac.uk',
    description: 'Red-brick Russell Group university known for research and industry partnerships across science, business, and social science.',
    countryCode: 'GB',
    programs: [
      { title: 'MSc Advanced Computer Science', field: 'Computer Science', level: 'MSC', durationMonths: 12, tuitionMinUSD: 27000, tuitionMaxUSD: 32000, description: 'Deep learning, natural language processing, and advanced software systems.', requirements: [{ key: 'GPA', value: '3.2' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-06-30') }] },
      { title: 'MSc Data Science', field: 'Data Science', level: 'MSC', durationMonths: 12, tuitionMinUSD: 25000, tuitionMaxUSD: 30000, description: 'Statistical modelling, machine learning, and data visualisation for industry and research.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-06-30') }] },
      { title: 'MBA (Full-Time)', field: 'Business Administration', level: 'MSC', durationMonths: 12, tuitionMinUSD: 40000, tuitionMaxUSD: 48000, description: 'Alliance MBS global MBA with specialisations in entrepreneurship, sustainability, and finance.', requirements: [{ key: 'GMAT', value: '600' }, { key: 'IELTS', value: '7.0' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-05-31') }] },
    ],
  },
  // ──────────────── ADDITIONAL CANADA ────────────────
  {
    name: 'McGill University',
    city: 'Montreal',
    website: 'https://www.mcgill.ca',
    description: 'Canada\'s most internationally diverse university, ranked in the global top 40, with strong medicine, law, and engineering programmes.',
    countryCode: 'CA',
    programs: [
      { title: 'Master of Science in Computer Science', field: 'Computer Science', level: 'MSC', durationMonths: 24, tuitionMinUSD: 8000, tuitionMaxUSD: 18000, description: 'AI, distributed systems, bioinformatics, and theoretical computing.', requirements: [{ key: 'GPA', value: '3.3' }, { key: 'TOEFL', value: '90' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-01-15') }, { term: 'Winter 2027', deadline: D('2026-09-15') }] },
      { title: 'Master of Engineering (MEng) in Electrical and Computer Engineering', field: 'Electrical Engineering', level: 'MSC', durationMonths: 16, tuitionMinUSD: 16000, tuitionMaxUSD: 22000, description: 'Coursework-based professional masters in ECE covering communications, embedded systems, and power.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'TOEFL', value: '86' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-02-28') }] },
      { title: 'Master of Business Administration', field: 'Business Administration', level: 'MSC', durationMonths: 20, tuitionMinUSD: 48000, tuitionMaxUSD: 55000, description: 'Desautels Faculty of Management MBA with deep connections to Montreal\'s tech and pharma sectors.', requirements: [{ key: 'GMAT', value: '660' }, { key: 'TOEFL', value: '100' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-01-15') }] },
    ],
  },
  {
    name: 'University of Waterloo',
    city: 'Waterloo',
    website: 'https://uwaterloo.ca',
    description: 'Canada\'s top engineering and computing university, famous for its co-op programmes and startup culture.',
    countryCode: 'CA',
    programs: [
      { title: 'Master of Mathematics in Computer Science', field: 'Computer Science', level: 'MSC', durationMonths: 20, tuitionMinUSD: 8500, tuitionMaxUSD: 18000, description: 'Research or coursework track in AI, quantum computing, software engineering, and cryptography.', requirements: [{ key: 'GPA', value: '3.5' }, { key: 'TOEFL', value: '88' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-01-15') }] },
      { title: 'Master of Engineering in Electrical and Computer Engineering', field: 'Electrical Engineering', level: 'MSC', durationMonths: 16, tuitionMinUSD: 20000, tuitionMaxUSD: 26000, description: 'Professional masters in hardware design, communications, and embedded systems engineering.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'TOEFL', value: '86' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-02-01') }] },
      { title: 'Master of Data Science and Artificial Intelligence', field: 'Data Science', level: 'MSC', durationMonths: 16, tuitionMinUSD: 22000, tuitionMaxUSD: 28000, description: 'Joint faculty programme in ML, deep learning, statistical inference, and big data systems.', requirements: [{ key: 'GPA', value: '3.3' }, { key: 'TOEFL', value: '88' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-02-15') }] },
    ],
  },
  // ──────────────── ADDITIONAL GERMANY ────────────────
  {
    name: 'RWTH Aachen University',
    city: 'Aachen',
    website: 'https://www.rwth-aachen.de',
    description: 'Germany\'s top engineering university with deep industry ties to automotive, aerospace, and mechanical engineering sectors.',
    countryCode: 'DE',
    programs: [
      { title: 'Master of Science in Computer Science', field: 'Computer Science', level: 'MSC', durationMonths: 24, tuitionMinUSD: 400, tuitionMaxUSD: 400, description: 'Tuition-free German programme covering algorithms, AI, software technology, and media computing.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.0' }], deadlines: [{ term: 'Winter 2026', deadline: D('2026-05-15') }, { term: 'Summer 2027', deadline: D('2026-11-15') }] },
      { title: 'Master of Science in Mechanical Engineering', field: 'Mechanical Engineering', level: 'MSC', durationMonths: 24, tuitionMinUSD: 400, tuitionMaxUSD: 400, description: 'Cutting-edge mechanical and manufacturing engineering with strong automotive sector links.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.0' }], deadlines: [{ term: 'Winter 2026', deadline: D('2026-05-15') }] },
      { title: 'Master of Science in Electrical Engineering, Information Technology and Computer Engineering', field: 'Electrical Engineering', level: 'MSC', durationMonths: 24, tuitionMinUSD: 400, tuitionMaxUSD: 400, description: 'Comprehensive ECE programme covering power systems, communications, and microelectronics.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.0' }], deadlines: [{ term: 'Winter 2026', deadline: D('2026-05-15') }] },
    ],
  },
  // ──────────────── NETHERLANDS ────────────────
  {
    name: 'Delft University of Technology',
    city: 'Delft',
    website: 'https://www.tudelft.nl',
    description: 'Ranked #1 in the Netherlands for engineering, TU Delft is a global top-20 technical university with tuition-free or low-cost MSc programmes.',
    countryCode: 'NL',
    programs: [
      { title: 'MSc Computer Science', field: 'Computer Science', level: 'MSC', durationMonths: 24, tuitionMinUSD: 2530, tuitionMaxUSD: 20000, description: 'Software technology, algorithms, data management, and embedded systems in one of Europe\'s best CS departments.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-04-01') }] },
      { title: 'MSc Electrical Engineering', field: 'Electrical Engineering', level: 'MSC', durationMonths: 24, tuitionMinUSD: 2530, tuitionMaxUSD: 20000, description: 'Microelectronics, telecommunications, and power engineering with top European industry placements.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-04-01') }] },
      { title: 'MSc Data Science and Technology', field: 'Data Science', level: 'MSC', durationMonths: 24, tuitionMinUSD: 2530, tuitionMaxUSD: 20000, description: 'Data engineering, AI, and statistical modelling combined with computational methods.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-04-01') }] },
      { title: 'MSc Sustainable Energy Technology', field: 'Sustainable Energy', level: 'MSC', durationMonths: 24, tuitionMinUSD: 2530, tuitionMaxUSD: 20000, description: 'Clean energy systems, photovoltaics, wind, and smart grids for the energy transition.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-04-01') }] },
    ],
  },
  {
    name: 'University of Amsterdam',
    city: 'Amsterdam',
    website: 'https://www.uva.nl',
    description: 'One of Europe\'s largest research universities, known for social science, artificial intelligence, and the world\'s most cited AI research department.',
    countryCode: 'NL',
    programs: [
      { title: 'MSc Artificial Intelligence', field: 'Artificial Intelligence', level: 'MSC', durationMonths: 24, tuitionMinUSD: 2530, tuitionMaxUSD: 18000, description: 'Highly cited AI research programme covering machine learning, NLP, computer vision, and multi-agent systems.', requirements: [{ key: 'GPA', value: '3.3' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-01-15') }] },
      { title: 'MSc Information Studies — Data Science', field: 'Data Science', level: 'MSC', durationMonths: 12, tuitionMinUSD: 2530, tuitionMaxUSD: 18000, description: 'Data management, analytics, and social data science with a strong interdisciplinary approach.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-02-01') }] },
      { title: 'MSc Business Administration', field: 'Business Administration', level: 'MSC', durationMonths: 12, tuitionMinUSD: 2530, tuitionMaxUSD: 20000, description: 'One-year MSc in business with specialisations in strategy, finance, or entrepreneurship.', requirements: [{ key: 'GMAT', value: '600' }, { key: 'IELTS', value: '7.0' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-04-01') }] },
    ],
  },
  // ──────────────── SINGAPORE ────────────────
  {
    name: 'National University of Singapore',
    city: 'Singapore',
    website: 'https://www.nus.edu.sg',
    description: 'Asia\'s top university, ranked #8 globally. Combines rigorous academics with a dynamic Asia-Pacific industry and research environment.',
    countryCode: 'SG',
    programs: [
      { title: 'Master of Computing (Artificial Intelligence Specialisation)', field: 'Artificial Intelligence', level: 'MSC', durationMonths: 12, tuitionMinUSD: 20000, tuitionMaxUSD: 30000, description: 'Professional masters in AI, deep learning, computer vision, and robotics — highly ranked in Asia.', requirements: [{ key: 'GPA', value: '3.2' }, { key: 'TOEFL', value: '85' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-02-15') }] },
      { title: 'Master of Science in Data Science and Machine Learning', field: 'Data Science', level: 'MSC', durationMonths: 12, tuitionMinUSD: 22000, tuitionMaxUSD: 32000, description: 'Interdisciplinary programme combining statistical methods, ML systems, and real-world data projects.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'TOEFL', value: '85' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-03-31') }] },
      { title: 'MBA (Full-Time)', field: 'Business Administration', level: 'MSC', durationMonths: 17, tuitionMinUSD: 55000, tuitionMaxUSD: 65000, description: 'NUS Business School MBA — Asia\'s most internationally recognised MBA with strong tech and finance sector links.', requirements: [{ key: 'GMAT', value: '670' }, { key: 'TOEFL', value: '100' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-03-31') }] },
      { title: 'MSc Electrical Engineering', field: 'Electrical Engineering', level: 'MSC', durationMonths: 12, tuitionMinUSD: 18000, tuitionMaxUSD: 26000, description: 'Semiconductors, communications, and power electronics in Asia\'s leading engineering hub.', requirements: [{ key: 'GPA', value: '3.2' }, { key: 'TOEFL', value: '85' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-03-31') }] },
    ],
  },
  // ──────────────── IRELAND ────────────────
  {
    name: 'Trinity College Dublin',
    city: 'Dublin',
    website: 'https://www.tcd.ie',
    description: 'Ireland\'s oldest and most prestigious university, located in central Dublin with excellent EU and post-Brexit access for international graduates.',
    countryCode: 'IE',
    programs: [
      { title: 'MSc in Computer Science (Intelligent Systems)', field: 'Computer Science', level: 'MSC', durationMonths: 12, tuitionMinUSD: 18000, tuitionMaxUSD: 24000, description: 'AI, knowledge representation, and intelligent systems in one of Europe\'s most vibrant tech cities.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-05-31') }] },
      { title: 'MSc in Finance', field: 'Finance', level: 'MSC', durationMonths: 12, tuitionMinUSD: 20000, tuitionMaxUSD: 28000, description: 'Quantitative finance, risk management, and fintech in Dublin\'s growing financial hub.', requirements: [{ key: 'GMAT', value: '600' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-05-31') }] },
      { title: 'MSc in Biotechnology', field: 'Biotechnology', level: 'MSC', durationMonths: 12, tuitionMinUSD: 16000, tuitionMaxUSD: 22000, description: 'Pharmaceutical biotechnology, genomics, and biomanufacturing with strong industry links to Ireland\'s pharma sector.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-06-30') }] },
    ],
  },
  // ──────────────── SWEDEN ────────────────
  {
    name: 'KTH Royal Institute of Technology',
    city: 'Stockholm',
    website: 'https://www.kth.se',
    description: 'Sweden\'s leading technical university, ranked in the global top 100, with tuition-free programmes for EU students and low-cost masters for others.',
    countryCode: 'SE',
    programs: [
      { title: 'MSc in Machine Learning', field: 'Artificial Intelligence', level: 'MSC', durationMonths: 24, tuitionMinUSD: 14000, tuitionMaxUSD: 20000, description: 'Statistical learning, neural networks, and computer vision with access to Stockholm\'s booming AI ecosystem.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-01-15') }] },
      { title: 'MSc in Computer Science', field: 'Computer Science', level: 'MSC', durationMonths: 24, tuitionMinUSD: 14000, tuitionMaxUSD: 20000, description: 'Algorithms, distributed systems, and software engineering in Scandinavia\'s tech capital.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-01-15') }] },
      { title: 'MSc in Electrical Engineering', field: 'Electrical Engineering', level: 'MSC', durationMonths: 24, tuitionMinUSD: 14000, tuitionMaxUSD: 20000, description: 'Power electronics, signal processing, and sustainable energy systems at a leading European engineering school.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-01-15') }] },
    ],
  },
  // ──────────────── NEW ZEALAND ────────────────
  {
    name: 'University of Auckland',
    city: 'Auckland',
    website: 'https://www.auckland.ac.nz',
    description: 'New Zealand\'s top-ranked university, in the global top 100, offering an excellent quality of life and straightforward post-study work visa pathway.',
    countryCode: 'NZ',
    programs: [
      { title: 'Master of Science in Computer Science', field: 'Computer Science', level: 'MSC', durationMonths: 18, tuitionMinUSD: 22000, tuitionMaxUSD: 28000, description: 'AI, software engineering, and bioinformatics with small cohorts and strong academic mentorship.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-08-01') }, { term: 'Spring 2027', deadline: D('2027-02-01') }] },
      { title: 'Master of Engineering (ME)', field: 'Electrical Engineering', level: 'MSC', durationMonths: 18, tuitionMinUSD: 24000, tuitionMaxUSD: 30000, description: 'Professional masters covering electrical, mechanical, or software engineering disciplines.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-08-01') }] },
    ],
  },
  // ──────────────── ADDITIONAL AUSTRALIA ────────────────
  {
    name: 'Australian National University',
    city: 'Canberra',
    website: 'https://www.anu.edu.au',
    description: 'Australia\'s top-ranked research university, consistently in the global top 30, known for politics, social science, and research excellence.',
    countryCode: 'AU',
    programs: [
      { title: 'Master of Computing', field: 'Computer Science', level: 'MSC', durationMonths: 24, tuitionMinUSD: 28000, tuitionMaxUSD: 36000, description: 'Flexible computing masters covering AI, security, algorithms, and software engineering.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-07-31') }, { term: 'Spring 2027', deadline: D('2026-12-15') }] },
      { title: 'Master of Science in Machine Learning and Computer Vision', field: 'Artificial Intelligence', level: 'MSC', durationMonths: 24, tuitionMinUSD: 30000, tuitionMaxUSD: 38000, description: 'Specialist programme in ML, deep learning, and computer vision at one of Australia\'s premier AI groups.', requirements: [{ key: 'GPA', value: '3.3' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-07-31') }] },
      { title: 'Master of Public Policy', field: 'Public Policy', level: 'MSC', durationMonths: 18, tuitionMinUSD: 26000, tuitionMaxUSD: 34000, description: 'Policy analysis, governance, and economics at the Crawford School — directly adjacent to Australia\'s federal government.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-07-31') }] },
    ],
  },
  {
    name: 'University of New South Wales',
    city: 'Sydney',
    website: 'https://www.unsw.edu.au',
    description: 'Sydney\'s leading engineering and business university, ranked in the global top 50, with strong tech startup and finance industry connections.',
    countryCode: 'AU',
    programs: [
      { title: 'Master of Information Technology', field: 'Computer Science', level: 'MSC', durationMonths: 16, tuitionMinUSD: 32000, tuitionMaxUSD: 42000, description: 'Professional IT masters with specialisations in AI, cybersecurity, data engineering, and software design.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-07-01') }, { term: 'Spring 2027', deadline: D('2026-11-30') }] },
      { title: 'Master of Engineering in Electrical Engineering', field: 'Electrical Engineering', level: 'MSC', durationMonths: 16, tuitionMinUSD: 34000, tuitionMaxUSD: 44000, description: 'Power, communications, and photonics engineering with research access to UNSW\'s world-leading labs.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-07-01') }] },
      { title: 'Master of Data Science', field: 'Data Science', level: 'MSC', durationMonths: 16, tuitionMinUSD: 32000, tuitionMaxUSD: 42000, description: 'Statistical learning, big data platforms, and applied ML for industry data problems.', requirements: [{ key: 'GPA', value: '3.0' }, { key: 'IELTS', value: '6.5' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-07-01') }] },
      { title: 'MBA (Full-Time)', field: 'Business Administration', level: 'MSC', durationMonths: 18, tuitionMinUSD: 55000, tuitionMaxUSD: 65000, description: 'UNSW Business School MBA with strong industry mentoring and Asia-Pacific market focus.', requirements: [{ key: 'GMAT', value: '620' }, { key: 'IELTS', value: '7.0' }], deadlines: [{ term: 'Fall 2026', deadline: D('2026-05-31') }] },
    ],
  },
  // ──────────────── SWITZERLAND ────────────────
  {
    name: 'ETH Zurich',
    city: 'Zurich',
    website: 'https://ethz.ch',
    description: 'Consistently ranked in the global top 10, ETH Zurich is Europe\'s leading technical university, free for all students regardless of nationality.',
    countryCode: 'CH',
    programs: [
      { title: 'MSc in Computer Science', field: 'Computer Science', level: 'MSC', durationMonths: 24, tuitionMinUSD: 1500, tuitionMaxUSD: 1500, description: 'Near-tuition-free masters in theory, systems, ML, and software engineering at one of the world\'s elite institutions.', requirements: [{ key: 'GPA', value: '3.5' }, { key: 'IELTS', value: '7.0' }], deadlines: [{ term: 'Fall 2026', deadline: D('2025-12-15') }] },
      { title: 'MSc in Electrical Engineering and Information Technology', field: 'Electrical Engineering', level: 'MSC', durationMonths: 24, tuitionMinUSD: 1500, tuitionMaxUSD: 1500, description: 'Photonics, power systems, and signal processing at the institution that trained Einstein.', requirements: [{ key: 'GPA', value: '3.4' }, { key: 'IELTS', value: '7.0' }], deadlines: [{ term: 'Fall 2026', deadline: D('2025-12-15') }] },
      { title: 'MSc in Data Science', field: 'Data Science', level: 'MSC', durationMonths: 24, tuitionMinUSD: 1500, tuitionMaxUSD: 1500, description: 'Statistical foundations, ML, and data engineering at one of the world\'s most rigorous academic environments.', requirements: [{ key: 'GPA', value: '3.5' }, { key: 'IELTS', value: '7.0' }], deadlines: [{ term: 'Fall 2026', deadline: D('2025-12-15') }] },
    ],
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  // ── Guard: only run if SEED_ENABLED=true ──────────────────────────────────
  if (process.env.SEED_ENABLED !== 'true') {
    console.log('⏭️   Seed skipped: SEED_ENABLED is not "true". Set SEED_ENABLED=true to run.');
    return;
  }

  console.log('🌱  Starting idempotent seed (no data will be deleted)...\n');

  // ── Countries (upsert by unique code) ─────────────────────────────────────
  console.log('🌍  Upserting countries...');
  const countryMap: Record<string, string> = {};
  const countryDefs = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'DE', name: 'Germany' },
    { code: 'AU', name: 'Australia' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SG', name: 'Singapore' },
    { code: 'IE', name: 'Ireland' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'FR', name: 'France' },
    { code: 'CH', name: 'Switzerland' },
  ];
  for (const c of countryDefs) {
    const country = await prisma.country.upsert({
      where: { code: c.code },
      update: { name: c.name },
      create: c,
    });
    countryMap[country.code] = country.id;
  }

  // ── Universities & Programs ───────────────────────────────────────────────
  let newUniversities = 0;
  let newPrograms = 0;
  let skippedPrograms = 0;

  console.log('🏫  Seeding universities and programs...');

  for (const uni of UNIVERSITIES) {
    // Find or create university (no unique constraint; match by name + country)
    let university = await prisma.university.findFirst({
      where: { name: uni.name, countryId: countryMap[uni.countryCode] },
    });

    if (!university) {
      university = await prisma.university.create({
        data: {
          name: uni.name,
          city: uni.city,
          website: uni.website,
          description: uni.description,
          countryId: countryMap[uni.countryCode],
        },
      });
      newUniversities++;
    }

    // Programs: find by universityId + title + level; create only if missing
    for (const prog of uni.programs) {
      const existing = await prisma.program.findFirst({
        where: { universityId: university.id, title: prog.title, level: prog.level },
      });

      if (existing) {
        skippedPrograms++;
        continue;
      }

      await prisma.program.create({
        data: {
          universityId: university.id,
          title: prog.title,
          field: prog.field,
          level: prog.level,
          durationMonths: prog.durationMonths,
          tuitionMinUSD: prog.tuitionMinUSD,
          tuitionMaxUSD: prog.tuitionMaxUSD,
          description: prog.description,
          requirements: { create: prog.requirements },
          deadlines: { create: prog.deadlines },
        },
      });
      newPrograms++;
    }

    console.log(
      `  ✓ ${university.name} — ${uni.programs.length - skippedPrograms} new, ${skippedPrograms} already existed`,
    );
    // reset per-university skip counter for next log line
    skippedPrograms = 0;
  }

  // ── Final summary ─────────────────────────────────────────────────────────
  const [totalCountries, totalUniversities, totalPrograms] = await Promise.all([
    prisma.country.count(),
    prisma.university.count(),
    prisma.program.count(),
  ]);

  console.log('\n📊  Seed summary:');
  console.log(`   New universities inserted : ${newUniversities}`);
  console.log(`   New programs inserted     : ${newPrograms}`);
  console.log('\n   Database totals:');
  console.log(`   Countries    : ${totalCountries}`);
  console.log(`   Universities : ${totalUniversities}`);
  console.log(`   Programs     : ${totalPrograms}`);
  console.log('\n✅  Done.\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

