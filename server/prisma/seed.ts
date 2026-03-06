import 'dotenv/config';
import prisma from '../src/config/database.ts';

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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('🌱  Cleaning existing module1 seed data...');
  await prisma.savedProgram.deleteMany();
  await prisma.programDeadline.deleteMany();
  await prisma.programRequirement.deleteMany();
  await prisma.program.deleteMany();
  await prisma.university.deleteMany();
  await prisma.country.deleteMany();

  console.log('🌍  Seeding countries...');
  const countryMap: Record<string, string> = {};
  const countryRecords = await Promise.all(
    [
      { code: 'US', name: 'United States' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'CA', name: 'Canada' },
      { code: 'DE', name: 'Germany' },
      { code: 'AU', name: 'Australia' },
    ].map((c) => prisma.country.create({ data: c })),
  );
  for (const c of countryRecords) countryMap[c.code] = c.id;

  let programCount = 0;
  console.log('🏫  Seeding universities and programs...');
  for (const uni of UNIVERSITIES) {
    const university = await prisma.university.create({
      data: {
        name: uni.name,
        city: uni.city,
        website: uni.website,
        description: uni.description,
        countryId: countryMap[uni.countryCode],
      },
    });
    for (const prog of uni.programs) {
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
      programCount++;
    }
    console.log(`  ✓ ${university.name} (${uni.programs.length} programs)`);
  }
  console.log(
    `\n✅  Done: ${UNIVERSITIES.length} universities, ${programCount} programs across 5 countries.`,
  );
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

