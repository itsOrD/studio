
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
  useCount?: number; // For tracking how many times a prompt is used/copied
  // customTitle is true if the user has manually set the title, false if AI-generated or default
  customTitle?: boolean; 
}

export interface TagBeingEdited {
  promptId: string;
  oldTag: string;
  currentValue: string;
}
