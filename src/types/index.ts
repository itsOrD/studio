

export interface Prompt {
  id: string;
  title: string;
  text: string;
  createdAt: number; // Timestamp
  tags?: string[];
  isFavorite?: boolean; 
  lastCopiedAt?: number; // Timestamp for last copy action
  isGeneratingDetails?: boolean; 
  history?: Array<{ text: string; editedAt: number }>; // Timestamp
  useCount?: number; 
  customTitle?: boolean; 
}

export interface TagBeingEdited {
  promptId: string;
  oldTag: string;
  currentValue: string;
}

// Added for clarity and use in sortPromptsUtility and HomePage
export type SortField = 'createdAt' | 'title' | 'useCount' | 'lastCopiedAt';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

    