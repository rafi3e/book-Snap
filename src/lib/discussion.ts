
'use client';

import {
  collection,
  query,
  orderBy,
  serverTimestamp,
  addDoc,
  deleteDoc,
  getFirestore,
  runTransaction,
  doc,
  arrayUnion,
  arrayRemove,
  type Timestamp,
} from 'firebase/firestore';
import { useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  bookId: string;
  parentId: string | null;
  text: string;
  createdAt: Timestamp; // Firestore timestamp
  score: number;
  upvotes: string[];
  downvotes: string[];
  isSpoiler?: boolean;
}

export type NewCommentPayload = Omit<Comment, 'id' | 'createdAt' | 'bookId' | 'score' | 'upvotes' | 'downvotes'>;

/**
 * Add a new comment to a book's discussion.
 * This is a non-blocking operation.
 * @param bookId The ID of the book being commented on.
 * @param payload The content of the new comment, may include parentId.
 */
export async function addComment(bookId: string, payload: NewCommentPayload) {
  if (!bookId || !payload.userId) return;

  const db = getFirestore();
  const commentsColRef = collection(db, 'books', bookId, 'comments');

  const commentData = {
    ...payload,
    bookId,
    parentId: payload.parentId || null,
    createdAt: serverTimestamp(),
    score: 0,
    upvotes: [],
    downvotes: [],
    isSpoiler: payload.isSpoiler || false,
  };

  // We don't await this, letting it run in the background.
  addDoc(commentsColRef, commentData).catch(error => {
    errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
            path: commentsColRef.path,
            operation: 'create',
            requestResourceData: commentData,
        })
    )
  });
}

/**
 * Deletes a comment from a book's discussion.
 * @param bookId The ID of the book.
 * @param commentId The ID of the comment to delete.
 */
export async function deleteComment(bookId: string, commentId: string) {
    if (!bookId || !commentId) return;
  
    const db = getFirestore();
    const commentRef = doc(db, 'books', bookId, 'comments', commentId);
  
    deleteDoc(commentRef).catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: commentRef.path,
          operation: 'delete',
        })
      );
    });
  }

/**
 * A hook to fetch all comments for a specific book in real-time,
 * ordered by creation date.
 * @param bookId The ID of the book.
 * @returns The comments data, loading state, and error.
 */
export function useBookComments(bookId: string | undefined) {
  const db = getFirestore();

  const commentsQuery = useMemoFirebase(() => {
    if (!bookId) return null;
    const commentsColRef = collection(db, 'books', bookId, 'comments');
    return query(commentsColRef, orderBy('createdAt', 'asc'));
  }, [db, bookId]);

  return useCollection<Comment>(commentsQuery);
}

/**
 * Handles up-voting or down-voting a comment in a transaction.
 * @param bookId The ID of the book.
 * @param commentId The ID of the comment being voted on.
 * @param userId The ID of the user casting the vote.
 * @param voteType 'up' or 'down'.
 */
export async function handleVote(
    bookId: string,
    commentId: string,
    userId: string,
    voteType: 'up' | 'down'
  ) {
    const db = getFirestore();
    const commentRef = doc(db, 'books', bookId, 'comments', commentId);
  
    runTransaction(db, async (transaction) => {
      const commentDoc = await transaction.get(commentRef);
      if (!commentDoc.exists()) {
        throw 'Document does not exist!';
      }

      const data = commentDoc.data();
      const upvotes = data.upvotes || [];
      const downvotes = data.downvotes || [];

      const hasUpvoted = upvotes.includes(userId);
      const hasDownvoted = downvotes.includes(userId);

      let newUpvotes = [...upvotes];
      let newDownvotes = [...downvotes];

      if (voteType === 'up') {
        if (hasUpvoted) {
          // User is removing their upvote
          newUpvotes = newUpvotes.filter((id) => id !== userId);
        } else {
          // User is adding an upvote (and removing any downvote)
          newUpvotes.push(userId);
          newDownvotes = newDownvotes.filter((id) => id !== userId);
        }
      } else if (voteType === 'down') {
        if (hasDownvoted) {
          // User is removing their downvote
          newDownvotes = newDownvotes.filter((id) => id !== userId);
        } else {
          // User is adding a downvote (and removing any upvote)
          newDownvotes.push(userId);
          newUpvotes = newUpvotes.filter((id) => id !== userId);
        }
      }

      const newScore = newUpvotes.length - newDownvotes.length;

      const updatePayload = {
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        score: newScore,
      };

      transaction.update(commentRef, updatePayload);
    }).catch((e) => {
        // The transaction failed, likely due to a security rule.
        // We don't know the exact data that was attempted, so we'll construct our best guess.
        // This won't be perfect but is the best we can do for a transaction.
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: commentRef.path,
                operation: 'update',
                requestResourceData: {
                    // This is an approximation of what we tried to do.
                    // The actual state might have changed between our read and write.
                    'upvotes': '(Updated in transaction)',
                    'downvotes': '(Updated in transaction)',
                    'score': '(Updated in transaction)',
                },
            })
        );
    });
  }
    
