
import { generatePromptTitle, type GeneratePromptTitleInput, type GeneratePromptTitleOutput } from './generatePromptTitleFlow';
import { ai } from '@/ai/genkit'; // Mocking Genkit

// Mock the genkit ai object and its methods
jest.mock('@/ai/genkit', () => ({
  ai: {
    definePrompt: jest.fn().mockReturnValue(jest.fn()),
    defineFlow: jest.fn((config, handler) => handler), // Immediately return the handler for direct call
  },
}));

const mockPromptFn = ai.definePrompt({} as any).getMockImplementation();


describe('generatePromptTitleFlow', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Provide a default mock implementation for the prompt function
    (ai.definePrompt({} as any) as jest.Mock).mockReturnValue(
        jest.fn(async (input: GeneratePromptTitleInput): Promise<{output: GeneratePromptTitleOutput | null}> => {
            if (input.promptText.includes("valid test")) return { output: { title: "Generated Test Title" } };
            if (input.promptText.includes("long title test")) return { output: { title: "This is a very very very very very very very long title from AI" } };
            if (input.promptText.includes("null output test")) return { output: null };
            if (input.promptText.includes("no title test")) return { output: {} as any };
            return { output: { title: "Default AI Title" } };
        })
    );
  });

  it('should return "Untitled Prompt" for very short prompt text', async () => {
    const input: GeneratePromptTitleInput = { promptText: 'hi' };
    const result = await generatePromptTitle(input);
    expect(result.title).toBe('Untitled Prompt');
  });

  it('should return "Untitled Prompt (Text too long)" if prompt text exceeds MAX_TITLE_GENERATION_INPUT_LENGTH', async () => {
    const longText = 'a'.repeat(5001); // MAX_TITLE_GENERATION_INPUT_LENGTH is 5000
    const input: GeneratePromptTitleInput = { promptText: longText };
    const result = await generatePromptTitle(input);
    expect(result.title).toBe('Untitled Prompt (Text too long)');
     // Check if the flow was NOT called (short-circuited)
    expect(ai.defineFlow({} as any, jest.fn()).getMockImplementation()).not.toHaveBeenCalled();
  });

  it('should call the AI flow and return the generated title for valid input', async () => {
    const input: GeneratePromptTitleInput = { promptText: 'This is a valid test prompt.' };
    const result = await generatePromptTitle(input);
    expect(result.title).toBe('Generated Test Title');
    expect(ai.definePrompt({} as any)).toHaveBeenCalledTimes(1);
  });
  
  it('should truncate overly long titles returned by AI', async () => {
    const input: GeneratePromptTitleInput = { promptText: 'long title test' };
    const result = await generatePromptTitle(input);
    expect(result.title).toBe('This is a very very very very...'); // 7 words + ...
  });

  it('should handle null output from AI by returning "Untitled Prompt"', async () => {
    const input: GeneratePromptTitleInput = { promptText: 'null output test' };
    const result = await generatePromptTitle(input);
    expect(result.title).toBe('Untitled Prompt');
  });
  
  it('should handle output without a title field from AI by returning "Untitled Prompt"', async () => {
    const input: GeneratePromptTitleInput = { promptText: 'no title test' };
    const result = await generatePromptTitle(input);
    expect(result.title).toBe('Untitled Prompt');
  });
});
