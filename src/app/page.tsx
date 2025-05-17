
"use client";

import type { Prompt, TagBeingEdited, SortConfig, SortField, SortOrder } from '@/types'; // Added SortConfig, SortField, SortOrder
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, ListChecks, FileText, ArrowDownUp, CalendarDays, CaseSensitive, TagsIcon, PencilIcon, Activity, Clock } from 'lucide-react';
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
import { generatePromptTags } from '@/ai/flows/generatePromptTagsFlow';
import { sortPrompts as sortPromptsUtility } from '@/lib/sortPromptsUtility';

const PROMPTS_STORAGE_KEY = 'orangepad-prompts';
export const INITIAL_UNTITLED_PROMPT = "Untitled Prompt";
export const FAVORITES_FILTER_KEY = "🍊 Favorites";
const MAX_PROMPT_TEXT_LENGTH = 15000; // Maximum characters for the prompt text area

export default function HomePage() {
  const [prompts, setPrompts] = useLocalStorage<Prompt[]>(PROMPTS_STORAGE_KEY, []);
  const [newPromptText, setNewPromptText] = useState('');
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isEditDialogOpener, setIsEditDialogOpener] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [promptToDeleteId, setPromptToDeleteId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', order: 'desc' });
  const [activeTag, setActiveTag] = useState<string | null>(null); 
  const [tagBeingRenamed, setTagBeingRenamed] = useState<TagBeingEdited | null>(null);
  const [newTagNameForDialog, setNewTagNameForDialog] = useState('');

  const { toast } = useToast();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPrompts(prev => prev.map(p => ({
      ...p,
      title: p.title || INITIAL_UNTITLED_PROMPT,
      tags: Array.isArray(p.tags) ? p.tags : [],
      isFavorite: p.isFavorite ?? false,
      isGeneratingDetails: p.isGeneratingDetails ?? false,
      history: Array.isArray(p.history) ? p.history : [],
      useCount: p.useCount ?? 0,
      lastCopiedAt: p.lastCopiedAt ?? 0,
      customTitle: p.customTitle ?? false,
    })));
    setHydrated(true);
  }, [setPrompts]);

  const triggerAIGeneration = useCallback(async (promptId: string, text: string, isCustomTitle: boolean, currentTitle?: string, textChanged: boolean = true) => {
    setPrompts(prev => prev.map(p => 
      p.id === promptId ? { ...p, isGeneratingDetails: true, title: isCustomTitle ? (currentTitle || p.title) : INITIAL_UNTITLED_PROMPT, tags: textChanged ? [] : p.tags } : p
    ));

    try {
      const titlePromise = isCustomTitle && !textChanged ? Promise.resolve({ title: currentTitle || INITIAL_UNTITLED_PROMPT }) : generatePromptTitle({ promptText: text });
      const tagsPromise = textChanged ? generatePromptTags({ promptText: text }) : Promise.resolve({ tags: prompts.find(p=>p.id===promptId)?.tags || [] });
      
      const [titleResult, tagsResult] = await Promise.all([
        titlePromise,
        tagsPromise
      ]);
      
      setPrompts(prev => prev.map(p => {
        if (p.id === promptId) {
          return { 
            ...p, 
            title: titleResult.title || (isCustomTitle ? currentTitle : INITIAL_UNTITLED_PROMPT), 
            tags: tagsResult.tags || [], 
            isGeneratingDetails: false,
            customTitle: isCustomTitle 
          };
        }
        return p;
      }));

      toast({
        title: 'AI Details Updated!',
        description: `Title ${isCustomTitle ? '(custom)' : ''} and tags finalized for "${titleResult.title || currentTitle}".`,
      });

    } catch (error) {
      console.error('Failed to generate title or tags:', error);
      setPrompts(prev => prev.map(p => p.id === promptId ? { ...p, isGeneratingDetails: false, title: currentTitle || (isCustomTitle ? p.title : INITIAL_UNTITLED_PROMPT), customTitle: isCustomTitle } : p));
      toast({
        title: 'AI Generation Failed',
        description: 'Could not generate title/tags. Using default/previous values.',
        variant: 'destructive',
      });
    }
  }, [setPrompts, toast, prompts]);


  const handleAddPrompt = useCallback(async () => {
    const trimmedText = newPromptText.trim();
    if (!trimmedText) {
      toast({ title: 'Empty Prompt', description: 'Cannot save an empty prompt.', variant: 'destructive' });
      return;
    }
    if (trimmedText.length > MAX_PROMPT_TEXT_LENGTH) {
        toast({ title: 'Prompt Too Long', description: `Prompt text cannot exceed ${MAX_PROMPT_TEXT_LENGTH} characters.`, variant: 'destructive' });
        return;
    }

    const tempId = crypto.randomUUID();
    const newPromptItem: Prompt = {
      id: tempId,
      text: trimmedText,
      title: INITIAL_UNTITLED_PROMPT,
      tags: [],
      createdAt: Date.now(),
      isFavorite: false,
      isGeneratingDetails: true,
      history: [],
      useCount: 0,
      lastCopiedAt: 0,
      customTitle: false,
    };

    setPrompts((prevPrompts) => [newPromptItem, ...prevPrompts]);
    const currentText = newPromptText.trim();
    setNewPromptText('');
    
    toast({
      title: 'Prompt Saved!',
      description: `Saving "${currentText.substring(0,30)}..." and generating details.`,
    });

    triggerAIGeneration(tempId, currentText, false, INITIAL_UNTITLED_PROMPT, true);

  }, [newPromptText, setPrompts, toast, triggerAIGeneration]);

  const handleCopyPrompt = useCallback(async (promptId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setPrompts(prev => prev.map(p => p.id === promptId ? { ...p, lastCopiedAt: Date.now(), useCount: (p.useCount || 0) + 1 } : p));
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
  }, [setPrompts, toast]);

  const handleOpenEditDialog = useCallback((prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsEditDialogOpener(true);
  }, []);
  
  const handleSaveEditedPrompt = useCallback(async (data: { id: string; text: string; title: string }) => {
    const promptToUpdate = prompts.find(p => p.id === data.id);
    if (!promptToUpdate) return;

    if (data.text.trim().length > MAX_PROMPT_TEXT_LENGTH) {
        toast({ title: 'Prompt Too Long', description: `Prompt text cannot exceed ${MAX_PROMPT_TEXT_LENGTH} characters.`, variant: 'destructive' });
        return;
    }
    
    const originalText = promptToUpdate.text;
    const textChanged = originalText !== data.text.trim();
    const titleChangedManually = promptToUpdate.title !== data.title.trim() && data.title.trim() !== "";
    
    const newCustomTitleState = titleChangedManually ? true : (textChanged ? false : promptToUpdate.customTitle);
    const newTitle = titleChangedManually ? data.title.trim() : (textChanged ? INITIAL_UNTITLED_PROMPT : promptToUpdate.title);

    setPrompts(prev => prev.map(p => {
      if (p.id === data.id) {
        const newHistory = p.history ? [...p.history] : [];
        if (textChanged && originalText) { 
          newHistory.unshift({ text: originalText, editedAt: Date.now() });
        }
        return {
          ...p,
          text: data.text.trim(),
          title: newTitle,
          customTitle: newCustomTitleState,
          isGeneratingDetails: textChanged,
          history: newHistory.slice(0, 10),
        };
      }
      return p;
    }));
    
    setEditingPrompt(null);
    setIsEditDialogOpener(false);

    if (textChanged || titleChangedManually) {
      toast({
        title: 'Prompt Updated!',
        description: `"${newTitle.substring(0,30)}..." saved. ${textChanged ? 'Regenerating details.' : ''}`,
      });
      triggerAIGeneration(data.id, data.text.trim(), newCustomTitleState, newTitle, textChanged);
    } else {
       toast({
        title: 'Prompt Saved',
        description: 'No changes detected to text or title.',
      });
    }
  }, [prompts, setPrompts, toast, triggerAIGeneration]);

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

  const handleRemoveTagFromPrompt = useCallback((promptId: string, tagToRemove: string) => {
    setPrompts(prev => prev.map(p => {
      if (p.id === promptId) {
        return { ...p, tags: (p.tags || []).filter(tag => tag !== tagToRemove) };
      }
      return p;
    }));
    toast({ title: 'Tag Removed', description: `Tag "${tagToRemove}" removed from prompt.` });
  }, [setPrompts, toast]);

  const handleOpenRenameTagDialog = useCallback((promptId: string, oldTag: string) => {
    setTagBeingRenamed({ promptId, oldTag, currentValue: oldTag });
    setNewTagNameForDialog(oldTag);
  }, []);
  
  const handleConfirmRenameTagOnPrompt = useCallback(() => {
    if (!tagBeingRenamed || !newTagNameForDialog.trim()) {
      toast({ title: "Rename Canceled", description: "New tag name cannot be empty.", variant: "destructive" });
      setTagBeingRenamed(null);
      setNewTagNameForDialog('');
      return;
    }
    const { promptId, oldTag } = tagBeingRenamed;
    const newTagCleaned = newTagNameForDialog.trim().toLowerCase();

    setPrompts(prev => prev.map(p => {
      if (p.id === promptId) {
        const existingTags = p.tags || [];
        if (existingTags.includes(newTagCleaned) && newTagCleaned !== oldTag.toLowerCase()) {
            toast({title: "Tag Merged", description: `Tag "${oldTag}" merged into existing tag "${newTagCleaned}".`, variant: "default"});
            return { ...p, tags: existingTags.filter(t => t !== oldTag) };
        }
        return {
          ...p,
          tags: existingTags.map(t => t === oldTag ? newTagCleaned : t).filter((tag, index, self) => self.indexOf(tag) === index)
        };
      }
      return p;
    }));
    toast({ title: 'Tag Renamed', description: `Tag "${oldTag}" renamed to "${newTagCleaned}" on prompt.` });
    setTagBeingRenamed(null);
    setNewTagNameForDialog('');
  }, [tagBeingRenamed, newTagNameForDialog, setPrompts, toast]);

  const handleToggleFavorite = useCallback((promptId: string) => {
    setPrompts(prev => prev.map(p => p.id === promptId ? { ...p, isFavorite: !p.isFavorite } : p));
    const prompt = prompts.find(p => p.id === promptId);
    if (prompt) {
        toast({
            title: prompt.isFavorite ? 'Unfavorited' : 'Favorited!',
            description: `"${prompt.title}" ${prompt.isFavorite ? 'removed from' : 'added to'} favorites.`,
        });
    }
  }, [prompts, setPrompts, toast]);

  const handleDuplicatePrompt = useCallback((promptId: string) => {
    const promptToDuplicate = prompts.find(p => p.id === promptId);
    if (!promptToDuplicate) return;

    const duplicatedPrompt: Prompt = {
      ...promptToDuplicate,
      id: crypto.randomUUID(),
      title: `${promptToDuplicate.title} (Copy)`,
      createdAt: Date.now(),
      isGeneratingDetails: false,
      history: [],
      useCount: 0,
      lastCopiedAt: 0,
      customTitle: promptToDuplicate.customTitle, 
    };
    setPrompts(prev => [duplicatedPrompt, ...prev]);
    toast({
        title: "Prompt Duplicated",
        description: `"${duplicatedPrompt.title}" created.`
    });
  }, [prompts, setPrompts, toast]);


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
      if (droppedText.length > MAX_PROMPT_TEXT_LENGTH) {
          toast({ title: 'Text Too Long', description: `Dropped text exceeds ${MAX_PROMPT_TEXT_LENGTH} characters and was not loaded.`, variant: 'destructive' });
          return;
      }
      setNewPromptText(droppedText);
      toast({
        title: 'Text Dropped!',
        description: 'Dropped text loaded into input area. Click "Save Prompt" to store it.',
      });
    }
  };

  const uniqueTagsForFiltering = useMemo(() => {
    if (!hydrated) return [];
    const tagsSet = new Set<string>();
    let hasFavorites = false;
    prompts.forEach(prompt => {
      if (prompt.isFavorite) hasFavorites = true;
      (prompt.tags || []).forEach(tag => tagsSet.add(tag));
    });
    const sortedTags = Array.from(tagsSet).sort((a,b) => a.localeCompare(b));
    return hasFavorites ? [FAVORITES_FILTER_KEY, ...sortedTags] : sortedTags;
  }, [hydrated, prompts]);

  const sortedPrompts = useMemo(() => {
    if (!hydrated) return [];
    return sortPromptsUtility(prompts, sortConfig, activeTag, INITIAL_UNTITLED_PROMPT, FAVORITES_FILTER_KEY);
  }, [hydrated, prompts, sortConfig, activeTag]);

  const isSaveDisabled = !newPromptText.trim() || newPromptText.length > MAX_PROMPT_TEXT_LENGTH;

  if (!hydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-background text-foreground">
        <AppHeader />
        <p>Loading OrangePad...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-8 bg-background text-foreground">
      <AppHeader />
      <main className="w-full max-w-5xl space-y-8">
        <Card 
          className={`w-full shadow-lg transition-all duration-300 ${isDragging ? 'border-accent ring-2 ring-accent' : 'border-input'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          data-testid="new-prompt-card"
        >
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-primary">
              <FileText className="w-6 h-6 mr-2" /> Create New Prompt
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isDragging ? "Release to drop text!" : `Drag & drop text here, or type below (max ${MAX_PROMPT_TEXT_LENGTH} chars).`}
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter or drop your prompt here..."
              value={newPromptText}
              onChange={(e) => setNewPromptText(e.target.value)}
              className={`w-full min-h-[120px] text-base bg-input border-input focus:ring-primary transition-all duration-300 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
              aria-label="New prompt input"
              data-testid="new-prompt-textarea"
              maxLength={MAX_PROMPT_TEXT_LENGTH + 100} // Allow some leeway for typing before triggering error for better UX
            />
            {newPromptText.length > MAX_PROMPT_TEXT_LENGTH && (
                <p className="text-xs text-destructive mt-1">
                    Prompt text exceeds {MAX_PROMPT_TEXT_LENGTH} characters. Current: {newPromptText.length}.
                </p>
            )}
            <Button 
              onClick={handleAddPrompt} 
              className="mt-4 w-full md:w-auto transition-transform active:scale-95 btn-important-action" 
              disabled={isSaveDisabled}
              data-testid="save-prompt-button"
            >
              <Save className="w-4 h-4 mr-2" /> Save Prompt
            </Button>
          </CardContent>
        </Card>

        <Card className="w-full shadow-lg" data-testid="saved-prompts-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center text-2xl text-primary">
                <ListChecks className="w-6 h-6 mr-2" /> Saved Prompts
              </CardTitle>
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                <Label htmlFor="sort-field" className="text-sm text-muted-foreground">Sort by:</Label>
                <Select
                  value={sortConfig.field}
                  onValueChange={(value) => setSortConfig(prev => ({ ...prev, field: value as SortField }))}
                >
                  <SelectTrigger id="sort-field" className="w-[170px] h-9" data-testid="sort-field-trigger">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt"><CalendarDays className="inline-block w-4 h-4 mr-2" />Date Saved</SelectItem>
                    <SelectItem value="title"><CaseSensitive className="inline-block w-4 h-4 mr-2" />Title</SelectItem>
                    <SelectItem value="useCount"><Activity className="inline-block w-4 h-4 mr-2" />Most Used</SelectItem>
                    <SelectItem value="lastCopiedAt"><Clock className="inline-block w-4 h-4 mr-2" />Recently Used</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={sortConfig.order}
                  onValueChange={(value) => setSortConfig(prev => ({ ...prev, order: value as SortOrder }))}
                >
                  <SelectTrigger id="sort-order" className="w-[120px] h-9" data-testid="sort-order-trigger">
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
            {uniqueTagsForFiltering.length > 0 && (
              <div className="mt-4">
                <Label className="text-sm text-muted-foreground flex items-center mb-1"><TagsIcon className="w-4 h-4 mr-1.5"/>Filter by Tag:</Label>
                <Tabs defaultValue="all" onValueChange={(value) => setActiveTag(value === 'all' ? null : value)} className="w-full">
                  <TabsList className="flex-wrap h-auto justify-start" data-testid="tag-filter-tabs">
                    <TabsTrigger value="all">All Prompts</TabsTrigger>
                    {uniqueTagsForFiltering.map(tag => (
                      <TabsTrigger key={tag} value={tag} className="flex items-center gap-1">
                        {tag === FAVORITES_FILTER_KEY ? <span role="img" aria-label="Orange emoji" className="text-[hsl(var(--primary))]">🍊</span> : null}
                        {tag}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {sortedPrompts.length === 0 ? (
              <p className="text-center text-muted-foreground py-10" data-testid="no-prompts-message">
                {activeTag ? `No prompts found for tag "${activeTag}".` : "No prompts saved yet. Add your first one!"}
              </p>
            ) : (
              <ScrollArea className="h-[calc(100vh-550px)] min-h-[300px] pr-2"> 
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="prompt-list">
                  {sortedPrompts.map((prompt) => (
                    <PromptItem
                      key={prompt.id}
                      prompt={prompt}
                      onCopy={handleCopyPrompt}
                      onEdit={handleOpenEditDialog}
                      onDelete={confirmDeletePrompt}
                      onRemoveTag={handleRemoveTagFromPrompt}
                      onRenameTagRequest={handleOpenRenameTagDialog}
                      onToggleFavorite={handleToggleFavorite}
                      onDuplicate={handleDuplicatePrompt}
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
            if (!isOpen) setEditingPrompt(null);
        }}
        onSave={handleSaveEditedPrompt}
        maxTextLength={MAX_PROMPT_TEXT_LENGTH}
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

      {tagBeingRenamed && (
        <AlertDialog open={!!tagBeingRenamed} onOpenChange={(open) => { if (!open) { setTagBeingRenamed(null); setNewTagNameForDialog(''); }}}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center"><PencilIcon className="w-5 h-5 mr-2 text-primary"/>Rename Tag</AlertDialogTitle>
              <AlertDialogDescription>
                Rename the tag "<strong>{tagBeingRenamed.oldTag}</strong>" for this prompt. This change applies only to this specific prompt.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <Label htmlFor="new-tag-name" className="text-sm font-medium">New tag name:</Label>
              <Input
                id="new-tag-name"
                value={newTagNameForDialog}
                onChange={(e) => setNewTagNameForDialog(e.target.value)}
                placeholder="Enter new tag name"
                className="mt-1"
                autoFocus
                data-testid="rename-tag-input"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setTagBeingRenamed(null); setNewTagNameForDialog(''); }}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmRenameTagOnPrompt} 
                disabled={!newTagNameForDialog.trim() || newTagNameForDialog.trim().toLowerCase() === tagBeingRenamed.oldTag.toLowerCase()}
                data-testid="confirm-rename-tag-button"
              >
                Save Name
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <footer className="py-8 mt-12 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} OrangePad. All rights reserved.</p>
      </footer>
    </div>
  );
}
