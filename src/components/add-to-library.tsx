
'use client';

import { useUser } from '@/firebase';
import {
  addLibraryEntry,
  updateLibraryEntry,
  removeLibraryEntry,
  useLibraryEntry,
  type ReadingStatus,
} from '@/lib/library';
import type { Book } from '@/lib/books';
import { Button } from '@/components/ui/button';
import { Loader2, Check, BookPlus, Trash2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusOptions: { label: string; value: ReadingStatus }[] = [
  { label: 'Want to Read', value: 'want-to-read' },
  { label: 'Reading', value: 'reading' },
  { label: 'Finished', value: 'finished' },
];

export function AddToLibrary({ book }: { book: Book }) {
  const { user } = useUser();
  const { data: libraryEntry, isLoading } = useLibraryEntry(user?.uid, book.id);
  const [progress, setProgress] = useState(libraryEntry?.progress || 0);

  const debouncedProgress = useDebounce(progress, 500);

  useEffect(() => {
    if (libraryEntry) {
      setProgress(libraryEntry.progress);
    }
  }, [libraryEntry]);

  useEffect(() => {
    if (!user || !libraryEntry || debouncedProgress === libraryEntry.progress) return;

    let updates: { progress: number; readingStatus?: ReadingStatus } = { progress: debouncedProgress };
    if (debouncedProgress === 100 && libraryEntry.readingStatus !== 'finished') {
      updates.readingStatus = 'finished';
    }

    updateLibraryEntry(user.uid, book.id, updates);
  }, [debouncedProgress, user, libraryEntry, book.id]);

  const handleStatusChange = (status: ReadingStatus) => {
    if (!user) return;

    if (libraryEntry) {
      updateLibraryEntry(user.uid, book.id, { readingStatus: status });
    } else {
      addLibraryEntry(user.uid, book, status);
    }
  };

  const handleRemove = () => {
    if (!user) return;
    removeLibraryEntry(user.uid, book.id);
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  const currentStatus = libraryEntry?.readingStatus;
  const triggerText = currentStatus
    ? statusOptions.find((s) => s.value === currentStatus)?.label
    : 'Add to Library';
  const TriggerIcon = currentStatus ? Check : BookPlus;

  return (
    <div className="flex w-full flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={currentStatus ? 'secondary' : 'default'} className="w-full">
            <TriggerIcon className="mr-2 h-4 w-4" />
            {triggerText}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Reading Status</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={currentStatus}
            onValueChange={(value) => handleStatusChange(value as ReadingStatus)}
          >
            {statusOptions.map(({ label, value }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          {currentStatus && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleRemove}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Remove from Library</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {currentStatus === 'reading' && (
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Slider
            value={[progress]}
            onValueChange={(value) => setProgress(value[0])}
            max={100}
            step={1}
          />
        </div>
      )}
    </div>
  );
}
