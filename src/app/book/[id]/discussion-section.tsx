
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/firebase';
import {
  addComment,
  handleVote,
  deleteComment,
  useBookComments,
  type Comment,
} from '@/lib/discussion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Loader2,
  MessageSquare,
  User as UserIcon,
  Book,
  Feather,
  Scroll,
  CornerDownRight,
  ArrowUp,
  ArrowDown,
  Trash2,
  type LucideIcon,
  EyeOff,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Switch } from '@/components/ui/switch';


const avatarMap: Record<string, LucideIcon> = {
  user: UserIcon,
  book: Book,
  feather: Feather,
  scroll: Scroll,
};

function SpoilerContent({ text }: { text: string }) {
    const [isRevealed, setIsRevealed] = useState(false);

    if (!isRevealed) {
        return (
            <button
                className="spoiler-button"
                onClick={() => setIsRevealed(true)}
            >
                <EyeOff className="mr-2 h-4 w-4" />
                <span>Spoiler - Click to reveal</span>
            </button>
        );
    }
    return <p className="mt-1 text-foreground/80">{text}</p>;
}

function CommentCard({
  comment,
  replies,
  bookId,
  onReplySuccess,
}: {
  comment: Comment;
  replies: Comment[];
  bookId: string;
  onReplySuccess: () => void;
}) {
  const { user } = useUser();
  const [showReplyForm, setShowReplyForm] = useState(false);

  const photoURL = comment.userAvatar;
  const isCustomAvatar = photoURL && photoURL.startsWith('data:image/');
  const AvatarIcon = photoURL && !isCustomAvatar ? avatarMap[photoURL] || UserIcon : UserIcon;


  const onVote = (voteType: 'up' | 'down') => {
    if (!user) return;
    handleVote(bookId, comment.id, user.uid, voteType);
  };

  const onDelete = () => {
    deleteComment(bookId, comment.id);
    onReplySuccess(); // Refetch comments after deletion
  };

  const userVote = user
    ? (comment.upvotes || []).includes(user.uid)
      ? 'up'
      : (comment.downvotes || []).includes(user.uid)
      ? 'down'
      : null
    : null;

  const isOwner = user && user.uid === comment.userId;


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10 border">
          {isCustomAvatar && <AvatarImage src={photoURL} alt={comment.username} />}
          <AvatarFallback>
            <AvatarIcon className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{comment.username}</p>
            <p className="text-xs text-muted-foreground">
              {comment.createdAt
                ? formatDistanceToNow(comment.createdAt.toDate(), {
                    addSuffix: true,
                  })
                : 'Just now'}
            </p>
          </div>
          
          {comment.isSpoiler ? (
            <SpoilerContent text={comment.text} />
          ) : (
            <p className="mt-1 text-foreground/80">{comment.text}</p>
          )}
          
           <div className="mt-2 flex items-center gap-1">
            {user && (
              <>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => onVote('up')}
                    >
                    <ArrowUp className={cn('h-4 w-4', userVote === 'up' && 'text-primary fill-primary')} />
                </Button>
                <span className="text-sm font-semibold w-4 text-center">{comment.score || 0}</span>
                 <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => onVote('down')}
                    >
                    <ArrowDown className={cn('h-4 w-4', userVote === 'down' && 'text-destructive fill-destructive')} />
                </Button>
                 <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-2"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    >
                    <CornerDownRight className="mr-2 h-4 w-4" />
                    Reply
                </Button>
              </>
            )}
            {isOwner && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete your comment. This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </div>
        </div>
      </div>
      
      {showReplyForm && (
        <div className="pl-8">
            <CommentForm
                bookId={bookId}
                parentId={comment.id}
                onSuccess={() => {
                  setShowReplyForm(false);
                  onReplySuccess();
                }}
                placeholder="Write a reply..."
                autoFocus
            />
        </div>
      )}

      {replies.length > 0 && (
        <div className="ml-8 space-y-4 border-l-2 pl-4">
          {replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              replies={[]} // Replies don't have replies in this design
              bookId={bookId}
              onReplySuccess={onReplySuccess}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentForm({
    bookId,
    parentId,
    onSuccess,
    placeholder = 'Share your thoughts...',
    autoFocus = false,
  }: {
    bookId: string;
    parentId?: string;
    onSuccess?: () => void;
    placeholder?: string;
    autoFocus?: boolean;
  }) {
  const { user } = useUser();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSpoiler, setIsSpoiler] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    setIsSubmitting(true);
    await addComment(bookId, {
      userId: user.uid,
      username: isAnonymous ? 'Anonymous' : (user.displayName || 'Anonymous'),
      userAvatar: isAnonymous ? 'user' : (user.photoURL || 'user'),
      text: commentText,
      parentId: parentId,
      isSpoiler: isSpoiler,
    });
    setCommentText('');
    setIsAnonymous(false);
    setIsSpoiler(false);
    setIsSubmitting(false);
    if(onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <Textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder={placeholder}
        className="min-h-[100px]"
        disabled={isSubmitting}
        autoFocus={autoFocus}
      />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center space-x-2">
                <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={(checked) => setIsAnonymous(checked as boolean)} />
                <Label htmlFor="anonymous" className="text-sm font-medium leading-none text-muted-foreground">
                    Post as Anonymous
                </Label>
            </div>
             <div className="flex items-center space-x-2">
                <Switch id="spoiler-mode" checked={isSpoiler} onCheckedChange={setIsSpoiler} />
                <Label htmlFor="spoiler-mode" className="text-sm font-medium leading-none text-muted-foreground">Mark as Spoiler</Label>
            </div>
        </div>
        <Button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="self-end sm:self-auto"
        >
            {isSubmitting ? (
            <Loader2 className="animate-spin" />
            ) : (
            parentId ? 'Post Reply' : 'Post Comment'
            )}
        </Button>
      </div>
    </form>
  );
}

function GuestPrompt() {
  return (
    <div className="mt-6 rounded-lg border border-dashed p-8 text-center">
      <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Join the Discussion</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Log in or create an account to share your thoughts on this book.
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <Button asChild>
          <Link href="/auth/login">Log In</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/auth/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}

export function DiscussionSection({ bookId }: { bookId: string }) {
  const { user } = useUser();
  const {
    data: comments,
    isLoading,
    error,
    forceRefetch
  } = useBookComments(bookId);

  const { topLevelComments, repliesByParentId } = useMemo(() => {
    if (!comments) {
      return { topLevelComments: [], repliesByParentId: {} };
    }
    const allComments = [...comments];
    const repliesByParentId: Record<string, Comment[]> = {};
    const topLevelComments: Comment[] = [];

    // Separate top-level comments and replies
    for (const comment of allComments) {
      if (comment.parentId) {
        if (!repliesByParentId[comment.parentId]) {
          repliesByParentId[comment.parentId] = [];
        }
        repliesByParentId[comment.parentId].push(comment);
      } else {
        topLevelComments.push(comment);
      }
    }

    // Sort top-level comments by score, then by date
    topLevelComments.sort((a, b) => {
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
    });
    
    // Sort replies by score, then creation date
    for (const parentId in repliesByParentId) {
      repliesByParentId[parentId].sort((a, b) => {
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;
        if (scoreB !== scoreA) {
            return scoreB - scoreA;
        }
        return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
      });
    }

    return { topLevelComments, repliesByParentId };
  }, [comments]);

  return (
    <div>
      <h2 className="mb-6 font-headline text-3xl">Discussion</h2>

      {user ? <CommentForm bookId={bookId} onSuccess={forceRefetch} /> : <GuestPrompt />}

      <div className="mt-8 space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading comments...</span>
          </div>
        )}
        {error && (
          <p className="text-center text-destructive">
            Could not load comments.
          </p>
        )}
        {!isLoading && comments && topLevelComments.length > 0 && (
          <>
            {topLevelComments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                replies={repliesByParentId[comment.id] || []}
                bookId={bookId}
                onReplySuccess={forceRefetch}
              />
            ))}
          </>
        )}
        {!isLoading && comments?.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <MessageSquare className="mx-auto h-12 w-12" />
            <p className="mt-4 text-lg">No comments yet.</p>
            <p className="text-sm">
              Be the first to share your thoughts on this book!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
