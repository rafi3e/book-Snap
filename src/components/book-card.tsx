
import Link from 'next/link';
import Image from 'next/image';
import type { Book, BookSearchResult } from '@/lib/books';
import { getCoverImage } from '@/lib/books';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Book as BookIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BookCardProps extends React.HTMLAttributes<HTMLDivElement> {
  book: Book | BookSearchResult;
  asLink?: boolean;
  href?: string;
  progress?: number; // Add progress prop
}

export function BookCard({ book, asLink, href, className, progress, ...props }: BookCardProps) {
  const coverImage = getCoverImage(book);

  const content = (
    <Card
      className={cn(
        "group flex flex-col transition-all duration-200 hover:bg-card/90 hover:shadow-md",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4 p-4">
        <div className="relative h-24 w-16 shrink-0 rounded-sm bg-muted flex items-center justify-center">
          {coverImage ? (
            <Image
              src={coverImage.imageUrl}
              alt={`Cover of ${book.title}`}
              fill
              sizes="64px"
              className="rounded-sm object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={coverImage.imageHint}
            />
          ) : (
              <BookIcon className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold leading-tight tracking-tight line-clamp-2">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground">{book.author}</p>
        </div>
      </div>
      {progress !== undefined && (
        <div className="px-4 pb-4">
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </Card>
  );

  if (asLink && href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
