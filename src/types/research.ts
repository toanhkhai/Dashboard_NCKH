export interface NormalizedRecord {
  id: string;
  timestamp: string;
  email: string;
  title: string;
  journal: string;
  issn: string;
  score: number;
  scoreDisplay: string;
  publishDate: string;
  publishYear: number | string;
  authors: string[];
  authorCount: number;
  correspondingAuthor: string;
  volumeIssuePage: string;
  proofLinks: string[];
  language?: string;
  notes?: string;
  // Specific to Source 2 (Extended / International)
  submitterName?: string;
  submitterPhone?: string;
  category?: string; // Scopus, ISI/Web of Science, etc.
  qRank?: string; // Q1, Q2, Q3, Q4
  impactFactor?: string;
  doi?: string;
  internalAuthors?: string[];
  internalAuthorCount?: number;
  coFirstAuthor?: string;
  firstAuthor?: string;
  sourceType: 'source1' | 'source2';
  rawRecord: Record<string, any>;
}

export interface FilterState {
  search: string;
  year: string; // 'all' or '2024', '2025', etc.
  score: string; // 'all', '1', '0.75', '0.5', '0.25', '0'
  journal: string; // 'all' or journal name
  qRank: string; // 'all', 'Q1', 'Q2', etc. (source 2)
}

export interface KPISummary {
  totalArticles: number;
  totalScore: number;
  averageScore: number;
  uniqueCorrespondingAuthors: number;
  totalJournals: number;
  proofVerifiedCount: number;
}
