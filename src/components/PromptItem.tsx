
"use client";

import type { Prompt, TagBeingEdited } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Edit3, Trash2, Tag, GripVertical, XIcon, PencilIcon } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useState } from 'react';

interface PromptItemProps {
  prompt: Prompt;
  onCopy: (text: string) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (promptId: string) => void;
  onRemoveTag: (promptId: string, tagToRemove: string) => void;
  onRenameTagRequest: (promptId: string, oldTag: string) => void; // Triggers rename dialog
}

export function PromptItem({ prompt, onCopy, onEdit, onDelete, onRemoveTag, onRenameTagRequest }: PromptItemProps) {
  const formattedDate = new Date(prompt.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const [popoverOpenState, setPopoverOpenState] = useState<Record<string, boolean>>({});
  const [renamingTagValue, setRenamingTagValue] = useState('');


  const handleTagPopoverOpenChange = (tag: string, isOpen: boolean) => {
    setPopoverOpenState(prev => ({ ...prev, [tag]: isOpen }));
    if (isOpen) {
      setRenamingTagValue(tag); // Pre-fill input with current tag name
    }
  };

  const handleRenameTagConfirm = (promptId: string, oldTag: string) => {
    if (renamingTagValue.trim() && renamingTagValue.trim() !== oldTag) {
       onRenameTagRequest(promptId, oldTag); // This will trigger the dialog in parent
       // The actual rename (passing new value) will be handled by the parent dialog
    }
    setPopoverOpenState(prev => ({ ...prev, [oldTag]: false }));
  };
  

  return (
    <Card className="flex flex-col h-full shadow-md bg-card hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-primary truncate" title={prompt.title || "Untitled Prompt"}>
          {prompt.title || "Untitled Prompt"}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">Saved: {formattedDate}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-3 space-y-2">
        <ScrollArea className="h-28 pr-3">
          <p className="text-sm whitespace-pre-wrap text-foreground">
            {prompt.text}
          </p>
        </ScrollArea>
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {prompt.tags.map((tag) => (
              <Popover key={tag} open={popoverOpenState[tag]} onOpenChange={(isOpen) => handleTagPopoverOpenChange(tag, isOpen)}>
                <PopoverTrigger asChild>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-accent hover:text-accent-foreground group">
                    {tag}
                    <GripVertical className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100" />
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 space-y-2" side="bottom" align="start">
                  <p className="text-sm font-medium text-center">Manage Tag: "{tag}"</p>
                   <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      onRenameTagRequest(prompt.id, tag);
                      handleTagPopoverOpenChange(tag, false); // Close popover
                    }}
                  >
                    <PencilIcon className="w-3 h-3 mr-1" /> Rename
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      onRemoveTag(prompt.id, tag);
                      handleTagPopoverOpenChange(tag, false); // Close popover
                    }}
                  >
                    <XIcon className="w-3 h-3 mr-1" /> Remove from Prompt
                  </Button>
                </PopoverContent>
              </Popover>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-3 mt-auto">
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onCopy(prompt.text)} aria-label="Copy prompt">
                <Copy className="w-5 h-5 text-accent" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground">
              <p>Copy</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onEdit(prompt)} aria-label="Edit prompt">
                <Edit3 className="w-5 h-5 text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground">
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onDelete(prompt.id)} aria-label="Delete prompt">
                <Trash2 className="w-5 h-5 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground">
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
