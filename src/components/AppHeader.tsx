import { BrainCircuit } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="w-full py-6 mb-8 text-center">
      <div className="flex items-center justify-center">
        <BrainCircuit className="w-10 h-10 mr-3 text-primary" />
        <h1 className="text-4xl font-bold text-primary">
          PromptVerse
        </h1>
      </div>
      <p className="mt-2 text-lg text-muted-foreground">
        Your personal space to create, store, and manage prompts with ease.
      </p>
    </header>
  );
}
