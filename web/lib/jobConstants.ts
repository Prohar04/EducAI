export type StudyCountry = {
  code: string;
  name: string;
  flag: string;
  currency: string;
};

export const STUDY_COUNTRIES: StudyCountry[] = [
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP" },
  { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD" },
  { code: "AU", name: "Australia", flag: "🇦🇺", currency: "AUD" },
  { code: "DE", name: "Germany", flag: "🇩🇪", currency: "EUR" },
  { code: "FR", name: "France", flag: "🇫🇷", currency: "EUR" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", currency: "EUR" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", currency: "EUR" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", currency: "SEK" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", currency: "DKK" },
  { code: "NO", name: "Norway", flag: "🇳🇴", currency: "NOK" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", currency: "CHF" },
  { code: "AT", name: "Austria", flag: "🇦🇹", currency: "EUR" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", currency: "EUR" },
  { code: "ES", name: "Spain", flag: "🇪🇸", currency: "EUR" },
  { code: "IT", name: "Italy", flag: "🇮🇹", currency: "EUR" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", currency: "EUR" },
  { code: "JP", name: "Japan", flag: "🇯🇵", currency: "JPY" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", currency: "SGD" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", currency: "NZD" },
  { code: "FI", name: "Finland", flag: "🇫🇮", currency: "EUR" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿", currency: "CZK" },
  { code: "PL", name: "Poland", flag: "🇵🇱", currency: "PLN" },
  { code: "HU", name: "Hungary", flag: "🇭🇺", currency: "HUF" },
  { code: "AE", name: "UAE", flag: "🇦🇪", currency: "AED" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", currency: "KRW" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", currency: "HKD" },
  { code: "CN", name: "China", flag: "🇨🇳", currency: "CNY" },
  { code: "IN", name: "India", flag: "🇮🇳", currency: "INR" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", currency: "BRL" },
];

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  US: ["New York", "Los Angeles", "Chicago", "Houston", "San Francisco", "Boston", "Seattle", "Austin", "Washington DC", "Miami"],
  GB: ["London", "Manchester", "Birmingham", "Edinburgh", "Bristol", "Leeds", "Glasgow", "Nottingham", "Sheffield", "Liverpool"],
  CA: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton", "Winnipeg", "Quebec City", "Halifax", "Victoria"],
  AU: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra", "Gold Coast", "Hobart", "Darwin", "Newcastle"],
  DE: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf", "Leipzig", "Dresden", "Nuremberg"],
  FR: ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg", "Bordeaux", "Lille", "Rennes"],
  NL: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen", "Tilburg", "Almere"],
  IE: ["Dublin", "Cork", "Limerick", "Galway", "Waterford", "Kilkenny"],
  SE: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Linköping", "Örebro", "Västerås"],
  DK: ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers"],
  NO: ["Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen", "Tromsø"],
  CH: ["Zurich", "Geneva", "Basel", "Bern", "Lausanne", "Winterthur"],
  AT: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt"],
  BE: ["Brussels", "Antwerp", "Ghent", "Charleroi", "Liège", "Bruges"],
  ES: ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao", "Málaga", "Zaragoza"],
  IT: ["Rome", "Milan", "Naples", "Turin", "Florence", "Bologna", "Venice"],
  PT: ["Lisbon", "Porto", "Braga", "Coimbra", "Faro", "Setúbal"],
  JP: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya", "Sapporo", "Fukuoka"],
  SG: ["Singapore"],
  NZ: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Dunedin"],
  FI: ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku"],
  CZ: ["Prague", "Brno", "Ostrava", "Plzeň", "Liberec"],
  PL: ["Warsaw", "Kraków", "Wrocław", "Poznań", "Gdańsk", "Łódź"],
  HU: ["Budapest", "Debrecen", "Miskolc", "Pécs", "Győr"],
  AE: ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain"],
  KR: ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon"],
  HK: ["Hong Kong"],
  CN: ["Beijing", "Shanghai", "Shenzhen", "Guangzhou", "Chengdu", "Hangzhou"],
  IN: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata"],
  BR: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Curitiba"],
};

export type FieldGroup = { category: string; fields: string[] };

export const FIELD_GROUPS: FieldGroup[] = [
  {
    category: "Technology",
    fields: [
      "Computer Science", "Software Engineering", "Data Science", "Artificial Intelligence",
      "Machine Learning", "Cybersecurity", "Cloud Computing", "Web Development",
      "Mobile Development", "DevOps", "Information Technology", "Computer Engineering",
      "Game Development", "Blockchain",
    ],
  },
  {
    category: "Business",
    fields: [
      "Business Administration", "Finance", "Accounting", "Economics", "Marketing",
      "International Business", "Supply Chain Management", "Human Resources",
      "Entrepreneurship", "Operations Management", "Business Analytics", "E-Commerce",
      "Project Management", "Real Estate",
    ],
  },
  {
    category: "Engineering",
    fields: [
      "Mechanical Engineering", "Electrical Engineering", "Civil Engineering",
      "Chemical Engineering", "Biomedical Engineering", "Environmental Engineering",
      "Aerospace Engineering", "Industrial Engineering", "Materials Engineering",
      "Petroleum Engineering", "Nuclear Engineering", "Structural Engineering",
    ],
  },
  {
    category: "Health & Medicine",
    fields: [
      "Medicine", "Nursing", "Public Health", "Pharmacy", "Dentistry",
      "Physiotherapy", "Occupational Therapy", "Nutrition & Dietetics",
      "Biomedical Science", "Medical Laboratory Science", "Health Informatics",
      "Veterinary Science",
    ],
  },
  {
    category: "Social Sciences",
    fields: [
      "Psychology", "Sociology", "Political Science", "International Relations",
      "Anthropology", "Social Work", "Criminology", "Geography", "Development Studies",
    ],
  },
  {
    category: "Arts & Design",
    fields: [
      "Graphic Design", "UX/UI Design", "Architecture", "Interior Design",
      "Fashion Design", "Film & Media", "Photography", "Fine Arts", "Animation",
      "Industrial Design", "Urban Planning",
    ],
  },
  {
    category: "Sciences",
    fields: [
      "Mathematics", "Statistics", "Physics", "Chemistry", "Biology",
      "Biotechnology", "Genetics", "Neuroscience", "Environmental Science",
      "Marine Biology", "Astronomy", "Geology",
    ],
  },
  {
    category: "Humanities",
    fields: [
      "Journalism", "Communication", "History", "Philosophy", "Literature",
      "Linguistics", "Education", "Law", "Translation & Interpretation",
      "Religious Studies", "Cultural Studies",
    ],
  },
  {
    category: "Other",
    fields: [
      "Hospitality Management", "Tourism", "Sports Science", "Agriculture",
      "Food Science", "Logistics", "Actuarial Science", "Library Science",
    ],
  },
];

export const VISA_OPTIONS_BY_COUNTRY: Record<string, string[]> = {
  US: ["F-1 OPT (post-graduation)", "F-1 CPT (during studies)", "J-1 Exchange Visitor", "H-1B (employer sponsored)"],
  GB: ["Graduate Route (post-graduation)", "Skilled Worker visa", "Youth Mobility Scheme", "Global Talent visa"],
  CA: ["PGWP (post-graduation)", "Co-op Work Permit", "Express Entry", "Provincial Nominee Program"],
  AU: ["Subclass 485 Temporary Graduate", "Subclass 482 TSS", "Student visa 500 work rights", "Skilled Independent 189"],
  DE: ["18-month Job Seeker visa", "EU Blue Card", "Skilled Immigration Act permit", "Student work rights"],
  FR: ["Talent Passport", "Student work rights (964 hrs/year)", "Job Seeker visa"],
  NL: ["Highly Skilled Migrant permit", "EU Blue Card", "Student work rights"],
  IE: ["Graduate Programme Permit", "Critical Skills Employment Permit", "Student work rights"],
  SE: ["Work permit", "EU Blue Card", "Student work rights"],
  DK: ["Positive List work permit", "Pay Limit scheme", "Student work rights"],
  NO: ["Skilled worker permit", "Student work rights"],
  CH: ["L/B work permit", "EU/EFTA agreement", "Student work rights"],
  AT: ["Red-White-Red card", "EU Blue Card", "Student work rights"],
  BE: ["Single permit", "EU Blue Card", "Student work rights"],
  ES: ["Talent visa", "EU Blue Card", "Student work rights"],
  IT: ["EU Blue Card", "Highly skilled worker permit", "Student work rights"],
  PT: ["Job Seeker visa", "Tech visa", "Student work rights"],
  JP: ["Engineer/Specialist in Humanities visa", "Specified Skilled Worker", "Student work rights"],
  SG: ["Employment Pass", "S Pass", "Work Holiday Pass"],
  NZ: ["Post-study work visa (2 years)", "Skilled Migrant Category", "Student work rights"],
  AE: ["Employment visa", "Freelance permit"],
  KR: ["D-10 Job Seeker visa", "E-7 Specially Designated Activities", "Student work rights"],
};
