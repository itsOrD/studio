
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage, { INITIAL_UNTITLED_PROMPT, FAVORITES_FILTER_KEY } from './page'; // Import necessary constants
import * as generatePromptTitleFlow from '@/ai/flows/generatePromptTitleFlow';
import * as generatePromptTagsFlow from '@/ai/flows/generatePromptTagsFlow';
import { useToast } from '@/hooks/use-toast';

// Mock AI flows
jest.mock('@/ai/flows/generatePromptTitleFlow', () => ({
  generatePromptTitle: jest.fn(),
}));
jest.mock('@/ai/flows/generatePromptTagsFlow', () => ({
  generatePromptTags: jest.fn(),
}));

// Mock useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

// Mock useLocalStorage
let mockStoredPrompts: any[] = [];
jest.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: jest.fn((key: string, defaultValue: any) => {
    const [state, setState] = jest.requireActual('react').useState(mockStoredPrompts.length > 0 ? mockStoredPrompts : defaultValue);
    const setLocalStorageState = (valueOrFn: any) => {
      const newValue = typeof valueOrFn === 'function' ? valueOrFn(state) : valueOrFn;
      mockStoredPrompts = newValue;
      setState(newValue);
    };
    return [state, setLocalStorageState];
  }),
}));


describe('HomePage Integration Tests', () => {
  const mockGenerateTitle = generatePromptTitleFlow.generatePromptTitle as jest.Mock;
  const mockGenerateTags = generatePromptTagsFlow.generatePromptTags as jest.Mock;
  const mockToast = jest.fn();

  beforeEach(() => {
    mockStoredPrompts = []; // Reset localStorage mock for each test
    mockGenerateTitle.mockReset();
    mockGenerateTags.mockReset();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    // Default AI flow implementations
    mockGenerateTitle.mockResolvedValue({ title: 'AI Generated Title' });
    mockGenerateTags.mockResolvedValue({ tags: ['ai-tag1', 'ai-tag2'] });
  });

  test('renders the home page with initial elements', () => {
    render(<HomePage />);
    expect(screen.getByText('Create New Prompt')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter or drop your prompt here...')).toBeInTheDocument();
    expect(screen.getByTestId('save-prompt-button')).toBeDisabled();
    expect(screen.getByText('Saved Prompts')).toBeInTheDocument();
    expect(screen.getByTestId('no-prompts-message')).toHaveTextContent('No prompts saved yet. Add your first one!');
  });

  test('allows typing in textarea and enables save button', async () => {
    render(<HomePage />);
    const textarea = screen.getByPlaceholderText('Enter or drop your prompt here...');
    await userEvent.type(textarea, 'This is a new prompt.');
    expect(textarea).toHaveValue('This is a new prompt.');
    expect(screen.getByTestId('save-prompt-button')).toBeEnabled();
  });

  test('adds a new prompt, shows AI generation placeholders, then updates with AI results', async () => {
    render(<HomePage />);
    const textarea = screen.getByPlaceholderText('Enter or drop your prompt here...');
    const saveButton = screen.getByTestId('save-prompt-button');

    await userEvent.type(textarea, 'A brilliant new idea for a prompt.');
    fireEvent.click(saveButton);

    // Check for immediate save with placeholders
    await waitFor(() => {
      const promptItems = screen.queryAllByTestId(/^prompt-item-/); // Assuming PromptItem has data-testid like prompt-item-{id}
      // This assertion is tricky without knowing the exact temporary UI state.
      // Let's check if the "no prompts" message is gone.
      expect(screen.queryByTestId('no-prompts-message')).not.toBeInTheDocument();
      // And if the toast for saving was called
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Prompt Saved!' }));
    });
    
    // Wait for AI results to appear
    await waitFor(async () => {
        const titleElement = await screen.findByText('AI Generated Title');
        expect(titleElement).toBeInTheDocument();
    }, { timeout: 3000 }); // Increased timeout for AI mocks

    expect(screen.getByText('ai-tag1')).toBeInTheDocument();
    expect(screen.getByText('ai-tag2')).toBeInTheDocument();
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'AI Details Generated!' }));
  });

  test('filters prompts by tag', async () => {
    mockStoredPrompts = [
      { id: 'p1', title: 'Prompt 1', text: 'text1', createdAt: Date.now(), tags: ['tagA', 'tagB'], isFavorite: false, useCount:0, lastCopiedAt:0 },
      { id: 'p2', title: 'Prompt 2', text: 'text2', createdAt: Date.now(), tags: ['tagB', 'tagC'], isFavorite: false, useCount:0, lastCopiedAt:0 },
      { id: 'p3', title: 'Prompt 3', text: 'text3', createdAt: Date.now(), tags: ['tagA'], isFavorite: true, useCount:0, lastCopiedAt:0 },
    ];
    render(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Prompt 1')).toBeInTheDocument();
      expect(screen.getByText('Prompt 2')).toBeInTheDocument();
      expect(screen.getByText('Prompt 3')).toBeInTheDocument();
    });

    const tagAFilter = screen.getByRole('tab', { name: /tagA/i });
    fireEvent.click(tagAFilter);

    await waitFor(() => {
      expect(screen.getByText('Prompt 1')).toBeInTheDocument();
      expect(screen.getByText('Prompt 3')).toBeInTheDocument();
      expect(screen.queryByText('Prompt 2')).not.toBeInTheDocument();
    });
    
    const allPromptsFilter = screen.getByRole('tab', { name: /All Prompts/i });
    fireEvent.click(allPromptsFilter);

    await waitFor(() => {
      expect(screen.getByText('Prompt 1')).toBeInTheDocument();
      expect(screen.getByText('Prompt 2')).toBeInTheDocument();
      expect(screen.getByText('Prompt 3')).toBeInTheDocument();
    });
  });
  
  test('sorts prompts by title ascending', async () => {
    mockStoredPrompts = [
      { id: 'p1', title: 'Charlie', text: 'text1', createdAt: Date.now(), tags: [], isFavorite: false, useCount:0, lastCopiedAt:0 },
      { id: 'p2', title: 'Alpha', text: 'text2', createdAt: Date.now() - 1000, tags: [], isFavorite: false, useCount:0, lastCopiedAt:0 },
      { id: 'p3', title: 'Bravo', text: 'text3', createdAt: Date.now() - 2000, tags: [], isFavorite: false, useCount:0, lastCopiedAt:0 },
    ];
    render(<HomePage />);

    await waitFor(() => expect(screen.getByText('Charlie')).toBeInTheDocument()); // Ensure initial render

    const sortFieldTrigger = screen.getByTestId('sort-field-trigger');
    fireEvent.mouseDown(sortFieldTrigger); // Open select for sort field
    const titleOption = await screen.findByText('Title');
    fireEvent.click(titleOption);

    const sortOrderTrigger = screen.getByTestId('sort-order-trigger');
    fireEvent.mouseDown(sortOrderTrigger); // Open select for sort order
    const ascendingOption = await screen.findByText('Ascending');
    fireEvent.click(ascendingOption);

    await waitFor(() => {
      const promptItems = screen.getAllByTestId(/^prompt-item-title-/); // Assuming PromptItem title has data-testid
      const titles = promptItems.map(item => item.textContent);
      expect(titles).toEqual(['Alpha', 'Bravo', 'Charlie']);
    });
  });

  test('favorites a prompt and it appears first when sorted by date', async () => {
     mockStoredPrompts = [
      { id: 'p1', title: 'Older Prompt', text: 'text1', createdAt: Date.now() - 2000, isFavorite: false, useCount:0, lastCopiedAt:0 },
      { id: 'p2', title: 'Newer Prompt', text: 'text2', createdAt: Date.now() - 1000, isFavorite: false, useCount:0, lastCopiedAt:0 },
    ];
    render(<HomePage />);

    await waitFor(() => expect(screen.getByText('Older Prompt')).toBeInTheDocument());
    
    // Default sort is createdAt desc, so Newer should be first
    let promptItems = screen.getAllByTestId(/^prompt-item-title-/);
    expect(promptItems.map(item => item.textContent)).toEqual(['Newer Prompt', 'Older Prompt']);

    const favoriteButtonForOlder = screen.getByTestId('prompt-item-p1-favorite-button'); // Assumes data-testid format
    fireEvent.click(favoriteButtonForOlder);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Favorited!' }));
      promptItems = screen.getAllByTestId(/^prompt-item-title-/);
      // Now "Older Prompt" (favorited) should be first, then "Newer Prompt"
      expect(promptItems.map(item => item.textContent)).toEqual(['Older Prompt', 'Newer Prompt']);
    });
  });

  test('deletes a prompt', async () => {
    mockStoredPrompts = [
      { id: 'p1-delete', title: 'Prompt to Delete', text: 'text to delete', createdAt: Date.now(), tags:[], isFavorite: false, useCount:0, lastCopiedAt:0 }
    ];
    render(<HomePage />);

    await waitFor(() => expect(screen.getByText('Prompt to Delete')).toBeInTheDocument());
    
    const deleteButton = screen.getByTestId('prompt-item-p1-delete-delete-button'); // Assumes data-testid format
    fireEvent.click(deleteButton);

    const confirmDeleteButton = await screen.findByRole('button', { name: /Yes, delete prompt/i });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Prompt to Delete')).not.toBeInTheDocument();
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Prompt Deleted!' }));
    });
    expect(screen.getByTestId('no-prompts-message')).toBeInTheDocument();
  });

  // TODO: Add tests for editing prompt, renaming/removing tags, duplication, other sort orders.
});

    