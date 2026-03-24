import 'dotenv/config';
import prisma from '../src/config/database.ts';

/**
 * seedVisaTemplates.ts
 *
 * Seeds VisaTimelineTemplate records for major destination countries.
 * This ensures the Timeline Planner has realistic milestone data.
 *
 * Safe to run multiple times (uses upsert).
 *
 * Usage:
 *   npm run seed:visa
 */

type Milestone = {
  key: string;
  label: string;
  offsetDays: number;
  notes: string;
};

type VisaTemplate = {
  countryCode: string;
  title: string;
  milestones: Milestone[];
};

const VISA_TEMPLATES: VisaTemplate[] = [
  // ──────────────── UNITED STATES ────────────────
  {
    countryCode: 'US',
    title: 'US Student Visa (F-1) Timeline',
    milestones: [
      {
        key: 'research',
        label: 'Research programs and shortlist universities',
        offsetDays: -365,
        notes: 'Start researching universities, programs, costs, and scholarship opportunities.',
      },
      {
        key: 'tests',
        label: 'Take standardized tests (GRE/GMAT, TOEFL/IELTS)',
        offsetDays: -330,
        notes: 'Schedule and complete required standardized tests. Most programs accept scores from past 2 years.',
      },
      {
        key: 'docs',
        label: 'Prepare application documents (SOP, LORs, CV)',
        offsetDays: -270,
        notes: 'Write Statement of Purpose, request Letters of Recommendation, update CV/resume.',
      },
      {
        key: 'apply',
        label: 'Submit university applications',
        offsetDays: -210,
        notes: 'Apply to 6-8 schools (2-3 reach, 2-3 match, 2-3 safety). Track deadlines carefully.',
      },
      {
        key: 'admission',
        label: 'Receive admission decisions',
        offsetDays: -150,
        notes: 'Most decisions arrive between February-April. Review financial aid packages.',
      },
      {
        key: 'i20',
        label: 'Accept offer and receive I-20',
        offsetDays: -120,
        notes: 'Accept admission offer, pay SEVIS fee ($350), receive I-20 form from university.',
      },
      {
        key: 'visa_apply',
        label: 'Apply for F-1 student visa',
        offsetDays: -90,
        notes: 'Complete DS-160 form, pay visa fee ($160), schedule embassy interview.',
      },
      {
        key: 'visa_interview',
        label: 'Attend visa interview',
        offsetDays: -60,
        notes: 'Prepare documents: I-20, DS-160 confirmation, financial proof, academic records.',
      },
      {
        key: 'travel',
        label: 'Book flights and arrange housing',
        offsetDays: -30,
        notes: 'Can enter US up to 30 days before program start date. Arrange on-campus or off-campus housing.',
      },
      {
        key: 'arrival',
        label: 'Arrive in US and complete orientation',
        offsetDays: -7,
        notes: 'Attend international student orientation, open bank account, get local SIM card.',
      },
    ],
  },

  // ──────────────── UNITED KINGDOM ────────────────
  {
    countryCode: 'UK',
    title: 'UK Student Visa (Tier 4) Timeline',
    milestones: [
      {
        key: 'research',
        label: 'Research UK universities and courses',
        offsetDays: -365,
        notes: 'Explore UCAS system, program requirements, and scholarship opportunities.',
      },
      {
        key: 'tests',
        label: 'Take English language test (IELTS/PTE)',
        offsetDays: -330,
        notes: 'Most UK universities require IELTS Academic (min. 6.5 overall). Check specific requirements.',
      },
      {
        key: 'docs',
        label: 'Prepare application materials',
        offsetDays: -270,
        notes: 'Write personal statement, secure 1-2 references, prepare academic transcripts.',
      },
      {
        key: 'apply',
        label: 'Submit UCAS or direct applications',
        offsetDays: -240,
        notes: 'UCAS deadline usually mid-January. Some postgraduate programs accept rolling applications.',
      },
      {
        key: 'admission',
        label: 'Receive offers (conditional/unconditional)',
        offsetDays: -180,
        notes: 'Universities respond within 8 weeks. Meet any conditional requirements.',
      },
      {
        key: 'cas',
        label: 'Accept offer and receive CAS',
        offsetDays: -120,
        notes: 'Pay deposit to confirm place and receive Confirmation of Acceptance for Studies (CAS).',
      },
      {
        key: 'visa_apply',
        label: 'Apply for Student visa online',
        offsetDays: -90,
        notes: 'Apply through UK Visas and Immigration. Fee: ~£363. Can apply up to 6 months before.',
      },
      {
        key: 'biometrics',
        label: 'Attend biometrics appointment',
        offsetDays: -75,
        notes: 'Visit visa application centre for fingerprints and photo. Bring required documents.',
      },
      {
        key: 'ihs',
        label: 'Pay Immigration Health Surcharge',
        offsetDays: -70,
        notes: 'IHS fee: £470/year for students. Grants access to NHS healthcare.',
      },
      {
        key: 'travel',
        label: 'Book travel and accommodation',
        offsetDays: -30,
        notes: 'Arrange university accommodation or private housing. Can arrive up to 1 month early.',
      },
      {
        key: 'arrival',
        label: 'Arrive and register at university',
        offsetDays: -7,
        notes: 'Complete student registration, open UK bank account, register with GP.',
      },
    ],
  },

  // ──────────────── CANADA ────────────────
  {
    countryCode: 'CA',
    title: 'Canada Study Permit Timeline',
    milestones: [
      {
        key: 'research',
        label: 'Research Canadian universities and programs',
        offsetDays: -365,
        notes: 'Explore DLI (Designated Learning Institutions) list. Note: Quebec has different rules.',
      },
      {
        key: 'tests',
        label: 'Complete language tests (IELTS/TOEFL)',
        offsetDays: -330,
        notes: 'Canadian universities accept both IELTS and TOEFL. Check provincial language requirements.',
      },
      {
        key: 'docs',
        label: 'Prepare application documents',
        offsetDays: -270,
        notes: 'Statement of Intent, reference letters, CV, academic transcripts, portfolio (if applicable).',
      },
      {
        key: 'apply',
        label: 'Submit university applications',
        offsetDays: -240,
        notes: 'Apply directly to universities (no centralized system). Most have January-March deadlines.',
      },
      {
        key: 'admission',
        label: 'Receive Letter of Acceptance',
        offsetDays: -180,
        notes: 'Conditional or unconditional acceptance. Some programs require interviews.',
      },
      {
        key: 'gic',
        label: 'Open GIC account (if applicable)',
        offsetDays: -120,
        notes: 'Guaranteed Investment Certificate ($10,000 CAD) simplifies study permit process for certain countries.',
      },
      {
        key: 'permit_apply',
        label: 'Apply for Study Permit online',
        offsetDays: -90,
        notes: 'Apply through IRCC. Fee: $150 CAD. Processing: 4-12 weeks depending on country.',
      },
      {
        key: 'biometrics',
        label: 'Provide biometrics',
        offsetDays: -75,
        notes: 'Visit designated VAC for biometrics (fee: $85 CAD). Valid for 10 years.',
      },
      {
        key: 'medical',
        label: 'Complete medical exam (if required)',
        offsetDays: -60,
        notes: 'Required for study programs >6 months. Must be done by panel physician.',
      },
      {
        key: 'travel',
        label: 'Book flights and arrange housing',
        offsetDays: -30,
        notes: 'Arrange on-campus residence or homestay. Check provincial health insurance requirements.',
      },
      {
        key: 'arrival',
        label: 'Arrive and activate Study Permit',
        offsetDays: -7,
        notes: 'Port of Entry letter converted to Study Permit at airport. Apply for SIN, open bank account.',
      },
    ],
  },

  // ──────────────── AUSTRALIA ────────────────
  {
    countryCode: 'AU',
    title: 'Australia Student Visa (Subclass 500) Timeline',
    milestones: [
      {
        key: 'research',
        label: 'Research Australian universities and courses',
        offsetDays: -365,
        notes: 'Check QS/ARWU rankings. Popular fields: Engineering, Business, Health Sciences.',
      },
      {
        key: 'tests',
        label: 'Take English proficiency test',
        offsetDays: -330,
        notes: 'IELTS, TOEFL, PTE Academic all accepted. Minimum usually 6.5+ IELTS.',
      },
      {
        key: 'docs',
        label: 'Prepare application documents',
        offsetDays: -270,
        notes: 'Personal statement, CV, academic transcripts, 2 references, work experience (if relevant).',
      },
      {
        key: 'apply',
        label: 'Submit university applications',
        offsetDays: -240,
        notes: 'Apply directly or through agents. Two main intakes: February/March and July/August.',
      },
      {
        key: 'admission',
        label: 'Receive Letter of Offer',
        offsetDays: -180,
        notes: 'Full or conditional offer. Read conditions carefully (e.g., English score, payment).',
      },
      {
        key: 'coe',
        label: 'Accept offer and receive CoE',
        offsetDays: -120,
        notes: 'Pay tuition deposit and OSHC (health insurance). Receive Confirmation of Enrolment.',
      },
      {
        key: 'visa_apply',
        label: 'Apply for Student visa (subclass 500)',
        offsetDays: -90,
        notes: 'Apply online via ImmiAccount. Fee: ~$650 AUD. Processing: 1-4 months.',
      },
      {
        key: 'biometrics',
        label: 'Provide biometrics and health exam',
        offsetDays: -75,
        notes: 'May need police clearance and medical exam by approved physician.',
      },
      {
        key: 'oshc',
        label: 'Arrange Overseas Student Health Cover',
        offsetDays: -60,
        notes: 'Mandatory for visa duration + extra months. Cost: ~$500-700/year.',
      },
      {
        key: 'travel',
        label: 'Book flights and accommodation',
        offsetDays: -30,
        notes: 'Arrive 1-2 weeks before orientation. Arrange temporary/permanent accommodation.',
      },
      {
        key: 'arrival',
        label: 'Arrive and complete orientation',
        offsetDays: -7,
        notes: 'TFN (Tax File Number), bank account, mobile phone, campus tour, enrolment confirmation.',
      },
    ],
  },

  // ──────────────── GERMANY ────────────────
  {
    countryCode: 'DE',
    title: 'Germany Student Visa Timeline',
    milestones: [
      {
        key: 'research',
        label: 'Research German universities and programs',
        offsetDays: -365,
        notes: 'Check if program is taught in English or requires German (DSH/TestDaF). Use DAAD database.',
      },
      {
        key: 'language',
        label: 'Complete language requirements',
        offsetDays: -330,
        notes: 'English programs: IELTS/TOEFL. German programs: TestDaF/DSH. Some need both.',
      },
      {
        key: 'docs',
        label: 'Prepare and certify documents',
        offsetDays: -270,
        notes: 'Get documents officially translated and notarized. Check uni-assist requirements.',
      },
      {
        key: 'apply',
        label: 'Submit applications (uni-assist or direct)',
        offsetDays: -240,
        notes: 'Winter semester: deadline ~July 15. Summer semester: deadline ~January 15.',
      },
      {
        key: 'admission',
        label: 'Receive Letter of Admission (Zulassung)',
        offsetDays: -180,
        notes: 'Universities respond 6-8 weeks after deadline. Some require interview (Skype).',
      },
      {
        key: 'blocked_account',
        label: 'Open blocked account (Sperrkonto)',
        offsetDays: -120,
        notes: 'Deposit €11,208/year (€934/month) for 2024. Required for visa. Use Fintiba/Deutsche Bank.',
      },
      {
        key: 'health_insurance',
        label: 'Arrange health insurance',
        offsetDays: -110,
        notes: 'Public (TK, AOK) or private insurance accepted. Proof required for visa and enrollment.',
      },
      {
        key: 'visa_apply',
        label: 'Apply for National Visa (Type D)',
        offsetDays: -90,
        notes: 'Book appointment at German embassy/consulate. Fee: €75. Processing: 6-12 weeks.',
      },
      {
        key: 'visa_appointment',
        label: 'Attend visa appointment',
        offsetDays: -75,
        notes: 'Bring: passport, admission letter, blocked account proof, insurance, photos, forms.',
      },
      {
        key: 'housing',
        label: 'Search for accommodation',
        offsetDays: -60,
        notes: 'Apply early for student dorms (Studentenwerk). Private flats need Anmeldung (registration).',
      },
      {
        key: 'travel',
        label: 'Book travel to Germany',
        offsetDays: -30,
        notes: 'Plan to arrive 1-2 weeks before semester. Arrange temporary stay if needed.',
      },
      {
        key: 'arrival',
        label: 'Complete Anmeldung and university enrollment',
        offsetDays: -7,
        notes: 'Register residence at Bürgeramt, get residence permit extension, enroll at university.',
      },
    ],
  },
];

async function seedVisaTemplates() {
  console.log('[seed:visa] Starting visa timeline template seeding...');

  let created = 0;
  let updated = 0;

  for (const template of VISA_TEMPLATES) {
    const existing = await prisma.visaTimelineTemplate.findUnique({
      where: { countryCode: template.countryCode },
    });

    await prisma.visaTimelineTemplate.upsert({
      where: { countryCode: template.countryCode },
      create: {
        countryCode: template.countryCode,
        title: template.title,
        milestones: template.milestones as any,
      },
      update: {
        title: template.title,
        milestones: template.milestones as any,
      },
    });

    if (existing) {
      updated++;
      console.log(`[seed:visa] ✓ Updated: ${template.countryCode} (${template.title})`);
    } else {
      created++;
      console.log(`[seed:visa] ✓ Created: ${template.countryCode} (${template.title})`);
    }
  }

  console.log(`[seed:visa] Done! Created: ${created}, Updated: ${updated}`);
}

// Run seeder
seedVisaTemplates()
  .catch((err) => {
    console.error('[seed:visa] Error:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
