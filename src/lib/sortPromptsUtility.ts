
import type { Prompt, SortConfig } from '@/types';

export function sortPrompts(
  prompts: Prompt[],
  sortConfig: SortConfig,
  activeTag: string | null,
  initialUntitledPrompt: string,
  favoritesFilterKey: string
): Prompt[] {
  let list = [...prompts];

  if (activeTag) {
    if (activeTag === favoritesFilterKey) {
      list = list.filter(p => p.isFavorite);
    } else {
      list = list.filter(p => (p.tags || []).includes(activeTag));
    }
  }

  list.sort((a, b) => {
    // Primary sort: favorites first
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;

    // Secondary sort: based on sortConfig
    let comparison = 0;
    const valA = a[sortConfig.field] ?? (sortConfig.field === 'title' ? initialUntitledPrompt : 0);
    const valB = b[sortConfig.field] ?? (sortConfig.field === 'title' ? initialUntitledPrompt : 0);
    
    if (sortConfig.field === 'title') {
      comparison = String(valA).localeCompare(String(valB));
      return sortConfig.order === 'asc' ? comparison : -comparison;
    } else { 
      // For 'createdAt', 'useCount', 'lastCopiedAt'
      // Higher numeric values are usually "better" or "later" (e.g. newer date, higher use count)
      // So, for 'desc' order (default for these types), we want (valB - valA)
      // For 'asc' order, we want (valA - valB)
      const numA = Number(valA) || 0;
      const numB = Number(valB) || 0;
      
      if (sortConfig.order === 'desc') {
        comparison = numB - numA;
      } else {
        comparison = numA - numB;
      }
      return comparison;
    }
  });
  return list;
}

    