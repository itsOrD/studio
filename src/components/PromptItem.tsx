
"use client";

import type { Prompt } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Copy, Edit3, Trash2, GripVertical, XIcon, PencilIcon, Loader2, CopyPlus as CloneIcon } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface PromptItemProps {
  prompt: Prompt;
  onCopy: (promptId: string, text: string) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (promptId: string) => void;
  onRemoveTag: (promptId: string, tagToRemove: string) => void;
  onRenameTagRequest: (promptId: string, oldTag: string) => void;
  onToggleFavorite: (promptId: string) => void;
  onDuplicate: (promptId: string) => void;
}

export function PromptItem({ 
  prompt, 
  onCopy, 
  onEdit, 
  onDelete, 
  onRemoveTag, 
  onRenameTagRequest,
  onToggleFavorite,
  onDuplicate
}: PromptItemProps) {
  const formattedDate = new Date(prompt.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const [popoverOpenState, setPopoverOpenState] = useState<Record<string, boolean>>({});

  const handleTagPopoverOpenChange = (tag: string, isOpen: boolean) => {
    setPopoverOpenState(prev => ({ ...prev, [tag]: isOpen }));
  };
  
  const lastCopiedText = prompt.lastCopiedAt && prompt.lastCopiedAt > 0
    ? `Last copied: ${new Date(prompt.lastCopiedAt).toLocaleString()}` 
    : "Not copied yet";
  
  const usageText = `Used ${prompt.useCount || 0} time(s). ${lastCopiedText}`;

  return (
    <TooltipProvider>
      <Card 
        className="flex flex-col h-full shadow-md bg-card hover:shadow-xl hover:scale-[1.02] hover:border-accent/50 transition-all duration-200 ease-in-out border"
        data-testid={`prompt-item-${prompt.id}`}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
              <div className="flex-grow min-w-0 mr-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CardTitle 
                        className="text-lg font-semibold text-primary truncate flex items-center cursor-pointer hover:underline" 
                        onClick={() => onEdit(prompt)}
                        data-testid={`prompt-item-title-${prompt.id}`}
                      >
                          {prompt.isGeneratingDetails && (prompt.title === "Untitled Prompt" || !prompt.title) ? (
                              <span className="flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating title...</span>
                          ) : (
                              <span className="truncate">{prompt.title || "Untitled Prompt"}</span> 
                          )}
                      </CardTitle>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover text-popover-foreground">
                      <p>Edit "{prompt.title || "Untitled Prompt"}"</p>
                    </TooltipContent>
                  </Tooltip>
                  <CardDescription className="text-xs text-muted-foreground">Saved: {formattedDate}</CardDescription>
              </div>
              <div className="flex items-center space-x-1 shrink-0">
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-7 h-7 opacity-70 hover:opacity-100" onClick={() => onCopy(prompt.id, prompt.text)} aria-label="Copy prompt text from header">
                              <Copy className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover text-popover-foreground">
                          <p>{usageText}</p>
                      </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-8 h-8 flex items-center justify-center text-2xl" 
                            onClick={() => onToggleFavorite(prompt.id)} 
                            aria-label={prompt.isFavorite ? 'Unfavorite this prompt' : 'Favorite this prompt'}
                            data-testid={`prompt-item-${prompt.id}-favorite-button`}
                          >
                              <span role="img" aria-label="Orange emoji" className={cn(!prompt.isFavorite && "opacity-50", "transition-opacity duration-150")}>🍊</span>
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover text-popover-foreground">
                          <p>{prompt.isFavorite ? 'Unfavorite' : 'Favorite'}</p>
                      </TooltipContent>
                  </Tooltip>
              </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow pb-3 space-y-2">
          <ScrollArea className="h-28 pr-3">
            <p className="text-sm whitespace-pre-wrap text-foreground" data-testid={`prompt-item-text-${prompt.id}`}>
              {prompt.text}
            </p>
          </ScrollArea>
          {prompt.isGeneratingDetails && (!prompt.tags || prompt.tags.length === 0) && (
              <div className="flex items-center text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating tags...
              </div>
          )}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1" data-testid={`prompt-item-tags-${prompt.id}`}>
              {prompt.tags.map((tag) => (
                <Popover key={tag} open={popoverOpenState[tag]} onOpenChange={(isOpen) => handleTagPopoverOpenChange(tag, isOpen)}>
                  <PopoverTrigger asChild>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-accent hover:text-accent-foreground group" data-testid={`prompt-item-tag-${prompt.id}-${tag}`}>
                      {tag}
                      <GripVertical className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100" />
                    </Badge>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2 space-y-2 bg-popover text-popover-foreground" side="bottom" align="start">
                    <p className="text-sm font-medium text-center">Manage Tag: "{tag}"</p>
                     <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        onRenameTagRequest(prompt.id, tag);
                        handleTagPopoverOpenChange(tag, false);
                      }}
                      data-testid={`rename-tag-button-${prompt.id}-${tag}`}
                    >
                      <PencilIcon className="w-3 h-3 mr-1" /> Rename
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        onRemoveTag(prompt.id, tag);
                        handleTagPopoverOpenChange(tag, false);
                      }}
                       data-testid={`remove-tag-button-${prompt.id}-${tag}`}
                    >
                      <XIcon className="w-3 h-3 mr-1" /> Remove
                    </Button>
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-1.5 pt-3 mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onEdit(prompt)} aria-label="Edit prompt" className="opacity-100">
                <Edit3 className="w-4 h-4 text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground">
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>
           <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onDuplicate(prompt.id)} aria-label="Duplicate prompt" className="opacity-100">
                <CloneIcon className="w-4 h-4 text-foreground/80 hover:text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground">
              <p>Duplicate</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDelete(prompt.id)} 
                aria-label="Delete prompt" 
                className="opacity-100"
                data-testid={`prompt-item-${prompt.id}-delete-button`}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground">
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onCopy(prompt.id, prompt.text)} aria-label="Copy prompt text from footer" className="opacity-70 hover:opacity-100">
                <Copy className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground">
              <p>{usageText}</p>
            </TooltipContent>
          </Tooltip>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}

    