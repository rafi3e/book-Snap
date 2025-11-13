
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, Upload, RefreshCw } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { extractBookTitleAction } from '@/app/actions';

export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const getCameraStream = async () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Camera API not available in this browser.');
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Unsupported Browser',
          description: 'Your browser does not support camera access.',
        });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        streamRef.current = stream;
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };

    getCameraStream();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode, toast]);

  const processImage = useCallback(async (imageDataUri: string) => {
    setIsProcessing(true);
    const result = await extractBookTitleAction({ imageDataUri });

    if (result.error || !result.title) {
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: result.error || 'Could not find a title in the image. Please try again.',
      });
      setIsProcessing(false);
      return;
    }
    
    toast({
        title: 'Title Found!',
        description: `Searching for "${result.title}"...`,
    });

    router.push(`/search?q=${encodeURIComponent(result.title)}`);

  }, [router, toast]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageDataUri = canvas.toDataURL('image/jpeg');
    processImage(imageDataUri);

  }, [processImage]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUri = e.target?.result as string;
        if (imageDataUri) {
          processImage(imageDataUri);
        }
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFlipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-between bg-black p-4 text-white">
      <div className="w-full max-w-sm flex-1 flex flex-col justify-center items-center">
        <div className="relative w-full aspect-[9/16] max-h-[70vh] overflow-hidden rounded-2xl border-4 border-dashed border-primary/50 bg-black/30">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            muted
            playsInline
          />
          {!hasCameraPermission && (
             <div className="absolute inset-0 flex items-center justify-center p-4">
              <Alert variant="destructive">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access to use this feature. You can still upload a photo.
                </AlertDescription>
              </Alert>
            </div>
          )}
          {isProcessing && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="font-semibold text-lg">Analyzing...</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex w-full max-w-sm items-center justify-between gap-4 py-8">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*"
          disabled={isProcessing}
        />
        <Button
          onClick={handleUploadClick}
          disabled={isProcessing}
          variant="secondary"
          className="flex-col h-20 w-20 rounded-full"
          aria-label="Upload book cover"
        >
          <Upload className="h-8 w-8" />
        </Button>
        <Button
          onClick={handleCapture}
          disabled={isProcessing || !hasCameraPermission}
          size="lg"
          className="h-24 w-24 rounded-full border-4 border-white/20"
          aria-label="Capture book cover"
        >
          <Camera className="h-10 w-10" />
        </Button>
        <Button
          onClick={handleFlipCamera}
          disabled={isProcessing || !hasCameraPermission}
          variant="secondary"
          className="flex-col h-20 w-20 rounded-full"
          aria-label="Flip camera"
        >
            <RefreshCw className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
}
