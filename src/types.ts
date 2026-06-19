export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface Section {
  title: string;
  theory: string;
  example: string;
  table?: TableData;
}

export interface Chapter {
  id: string; // e.g. 'intro', 'market', 'strategy', 'org', 'ops', 'finance', 'annexes'
  title: string;
  shortTitle: string;
  icon: string; // Lucide icon name
  num: number;
  introduction: string;
  sections: Section[];
  conclusion: string;
}

export interface QuizQuestion {
  id: string;
  chapterId: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizAttempt {
  id?: number;
  chapterId: string;
  score: number;
  total: number;
  date: string;
  passed: boolean;
}

export interface SwotItem {
  id: string;
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  text: string;
}

export interface MarketingCampaign {
  slogan: string;
  channel: string;
  target: string;
  estimatedReach: number;
  conversionRate: number;
}

export interface BudgetItem {
  id: string;
  year: number; // 1, 2, 3
  revenues: number;
  cogs: number; // Cost of goods sold
  salaries: number;
  marketing: number;
  rent: number;
  other: number;
}

export interface OrgNode {
  id: string;
  name: string;
  role: string;
  department: 'Direction' | 'Marketing' | 'Commercial' | 'Opérations' | 'Finance' | 'R&D';
  parentId?: string;
}

export interface LexiconTerm {
  id?: string;
  termFr: string;
  defFr: string;
  termEn: string;
  defEn: string;
  tags: string[];
}

export interface BmcCell {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  placeholderFr: string;
  items: string[];
}
