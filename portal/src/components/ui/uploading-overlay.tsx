'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { UploadCloud } from 'lucide-react';
import { Heading } from '@/components/ui/heading';

interface UploadingOverlayProps {
  isUploading: boolean;
}

export function UploadingOverlay({ isUploading }: UploadingOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isUploading || !mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 transition-opacity animate-in fade-in duration-200">
      <div className="bg-card animate-in fade-in zoom-in-95 rounded-xl border border-border/80 p-6 sm:p-7 shadow-2xl mx-4 flex w-full max-w-sm flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 border-r-brown-800 animate-spin" />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brown-800/10">
            <UploadCloud className="h-8 w-8 text-brown-800 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-1.5">
          <Heading variant="card-title" as="h3" className="text-base font-bold text-foreground">
            Uploading Profile Photo...
          </Heading>
          <p className="text-xs text-muted-foreground">Please wait while we update your profile.</p>
        </div>

        <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-1">
          <div className="uploading-overlay-bar h-full w-full bg-gradient-to-r from-brown-800 via-amber-500 to-brown-800" />
        </div>
      </div>
    </div>,
    document.body
  );
}
