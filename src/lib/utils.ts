import {
  CrmAssistantMessage,
  CrmOutreachStatus,
  CrmRecord,
  CrmRecordInput,
  CrmResearchContact,
  CrmResearchSnapshot,
  CrmSourceType,
  FilmFirm,
  FilmFirmInput,
  FinanceFirm,
  FinanceFirmInput,
  UniversityOpportunityInput
} from "@/types";

type ClassValue = string | number | false | null | undefined;

export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}

export const FINANCE_STORAGE_KEY = "innovare-finance-firms";
export const FILM_STORAGE_KEY = "innovare-film-firms";
export const CRM_STORAGE_KEY = "innovare-crm-records";
export const UNIVERSITY_OPPORTUNITIES_STORAGE_KEY = "innovare-university-opportunities";

export function normalizeCrmStatus(value: string): CrmOutreachStatus {
  if (
    value === "saved" ||
    value === "sent" ||
    value === "follow-up-1" ||
    value === "follow-up-2" ||
    value === "follow-up-3" ||
    value === "successful" ||
    value === "failed"
  ) {
    return value;
  }

  if (value === "replied" || value === "meeting" || value === "closed") {
    return "successful";
  }

  if (value === "researching" || value === "drafting") {
    return "saved";
  }

  return "saved";
}

export function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const withProtocol = /^[a-z]+:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const pathname = parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/$/, "");
    return `https://${hostname}${pathname}`;
  } catch {
    return "";
  }
}

export function createFinanceFirmFromInput(input: FinanceFirmInput): FinanceFirm {
  const normalizedWebsite = normalizeWebsite(input.website);
  const slug = createSlug(input.name);

  return {
    id: `${slug}-${Date.now()}`,
    name: input.name.trim(),
    website: normalizedWebsite,
    domain: normalizedWebsite ? new URL(normalizedWebsite).hostname : null,
    boutiqueStatus: input.boutiqueStatus,
    marketSymbol: null,
    category: input.category.trim() || "Industry",
    focusArea: input.focusArea.trim() || null,
    location: input.location.trim() || "Location not provided",
    summary:
      input.summary.trim() ||
      `${input.name.trim()} was added to Innovare as a custom organization profile for research, outreach, and future collaboration.`,
    notes: input.notes.trim() || null,
    aliases: [],
    sourceFiles: ["user-submitted"],
    isUserAdded: true
  };
}

export function createFilmFirmFromInput(input: FilmFirmInput): FilmFirm {
  const normalizedWebsite = normalizeWebsite(input.website);
  const slug = createSlug(input.name);
  const city = input.city.trim() || "City not provided";
  const state = input.state.trim() || "State not provided";

  return {
    id: `${slug}-${Date.now()}`,
    name: input.name.trim(),
    website: normalizedWebsite,
    domain: normalizedWebsite ? new URL(normalizedWebsite).hostname : null,
    size: input.size,
    sizeBasis:
      input.size === "large"
        ? "user-marked as large-scale studio or platform"
        : "user-marked as small or independent studio",
    city,
    state,
    region: input.region.trim() || "Region not provided",
    focus: input.focus.trim() || "Film production",
    address: input.address.trim() || null,
    summary:
      input.summary.trim() ||
      `${input.name.trim()} was added to Innovare as a film organization in ${city}, ${state}.`,
    notes: input.notes.trim() || null,
    sourceUrl: null,
    isUserAdded: true
  };
}

