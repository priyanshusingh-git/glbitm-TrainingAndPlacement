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
 <DialogContent className="sm:max-w-md">
 <DialogHeader>
 <DialogTitle>Crop Profile Picture</DialogTitle>
 <DialogDescription>
 Adjust the image crop and zoom level.
 </DialogDescription>
 </DialogHeader>
 <div className="relative h-[300px] w-full bg-black">
 {imageSrc && (
 <Cropper
 image={imageSrc}
 crop={crop}
 zoom={zoom}
 aspect={1} // Square aspect ratio
 onCropChange={onCropChange}
 onCropComplete={onCropCompleteHandler}
 onZoomChange={onZoomChange}
 />
 )}
 </div>
 <div className='py-4'>
 <label className='text-sm mb-2 block'>Zoom</label>
 <Slider
 value={[zoom]}
 min={1}
 max={3}
 step={0.1}
 onValueChange={(val) => setZoom(val[0])}
 />
 </div>
 <DialogFooter>
 <Button variant="secondary" onClick={onCancel}>Cancel</Button>
 <Button onClick={handleSave}>Confirm Crop</Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 )
}
