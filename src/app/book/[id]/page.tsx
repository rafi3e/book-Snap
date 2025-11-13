
import { notFound } from 'next/navigation';
import { getBookById } from '@/lib/books';
import { BookDetailsView } from './book-details-view';
import { Separator } from '@/components/ui/separator';
import { AiRecommendations } from './ai-recommendations';
import { DiscussionSection } from './discussion-section';

export async function generateStaticParams() {
  // Return a dummy ID to satisfy Next.js's static export requirement for dynamic routes.
  // In a real application, you would fetch a list of book IDs to pre-render.
  return [{ id: 'dummy-book-id' }];
}

type BookPageProps = {
  params: {
    id: string;
  };
};

export default async function BookPage({ params }: BookPageProps) {
  const book = await getBookById(params.id);

  if (!book) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <BookDetailsView book={book} />

      <Separator className="my-12" />
      <DiscussionSection bookId={book.id} />

      <Separator className="my-12" />
      <AiRecommendations book={book} />
    </div>
  );
}
