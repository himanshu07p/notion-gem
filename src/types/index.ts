export interface NotionPage {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
}

export interface NotionDatabase {
  id: string;
  title: string;
  properties: Record<string, any>;
  entries: NotionDatabaseEntry[];
}

export interface NotionDatabaseEntry {
  id: string;
  properties: Record<string, any>;
  createdTime: Date;
  lastEditedTime: Date;
}

export interface AIAnalysisResult {
  summary: string;
  keyPoints: string[];
  suggestions: string[];
  confidence: number;
}

export interface ContentSuggestion {
  type: 'structure' | 'content' | 'formatting';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SearchResult {
  id: string;
  type: 'page' | 'database';
  title: string;
  relevanceScore: number;
  snippet: string;
}
