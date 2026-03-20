import React from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadingOverlayProps {
 isUploading: boolean;
}

export function UploadingOverlay({ isUploading }: UploadingOverlayProps) {
 if (!isUploading) {
 return null;
 }

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
 <div className="bg-background animate-in fade-in zoom-in-95 rounded-xl border p-8 shadow-2xl mx-4 flex w-full max-w-sm flex-col items-center gap-4">
 <div className="relative">
 <div className="absolute inset-0 rounded-full border-b-2 border-brown-800 animate-spin" />
 <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brown-800/10">
 <UploadCloud className="h-8 w-8 text-brown-800" />
 </div>
 </div>
 <div className="text-center space-y-2">
 <h3 className="text-lg font-semibold">Uploading Profile Photo...</h3>
 <p className="text-sm text-muted-foreground">Please wait while we update your profile.</p>
 </div>

 <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-2">
 <div className="uploading-overlay-bar h-full w-full bg-brown-800" />
 </div>
 </div>
 </div>
 );
}
