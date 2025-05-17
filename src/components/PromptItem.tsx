"use client";

import type { Prompt } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Edit3, Trash2 } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface PromptItemProps {
  prompt: Prompt;
  onCopy: (text: string) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (promptId: string) => void;
}

export function PromptItem({ prompt, onCopy, onEdit, onDelete }: PromptItemProps) {
  const formattedDate = new Date(prompt.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <Card className="flex flex-col h-full shadow-md bg-card hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-primary truncate" title={prompt.title || "Untitled Prompt"}>
          {prompt.title || "Untitled Prompt"}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">Saved: {formattedDate}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-3">
        <ScrollArea className="h-28 pr-3"> {/* Adjusted height for tile consistency */}
          <p className="text-sm whitespace-pre-wrap text-foreground">
            {prompt.text}
          </p>
        </ScrollArea>
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
