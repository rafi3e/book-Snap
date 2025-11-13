
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Book as BookIcon } from 'lucide-react';
import { getAiRecommendationsAction } from '@/app/actions';
import { searchBooks, getCoverImage, type BookSearchResult } from '@/lib/books';
import type { Book } from '@/lib/books';
import Link from 'next/link';
import Image from 'next/image';

interface RecommendedBook extends BookSearchResult {
    reason: string;
}

function RecommendedBookCard({ book }: { book: RecommendedBook }) {
    const coverImage = getCoverImage(book);
    return (
        <Card className="bg-card/50 flex flex-col">
            <CardHeader className='flex-grow'>
                <div className="flex gap-4">
                    <div className="relative h-24 w-16 shrink-0 rounded-sm bg-muted flex items-center justify-center">
                        {coverImage ? (
                            <Image
                                src={coverImage.imageUrl}
                                alt={`Cover of ${book.title}`}
                                fill
                                sizes="64px"
                                className="rounded-sm object-cover shadow-md"
                                data-ai-hint={coverImage.imageHint}
                            />
                        ) : (
                            <BookIcon className="w-8 h-8 text-muted-foreground" />
                        )}
                    </div>
                    <div>
                        <CardTitle className='text-lg leading-tight'>{book.title}</CardTitle>
                        <CardDescription>{book.author}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground italic mb-4">
                   "{book.reason}"
                </p>
                <Button variant="link" asChild className='p-0 h-auto'>
                    <Link href={`/book/${book.id}`}>
                        View this book
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

export function AiRecommendations({ book }: { book: Book }) {
  const [recommendations, setRecommendations] = useState<RecommendedBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    const result = await getAiRecommendationsAction({
      bookTitle: book.title,
      bookAuthor: book.author,
      bookGenres: book.genres,
    });
    
    if (result.error || !result.recommendations) {
      setError(result.error || 'Could not generate recommendations.');
      setIsLoading(false);
      return;
    }

    // For each recommendation, search for the book to get its ID and cover
    const detailedRecommendations = await Promise.all(
        result.recommendations.map(async (rec) => {
            const searchResults = await searchBooks(`${rec.title} ${rec.author}`);
            const foundBook = searchResults[0]; // Assume first result is the best match
            return {
                id: foundBook?.id || '',
                title: rec.title,
                author: rec.author,
                reason: rec.reason,
                coverId: foundBook?.coverId || null,
                publicationYear: foundBook?.publicationYear || null,
            };
        })
    );

    setRecommendations(detailedRecommendations.filter(rec => rec.id)); // Only keep recommendations where we found a book
    setIsLoading(false);
  };

  useEffect(() => {
    // Automatically generate recommendations when the component mounts
    handleGenerate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id]);


  return (
    <div>
        <h2 className="mb-6 font-headline text-3xl">Recommendations</h2>
        
        {isLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Generating smart recommendations...</span>
            </div>
        )}

        {error && !isLoading &&(
             <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-12 text-center">
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={handleGenerate} variant="secondary">
                   <Wand2 className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
            </div>
        )}

        {!isLoading && !error && recommendations.length > 0 && (
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {recommendations.map((rec) => (
                    <RecommendedBookCard key={rec.id} book={rec} />
                ))}
            </div>
        )}

        {!isLoading && !error && recommendations.length === 0 && !error && (
             <div className="py-12 text-center text-muted-foreground">
                <p>No recommendations to display at the moment.</p>
             </div>
        )}
    </div>
  );
}
