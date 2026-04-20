export type BoutiqueStatus = "boutique" | "institutional";
export type FilmCompanySize = "small" | "large";
export type CrmSourceType = "finance" | "film";
export type CrmOutreachStatus =
  | "saved"
  | "sent"
  | "follow-up-1"
  | "follow-up-2"
  | "follow-up-3"
  | "successful"
  | "failed";

export type CrmAssistantMessage = {
  id: string;
  content: string;
};

export type CrmResearchContact = {
  role: string;
  reason: string;
  linkedinSearchUrl: string;
  webSearchUrl: string;
  suggestedEmail: string;
};

export type CrmResearchSnapshot = {
  domainLabel: string;
  companyEmailCandidates: string[];
  companyLinkedInSearchUrl: string;
  latestNewsSearchUrl: string;
  companyDescription: string;
  differentiator: string;
  evidenceLevel: "limited" | "moderate";
  verifiedEvidence: string[];
  researchGaps: string[];
  outreachAngles: string[];
  outreachTemplateSubject: string;
  outreachTemplateBody: string;
  contactCandidates: CrmResearchContact[];
  messages: CrmAssistantMessage[];
};

export type FinanceFirm = {
  id: string;
  name: string;
  website: string;
  domain: string | null;
  boutiqueStatus: BoutiqueStatus;
  marketSymbol: string | null;
  category: string;
  focusArea: string | null;
  location: string;
  summary: string;
  notes: string | null;
  aliases: string[];
  sourceFiles: string[];
  isUserAdded?: boolean;
};

export type FinanceFirmInput = {
  name: string;
  website: string;
  boutiqueStatus: BoutiqueStatus;
  category: string;
  focusArea: string;
  location: string;
  summary: string;
  notes: string;
};

export type FilmFirm = {
  id: string;
  name: string;
  website: string;
  domain: string | null;
  size: FilmCompanySize;
  sizeBasis: string;
  city: string;
  state: string;
  region: string;
  focus: string;
  address: string | null;
  summary: string;
  notes: string | null;
  sourceUrl: string | null;
  isUserAdded?: boolean;
};

export type FilmFirmInput = {
  name: string;
  website: string;
  size: FilmCompanySize;
  city: string;
  state: string;
  region: string;
  focus: string;
  address: string;
  summary: string;
  notes: string;
};

export type CrmRecord = {
  id: string;
  sourceType: CrmSourceType;
  sourceId: string;
  organization: string;
  website: string;
  domain: string | null;
  location: string;
  segment: string;
  summary: string;
  companyEmail: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactLinkedIn: string;
  status: CrmOutreachStatus;
  notes: string;
  nextStep: string;
  lastContacted: string;
  emailSubject: string;
  outreachDraft: string;
  savedAt: string;
  updatedAt: string;
};

export type CrmRecordInput = {
  companyEmail: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactLinkedIn: string;
  status: CrmOutreachStatus;
  notes: string;
  nextStep: string;
  lastContacted: string;
  emailSubject: string;
  outreachDraft: string;
};

export type UniversityEcosystem = {
  id: string;
  name: string;
  summary: string;
  focus: string;
  region: string;
};

export type UniversityOpportunity = {
  id: string;
  ecosystemId: string;
  ecosystem: string;
  projectRole: string;
  organization: string;
  website: string;
  location: string;
  opportunityType: string;
  description: string;
  applicationLink: string;
  contactEmail: string;
  postedAt: string;
  isUserAdded?: boolean;
};

export type UniversityOpportunityInput = {
  ecosystemId: string;
  ecosystem: string;
  projectRole: string;
  organization: string;
  website: string;
  location: string;
  opportunityType: string;
  description: string;
  applicationLink: string;
  contactEmail: string;
};
