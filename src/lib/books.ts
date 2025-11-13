
import { z } from 'zod';

export interface Book {
  id: string; // This will be the Open Library Work ID, e.g., OL45883W
  title: string;
  author: string;
  publicationYear: number;
  description: string;
  rating: number; 
  ratingCount: number; // Number of ratings
  genres: string[];
  coverId: number | null; // This will be the Open Library Cover ID
}

export interface BookSearchResult {
  id: string;
  title: string;
  author: string;
  publicationYear: number | null;
  coverId: number | null;
}

export const RecommendedBookSchema = z.object({
  title: z.string().describe('The title of the recommended book.'),
  author: z.string().describe('The author of the recommended book.'),
  reason: z.string().describe('A short, compelling reason (1-2 sentences) why this book is a good recommendation based on the original book.'),
});

export const recommendationsInputSchema = z.object({
    bookTitle: z.string().min(1, 'Book title is required.'),
    bookAuthor: z.string().min(1, 'Book author is required.'),
    bookGenres: z.array(z.string()).min(1, 'At least one genre is required.'),
});

// Helper to format search results into a simplified Book model
function formatBook(doc: any): BookSearchResult {
    return {
        id: doc.key.replace('/works/', ''),
        title: doc.title,
        author: doc.author_name?.[0] || 'Unknown Author',
        publicationYear: doc.first_publish_year || null,
        coverId: doc.cover_i || null,
    };
}


const OPEN_LIBRARY_HEADERS = {
  'User-Agent': 'BooksnapApp/1.0 (contact@example.com)',
};

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  if (!query) {
    return [];
  }
  try {
    // Directly call Open Library search API since Next.js API routes are not available in static export
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`, {
      headers: OPEN_LIBRARY_HEADERS,
    });
    if (!response.ok) {
      console.error('Failed to fetch from Open Library:', response.status, response.statusText);
      return [];
    }
    const data = await response.json();
    return data.docs.map(formatBook);
  } catch (error) {
    console.error("Error searching books from Open Library:", error);
    return [];
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  try {
    const workResponse = await fetch(`https://openlibrary.org/works/${id}.json`, {
      headers: OPEN_LIBRARY_HEADERS,
    });
    if (!workResponse.ok) throw new Error('Work not found');
    const workData = await workResponse.json();

    const authorKey = workData.authors?.[0]?.author?.key;
    let authorName = 'Unknown Author';
    if (authorKey) {
        const authorResponse = await fetch(`https://openlibrary.org${authorKey}.json`, {
          headers: OPEN_LIBRARY_HEADERS,
        });
        if (authorResponse.ok) {
            const authorData = await authorResponse.json();
            authorName = authorData.name;
        }
    }

    let description = 'No description available.';
    if (typeof workData.description === 'string') {
        description = workData.description;
    } else if (workData.description?.value) {
        description = workData.description.value;
    }

    // Get subjects for genres, limit to 5
    const subjects = workData.subjects?.slice(0, 5) || [];

    // Fetch rating
    let rating = (id.charCodeAt(id.length - 1) % 20) / 10 + 3.0; // Fallback pseudo-random rating
    let ratingCount = 0;
    try {
      const ratingResponse = await fetch(`https://openlibrary.org/works/${id}/ratings.json`, {
        headers: OPEN_LIBRARY_HEADERS,
      });
      if(ratingResponse.ok) {
        const ratingData = await ratingResponse.json();
        if (ratingData.summary?.average) {
          rating = ratingData.summary.average;
        }
        if (ratingData.summary?.count) {
          ratingCount = ratingData.summary.count;
        }
      }
    } catch(e) {
      console.error("Could not fetch rating, using fallback.", e);
    }


    return {
      id,
      title: workData.title,
      author: authorName,
      publicationYear: workData.first_publish_date ? new Date(workData.first_publish_date).getFullYear() : 0,
      description: description.split(/\n/)[0], // Take first paragraph
      rating: rating,
      ratingCount: ratingCount,
      genres: subjects,
      coverId: workData.covers?.[0] || null,
    };
  } catch (error) {
    console.error(`Error fetching book by ID ${id}:`, error);
    return null;
  }
}

export function getCoverImage(book: { coverId: number | null } | BookSearchResult): { imageUrl: string; imageHint: string } | null {
  if (!book.coverId) {
    return null;
  }
  return {
    imageUrl: `https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg`,
    imageHint: 'book cover'
  };
}


export async function getSimilarBooks(bookId: string): Promise<BookSearchResult[]> {
    const currentBook = await getBookById(bookId);
    if (!currentBook || currentBook.genres.length === 0) return [];
  
    // Find similar books based on the first genre
    const subject = currentBook.genres[0];
    try {
      const response = await fetch(`https://openlibrary.org/subjects/${subject.toLowerCase().replace(/ /g, '_')}.json?limit=4`, {
        headers: OPEN_LIBRARY_HEADERS,
      });
      if (!response.ok) return [];
      const data = await response.json();
      
      const similar = data.works
        .map((work: any) => ({
          id: work.key.replace('/works/', ''),
          title: work.title,
          author: work.authors?.[0]?.name || 'Unknown Author',
          publicationYear: work.first_publish_year || null,
          coverId: work.cover_id || null,
        }))
        .filter((b: BookSearchResult) => b.id !== bookId) // Exclude the book itself
        .slice(0,3);

      return similar;
    } catch (error) {
      console.error("Error fetching similar books:", error);
      return [];
    }
}
