"use client";

import type { Prompt } from '@/types';
import { useState, useEffect, useCallback, useMemo, type DragEvent } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppHeader } from '@/components/AppHeader';
import { PromptItem } from '@/components/PromptItem';
import { EditPromptDialog } from '@/components/EditPromptDialog';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Save, ListChecks, FileText, ArrowDownUp, CalendarDays, CaseSensitive } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { generatePromptTitle } from '@/ai/flows/generatePromptTitleFlow';

const PROMPTS_STORAGE_KEY = 'orangepad-prompts'; // Renamed storage key

type SortField = 'createdAt' | 'title';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export default function HomePage() {
  const [prompts, setPrompts] = useLocalStorage<Prompt[]>(PROMPTS_STORAGE_KEY, []);
  const [newPromptText, setNewPromptText] = useState('');
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isEditDialogOpener, setIsEditDialogOpener] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [promptToDeleteId, setPromptToDeleteId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', order: 'desc' });

  const { toast } = useToast();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleAddPrompt = useCallback(async () => {
    if (!newPromptText.trim()) {
      toast({
        title: 'Empty Prompt',
        description: 'Cannot save an empty prompt.',
        variant: 'destructive',
      });
      return;
    }

    let title = 'Untitled Prompt';
    const loadingToast = toast({ title: 'Saving prompt...', description: 'Generating title, please wait.' });
    
    try {
      const titleResult = await generatePromptTitle({ promptText: newPromptText.trim() });
      title = titleResult.title;
    } catch (error) {
      console.error('Failed to generate title for new prompt:', error);
      toast({
        title: 'Title Generation Failed',
        description: 'Using a default title for now.',
        variant: 'destructive',
      });
    } finally {
        loadingToast.dismiss();
    }

    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      text: newPromptText.trim(),
      title: title,
      createdAt: Date.now(),
    };
    setPrompts((prevPrompts) => [newPrompt, ...prevPrompts]);
    setNewPromptText('');
    toast({
      title: 'Prompt Saved!',
      description: `"${title}" has been successfully saved.`,
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
  
  const handleSaveEditedPrompt = useCallback(async (data: { id: string; text: string }) => {
    const promptToUpdate = prompts.find(p => p.id === data.id);
    if (!promptToUpdate) return;

    let newTitle = promptToUpdate.title;
    let titleChanged = false;

    if (promptToUpdate.text !== data.text) {
      const loadingToast = toast({ title: 'Updating prompt...', description: 'Regenerating title, please wait.' });
      try {
        const titleResult = await generatePromptTitle({ promptText: data.text });
        newTitle = titleResult.title;
        titleChanged = true;
      } catch (error) {
        console.error('Failed to generate title on edit:', error);
        toast({
          title: 'Title Regeneration Failed',
          description: 'Could not update title. Using previous title.',
          variant: 'destructive',
        });
      } finally {
        loadingToast.dismiss();
      }
    }

    const updatedPrompt: Prompt = {
      ...promptToUpdate,
      text: data.text,
      title: newTitle || 'Untitled Prompt',
    };

    setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
    setEditingPrompt(null); // Also closes dialog if onOpenChange is linked
    setIsEditDialogOpener(false); // Explicitly close dialog
    toast({
      title: 'Prompt Updated!',
      description: `"${updatedPrompt.title}" has been successfully updated. ${titleChanged ? '(Title also updated)' : ''}`,
    });
  }, [prompts, setPrompts, toast]);

  const confirmDeletePrompt = useCallback((promptId: string) => {
    setPromptToDeleteId(promptId);
  }, []);

  const handleDeletePrompt = useCallback(() => {
    if (!promptToDeleteId) return;
    const promptToDelete = prompts.find(p => p.id === promptToDeleteId);
    setPrompts((prevPrompts) => prevPrompts.filter((p) => p.id !== promptToDeleteId));
    toast({
      title: 'Prompt Deleted!',
      description: `"${promptToDelete?.title || 'The prompt'}" has been removed.`,
      variant: 'destructive'
    });
    setPromptToDeleteId(null);
  }, [promptToDeleteId, prompts, setPrompts, toast]);


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

  const sortedPrompts = useMemo(() => {
    if (!hydrated) return [];
    const list = [...prompts];
    list.sort((a, b) => {
      let comparison = 0;
      const titleA = a.title || 'Untitled Prompt';
      const titleB = b.title || 'Untitled Prompt';

      if (sortConfig.field === 'title') {
        comparison = titleA.localeCompare(titleB);
      } else { // createdAt
        comparison = a.createdAt - b.createdAt;
      }
      return sortConfig.order === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [hydrated, prompts, sortConfig]);

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
      <main className="w-full max-w-4xl space-y-8"> {/* Increased max-width for tile view */}
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center text-2xl text-primary">
                <ListChecks className="w-6 h-6 mr-2" /> Saved Prompts
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Label htmlFor="sort-field" className="text-sm text-muted-foreground">Sort by:</Label>
                <Select
                  value={sortConfig.field}
                  onValueChange={(value) => setSortConfig(prev => ({ ...prev, field: value as SortField }))}
                >
                  <SelectTrigger id="sort-field" className="w-[150px] h-9">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt"><CalendarDays className="inline-block w-4 h-4 mr-2" />Date Saved</SelectItem>
                    <SelectItem value="title"><CaseSensitive className="inline-block w-4 h-4 mr-2" />Title</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={sortConfig.order}
                  onValueChange={(value) => setSortConfig(prev => ({ ...prev, order: value as SortOrder }))}
                >
                  <SelectTrigger id="sort-order" className="w-[120px] h-9">
                     <SelectValue placeholder="Select order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => setSortConfig(prev => ({ ...prev, order: prev.order === 'asc' ? 'desc' : 'asc' }))} className="h-9 w-9">
                    <ArrowDownUp className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sortedPrompts.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">No prompts saved yet. Add your first one!</p>
            ) : (
              <ScrollArea className="h-[600px] pr-2"> {/* Adjust height as needed */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        onOpenChange={(isOpen) => {
            setIsEditDialogOpener(isOpen);
            if (!isOpen) setEditingPrompt(null); // Clear editing prompt when dialog closes
        }}
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
        <p>&copy; {new Date().getFullYear()} OrangePad. All rights reserved.</p>
      </footer>
    </div>
  );
}
