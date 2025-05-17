
export interface Prompt {
  id: string;
  title: string;
  text: string;
  createdAt: number;
  tags?: string[];
  isFavorite?: boolean; // For starring/favoriting
  lastCopiedAt?: number; // For last copy history
  isGeneratingDetails?: boolean; // To indicate background AI processing
  history?: Array<{ text: string; editedAt: number }>; // Basic history placeholder
}

export interface TagBeingEdited {
  promptId: string;
  oldTag: string;
  currentValue: string;
}
