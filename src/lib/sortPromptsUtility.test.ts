
import type { Prompt, SortConfig } from '@/types';
import { sortPrompts } from './sortPromptsUtility';

const mockPrompts: Prompt[] = [
  { id: '1', title: 'Apple Pie Recipe', text: '...', createdAt: 1000, useCount: 5, lastCopiedAt: 500, isFavorite: true, tags: ['food', 'dessert'] },
  { id: '2', title: 'Banana Bread', text: '...', createdAt: 2000, useCount: 10, lastCopiedAt: 1500, isFavorite: false, tags: ['food', 'baking'] },
  { id: '3', title: 'Carrot Cake', text: '...', createdAt: 500, useCount: 2, lastCopiedAt: 200, isFavorite: true, tags: ['dessert'] },
  { id: '4', title: 'Date Squares', text: '...', createdAt: 1500, useCount: 8, lastCopiedAt: 1000, isFavorite: false, tags: ['food', 'snack'] },
  { id: '5', title: 'Untitled Prompt', text: '...', createdAt: 2500, useCount: 1, lastCopiedAt: 2500, isFavorite: false, tags: [] },
];

const INITIAL_UNTITLED_PROMPT = "Untitled Prompt";
const FAVORITES_FILTER_KEY = "🍊 Favorites";

describe('sortPromptsUtility', () => {
  it('should sort by createdAt descending by default (favorites first)', () => {
    const config: SortConfig = { field: 'createdAt', order: 'desc' };
    const sorted = sortPrompts([...mockPrompts], config, null, INITIAL_UNTITLED_PROMPT, FAVORITES_FILTER_KEY);
    // Expected: Carrot Cake (fav, 500), Apple Pie (fav, 1000), Untitled (2500), Banana (2000), Date (1500)
    // Corrected expected based on fav first:
    // Favorites sorted by createdAt desc: Apple Pie (1000), Carrot Cake (500)
    // Non-favorites sorted by createdAt desc: Untitled (2500), Banana (2000), Date (1500)
    expect(sorted.map(p => p.id)).toEqual(['1', '3', '5', '2', '4']);
  });

  it('should sort by createdAt ascending (favorites first)', () => {
    const config: SortConfig = { field: 'createdAt', order: 'asc' };
    const sorted = sortPrompts([...mockPrompts], config, null, INITIAL_UNTITLED_PROMPT, FAVORITES_FILTER_KEY);
    // Favorites sorted by createdAt asc: Carrot Cake (500), Apple Pie (1000)
    // Non-favorites sorted by createdAt asc: Date (1500), Banana (2000), Untitled (2500)
    expect(sorted.map(p => p.id)).toEqual(['3', '1', '4', '2', '5']);
  });

  it('should sort by title ascending (favorites first)', () => {
    const config: SortConfig = { field: 'title', order: 'asc' };
    const sorted = sortPrompts([...mockPrompts], config, null, INITIAL_UNTITLED_PROMPT, FAVORITES_FILTER_KEY);
    // Favorites by title asc: Apple Pie, Carrot Cake
    // Non-favorites by title asc: Banana Bread, Date Squares, Untitled Prompt
    expect(sorted.map(p => p.id)).toEqual(['1', '3', '2', '4', '5']);
  });

  it('should sort by title descending (favorites first)', () => {
    const config: SortConfig = { field: 'title', order: 'desc' };
    const sorted = sortPrompts([...mockPrompts], config, null, INITIAL_UNTITLED_PROMPT, FAVORITES_FILTER_KEY);
     // Favorites by title desc: Carrot Cake, Apple Pie
    // Non-favorites by title desc: Untitled Prompt, Date Squares, Banana Bread
    expect(sorted.map(p => p.id)).toEqual(['3', '1', '5', '4', '2']);
  });

  it('should sort by useCount descending (favorites first)', () => {
    const config: SortConfig = { field: 'useCount', order: 'desc' };
    const sorted = sortPrompts([...mockPrompts], config, null, INITIAL_UNTITLED_PROMPT, FAVORITES_FILTER_KEY);
    // Favs by useCount desc: Apple (5), Carrot (2)
    // Non-favs by useCount desc: Banana (10), Date (8), Untitled (1)
    expect(sorted.map(p => p.id)).toEqual(['1', '3', '2', '4', '5']);
  });

  it('should sort by lastCopiedAt ascending (favorites first)', () => {
    const config: SortConfig = { field: 'lastCopiedAt', order: 'asc' };
    const sorted = sortPrompts([...mockPrompts], config, null, INITIAL_UNTITLED_PROMPT, FAVORITES_FILTER_KEY);
    // Favs by lastCopiedAt asc: Carrot (200), Apple (500)
    // Non-favs by lastCopiedAt asc: Date (1000), Banana (1500), Untitled (2500)
    expect(sorted.map(p => p.id)).toEqual(['3', '1', '4', '2', '5']);
  });

  it('should filter by tag "food" and sort by title ascending (favorites first)', () => {
    const config: SortConfig = { field: 'title', order: 'asc' };
    // Prompts with 'food': Apple Pie (fav), Banana Bread, Date Squares
    const sorted = sortPrompts([...mockPrompts], config, 'food', INITIAL_UNTITLED_PROMPT, FAVORITES_FILTER_KEY);
    // Expected: Apple Pie (fav), Banana Bread, Date Squares
    expect(sorted.map(p => p.id)).toEqual(['1', '2', '4']);
  });

  it('should filter by favorites and sort by createdAt descending', () => {
    const config: SortConfig = { field: 'createdAt', order: 'desc' };
    // Favorite prompts: Apple Pie (1000), Carrot Cake (500)
    const sorted = sortPrompts([...mockPrompts], config, FAVORITES_FILTER_KEY, INITIAL_UNTITLED_PROMPT, FAVORITES_FILTER_KEY);
    // Expected by createdAt desc: Apple Pie, Carrot Cake
    expect(sorted.map(p => p.id)).toEqual(['1', '3']);
  });

  it('handles empty prompts array', () => {
    const config: SortConfig = { field: 'createdAt', order: 'desc' };
    const sorted = sortPrompts([], config, null, INITIAL_UNTITLED_PROMPT, FAVORITES_FILTER_KEY);
    expect(sorted).toEqual([]);
  });

  it('handles prompts with missing sortable fields correctly (treats as 0 or default title)', () => {
    const promptsWithMissing: Prompt[] = [
      { id: 'a', title: 'A', createdAt: 100, isFavorite: false }, // Missing useCount, lastCopiedAt
      { id: 'b', title: 'B', createdAt: 200, useCount: 5, isFavorite: false }, // Missing lastCopiedAt
      { id: 'c', text:'c text', createdAt: 300, isFavorite: false } as Prompt, // Missing title, useCount, lastCopiedAt
    ];
    const config: SortConfig = { field: 'useCount', order: 'desc' };
    const sorted = sortPrompts(promptsWithMissing, config, null, INITIAL_UNTITLED_PROMPT, FAVORITES_FILTER_KEY);
    // B (5), A (0), C (0) - A and C secondary sort by createdAt desc
    expect(sorted.map(p => p.id)).toEqual(['b', 'c', 'a']); 
  });
});

    