'use client';

import { useState, useEffect, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchBooks, BookSearchResult } from '@/lib/books';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/book-card';
import { SearchIcon, BookOpen, Loader2, History, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useRecentSearches } from '@/hooks/use-recent-searches';

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [isSearching, startSearchTransition] = useTransition();
  const { recentSearches, addSearchTerm, clearSearches } = useRecentSearches();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    // Update the URL query parameter without a full page reload
    const newUrl = debouncedSearchTerm ? `/search?q=${encodeURIComponent(debouncedSearchTerm)}` : '/search';
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);

    if (!debouncedSearchTerm.trim()) {
      setResults([]);
      return;
    }

    startSearchTransition(async () => {
      addSearchTerm(debouncedSearchTerm);
      const books = await searchBooks(debouncedSearchTerm);
      setResults(books);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const handleRecentSearchClick = (term: string) => {
    setSearchTerm(term);
  };

  const showInitialState = !debouncedSearchTerm.trim() && !isSearching;

  return (
    <div className="container mx-auto px-4 py-8 h-full flex flex-col">
      <div className="mx-auto max-w-2xl w-full">
        <h1 className="mb-8 text-center font-headline text-4xl sm:text-5xl">
          Search for a Book
        </h1>
        <div className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="e.g., 'Dune' or 'Frank Herbert'"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full bg-card py-6 pl-12 pr-4 text-lg shadow-inner"
            aria-label="Search for a book by title or author"
          />
           {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto -mx-4 px-4">
        <div className="mx-auto max-w-2xl">
          {results.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {results.map((book) => (
                <BookCard
                  book={book}
                  key={book.id}
                  asLink
                  href={`/book/${book.id}`}
                />
              ))}
            </div>
          )}

          {debouncedSearchTerm.trim() && !isSearching && results.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <BookOpen className="mx-auto h-12 w-12" />
              <p className="mt-4 text-lg">No books found</p>
              <p className="text-sm">
                Try a different title or author.
              </p>
            </div>
          )}

          {showInitialState && recentSearches.length > 0 && (
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <History className="h-5 w-5 text-muted-foreground" />
                        Recent Searches
                    </h2>
                    <Button variant="ghost" size="sm" onClick={clearSearches} className="text-muted-foreground">
                        <X className="mr-1 h-4 w-4" />
                        Clear
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, index) => (
                        <Button key={index} variant="secondary" size="sm" onClick={() => handleRecentSearchClick(term)}>
                            {term}
                        </Button>
                    ))}
                </div>
            </div>
          )}

          {showInitialState && recentSearches.length === 0 && (
             <div className="py-16 text-center text-muted-foreground">
              <SearchIcon className="mx-auto h-12 w-12" />
              <p className="mt-4 text-lg">Start typing to find a book</p>
              <p className="text-sm">
                Your next great read is just a search away.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
