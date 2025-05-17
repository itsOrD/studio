
import { generatePromptTags, type GeneratePromptTagsInput, type GeneratePromptTagsOutput } from './generatePromptTagsFlow';
import { ai } from '@/ai/genkit'; // Mocking Genkit

// Mock the genkit ai object and its methods
jest.mock('@/ai/genkit', () => ({
  ai: {
    definePrompt: jest.fn().mockReturnValue(jest.fn()),
    defineFlow: jest.fn((config, handler) => handler), // Immediately return the handler for direct call
  },
}));

const mockPromptFn = ai.definePrompt({} as any).getMockImplementation();

describe('generatePromptTagsFlow', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Provide a default mock implementation for the prompt function
    (ai.definePrompt({} as any) as jest.Mock).mockReturnValue(
        jest.fn(async (input: GeneratePromptTagsInput): Promise<{output: GeneratePromptTagsOutput | null}> => {
            if (input.promptText.includes("empty test")) return { output: { tags: [] } };
            if (input.promptText.includes("valid test")) return { output: { tags: ["tag1", "Tag Two", " tag3 "] } };
            if (input.promptText.includes("null output test")) return { output: null };
            if (input.promptText.includes("no tags array test")) return { output: {} as any }; // Simulate invalid output
            return { output: { tags: ["defaultTag"] } };
        })
    );
  });

  it('should return empty tags for very short prompt text', async () => {
    const input: GeneratePromptTagsInput = { promptText: 'hi' };
    const result = await generatePromptTags(input);
    expect(result.tags).toEqual([]);
  });

  it('should return empty tags if prompt text exceeds MAX_TAG_GENERATION_INPUT_LENGTH', async () => {
    const longText = 'a'.repeat(10001); // MAX_TAG_GENERATION_INPUT_LENGTH is 10000
    const input: GeneratePromptTagsInput = { promptText: longText };
    const result = await generatePromptTags(input);
    expect(result.tags).toEqual([]);
    // Check if the flow was NOT called (short-circuited)
    expect(ai.defineFlow({} as any, jest.fn()).getMockImplementation()).not.toHaveBeenCalled();
  });

  it('should call the AI flow and return sanitized tags for valid input', async () => {
    const input: GeneratePromptTagsInput = { promptText: 'This is a valid test prompt about coding.' };
    const result = await generatePromptTags(input);
    expect(result.tags).toEqual(['tag1', 'tag two', 'tag3']); // Expect sanitized: lowercase, trimmed
    expect(ai.definePrompt({} as any)).toHaveBeenCalledTimes(1); // Ensure definePrompt was accessed (indirectly testing flow call)
  });
  
  it('should handle empty array from AI correctly', async () => {
    const input: GeneratePromptTagsInput = { promptText: 'empty test' };
    const result = await generatePromptTags(input);
    expect(result.tags).toEqual([]);
  });

  it('should handle null output from AI by returning empty tags', async () => {
    const input: GeneratePromptTagsInput = { promptText: 'null output test' };
    const result = await generatePromptTags(input);
    expect(result.tags).toEqual([]);
  });

  it('should handle output without tags array from AI by returning empty tags', async () => {
    const input: GeneratePromptTagsInput = { promptText: 'no tags array test' };
    const result = await generatePromptTags(input);
    expect(result.tags).toEqual([]);
  });

  it('should filter out non-string or empty tags from AI output', async () => {
     // Update mock for this specific test
    (ai.definePrompt({} as any) as jest.Mock).mockReturnValue(
        jest.fn(async (input: GeneratePromptTagsInput): Promise<{output: GeneratePromptTagsOutput | null}> => {
            return { output: { tags: ["valid", null as any, "  ", "another valid"] } };
        })
    );
    const input: GeneratePromptTagsInput = { promptText: 'test with mixed quality tags' };
    const result = await generatePromptTags(input);
    expect(result.tags).toEqual(['valid', 'another valid']);
  });

  it('should ensure unique tags', async () => {
    (ai.definePrompt({} as any) as jest.Mock).mockReturnValue(
        jest.fn(async (input: GeneratePromptTagsInput): Promise<{output: GeneratePromptTagsOutput | null}> => {
            return { output: { tags: ["apple", "banana", "APPLE", "cherry", "Banana"] } };
        })
    );
    const input: GeneratePromptTagsInput = { promptText: 'test for unique tags' };
    const result = await generatePromptTags(input);
    expect(result.tags).toEqual(['apple', 'banana', 'cherry']);
  });
});