function getCleanDomain(domain: string | null, website: string) {
  if (domain?.trim()) {
    return domain.trim().toLowerCase().replace(/^www\./, "");
  }

  const normalizedWebsite = normalizeWebsite(website);
  if (!normalizedWebsite) {
    return null;
  }

  try {
    return new URL(normalizedWebsite).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

function buildLinkedInSearchUrl(query: string) {
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`;
}

function buildGoogleSearchUrl(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function getFirstSentence(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const sentenceMatch = trimmed.match(/.*?[.!?](?:\s|$)/);
  return sentenceMatch?.[0]?.trim() || trimmed;
}

function hasUsefulCompanySummary(record: CrmRecord) {
  const summary = record.summary.trim().toLowerCase();
  if (!summary) {
    return false;
  }

  const weakSignals = [
    "appears in innovare",
    "was added to innovare",
    "directory as",
    "organization profile",
    "location not provided",
    "public website",
    "custom organization profile"
  ];

  return !weakSignals.some((signal) => summary.includes(signal));
}

function isUsefulLocation(location: string) {
  const cleaned = location.trim().toLowerCase();
  return Boolean(cleaned) && cleaned !== "location not provided" && cleaned !== "unspecified";
}

function buildOutreachSubject(record: CrmRecord) {
  if (record.sourceType === "finance") {
    return "Private Equity will not survive in this form - exploring summer internship";
  }

  return `Exploring summer project opportunities at ${record.organization}`;
}

function buildOutreachTemplate(record: CrmRecord) {
  if (record.sourceType === "finance") {
    return `Hi X,

I recently came across your work at ${record.organization} and was particularly interested in your involvement in investment banking and X. I saw your interest in crypto, and I have recently been looking into blockchain smart contracts that could be applied to PE funding.

My name is (x), and I am currently a rising sophomore studying X at X, with a strong interest in investment banking and private markets.

I find ${record.organization} especially compelling because I believe future dealmaking may increasingly integrate technology into structuring and execution, rather than relying solely on traditional processes.

I wanted to ask about potential internship opportunities at ${record.organization} for the upcoming summer. I am eager to contribute to the firm and deepen my understanding of investment banking. I have attached my resume for your review and would greatly appreciate the opportunity to speak.

Best regards,
(x)`;
  }

  return `Hi X,

I recently came across your work at ${record.organization} and was particularly interested in your involvement in ${record.segment}.

My name is (x), and I am currently a rising sophomore studying X at X, with a strong interest in media, startups, and project-based work.

I find ${record.organization} especially compelling because I am interested in how creative teams turn early ideas into finished projects with real distribution and audience traction.

I wanted to ask about potential unpaid summer project opportunities at ${record.organization}. I am eager to contribute research, coordination, and execution support while learning more about the organization. I have attached my resume for your review and would greatly appreciate the opportunity to speak.

Best regards,
(x)`;
}

function sanitizeOutreachDraft(value: string) {
  return value
    .replace(/\bMy name is Ethan,\s*/g, "My name is (x), ")
    .replace(/\bMy name is your name,\s*/g, "My name is (x), ")
    .replace(/Best regards,\s*Ethan\b/g, "Best regards,\n(x)")
    .replace(/Best regards,\s*your name\b/g, "Best regards,\n(x)")
    .replace(/\bBest,\s*Ethan\b/g, "Best,\n(x)")
    .replace(/\bBest,\s*your name\b/g, "Best,\n(x)");
}

function shouldUseDefaultSubject(value: string | undefined) {
  const subject = value?.trim();
  return !subject || /^intro to\b/i.test(subject) || /^can private equity survive/i.test(subject);
}

function buildCompanyEvidence(record: CrmRecord, domain: string | null) {
  const evidence: string[] = [];

  if (domain) {
    evidence.push(`Website domain found: ${domain}.`);
  }

  if (isUsefulLocation(record.location)) {
    evidence.push(`Directory location/category signal: ${record.location}.`);
  }

  if (record.segment.trim()) {
    evidence.push(`Innovare category signal: ${record.segment}.`);
  }

  if (hasUsefulCompanySummary(record)) {
    evidence.push(`Existing note: ${getFirstSentence(record.summary)}.`);
  }

  return evidence;
}

function buildResearchGaps(record: CrmRecord) {
  const baseGaps = [
    "What the company actually sells or advises on.",
    "Recent deals, productions, investments, clients, or announcements.",
    "Named decision-makers with verified LinkedIn profiles.",
    "A real contact email beyond generic inbox guesses."
  ];

  if (record.sourceType === "finance") {
    return [
      "Whether the firm is active in M&A, capital raising, private placements, restructuring, PE, or another advisory niche.",
      "Recent transactions or industries the firm appears to focus on.",
      ...baseGaps.slice(2)
    ];
  }

  return [
    "Whether the company produces, finances, distributes, manages talent, or provides production services.",
    "Recent films, shows, clients, campaigns, or production credits.",
    ...baseGaps.slice(2)
  ];
}

function buildOutreachAngles(record: CrmRecord) {
  if (record.sourceType === "finance") {
    return [
      "Private markets + technology angle: blockchain, smart contracts, AI diligence, or workflow automation.",
      "Unpaid summer internship angle: research, sourcing, market maps, buyer lists, and deal support.",
      "Student initiative angle: you are willing to do useful work before asking for a formal role."
    ];
  }

  return [
    "Project-support angle: research, coordination, outreach, and production assistance.",
    "Startup/operator angle: helping a lean creative team move faster without needing a formal program.",
    "Student initiative angle: you are asking for a concrete project, not a generic internship."
  ];
}

function getCompanyEmailLocalParts(sourceType: CrmSourceType, segment: string) {
  const base = ["info", "contact", "hello", "team"];
  const segmentValue = segment.toLowerCase();

  if (sourceType === "finance") {
    return [...base, "careers", "talent", "recruiting"];
  }

  if (segmentValue.includes("production") || segmentValue.includes("studio")) {
    return [...base, "development", "projects", "production"];
  }

  return [...base, "projects", "partnerships"];
}

export function inferSuggestedCompanyEmails(
  domain: string | null,
  sourceType: CrmSourceType,
  segment: string
) {
  if (!domain) {
    return [];
  }

  return Array.from(
    new Set(getCompanyEmailLocalParts(sourceType, segment).map((localPart) => `${localPart}@${domain}`))
  ).slice(0, 4);
}

function inferPreferredCompanyEmail(
  domain: string | null,
  sourceType: CrmSourceType,
  segment: string
) {
  return inferSuggestedCompanyEmails(domain, sourceType, segment)[0] ?? "";
}

function inferLikelyContactRoles(record: CrmRecord): Array<{ role: string; reason: string; inboxHint: string }> {
  const segmentValue = record.segment.toLowerCase();

  if (record.sourceType === "finance") {
    if (segmentValue.includes("venture") || segmentValue.includes("private equity")) {
      return [
        {
          role: "Founder / Managing Partner",
          reason: "Usually closest to investment, hiring, and partner-level conversations.",
          inboxHint: "team"
        },
        {
          role: "Principal / Partner",
          reason: "Strong target for direct investing or platform-related outreach.",
          inboxHint: "info"
        },
        {
          role: "Platform / Talent Lead",
          reason: "Best path for operating, internship, or recruiting-oriented outreach.",
          inboxHint: "talent"
        },
        {
          role: "Chief Operating Officer",
          reason: "Useful when the ask is strategic, cross-functional, or startup-adjacent.",
          inboxHint: "operations"
        }
      ];
    }

    return [
      {
        role: "Chief Executive Officer / President",
        reason: "Best top-level search when you want leadership or business-side ownership.",
        inboxHint: "info"
      },
      {
        role: "Managing Director / Partner",
        reason: "Often the strongest target inside finance teams and deal-focused groups.",
        inboxHint: "team"
      },
      {
        role: "Head of Talent / Recruiting",
        reason: "Most relevant when the goal is internships, analyst roles, or recruiting entry points.",
        inboxHint: "recruiting"
      },
      {
        role: "Chief Operating Officer / Chief of Staff",
        reason: "Strong for strategic projects, research support, or operational collaboration.",
        inboxHint: "talent"
      }
    ];
  }

  return [
    {
      role: "Founder / Executive Producer",
      reason: "Usually the clearest leadership target at smaller studios and creative companies.",
      inboxHint: "hello"
    },
    {
      role: "Head of Development",
      reason: "Best for pitching, research-heavy support, or content and project collaboration.",
      inboxHint: "development"
    },
    {
      role: "Producer / Development Executive",
      reason: "Useful when the outreach is project-based or tied to active production work.",
      inboxHint: "projects"
    },
    {
      role: "Partnerships / Talent Lead",
      reason: "Strong for collaboration, venture help, and people-facing coordination.",
      inboxHint: "team"
    }
  ];
}

export function normalizeCrmRecord(
  record: Partial<CrmRecord> &
    Pick<
      CrmRecord,
      | "id"
      | "sourceType"
      | "sourceId"
      | "organization"
      | "website"
      | "location"
      | "segment"
      | "summary"
      | "status"
      | "savedAt"
      | "updatedAt"
    >
): CrmRecord {
  const normalizedWebsite = normalizeWebsite(record.website) || record.website;
  const domain = getCleanDomain(record.domain ?? null, normalizedWebsite);

  return {
    id: record.id,
    sourceType: record.sourceType,
    sourceId: record.sourceId,
    organization: record.organization,
    website: normalizedWebsite,
    domain,
    location: record.location,
    segment: record.segment,
    summary: record.summary,
    companyEmail:
      record.companyEmail?.trim() || inferPreferredCompanyEmail(domain, record.sourceType, record.segment),
    contactName: record.contactName?.trim() ?? "",
    contactRole: record.contactRole?.trim() ?? "",
    contactEmail: record.contactEmail?.trim() ?? "",
    contactLinkedIn: record.contactLinkedIn?.trim() ?? "",
    status: normalizeCrmStatus(record.status),
    notes: record.notes ?? "",
    nextStep: record.nextStep ?? "",
    lastContacted: record.lastContacted ?? "",
    emailSubject: shouldUseDefaultSubject(record.emailSubject)
      ? buildOutreachSubject(record as CrmRecord)
      : record.emailSubject?.trim() ?? "",
    outreachDraft:
      record.outreachDraft ? sanitizeOutreachDraft(record.outreachDraft) :
      buildOutreachTemplate(record as CrmRecord),
    savedAt: record.savedAt,
    updatedAt: record.updatedAt
  };
}

export function createCrmRecordFromFinanceFirm(firm: FinanceFirm): CrmRecord {
  const now = new Date().toISOString();
  const domain = getCleanDomain(firm.domain, firm.website);

  return {
    id: `finance-${firm.id}`,
    sourceType: "finance",
    sourceId: firm.id,
    organization: firm.name,
    website: firm.website,
    domain,
    location: firm.location,
    segment: firm.category,
    summary: firm.summary,
    companyEmail: inferPreferredCompanyEmail(domain, "finance", firm.category),
    contactName: "",
    contactRole: "",
    contactEmail: "",
    contactLinkedIn: "",
    status: "saved",
    notes: firm.notes ?? "",
    nextStep: "",
    lastContacted: "",
    emailSubject: buildOutreachSubject({
      id: `finance-${firm.id}`,
      sourceType: "finance",
      sourceId: firm.id,
      organization: firm.name,
      website: firm.website,
      domain,
      location: firm.location,
      segment: firm.category,
      summary: firm.summary,
      companyEmail: "",
      contactName: "",
      contactRole: "",
      contactEmail: "",
      contactLinkedIn: "",
      status: "saved",
      notes: "",
      nextStep: "",
      lastContacted: "",
      emailSubject: "",
      outreachDraft: "",
      savedAt: now,
      updatedAt: now
    }),
    outreachDraft: buildOutreachTemplate({
      id: `finance-${firm.id}`,
      sourceType: "finance",
      sourceId: firm.id,
      organization: firm.name,
      website: firm.website,
      domain,
      location: firm.location,
      segment: firm.category,
      summary: firm.summary,
      companyEmail: "",
      contactName: "",
      contactRole: "",
      contactEmail: "",
      contactLinkedIn: "",
      status: "saved",
      notes: "",
      nextStep: "",
      lastContacted: "",
      emailSubject: "",
      outreachDraft: "",
      savedAt: now,
      updatedAt: now
    }),
    savedAt: now,
    updatedAt: now
  };
}

export function createCrmRecordFromFilmFirm(firm: FilmFirm): CrmRecord {
  const now = new Date().toISOString();
  const domain = getCleanDomain(firm.domain, firm.website);

  return {
    id: `film-${firm.id}`,
    sourceType: "film",
    sourceId: firm.id,
    organization: firm.name,
    website: firm.website,
    domain,
    location: `${firm.city}, ${firm.state}`,
    segment: `${firm.focus} / ${firm.region}`,
    summary: firm.summary,
    companyEmail: inferPreferredCompanyEmail(domain, "film", `${firm.focus} / ${firm.region}`),
    contactName: "",
    contactRole: "",
    contactEmail: "",
    contactLinkedIn: "",
    status: "saved",
    notes: firm.notes ?? "",
    nextStep: "",
    lastContacted: "",
    emailSubject: buildOutreachSubject({
      id: `film-${firm.id}`,
      sourceType: "film",
      sourceId: firm.id,
      organization: firm.name,
      website: firm.website,
      domain,
      location: `${firm.city}, ${firm.state}`,
      segment: `${firm.focus} / ${firm.region}`,
      summary: firm.summary,
      companyEmail: "",
      contactName: "",
      contactRole: "",
      contactEmail: "",
      contactLinkedIn: "",
      status: "saved",
      notes: "",
      nextStep: "",
      lastContacted: "",
      emailSubject: "",
      outreachDraft: "",
      savedAt: now,
      updatedAt: now
    }),
    outreachDraft: buildOutreachTemplate({
      id: `film-${firm.id}`,
      sourceType: "film",
      sourceId: firm.id,
      organization: firm.name,
      website: firm.website,
      domain,
      location: `${firm.city}, ${firm.state}`,
      segment: `${firm.focus} / ${firm.region}`,
      summary: firm.summary,
      companyEmail: "",
      contactName: "",
      contactRole: "",
      contactEmail: "",
      contactLinkedIn: "",
      status: "saved",
      notes: "",
      nextStep: "",
      lastContacted: "",
      emailSubject: "",
      outreachDraft: "",
      savedAt: now,
      updatedAt: now
    }),
    savedAt: now,
    updatedAt: now
  };
}

export function updateCrmRecord(record: CrmRecord, input: CrmRecordInput): CrmRecord {
  return normalizeCrmRecord({
    ...record,
    ...input,
    updatedAt: new Date().toISOString()
  });
}

export function getPrimaryOutreachEmail(record: CrmRecord) {
  return record.contactEmail.trim() || record.companyEmail.trim();
}

export function buildMailtoHref(record: CrmRecord) {
  const targetEmail = getPrimaryOutreachEmail(record);

  if (!targetEmail) {
    return "";
  }

  const subject = encodeURIComponent(record.emailSubject || `Intro to ${record.organization}`);
  const body = encodeURIComponent(record.outreachDraft || "");

  return `mailto:${targetEmail}?subject=${subject}&body=${body}`;
}

export function buildCrmResearchSnapshot(record: CrmRecord): CrmResearchSnapshot {
  const domain = getCleanDomain(record.domain, record.website);
  const companyEmailCandidates = inferSuggestedCompanyEmails(domain, record.sourceType, record.segment);
  const latestNewsSearchUrl = buildGoogleSearchUrl(`${record.organization} latest news company`);
  const usefulSummary = hasUsefulCompanySummary(record);
  const verifiedEvidence = buildCompanyEvidence(record, domain);
  const researchGaps = buildResearchGaps(record);
  const outreachAngles = buildOutreachAngles(record);
  const evidenceLevel = usefulSummary && verifiedEvidence.length >= 3 ? "moderate" : "limited";
  const companyDescription = usefulSummary
    ? getFirstSentence(record.summary)
    : `Not verified yet. Innovare currently has a website/domain and category signals for ${record.organization}, but not enough evidence to say exactly what the company does.`;
  const differentiator = usefulSummary
    ? record.sourceType === "finance"
      ? `Potential outreach angle: connect ${record.organization}'s finance work to a specific technology or private-markets question after verifying recent deals.`
      : `Potential outreach angle: connect ${record.organization}'s creative or production focus to a concrete project-support offer after verifying recent work.`
    : "No verified differentiator yet. Use the website, latest-news search, and LinkedIn searches below to find a specific hook before sending outreach.";
  const outreachTemplateSubject = buildOutreachSubject(record);
  const outreachTemplateBody = buildOutreachTemplate(record);
  const contactCandidates: CrmResearchContact[] = inferLikelyContactRoles(record).map((candidate) => ({
    role: candidate.role,
    reason: candidate.reason,
    linkedinSearchUrl: buildLinkedInSearchUrl(`${record.organization} ${candidate.role}`),
    webSearchUrl: buildGoogleSearchUrl(`${record.organization} ${candidate.role} LinkedIn`),
    suggestedEmail: domain ? `${candidate.inboxHint}@${domain}` : ""
  }));

  const messages: CrmAssistantMessage[] = [
    {
      id: `${record.id}-domain`,
      content: domain
        ? `Verified starting point: I found the domain ${domain}. The inbox suggestions are guesses based on that domain, not confirmed addresses. Start with ${
            record.companyEmail || companyEmailCandidates[0] || `info@${domain}`
          } only after checking the website contact page.`
        : "I could not detect a clean website domain yet, so the first step is verifying the site before outreach."
    },
    {
      id: `${record.id}-latest`,
      content: `Evidence level: ${evidenceLevel}. Before emailing, verify what ${record.organization} actually does by checking the website, recent news, and at least one LinkedIn profile.`
    },
    {
      id: `${record.id}-gap`,
      content: `Research gap: ${researchGaps[0]} This is the missing detail that will make the outreach feel specific instead of generic.`
    },
    {
      id: `${record.id}-template`,
      content: `Suggested outreach template

Subject: ${outreachTemplateSubject}

${outreachTemplateBody}

Suggested people to verify before sending: ${contactCandidates
        .slice(0, 3)
        .map((candidate) => candidate.role)
        .join(", ")}.`
    },
    {
      id: `${record.id}-disclaimer`,
      content:
        "The LinkedIn buttons below are targeted searches, not verified profiles, so you can research quickly without inventing fake contact data."
    }
  ];

  return {
    domainLabel: domain ?? "No clean domain yet",
    companyEmailCandidates,
    companyLinkedInSearchUrl: buildLinkedInSearchUrl(record.organization),
    latestNewsSearchUrl,
    companyDescription,
    differentiator,
    evidenceLevel,
    verifiedEvidence,
    researchGaps,
    outreachAngles,
    outreachTemplateSubject,
    outreachTemplateBody,
    contactCandidates,
    messages
  };
}

export function createUniversityOpportunityFromInput(input: UniversityOpportunityInput) {
  return {
    id: `${createSlug(input.organization)}-${Date.now()}`,
    ecosystemId: input.ecosystemId,
    ecosystem: input.ecosystem.trim(),
    projectRole: input.projectRole.trim(),
    organization: input.organization.trim(),
    website: normalizeWebsite(input.website),
    location: input.location.trim(),
    opportunityType: input.opportunityType.trim(),
    description: input.description.trim(),
    applicationLink: normalizeWebsite(input.applicationLink),
    contactEmail: input.contactEmail.trim(),
    postedAt: new Date().toISOString(),
    isUserAdded: true
  };
}

export function loadStoredItems<T>(key: string): T[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const item = window.localStorage.getItem(key);
    if (!item) {
      return [];
    }
    return JSON.parse(item) as T[];
  } catch {
    return [];
  }
}

export function saveStoredItems<T>(key: string, value: T[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}
