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
import { Label } from '@/components/ui/label';

interface EditPromptDialogProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (updatedPrompt: Prompt) => void;
}

export function EditPromptDialog({ prompt, isOpen, onOpenChange, onSave }: EditPromptDialogProps) {
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (prompt) {
      setEditText(prompt.text);
    }
  }, [prompt]);

  const handleSave = () => {
    if (prompt && editText.trim()) {
      onSave({ ...prompt, text: editText.trim() });
      onOpenChange(false);
    }
  };

  if (!prompt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Prompt</DialogTitle>
          <DialogDescription>
            Make changes to your prompt below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="prompt-text" className="text-right sr-only">
              Prompt
            </Label>
            <Textarea
              id="prompt-text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="col-span-4 min-h-[100px] bg-input text-foreground placeholder:text-muted-foreground"
              placeholder="Enter your prompt text"
              aria-label="Prompt text editor"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={!editText.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
