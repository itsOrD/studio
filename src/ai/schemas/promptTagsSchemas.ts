
import {z} from 'genkit';

export const GeneratePromptTagsInputSchema = z.object({
  promptText: z.string().describe('The full text of the prompt to generate tags for.'),
});
export type GeneratePromptTagsInput = z.infer<typeof GeneratePromptTagsInputSchema>;

export const GeneratePromptTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of 3-5 relevant, concise, single-word or two-word tags. Empty array if no relevant tags found.'),
});
export type GeneratePromptTagsOutput = z.infer<typeof GeneratePromptTagsOutputSchema>;
