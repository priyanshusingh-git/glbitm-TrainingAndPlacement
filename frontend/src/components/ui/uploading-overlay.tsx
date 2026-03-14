import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, UploadCloud } from 'lucide-react';

interface UploadingOverlayProps {
 isUploading: boolean;
}

export function UploadingOverlay({ isUploading }: UploadingOverlayProps) {
 return (
 <AnimatePresence>
 {isUploading && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
 >
 <motion.div
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.8, opacity: 0 }}
 className="bg-background rounded-xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full mx-4 border"
 >
 <div className="relative">
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ duration: 2, repeat: Infinity, ease:"linear" }}
 className="absolute inset-0 rounded-full border-b-2 border-brown-800"
 />
 <div className="h-16 w-16 bg-brown-800/10 rounded-full flex items-center justify-center">
 <UploadCloud className="h-8 w-8 text-brown-800" />
 </div>
 </div>

 <div className="text-center space-y-2">
 <h3 className="text-lg font-semibold">Uploading Profile Photo...</h3>
 <p className="text-sm text-muted-foreground">Please wait while we update your profile.</p>
 </div>

 <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-2">
 <motion.div
 className="h-full bg-brown-800"
 initial={{ width:"0%" }}
 animate={{ width:"100%" }}
 transition={{ duration: 2, repeat: Infinity }}
 />
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 );
}
