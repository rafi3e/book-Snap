
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Camera, Search } from 'lucide-react';
import Image from 'next/image';

const floatingImages = [
    {
      "id": "OL26412752W",
      "imageUrl": "https://covers.openlibrary.org/b/id/10301712-L.jpg",
      "style": { "animationDelay": "0s" },
      "position": { "top": "10%", "left": "15%" },
      "imageHint": "dune book"
    },
    {
      "id": "OL27448W",
      "imageUrl": "https://covers.openlibrary.org/b/id/12693523-L.jpg",
      "style": { "animationDelay": "1.2s" },
      "position": { "top": "20%", "right": "10%" },
      "imageHint": "the hobbit"
    },
    {
      "id": "OL45883W",
      "imageUrl": "https://covers.openlibrary.org/b/id/12718855-L.jpg",
      "style": { "animationDelay": "2.4s" },
      "position": { "bottom": "15%", "left": "20%" },
      "imageHint": "lord of the rings"
    },
    {
      "id": "OL24949015W",
      "imageUrl": "https://covers.openlibrary.org/b/id/8237927-L.jpg",
      "style": { "animationDelay": "3.6s" },
      "position": { "bottom": "10%", "right": "15%" },
      "imageHint": "sci fi book"
    },
    {
      "id": "OL24346516W",
      "imageUrl": "https://covers.openlibrary.org/b/id/10185989-L.jpg",
      "style": { "animationDelay": "4.8s" },
      "position": { "top": "60%", "left": "5%" },
      "imageHint": "the martian"
    }
];

export default function HomePage() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-10">
        {floatingImages.map((img) => (
          <Image
            key={img.id}
            src={img.imageUrl}
            alt={img.imageHint}
            width={150}
            height={225}
            className="absolute rounded-lg object-cover shadow-2xl animate-float"
            style={{ ...img.position, ...img.style }}
            data-ai-hint={img.imageHint}
          />
        ))}
      </div>
      <div className="container relative z-10 flex h-full flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-bold tracking-tighter font-headline sm:text-7xl md:text-8xl">
          BookSnap
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Snap it. Know it.
          <br />
          Discover any book instantly — by taking a picture or searching
          manually.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6">
          <Button asChild size="lg" className="text-lg py-7 px-8">
            <Link href="/search">
              <Search className="mr-2 h-5 w-5" />
              Search a Book
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="text-lg py-7 px-8"
          >
            <Link href="/scan">
              <Camera className="mr-2 h-5 w-5" />
              Scan a Book
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
