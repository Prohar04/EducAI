import { NextRequest, NextResponse } from "next/server";

// Mock education pulse data - in production, this would fetch from a news API or database
// This endpoint returns cached news items relevant to study abroad
const MOCK_NEWS_ITEMS = [
  {
    id: "1",
    title: "US Universities Announce Extended Application Deadlines for Fall 2026",
    source: "Times Higher Education",
    timestamp: "2h ago",
    tag: "USA",
    url: "https://www.timeshighereducation.com",
  },
  {
    id: "2",
    title: "UK Post-Study Work Visa Extended to 3 Years for PhD Graduates",
    source: "Gov.uk",
    timestamp: "5h ago",
    tag: "UK",
    url: "https://www.gov.uk",
  },
  {
    id: "3",
    title: "Canada Increases International Student Intake Caps for 2026",
    source: "Immigration.ca",
    timestamp: "1d ago",
    tag: "Canada",
    url: "https://www.immigration.ca",
  },
  {
    id: "4",
    title: "Germany Offers Free Tuition for All International Students",
    source: "Study in Germany",
    timestamp: "2d ago",
    tag: "Germany",
    url: "https://www.studying-in-germany.org",
  },
  {
    id: "5",
    title: "Australia Simplifies Student Visa Process with Digital Applications",
    source: "Education AU",
    timestamp: "3d ago",
    tag: "Australia",
    url: "https://www.studyinaustralia.gov.au",
  },
  {
    id: "6",
    title: "New Scholarship Programs Launch for STEM Students in Europe",
    source: "Erasmus+",
    timestamp: "4d ago",
    tag: "Europe",
    url: "https://erasmus-plus.ec.europa.eu",
  },
];

export async function GET(req: NextRequest) {
  try {
    // Get optional country filter from query params
    const searchParams = req.nextUrl.searchParams;
    const country = searchParams.get("country");

    let newsItems = MOCK_NEWS_ITEMS;

    // Filter by country if provided
    if (country) {
      const countryLower = country.toLowerCase();
      newsItems = newsItems.filter((item) =>
        item.tag.toLowerCase().includes(countryLower) ||
        item.title.toLowerCase().includes(countryLower)
      );
    }

    // Return top 6 items
    return NextResponse.json({
      news: newsItems.slice(0, 6),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Education Pulse API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch education news" },
      { status: 500 }
    );
  }
}
