export interface Prompt {
  id: string;
  title: string;
  text: string;
  createdAt: number;
  tags?: string[]; // Added tags array
}

export interface TagBeingEdited {
  promptId: string;
  oldTag: string;
  currentValue: string; // For the input field in the rename dialog
}
