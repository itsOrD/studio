
import {z} from 'genkit';

export const GeneratePromptTitleInputSchema = z.object({
  promptText: z.string().describe('The full text of the prompt to generate a title for.'),
});
export type GeneratePromptTitleInput = z.infer<typeof GeneratePromptTitleInputSchema>;

export const GeneratePromptTitleOutputSchema = z.object({
  title: z.string().describe('A concise, descriptive title for the prompt, ideally 3-7 words long.'),
});
export type GeneratePromptTitleOutput = z.infer<typeof GeneratePromptTitleOutputSchema>;
