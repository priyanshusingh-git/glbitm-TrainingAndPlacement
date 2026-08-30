import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import getCroppedImg from '@/lib/image-processing'

interface ImageCropperProps {
 imageSrc: string | null
 onCropComplete: (croppedImg: Blob) => void
 onCancel: () => void
 open: boolean
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel, open }: ImageCropperProps) {
 const [crop, setCrop] = useState({ x: 0, y: 0 })
 const [zoom, setZoom] = useState(1)
 const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

 const onCropChange = (crop: { x: number; y: number }) => {
 setCrop(crop)
 }

 const onZoomChange = (zoom: number) => {
 setZoom(zoom)
 }

 const { toast } = useToast()

 const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
 setCroppedAreaPixels(croppedAreaPixels)
 }, [])

 const handleSave = async () => {
 if (imageSrc && croppedAreaPixels) {
 try {
 const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
 if (croppedImage) {
 onCropComplete(croppedImage)
 } else {
 console.error("Failed to crop image, result is null")
 toast({
 variant:"destructive",
 title:"Error",
 description:"Could not generate cropped image. Please try another image.",
 })
 }
 } catch (e) {
 console.error("Crop failed:", e)
 toast({
 variant:"destructive",
 title:"Error",
 description:"Failed to crop image. Please try again."
 })
 }
 } else {
 console.error("Missing crop data", { imageSrc: !!imageSrc, croppedAreaPixels })
 }
 }

 return (
    <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] sm:w-full rounded-xl border-border/70 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">Crop Profile Picture</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Adjust the framing and zoom level for your student dossier photo.
          </DialogDescription>
        </DialogHeader>
        <div className="relative h-[260px] sm:h-[300px] w-full bg-black rounded-lg overflow-hidden border border-border/40">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteHandler}
              onZoomChange={onZoomChange}
            />
          )}
        </div>
        <div className="py-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Zoom Level</span>
            <span className="font-mono text-[11px]">{zoom.toFixed(1)}x</span>
          </div>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.05}
            onValueChange={(val) => setZoom(val[0])}
          />
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onCancel} className="rounded-sm text-xs h-9 px-4">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="bg-brown-800 text-cream hover:bg-brown-900 text-xs font-bold rounded-sm h-9 px-4 shadow-sm">
            Confirm &amp; Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
 )
}
