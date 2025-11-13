'use client';

import Link from 'next/link';
import { BookSnapLogo } from '@/components/icons';
import { ProfileButton } from './profile-button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 hidden w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BookSnapLogo className="h-6 w-6" />
          <span className="font-bold">BookSnap</span>
        </Link>
        <ProfileButton />
      </div>
    </header>
  );
}
