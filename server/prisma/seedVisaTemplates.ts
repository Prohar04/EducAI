import "dotenv/config";
import prisma from "../src/config/database.ts";

/**
 * Manual seed for default VisaTimelineTemplate records.
 *
 * Usage:
 *   npm run seed:visa
 */

type MilestoneKey =
  | "shortlist"
  | "tests"
  | "documents"
  | "apply"
  | "scholarships"
  | "visa_docs"
  | "visa_submit"
  | "interview"
  | "housing";

type Milestone = {
  key: MilestoneKey;
  label: string;
  offsetDays: number;
  notes: string;
};

type VisaTemplateSeed = {
  countryCode: string;
  title: string;
  notes: Record<MilestoneKey, string>;
};

const MILESTONE_BLUEPRINT: Array<Omit<Milestone, "notes">> = [
  { key: "shortlist", label: "Shortlist programs", offsetDays: -330 },
  { key: "tests", label: "English test preparation", offsetDays: -300 },
  { key: "documents", label: "Prepare SOP & LOR", offsetDays: -240 },
  { key: "apply", label: "Submit applications", offsetDays: -180 },
  { key: "scholarships", label: "Apply for scholarships", offsetDays: -150 },
  { key: "visa_docs", label: "Prepare visa documents", offsetDays: -90 },
  { key: "visa_submit", label: "Submit visa application", offsetDays: -60 },
  { key: "interview", label: "Visa interview (if required)", offsetDays: -30 },
  { key: "housing", label: "Housing & travel planning", offsetDays: -10 },
];

