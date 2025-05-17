
import { NotebookPen } from 'lucide-react'; // Reverted icon

export function AppHeader() {
  return (
    <header className="w-full py-6 mb-8 text-center">
      <div className="flex items-center justify-center">
        <NotebookPen className="w-10 h-10 mr-3 text-primary" /> {/* Using primary color (Orange) */}
        <h1 className="text-4xl font-bold text-primary"> {/* Using primary color (Orange) */}
          OrangePad
        </h1>
      </div>
      <p className="mt-2 text-lg text-muted-foreground">
        Craft, store, and manage your prompts with a zesty twist!
      </p>
    </header>
  );
}
