
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

// Updated Orange Fruit Icon for Favorites
const OrangeFruitIcon = ({ className, isFavorite }: { className?: string; isFavorite?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    strokeWidth="1.5" // Default stroke width for consistency
    className={cn(
      "w-4 h-4", // Standard icon size
      "transition-colors duration-200",
      isFavorite ? "text-[hsl(var(--primary))]" : "text-muted-foreground hover:text-[hsl(var(--primary))]", // Base color for stroke when not filled
      className
    )}
    fill="none" // Default fill to none, overridden by parts of the SVG
    aria-hidden="true"
  >
    {/* Main Orange Body */}
    <circle
      cx="12"
      cy="13" // Center Y for the main fruit body
      r="7"   // Radius of the fruit
      stroke={isFavorite ? "hsl(var(--primary))" : "currentColor"}
      fill={isFavorite ? "hsl(var(--primary))" : "none"}
      strokeWidth="1.5"
    />
    {/* Leaf: A simple shape, attached to top-right of the orange */}
    <path
      d="M14.5 4 C16.5 6, 15 8, 13 7 C14 5, 14.5 4, 14.5 4 Z" // Adjusted leaf shape for better appearance
      fill="hsl(120 50% 40%)"   // Leaf green fill
      stroke="hsl(120 60% 30%)" // Darker green stroke for leaf
      strokeWidth="1"
      transform="rotate(10 14 6)" // Rotate leaf slightly
    />
    {/* Optional: A small dot on the orange for texture/detail when favorited */}
    {isFavorite && (
      <circle
        cx="10"
        cy="11.5"
        r="1"
        fill="hsl(var(--primary-foreground))" // Light highlight
        stroke="none" // No stroke for the highlight itself
        opacity="0.7"
      />
    )}
  </svg>
);


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
  
  const lastCopiedText = prompt.lastCopiedAt 
    ? `Last copied: ${new Date(prompt.lastCopiedAt).toLocaleString()}` 
    : "Copy to clipboard";
  
  const usageText = `Used ${prompt.useCount || 0} time(s). ${lastCopiedText}`;

  return (
    <TooltipProvider>
      <Card className="flex flex-col h-full shadow-md bg-card hover:shadow-xl hover:scale-[1.02] hover:border-accent/50 transition-all duration-200 ease-in-out border">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
              <div className="flex-grow min-w-0 mr-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CardTitle 
                        className="text-lg font-semibold text-primary truncate flex items-center cursor-pointer hover:underline" 
                        onClick={() => onEdit(prompt)}
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
                          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => onToggleFavorite(prompt.id)} aria-label="Toggle favorite">
                              <OrangeFruitIcon isFavorite={prompt.isFavorite} />
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
            <p className="text-sm whitespace-pre-wrap text-foreground">
              {prompt.text}
            </p>
          </ScrollArea>
          {prompt.isGeneratingDetails && (!prompt.tags || prompt.tags.length === 0) && (
              <div className="flex items-center text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating tags...
              </div>
          )}
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
                        handleTagPopoverOpenChange(tag, false);
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
                        handleTagPopoverOpenChange(tag, false);
                      }}
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
              <Button variant="ghost" size="icon" onClick={() => onDelete(prompt.id)} aria-label="Delete prompt" className="opacity-100">
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

