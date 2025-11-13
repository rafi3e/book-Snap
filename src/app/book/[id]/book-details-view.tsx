
'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Book } from '@/lib/books';
import { getCoverImage } from '@/lib/books';
import { Badge } from '@/components/ui/badge';
import { Wand2, Loader2, Book as BookIcon, Star } from 'lucide-react';
import { getAiSummaryAction } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddToLibrary } from '@/components/add-to-library';

function AiSummary({ book }: { book: Book }) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError('');
    setSummary('');
    const result = await getAiSummaryAction({
      bookTitle: book.title,
      bookDescription: book.description,
    });
    setIsLoading(false);

    if ('error' in result) {
      setError(result.error || 'An unknown error occurred.');
    } else if (result.aiSummary) {
      setSummary(result.aiSummary);
    }
  };

  return (
    <Card className="mt-6 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
          <Wand2 className="h-6 w-6 text-primary" />
          AI Corner
        </CardTitle>
      </CardHeader>
      <CardContent>
        {summary && <p className="text-muted-foreground">{summary}</p>}
        {error && <p className="text-destructive">{error}</p>}
        {!summary && !isLoading && !error && (
          <p className="text-muted-foreground">
            Generate a short summary or a quote of the day for this book.
          </p>
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating...</span>
          </div>
        )}
        <Button
          onClick={handleGenerateSummary}
          disabled={isLoading}
          className="mt-4"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Generate Summary
        </Button>
      </CardContent>
    </Card>
  );
}

export function BookDetailsView({ book }: { book: Book }) {
  const coverImage = getCoverImage(book);

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-1 flex flex-col items-center gap-6 text-center">
                <div className="relative aspect-[3/4] w-full max-w-[250px] sm:max-w-[300px]">
                    {coverImage ? (
                        <>
                            <Image
                                src={coverImage.imageUrl}
                                alt={`Blurred background for ${book.title}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 300px"
                                className="object-cover scale-150 blur-2xl opacity-30"
                                data-ai-hint={coverImage.imageHint}
                            />
                            <Image
                                src={coverImage.imageUrl}
                                alt={`Cover of ${book.title}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 300px"
                                priority
                                className="object-contain rounded-lg shadow-2xl"
                                data-ai-hint={coverImage.imageHint}
                            />
                        </>
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg shadow-2xl">
                            <BookIcon className="h-16 w-16 text-muted-foreground" />
                        </div>
                    )}
                </div>

                <div className="w-full max-w-sm space-y-4">
                    <div className="flex items-center justify-center gap-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold text-lg">{book.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({new Intl.NumberFormat().format(book.ratingCount)} ratings)</span>
                    </div>
                    <AddToLibrary book={book} />
                </div>
            </div>

            <div className="md:col-span-2 text-center md:text-left">
                <h1 className="font-headline text-4xl tracking-tight sm:text-5xl">
                {book.title}
                </h1>
                <p className="mt-2 text-xl text-muted-foreground">{book.author}</p>
                {book.publicationYear > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">
                    {book.publicationYear}
                </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-2">
                {book.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                    {genre}
                    </Badge>
                ))}
                </div>

                <p className="mt-6 text-base leading-relaxed text-foreground/80 max-w-2xl mx-auto md:mx-0">
                {book.description}
                </p>

                <div>
                    <AiSummary book={book} />
                </div>
            </div>
        </div>
    </div>
  );
}
