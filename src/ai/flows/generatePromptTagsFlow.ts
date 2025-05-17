
'use server';
/**
 * @fileOverview Generates relevant tags for a given prompt text.
 *
 * - generatePromptTags - A function that generates tags for prompt text.
 * - GeneratePromptTagsInput - The input type for the generatePromptTags function.
 * - GeneratePromptTagsOutput - The return type for the generatePromptTags function.
 */

import {ai} from '@/ai/genkit';
import {
  GeneratePromptTagsInputSchema,
  type GeneratePromptTagsInput,
  GeneratePromptTagsOutputSchema,
  type GeneratePromptTagsOutput,
} from '@/ai/schemas/promptTagsSchemas';

// Re-export types for external use
export type { GeneratePromptTagsInput, GeneratePromptTagsOutput };

export async function generatePromptTags(input: GeneratePromptTagsInput): Promise<GeneratePromptTagsOutput> {
  // Defensive check for empty or very short prompt text
  if (!input.promptText || input.promptText.trim().length < 10) {
    return { tags: [] };
  }
  return generatePromptTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePromptTagsPrompt',
  input: { schema: GeneratePromptTagsInputSchema },
  output: { schema: GeneratePromptTagsOutputSchema },
  prompt: `Analyze the following prompt text and generate 3-5 relevant, concise, single-word or short two-word (e.g., "machine learning") tags.
The tags should help categorize the prompt.
Output the tags as a JSON array of strings. For example: ["tag1", "tag2", "tag three"].
If no relevant tags can be determined or the text is too generic, return an empty array.

Prompt Text:
{{{promptText}}}

Generated Tags (JSON array of strings):`,
  config: {
    // Adjust temperature for more deterministic or creative tagging
    // temperature: 0.5, 
  }
});

const generatePromptTagsFlow = ai.defineFlow(
  {
    name: 'generatePromptTagsFlow',
    inputSchema: GeneratePromptTagsInputSchema,
    outputSchema: GeneratePromptTagsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output || !Array.isArray(output.tags)) {
        console.warn('Tag generation did not return a valid array, returning empty. Output:', output);
        return { tags: [] };
    }
    // Sanitize tags: ensure they are strings, trim whitespace, remove empty strings, and convert to lowercase for consistency
    const sanitizedTags = output.tags
      .filter(tag => typeof tag === 'string' && tag.trim() !== '')
      .map(tag => tag.trim().toLowerCase());
    
    return { tags: Array.from(new Set(sanitizedTags)) }; // Ensure unique tags
  }
);
