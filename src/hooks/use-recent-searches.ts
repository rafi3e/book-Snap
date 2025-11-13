'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'booksnap_recent_searches';
const MAX_SEARCHES = 5;

// This function safely interacts with localStorage, which is only available on the client.
const getSearchesFromStorage = (): string[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const storedSearches = window.localStorage.getItem(STORAGE_KEY);
        return storedSearches ? JSON.parse(storedSearches) : [];
    } catch (error) {
        console.error("Failed to parse recent searches from localStorage", error);
        return [];
    }
};

export const useRecentSearches = () => {
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // On initial client-side mount, load searches from localStorage.
    useEffect(() => {
        setRecentSearches(getSearchesFromStorage());
    }, []);

    const addSearchTerm = useCallback((term: string) => {
        const newSearches = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, MAX_SEARCHES);
        setRecentSearches(newSearches);
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newSearches));
        } catch (error) {
            console.error("Failed to save recent searches to localStorage", error);
        }
    }, [recentSearches]);

    const clearSearches = useCallback(() => {
        setRecentSearches([]);
        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error("Failed to clear recent searches from localStorage", error);
        }
    }, []);

    return { recentSearches, addSearchTerm, clearSearches };
};
