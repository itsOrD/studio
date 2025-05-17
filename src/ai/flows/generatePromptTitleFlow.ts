
'use server';
/**
 * @fileOverview Generates a concise title for a given prompt text.
 *
 * - generatePromptTitle - A function that generates a title for prompt text.
 * - GeneratePromptTitleInput - The input type for the generatePromptTitle function.
 * - GeneratePromptTitleOutput - The return type for the generatePromptTitle function.
 */

import {ai} from '@/ai/genkit';
import {
  GeneratePromptTitleInputSchema,
  type GeneratePromptTitleInput,
  GeneratePromptTitleOutputSchema,
  type GeneratePromptTitleOutput,
} from '@/ai/schemas/promptTitleSchemas';

// Re-export types for external use, adhering to 'use server' constraints
export type { GeneratePromptTitleInput, GeneratePromptTitleOutput };

export async function generatePromptTitle(input: GeneratePromptTitleInput): Promise<GeneratePromptTitleOutput> {
  // Defensive check for empty or very short prompt text
  if (!input.promptText || input.promptText.trim().length < 5) {
    return { title: "Untitled Prompt" };
  }
  return generatePromptTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePromptTitlePrompt',
  input: { schema: GeneratePromptTitleInputSchema },
  output: { schema: GeneratePromptTitleOutputSchema },
  prompt: `Analyze the following prompt text and generate a concise, descriptive title for it.
The title should be between 3 and 7 words long and capture the main essence of the prompt.
Do not use quotes in the title. If the text is too short or unclear, return "Untitled Prompt".

Prompt Text:
{{{promptText}}}

Generated Title:`,
});

const generatePromptTitleFlow = ai.defineFlow(
  {
    name: 'generatePromptTitleFlow',
    inputSchema: GeneratePromptTitleInputSchema,
    outputSchema: GeneratePromptTitleOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output || !output.title) {
        return { title: "Untitled Prompt" };
    }
    // Ensure title is not overly long if model doesn't respect length constraint
    const words = output.title.split(' ');
    if (words.length > 10) {
        return { title: words.slice(0, 7).join(' ') + '...' };
    }
    return output;
  }
);
