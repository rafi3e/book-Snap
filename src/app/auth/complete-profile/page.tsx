
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, User as UserIcon, Book, Feather, Scroll, Upload } from 'lucide-react';
import { generateAiUsernameAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { ImageCropper, getCroppedImg } from '@/components/image-cropper';
import type { Area } from 'react-easy-crop';

const avatars = [
    { id: 'user', icon: UserIcon },
    { id: 'book', icon: Book },
    { id: 'feather', icon: Feather },
    { id: 'scroll', icon: Scroll },
];

export default function CompleteProfilePage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();
    const db = getFirestore();

    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(avatars[0].id);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);

    // Cropper state
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);

    useEffect(() => {
        const fetchUserData = async (uid: string) => {
            const userDocRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setBio(userDoc.data().bio || '');
            }
        };

        if (user) {
            setUsername(user.displayName || '');
            
            const photo = user.photoURL || avatars[0].id;
            if (photo.startsWith('data:image/')) {
                setCustomAvatarPreview(photo);
                setSelectedAvatar('custom');
            } else if (avatars.some(a => a.id === photo)) {
                setSelectedAvatar(photo);
                setCustomAvatarPreview(null);
            } else {
                 setSelectedAvatar(avatars[0].id);
                 setCustomAvatarPreview(null);
            }
            
            fetchUserData(user.uid);
        }
        if(!isUserLoading) {
            setIsInitialLoad(false);
        }
    }, [user, isUserLoading, db]);

    const handleGenerateUsername = async () => {
        setIsGenerating(true);
        const result = await generateAiUsernameAction();
        if (result.error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: result.error,
            });
        } else if(result.username) {
            setUsername(result.username);
        }
        setIsGenerating(false);
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            setImageToCrop(e.target?.result as string);
            setIsCropperOpen(true);
        };
        reader.readAsDataURL(file);
        // Reset file input to allow re-selection of the same file
        event.target.value = '';
    };

    const handleCropComplete = async (croppedAreaPixels: Area) => {
        if (!imageToCrop) return;
        try {
            const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                setCustomAvatarPreview(dataUrl);
                setSelectedAvatar('custom');
                setIsCropperOpen(false);
                setImageToCrop(null);
            };
            reader.readAsDataURL(croppedImageBlob);

        } catch (e) {
            console.error(e);
            toast({
                variant: 'destructive',
                title: 'Cropping failed',
                description: 'Could not process the image. Please try another one.',
            });
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleAvatarSelection = (id: string) => {
        setSelectedAvatar(id);
        if (id !== 'custom') {
            setCustomAvatarPreview(null);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ variant: 'destructive', title: 'You must be logged in.'});
            return;
        }
        if (username.length < 3) {
            toast({ variant: 'destructive', title: 'Username must be at least 3 characters.'});
            return;
        }

        setIsSaving(true);
        try {
            const finalPhotoURL = selectedAvatar === 'custom' && customAvatarPreview ? customAvatarPreview : selectedAvatar;

            await updateProfile(user, {
                displayName: username,
                photoURL: finalPhotoURL,
            });

            const userRef = doc(db, 'users', user.uid);
            const userData = {
                id: user.uid,
                username: username,
                email: user.email,
                bio: bio,
            };
            setDocumentNonBlocking(userRef, userData, { merge: true });

            toast({ title: 'Profile Updated!', description: 'Your changes have been saved.'});
            router.push('/profile');
        } catch (error: any) {
            console.error("Error updating profile: ", error);
            let description = 'An unknown error occurred. Please try again.';
             if (typeof error.message === 'string') {
                if (error.message.includes('auth/invalid-profile-attribute') || error.message.includes('Photo URL too long')) {
                    description = "The selected image is too large even after compression. Please choose a smaller file.";
                } else {
                    description = error.message;
                }
            }
            toast({ variant: 'destructive', title: 'Failed to update profile.', description: description });
        } finally {
            setIsSaving(false);
        }
    };

    if (isInitialLoad) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }
    
    if (!user && !isUserLoading) {
        router.push('/auth/login');
        return (
            <div className="flex h-full items-center justify-center">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <>
            <ImageCropper
                isOpen={isCropperOpen}
                onClose={() => setIsCropperOpen(false)}
                image={imageToCrop}
                onCropComplete={handleCropComplete}
            />
            <div className="container mx-auto flex h-full max-w-sm flex-col items-center justify-center gap-8 px-4 py-8">
                <div className="text-center">
                    <h1 className="font-headline text-4xl">Edit Your Profile</h1>
                    <p className="text-muted-foreground">Update your username, bio, and avatar.</p>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-8">
                    <div className="space-y-4">
                        <Label htmlFor="username">Username</Label>
                        <div className="flex gap-2">
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Your cool username"
                                required
                                minLength={3}
                            />
                            <Button variant="outline" type="button" onClick={handleGenerateUsername} disabled={isGenerating}>
                                {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 />}
                            </Button>
                        </div>
                    </div>

                     <div className="space-y-4">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us a little about yourself."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>Choose your Avatar</Label>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                        <div className="grid grid-cols-5 gap-4">
                            {avatars.map(({id, icon: Icon}) => (
                                <button
                                    type="button"
                                    key={id}
                                    onClick={() => handleAvatarSelection(id)}
                                    className={cn(
                                        "flex aspect-square items-center justify-center rounded-full border-2 transition-all",
                                        selectedAvatar === id
                                            ? 'border-primary scale-110'
                                            : 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80'
                                    )}
                                >
                                    <Icon className="h-8 w-8" />
                                </button>
                            ))}
                             <button
                                type="button"
                                onClick={handleUploadClick}
                                className={cn(
                                    "flex aspect-square items-center justify-center rounded-full border-2 transition-all relative overflow-hidden",
                                    selectedAvatar === 'custom'
                                        ? 'border-primary scale-110'
                                        : 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80'
                                )}
                            >
                                {customAvatarPreview ? (
                                    <Image src={customAvatarPreview} alt="Custom avatar preview" fill className="object-cover" />
                                ) : (
                                    <Upload className="h-8 w-8" />
                                )}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : "Save Changes"}
                    </Button>
                </form>
            </div>
        </>
    );
}
