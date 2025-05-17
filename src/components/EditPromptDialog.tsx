
"use client";

import type { Prompt } from '@/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditPromptDialogProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: { id: string; title: string; text: string }) => void;
}

export function EditPromptDialog({ prompt, isOpen, onOpenChange, onSave }: EditPromptDialogProps) {
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (prompt) {
      setEditTitle(prompt.title);
      setEditText(prompt.text);
    }
  }, [prompt]);

  const handleSave = () => {
    if (prompt && editText.trim() && editTitle.trim()) {
      onSave({ id: prompt.id, title: editTitle.trim(), text: editText.trim() });
    }
  };

  const resetState = () => {
    if (prompt) {
        setEditTitle(prompt.title);
        setEditText(prompt.text);
    }
  }

  if (!prompt) return null;

  const hasChanges = (prompt.title !== editTitle.trim() || prompt.text !== editText.trim()) && editTitle.trim() && editText.trim();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
            resetState();
        }
    }}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Prompt</DialogTitle>
          <DialogDescription>
            Make changes to your prompt. Title and tags may regenerate if text changes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="prompt-title-edit" className="text-left">
              Title
            </Label>
            <Input
              id="prompt-title-edit"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="bg-input text-foreground placeholder:text-muted-foreground"
              placeholder="Enter prompt title"
              aria-label="Prompt title editor"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prompt-text-edit" className="text-left">
              Prompt Text
            </Label>
            <Textarea
              id="prompt-text-edit"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[120px] bg-input text-foreground placeholder:text-muted-foreground"
              placeholder="Enter your prompt text"
              aria-label="Prompt text editor"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={resetState}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={!hasChanges}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
