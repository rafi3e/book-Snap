'use client';

import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { BookOpen, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/book-card';
import { collection } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { LibraryEntry } from '@/lib/library';


const EmptyShelf = () => (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-muted-foreground">
        <BookOpen className="h-16 w-16" />
        <p className="text-lg font-medium">This shelf is empty</p>
        <p className="max-w-xs text-sm">
            Search for books and add them to your library to see them here.
        </p>
        <Button asChild className="mt-4" variant="secondary">
            <Link href="/search">Find Books</Link>
        </Button>
    </div>
);

const BookShelf = ({ books }: { books: (LibraryEntry & { progress?: number })[] }) => (
    <div className="grid grid-cols-1 gap-4">
        {books.map((entry) => (
            <BookCard
                key={entry.id}
                book={{
                  id: entry.book.id,
                  title: entry.book.title,
                  author: entry.book.author,
                  coverId: entry.book.coverId,
                  publicationYear: entry.book.publicationYear,
                }}
                asLink
                href={`/book/${entry.book.id}`}
                progress={entry.progress}
            />
        ))}
    </div>
);


export default function LibraryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const libraryCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'libraryEntries');
  }, [firestore, user]);

  const { data: libraryEntries, isLoading: isLibraryLoading } = useCollection<LibraryEntry>(libraryCollectionRef);

  const wantToReadBooks = libraryEntries?.filter(e => e.readingStatus === 'want-to-read') || [];
  const readingBooks = libraryEntries?.filter(e => e.readingStatus === 'reading') || [];
  const finishedBooks = libraryEntries?.filter(e => e.readingStatus === 'finished') || [];

  const NotLoggedInState = () => (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-muted-foreground">
        <BookOpen className="h-16 w-16" />
        <p className="text-lg font-medium">Your library is waiting</p>
        <p className="max-w-xs">
            Sign in to start building your personal collection of books.
        </p>
        <Button asChild className="mt-4">
            <Link href="/auth/login">Sign In</Link>
        </Button>
    </div>
  );

  const isLoading = isUserLoading || isLibraryLoading;

  if(isLoading && user) {
    return (
        <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-center font-headline text-4xl sm:text-5xl">
          My Library
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          Your personal collection of books.
        </p>
      </div>

      {!user ? (
        <NotLoggedInState />
      ) : (
        <Tabs defaultValue="reading" className="w-full flex flex-col flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="want-to-read">Want to Read</TabsTrigger>
            <TabsTrigger value="reading">Reading</TabsTrigger>
            <TabsTrigger value="finished">Finished</TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-y-auto mt-6">
            <TabsContent value="want-to-read">
              {wantToReadBooks.length > 0 ? <BookShelf books={wantToReadBooks} /> : <EmptyShelf />}
            </TabsContent>
            <TabsContent value="reading">
               {readingBooks.length > 0 ? <BookShelf books={readingBooks} /> : <EmptyShelf />}
            </TabsContent>
            <TabsContent value="finished">
               {finishedBooks.length > 0 ? <BookShelf books={finishedBooks} /> : <EmptyShelf />}
            </TabsContent>
          </div>
        </Tabs>
      )}

    </div>
  );
}
