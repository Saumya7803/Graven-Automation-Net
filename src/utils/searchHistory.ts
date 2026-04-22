const STORAGE_KEY = 'recentSearches';
const MAX_RECENT_SEARCHES = 5;

interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export const saveRecentSearch = (query: string): void => {
  if (!query.trim()) return;

  try {
    const existing = getRecentSearches();
    const normalized = query.trim();

    // Remove if already exists to avoid duplicates
    const filtered = existing.filter(q => q.toLowerCase() !== normalized.toLowerCase());

    // Add new search at the beginning
    const updated = [normalized, ...filtered].slice(0, MAX_RECENT_SEARCHES);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent search:', error);
  }
};

export const getRecentSearches = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting recent searches:', error);
    return [];
  }
};

export const clearRecentSearch = (query: string): void => {
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter(q => q.toLowerCase() !== query.toLowerCase());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error clearing recent search:', error);
  }
};

export const clearAllRecentSearches = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing all recent searches:', error);
  }
};
