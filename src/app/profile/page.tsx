
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  LogOut,
  User as UserIcon,
  Book,
  Feather,
  Scroll,
  type LucideIcon,
  BookHeart,
  Edit,
  Palette,
  Shield,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const avatarMap: Record<string, LucideIcon> = {
  user: UserIcon,
  book: Book,
  feather: Feather,
  scroll: Scroll,
};

function ProfileTab({ user }: { user: import('firebase/auth').User | null }) {
    const router = useRouter();
    if (!user) return null;
    
    const photoURL = user.photoURL;
    const isCustomAvatar = photoURL && photoURL.startsWith('data:image/');
    const AvatarIcon = photoURL && !isCustomAvatar ? avatarMap[photoURL] || UserIcon : UserIcon;
    
    const handleEditProfile = () => {
        router.push('/auth/complete-profile');
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                     <Avatar className="h-16 w-16 border">
                        {isCustomAvatar && <AvatarImage src={photoURL} alt={user.displayName || 'User'} />}
                        <AvatarFallback>
                            <AvatarIcon className="h-8 w-8" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-xl font-semibold">{user.displayName || 'BookSnap User'}</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Button onClick={handleEditProfile} variant="outline" className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                </Button>
            </CardContent>
        </Card>
    );
}

function PersonalizationTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Personalization</CardTitle>
                <CardDescription>
                    Customize the look and feel of your app. (Coming soon)
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
                <p>Theme and color options will be available here.</p>
            </CardContent>
        </Card>
    )
}

function AccountTab() {
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleSignOut = async () => {
        try {
        await auth.signOut();
        toast({
            title: 'Signed Out',
            description: 'You have been successfully signed out.',
        });
        router.push('/');
        } catch (error) {
        console.error('Sign Out Error:', error);
        toast({
            variant: 'destructive',
            title: 'Sign Out Failed',
            description: 'An error occurred while signing out. Please try again.',
        });
        }
    };

    return (
        <Card>
             <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                    Manage your account and app settings.
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                 <Button onClick={handleSignOut} variant="destructive" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
            </CardContent>
        </Card>
    )
}


export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  if (isUserLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto flex h-full max-w-md flex-col items-center justify-center gap-6 px-4 py-8 text-center">
        <BookHeart className="h-16 w-16 text-muted-foreground" />
        <div className='space-y-2'>
            <h1 className="text-2xl font-semibold">Join BookSnap</h1>
            <p className="text-muted-foreground">
                Create an account to save your library, track your reading progress, and get personalized recommendations.
            </p>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Button asChild size="lg">
            <Link href="/auth/login">Log In</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="/">Continue as Guest</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 text-center">
            <h1 className="text-center font-headline text-4xl sm:text-5xl">
            Settings
            </h1>
            <p className="mt-2 text-center text-muted-foreground">
            Manage your profile and preferences.
            </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile"><UserIcon className='sm:mr-2' /> <span className='hidden sm:inline'>Profile</span></TabsTrigger>
                <TabsTrigger value="personalization"><Palette className='sm:mr-2' /> <span className='hidden sm:inline'>Personalization</span></TabsTrigger>
                <TabsTrigger value="account"><Shield className='sm:mr-2' /> <span className='hidden sm:inline'>Account</span></TabsTrigger>
            </TabsList>
            <div className="mt-6">
                <TabsContent value="profile">
                    <ProfileTab user={user} />
                </TabsContent>
                <TabsContent value="personalization">
                    <PersonalizationTab />
                </TabsContent>
                <TabsContent value="account">
                    <AccountTab />
                </TabsContent>
            </div>
        </Tabs>
    </div>
  );
}
