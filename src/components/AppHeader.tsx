
import { NotebookPen } from 'lucide-react';
import { ThemeToggleDropdown } from './ThemeToggleDropdown'; // Import the toggle

export function AppHeader() {
  return (
    <header className="w-full py-6 mb-8">
      <div className="flex items-center justify-center relative">
        <div className="flex items-center">
          <NotebookPen className="w-10 h-10 mr-3 text-primary" />
          <h1 className="text-4xl font-bold text-primary">
            OrangePad
          </h1>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <ThemeToggleDropdown />
        </div>
      </div>
      <p className="mt-2 text-lg text-muted-foreground text-center">
        Craft, store, and manage your prompts with a zesty twist!
      </p>
    </header>
  );
}
