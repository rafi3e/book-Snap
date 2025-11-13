'use client';

import Link from 'next/link';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Book, Feather, Scroll, type LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const avatarMap: Record<string, LucideIcon> = {
  user: UserIcon,
  book: Book,
  feather: Feather,
  scroll: Scroll,
};

export function ProfileButton() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }
  
  const photoURL = user?.photoURL;
  const isCustomAvatar = photoURL && photoURL.startsWith('data:image/');
  const AvatarIcon = photoURL && !isCustomAvatar ? avatarMap[photoURL] || UserIcon : UserIcon;

  return (
    <Button asChild variant="ghost" className="h-10 w-10 rounded-full">
      <Link href="/profile">
        <Avatar>
          {isCustomAvatar && <AvatarImage src={photoURL} alt={user?.displayName || 'User'} />}
          <AvatarFallback>
            <AvatarIcon className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <span className="sr-only">Profile</span>
      </Link>
    </Button>
  );
}