const TEMPLATE_SEEDS: VisaTemplateSeed[] = [
  {
    countryCode: "US",
    title: "US Student Visa Timeline",
    notes: {
      shortlist:
        "Shortlist target universities in the US and note early admission deadlines, tuition, and location fit.",
      tests:
        "Plan IELTS, TOEFL, or Duolingo English Test dates early enough to retake if your target score needs improvement.",
      documents:
        "Draft your SOP, request recommendation letters, and organize transcripts and test reports for US applications.",
      apply:
        "Submit university applications in time for your intended intake and keep track of each program deadline.",
      scholarships:
        "Check university scholarships, assistantships, and any merit-based awards that may close before final admission decisions.",
      visa_docs:
        "Prepare passport, I-20, funding proof, DS-160 details, and supporting academic records for the F-1 process.",
      visa_submit:
        "Pay the SEVIS and visa fees, complete DS-160, and submit the student visa application once your university documents are ready.",
      interview:
        "Review common F-1 interview questions and carry your financial and admission documents to the embassy appointment.",
      housing:
        "Finalize accommodation, travel plans, and arrival checklist so you can settle in before orientation begins.",
    },
  },
  {
    countryCode: "UK",
    title: "UK Student Visa Timeline",
    notes: {
      shortlist:
        "Compare UK universities, courses, tuition, and deadlines so you can focus on the strongest shortlist first.",
      tests:
        "Prepare for IELTS, PTE, or equivalent proof of English that matches your university and visa requirements.",
      documents:
        "Work on your SOP, references, transcripts, and any portfolio or writing sample required by UK programmes.",
      apply:
        "Submit UCAS or direct applications early enough to leave time for offers, deposits, and CAS processing.",
      scholarships:
        "Review Chevening, GREAT, and university scholarship timelines because many close before visa work starts.",
      visa_docs:
        "Gather passport, CAS, financial proof, TB test results if needed, and accommodation details for your Student visa file.",
      visa_submit:
        "Submit the UK Student visa application after your CAS is issued and your financial documents are ready.",
      interview:
        "Prepare for credibility checks or extra visa questions if UKVI requests them during processing.",
      housing:
        "Confirm accommodation, travel, and arrival plans before your visa window opens for entry to the UK.",
    },
  },
  {
    countryCode: "CA",
    title: "Canada Study Permit Timeline",
    notes: {
      shortlist:
        "Shortlist Canadian programmes and confirm each school is a designated learning institution for study permit eligibility.",
      tests:
        "Schedule your English test early so scores are ready for admissions and any scholarship applications.",
      documents:
        "Prepare your SOP, recommendation letters, transcripts, financial proof, and any programme-specific extras.",
      apply:
        "Submit applications with enough buffer for offer letters and study permit processing timelines.",
      scholarships:
        "Track entrance awards, provincial scholarships, and institution funding while your applications are still in progress.",
      visa_docs:
        "Organize passport, offer letter, financial proof, biometrics details, and any required medical exam information.",
      visa_submit:
        "Apply for the Canadian study permit once your admission documents and proof of funds are ready.",
      interview:
        "An interview is uncommon, but prepare clear answers about your study plans and post-study intentions if requested.",
      housing:
        "Plan housing, flights, insurance, and arrival tasks before you travel to Canada for your intake.",
    },
  },
  {
    countryCode: "AU",
    title: "Australia Student Visa Timeline",
    notes: {
      shortlist:
        "Shortlist Australian universities and confirm which intake best fits your application readiness and budget.",
      tests:
        "Prepare for IELTS, TOEFL, or PTE early so you can meet both university and visa expectations.",
      documents:
        "Build your SOP, recommendations, transcripts, and supporting documents for offer and visa steps.",
      apply:
        "Submit applications early enough to receive your offer, arrange tuition deposit, and secure your CoE.",
      scholarships:
        "Review university awards and government-backed scholarships before admission deadlines pass.",
      visa_docs:
        "Prepare passport, CoE, Genuine Student evidence, OSHC details, and proof of funds for the student visa.",
      visa_submit:
        "Lodge the Australian student visa once your CoE and core supporting documents are complete.",
      interview:
        "An interview may not be required, but keep your study plans, finances, and course choice clearly documented.",
      housing:
        "Arrange accommodation, flights, and your first-week arrival checklist before orientation in Australia.",
    },
  },
  {
    countryCode: "DE",
    title: "Germany Student Visa Timeline",
    notes: {
      shortlist:
        "Shortlist German programmes, check language expectations, and confirm whether uni-assist or direct applications are required.",
      tests:
        "Prepare IELTS, TOEFL, TestDaF, or other language proof depending on the programme and university.",
      documents:
        "Prepare SOP, recommendations, certified transcripts, translations, and any APS or uni-assist paperwork you may need.",
      apply:
        "Submit applications with enough time for admissions review, blocked account setup, and embassy scheduling.",
      scholarships:
        "Check DAAD and university funding options early because scholarship timelines often run ahead of visa steps.",
      visa_docs:
        "Gather passport, admission letter, blocked account proof, health insurance, and other supporting paperwork for the visa file.",
      visa_submit:
        "Submit your German student visa application after your admission and proof-of-funding documents are complete.",
      interview:
        "Prepare for embassy questions about your study plans, funding, and accommodation if an interview is required.",
      housing:
        "Plan accommodation, travel, city registration, and first-week logistics before arriving in Germany.",
    },
  },
];

function buildMilestones(notes: Record<MilestoneKey, string>): Milestone[] {
  return MILESTONE_BLUEPRINT.map((milestone) => ({
    ...milestone,
    notes: notes[milestone.key],
  }));
}

async function seedVisaTemplates() {
  console.log("[seed:visa] Starting visa timeline template seeding...");

  let created = 0;
  let updated = 0;

  for (const template of TEMPLATE_SEEDS) {
    const milestones = buildMilestones(template.notes);
    const existing = await prisma.visaTimelineTemplate.findUnique({
      where: { countryCode: template.countryCode },
    });

    await prisma.visaTimelineTemplate.upsert({
      where: { countryCode: template.countryCode },
      create: {
        countryCode: template.countryCode,
        title: template.title,
        milestones: milestones as any,
      },
      update: {
        title: template.title,
        milestones: milestones as any,
      },
    });

    if (existing) {
      updated += 1;
      console.log(
        `[seed:visa] Updated ${template.countryCode} (${template.title})`,
      );
    } else {
      created += 1;
      console.log(
        `[seed:visa] Created ${template.countryCode} (${template.title})`,
      );
    }
  }

  console.log(`[seed:visa] Done. Created: ${created}, Updated: ${updated}`);
}

seedVisaTemplates()
  .catch((error) => {
    console.error("[seed:visa] Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
