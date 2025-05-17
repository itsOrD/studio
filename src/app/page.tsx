"use client";

import type { Prompt } from '@/types';
import { useState, useEffect, useCallback, type DragEvent } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppHeader } from '@/components/AppHeader';
import { PromptItem } from '@/components/PromptItem';
import { EditPromptDialog } from '@/components/EditPromptDialog';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, ListChecks, FileText } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


const PROMPTS_STORAGE_KEY = 'promptverse-prompts';

export default function HomePage() {
  const [prompts, setPrompts] = useLocalStorage<Prompt[]>(PROMPTS_STORAGE_KEY, []);
  const [newPromptText, setNewPromptText] = useState('');
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isEditDialogOpener, setIsEditDialogOpener] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [promptToDeleteId, setPromptToDeleteId] = useState<string | null>(null);


  const { toast } = useToast();

  // Hydration safety: Ensure client-side state for prompts is synced after mount
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleAddPrompt = useCallback(() => {
    if (!newPromptText.trim()) {
      toast({
        title: 'Empty Prompt',
        description: 'Cannot save an empty prompt.',
        variant: 'destructive',
      });
      return;
    }
    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      text: newPromptText.trim(),
      createdAt: Date.now(),
    };
    setPrompts((prevPrompts) => [newPrompt, ...prevPrompts]);
    setNewPromptText('');
    toast({
      title: 'Prompt Saved!',
      description: 'Your new prompt has been successfully saved.',
    });
  }, [newPromptText, setPrompts, toast]);

  const handleCopyPrompt = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to Clipboard!',
        description: 'Prompt text has been copied.',
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: 'Copy Failed',
        description: 'Could not copy text to clipboard.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleOpenEditDialog = useCallback((prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsEditDialogOpener(true);
  }, []);
  
  const handleSaveEditedPrompt = useCallback((updatedPrompt: Prompt) => {
    setPrompts((prevPrompts) =>
      prevPrompts.map((p) => (p.id === updatedPrompt.id ? updatedPrompt : p))
    );
    toast({
      title: 'Prompt Updated!',
      description: 'Your prompt has been successfully updated.',
    });
  }, [setPrompts, toast]);

  const confirmDeletePrompt = useCallback((promptId: string) => {
    setPromptToDeleteId(promptId);
  }, []);

  const handleDeletePrompt = useCallback(() => {
    if (!promptToDeleteId) return;
    setPrompts((prevPrompts) => prevPrompts.filter((p) => p.id !== promptToDeleteId));
    toast({
      title: 'Prompt Deleted!',
      description: 'The prompt has been removed.',
      variant: 'destructive'
    });
    setPromptToDeleteId(null);
  }, [promptToDeleteId, setPrompts, toast]);


  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedText = event.dataTransfer.getData('text/plain');
    if (droppedText) {
      setNewPromptText(droppedText);
      toast({
        title: 'Text Dropped!',
        description: 'Dropped text loaded into input area. Click "Save Prompt" to store it.',
      });
    }
  };

  const sortedPrompts = hydrated ? [...prompts].sort((a, b) => b.createdAt - a.createdAt) : [];

  if (!hydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-background text-foreground">
        <AppHeader />
        <p>Loading prompts...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-8 bg-background text-foreground">
      <AppHeader />
      <main className="w-full max-w-3xl space-y-8">
        <Card 
          className={`w-full shadow-lg transition-all duration-300 ${isDragging ? 'border-primary ring-2 ring-primary' : 'border-input'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-primary">
              <FileText className="w-6 h-6 mr-2" /> Create New Prompt
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isDragging ? "Release to drop text!" : "Drag & drop text here, or type below."}
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter or drop your prompt here..."
              value={newPromptText}
              onChange={(e) => setNewPromptText(e.target.value)}
              className={`w-full min-h-[120px] text-base bg-input border-input focus:ring-primary transition-all duration-300 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
              aria-label="New prompt input"
            />
            <Button onClick={handleAddPrompt} className="mt-4 w-full md:w-auto transition-transform active:scale-95" disabled={!newPromptText.trim()}>
              <Save className="w-4 h-4 mr-2" /> Save Prompt
            </Button>
          </CardContent>
        </Card>

        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-primary">
              <ListChecks className="w-6 h-6 mr-2" /> Saved Prompts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedPrompts.length === 0 ? (
              <p className="text-center text-muted-foreground">No prompts saved yet. Add your first one!</p>
            ) : (
              <ScrollArea className="h-[400px] pr-2"> {/* Adjust max height as needed */}
                <div className="space-y-4">
                  {sortedPrompts.map((prompt) => (
                    <PromptItem
                      key={prompt.id}
                      prompt={prompt}
                      onCopy={handleCopyPrompt}
                      onEdit={handleOpenEditDialog}
                      onDelete={confirmDeletePrompt}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </main>

      <EditPromptDialog
        prompt={editingPrompt}
        isOpen={isEditDialogOpener}
        onOpenChange={setIsEditDialogOpener}
        onSave={handleSaveEditedPrompt}
      />

      <AlertDialog open={!!promptToDeleteId} onOpenChange={(open) => !open && setPromptToDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the prompt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPromptToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePrompt} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Yes, delete prompt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="py-8 mt-12 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} PromptVerse. All rights reserved.</p>
      </footer>
    </div>
  );
}
