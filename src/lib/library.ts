
import {
  collection,
  doc,
  getFirestore,
  serverTimestamp,
} from 'firebase/firestore';
import {
  setDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { useDoc, useMemoFirebase } from '@/firebase';
import type { BookSearchResult } from './books';

export type ReadingStatus = 'want-to-read' | 'reading' | 'finished';

export interface LibraryEntry {
  id: string; // bookId
  userId: string;
  readingStatus: ReadingStatus;
  progress: number;
  book: {
    id: string;
    title: string;
    author: string;
    coverId: number | null;
    publicationYear: number | null;
  };
  addedAt: any; // Server timestamp
  updatedAt: any; // Server timestamp
}

/**
 * Add a book to a user's library.
 * @param userId The user's ID.
 * @param book The book object.
 * @param status The reading status.
 */
export function addLibraryEntry(
  userId: string,
  book: BookSearchResult,
  status: ReadingStatus
) {
  if (!userId || !book) return;

  const db = getFirestore();
  const entryRef = doc(db, 'users', userId, 'libraryEntries', book.id);
  const entryData: LibraryEntry = {
    id: book.id,
    userId: userId,
    readingStatus: status,
    progress: status === 'finished' ? 100 : 0,
    book: {
      id: book.id,
      title: book.title,
      author: book.author,
      coverId: book.coverId,
      publicationYear: book.publicationYear,
    },
    addedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  setDocumentNonBlocking(entryRef, entryData, { merge: false });
}

/**
 * Update an existing library entry.
 * @param userId The user's ID.
 * @param bookId The book's ID.
 * @param updates The fields to update.
 */
export function updateLibraryEntry(
  userId: string,
  bookId: string,
  updates: Partial<Pick<LibraryEntry, 'readingStatus' | 'progress'>>
) {
  if (!userId || !bookId) return;
  const db = getFirestore();
  const entryRef = doc(db, 'users', userId, 'libraryEntries', bookId);

  const dataWithTimestamp = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  updateDocumentNonBlocking(entryRef, dataWithTimestamp, { merge: true });
}

/**
 * Remove a book from a user's library.
 * @param userId The user's ID.
 * @param bookId The book's ID.
 */
export function removeLibraryEntry(userId: string, bookId: string) {
  if (!userId || !bookId) return;
  const db = getFirestore();
  const entryRef = doc(db, 'users', userId, 'libraryEntries', bookId);
  deleteDocumentNonBlocking(entryRef);
}

/**
 * A hook to get a single library entry for a user and book.
 * @param userId The user's ID.
 * @param bookId The book's ID.
 * @returns The library entry data, loading state, and error.
 */
export function useLibraryEntry(userId: string | undefined, bookId: string) {
  const db = getFirestore();

  const entryRef = useMemoFirebase(() => {
    if (!userId || !bookId) return null;
    return doc(db, 'users', userId, 'libraryEntries', bookId);
  }, [db, userId, bookId]);

  return useDoc<LibraryEntry>(entryRef);
}
