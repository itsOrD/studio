
"use client";

import type { Prompt, TagBeingEdited } from '@/types';
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
import { Save, ListChecks, FileText, ArrowDownUp, CalendarDays, CaseSensitive, TagsIcon, PencilIcon, Copy as CopyIcon, Clone as CloneIcon, Activity, Clock, Heart } from 'lucide-react';
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

const PROMPTS_STORAGE_KEY = 'orangepad-prompts';
const INITIAL_UNTITLED_PROMPT = "Untitled Prompt";
const FAVORITES_FILTER_KEY = "❤️ Favorites";

type SortField = 'createdAt' | 'title' | 'useCount' | 'lastCopiedAt';
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
  const [activeTag, setActiveTag] = useState<string | null>(null); // Can be a tag string or FAVORITES_FILTER_KEY
  const [tagBeingRenamed, setTagBeingRenamed] = useState<TagBeingEdited | null>(null);
  const [newTagNameForDialog, setNewTagNameForDialog] = useState('');

  const { toast } = useToast();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Initialize prompts with default values for new fields
    setPrompts(prev => prev.map(p => ({
      ...p,
      tags: Array.isArray(p.tags) ? p.tags : [],
      isFavorite: p.isFavorite ?? false,
      isGeneratingDetails: p.isGeneratingDetails ?? false,
      history: Array.isArray(p.history) ? p.history : [],
      useCount: p.useCount ?? 0,
      customTitle: p.customTitle ?? false,
      // lastCopiedAt is handled if it exists or remains undefined
    })));
    setHydrated(true);
  }, [setPrompts]);

  const triggerAIGeneration = useCallback(async (promptId: string, text: string, isCustomTitle: boolean, currentTitle?: string) => {
    try {
      const titlePromise = isCustomTitle ? Promise.resolve({ title: currentTitle || INITIAL_UNTITLED_PROMPT }) : generatePromptTitle({ promptText: text });
      const [titleResult, tagsResult] = await Promise.all([
        titlePromise,
        generatePromptTags({ promptText: text })
      ]);
      
      setPrompts(prev => prev.map(p => {
        if (p.id === promptId) {
          return { 
            ...p, 
            title: titleResult.title, 
            tags: tagsResult.tags || [], 
            isGeneratingDetails: false,
            customTitle: isCustomTitle // Preserve custom title status
          };
        }
        return p;
      }));

      if (!isCustomTitle || (tagsResult.tags && tagsResult.tags.length > 0)) {
        toast({
          title: 'Details Generated!',
          description: `Title ${isCustomTitle ? ' (custom)' : ''} and tags updated for "${titleResult.title}".`,
        });
      }

    } catch (error) {
      console.error('Failed to generate title or tags:', error);
      setPrompts(prev => prev.map(p => p.id === promptId ? { ...p, isGeneratingDetails: false, title: currentTitle || INITIAL_UNTITLED_PROMPT, customTitle: isCustomTitle } : p));
      toast({
        title: 'AI Generation Failed',
        description: 'Could not generate title/tags. Using default/previous values.',
        variant: 'destructive',
      });
    }
  }, [setPrompts, toast]);


  const handleAddPrompt = useCallback(async () => {
    if (!newPromptText.trim()) {
      toast({
        title: 'Empty Prompt',
        description: 'Cannot save an empty prompt.',
        variant: 'destructive',
      });
      return;
    }

    const tempId = crypto.randomUUID();
    const newPromptItem: Prompt = {
      id: tempId,
      text: newPromptText.trim(),
      title: INITIAL_UNTITLED_PROMPT,
      tags: [],
      createdAt: Date.now(),
      isFavorite: false,
      isGeneratingDetails: true,
      history: [],
      useCount: 0,
      customTitle: false,
    };

    setPrompts((prevPrompts) => [newPromptItem, ...prevPrompts]);
    const currentText = newPromptText.trim();
    setNewPromptText('');
    
    toast({
      title: 'Prompt Saved!',
      description: `Saving "${currentText.substring(0,30)}..." and generating details.`,
    });

    triggerAIGeneration(tempId, currentText, false, INITIAL_UNTITLED_PROMPT);

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

    const originalText = promptToUpdate.text;
    const originalTitle = promptToUpdate.title;
    const textChanged = originalText !== data.text;
    const titleChanged = originalTitle !== data.title;
    const newCustomTitleState = titleChanged ? true : promptToUpdate.customTitle;

    setPrompts(prev => prev.map(p => {
      if (p.id === data.id) {
        const newHistory = p.history ? [...p.history] : [];
        if (textChanged && originalText) { 
          newHistory.unshift({ text: originalText, editedAt: Date.now() });
        }
        return {
          ...p,
          text: data.text,
          title: data.title, // Update title from dialog
          customTitle: newCustomTitleState,
          isGeneratingDetails: textChanged, 
          history: newHistory.slice(0, 10), 
        };
      }
      return p;
    }));
    
    setEditingPrompt(null);
    setIsEditDialogOpener(false);

    if (textChanged) {
      toast({
        title: 'Prompt Updated!',
        description: `"${data.title.substring(0,30)}..." saved. Regenerating details if needed.`,
      });
      triggerAIGeneration(data.id, data.text, newCustomTitleState, data.title);
    } else if (titleChanged) {
       toast({
        title: 'Prompt Title Updated!',
        description: `Title changed to "${data.title.substring(0,30)}...".`,
      });
      // If only title changed, and text did not, we might still want to regenerate tags IF title was AI generated before
      // For simplicity now, if text didn't change, we assume tags are still relevant enough or user can edit text to re-trigger tag AI.
      // Or, we could explicitly re-trigger only tags if old title was not custom.
      // For now, only text change triggers AI.
    } else {
       toast({
        title: 'Prompt Saved',
        description: 'No changes detected.',
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
      return;
    }
    const { promptId, oldTag } = tagBeingRenamed;
    const newTagCleaned = newTagNameForDialog.trim().toLowerCase();

    setPrompts(prev => prev.map(p => {
      if (p.id === promptId) {
        const existingTags = p.tags || [];
        if (existingTags.includes(newTagCleaned) && newTagCleaned !== oldTag) {
            toast({title: "Tag Exists", description: `Tag "${newTagCleaned}" already exists on this prompt. Removing "${oldTag}".`, variant: "default"});
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
      useCount: 0, // Reset use count for duplicated prompt
      customTitle: promptToDuplicate.customTitle, // Preserve custom title status
      // lastCopiedAt is not copied
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
    const sortedTags = Array.from(tagsSet).sort();
    return hasFavorites ? [FAVORITES_FILTER_KEY, ...sortedTags] : sortedTags;
  }, [hydrated, prompts]);

  const sortedPrompts = useMemo(() => {
    if (!hydrated) return [];
    let list = [...prompts];

    if (activeTag) {
      if (activeTag === FAVORITES_FILTER_KEY) {
        list = list.filter(p => p.isFavorite);
      } else {
        list = list.filter(p => (p.tags || []).includes(activeTag));
      }
    }

    list.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      let comparison = 0;
      const valA = a[sortConfig.field] ?? (sortConfig.field === 'title' ? INITIAL_UNTITLED_PROMPT : 0);
      const valB = b[sortConfig.field] ?? (sortConfig.field === 'title' ? INITIAL_UNTITLED_PROMPT : 0);
      
      if (sortConfig.field === 'title') {
        comparison = String(valA).localeCompare(String(valB));
      } else { // createdAt, useCount, lastCopiedAt (numeric, higher is better for desc)
        comparison = (Number(valB) || 0) - (Number(valA) || 0);
      }
      return sortConfig.order === 'asc' ? -comparison : comparison; // Invert for asc if original was B-A
    });
    return list;
  }, [hydrated, prompts, sortConfig, activeTag]);

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
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                <Label htmlFor="sort-field" className="text-sm text-muted-foreground">Sort by:</Label>
                <Select
                  value={sortConfig.field}
                  onValueChange={(value) => setSortConfig(prev => ({ ...prev, field: value as SortField }))}
                >
                  <SelectTrigger id="sort-field" className="w-[170px] h-9">
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
            {uniqueTagsForFiltering.length > 0 && (
              <div className="mt-4">
                <Label className="text-sm text-muted-foreground flex items-center mb-1"><TagsIcon className="w-4 h-4 mr-1.5"/>Filter by Tag:</Label>
                <Tabs defaultValue="all" onValueChange={(value) => setActiveTag(value === 'all' ? null : value)} className="w-full">
                  <TabsList className="flex-wrap h-auto justify-start">
                    <TabsTrigger value="all">All Prompts</TabsTrigger>
                    {uniqueTagsForFiltering.map(tag => (
                      <TabsTrigger key={tag} value={tag}>
                        {tag === FAVORITES_FILTER_KEY ? <Heart className="w-4 h-4 mr-1 text-primary" /> : null}
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
              <p className="text-center text-muted-foreground py-10">
                {activeTag ? `No prompts found for "${activeTag}".` : "No prompts saved yet. Add your first one!"}
              </p>
            ) : (
              <ScrollArea className="h-[600px] pr-2"> 
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setTagBeingRenamed(null); setNewTagNameForDialog(''); }}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmRenameTagOnPrompt} disabled={!newTagNameForDialog.trim() || newTagNameForDialog.trim().toLowerCase() === tagBeingRenamed.oldTag.toLowerCase()}>
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
