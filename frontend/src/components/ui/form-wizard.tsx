"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WizardStep {
 id: string;
 title: string;
 description?: string;
 content: React.ReactNode;
 // Optional function to validate step before proceeding
 onValidate?: () => boolean | Promise<boolean>;
}

interface FormWizardProps {
 steps: WizardStep[];
 onComplete: () => void;
 onCancel: () => void;
 isSubmitting?: boolean;
 submitLabel?: string;
 className?: string;
}

export function FormWizard({
 steps,
 onComplete,
 onCancel,
 isSubmitting = false,
 submitLabel ="Submit",
 className
}: FormWizardProps) {
 const [currentStep, setCurrentStep] = useState(0)
 const [direction, setDirection] = useState(1) // 1 for next, -1 for back
 const [isValidating, setIsValidating] = useState(false)

 const handleNext = async () => {
 const step = steps[currentStep]
 if (step.onValidate) {
 setIsValidating(true)
 try {
 const isValid = await step.onValidate()
 if (!isValid) {
 setIsValidating(false)
 return
 }
 } catch (error) {
 console.error("Validation error", error)
 setIsValidating(false)
 return
 }
 setIsValidating(false)
 }

 if (currentStep < steps.length - 1) {
 setDirection(1)
 setCurrentStep(prev => prev + 1)
 } else {
 onComplete()
 }
 }

 const handleBack = () => {
 if (currentStep > 0) {
 setDirection(-1)
 setCurrentStep(prev => prev - 1)
 } else {
 onCancel()
 }
 }

 const variants = {
 enter: (direction: number) => ({
 x: direction > 0 ? 50 : -50,
 opacity: 0,
 }),
 center: {
 x: 0,
 opacity: 1,
 },
 exit: (direction: number) => ({
 x: direction < 0 ? 50 : -50,
 opacity: 0,
 }),
 }

 return (
 <div className={cn("flex flex-col h-full", className)}>
 {/* Step Indicator Header */}
 <div className="mb-6">
 <div className="flex items-center justify-between relative px-2">
 <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-border rounded-full z-0 overflow-hidden">
 <motion.div
 className="h-full bg-brown-800"
 initial={{ width:"0%" }}
 animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
 transition={{ duration: 0.3, ease:"easeInOut" }}
 />
 </div>
 {steps.map((step, index) => {
 const isCompleted = index < currentStep;
 const isCurrent = index === currentStep;
 const isPending = index > currentStep;

 return (
 <div key={step.id} className="relative flex flex-col items-center justify-center z-10 bg-background round-full px-1">
 <div className={cn(
"w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors border-2 bg-background",
 isCompleted ?"border-brown-800 text-brown-800" :
 isCurrent ?"border-brown-800 text-brown-800" :
"border-muted text-muted-foreground"
 )}>
 {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
 </div>
 </div>
 )
 })}
 </div>
 <div className="mt-4 text-center">
 <h3 className="font-semibold text-lg">{steps[currentStep].title}</h3>
 {steps[currentStep].description && (
 <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
 )}
 </div>
 </div>

 {/* Step Content */}
 <div className="flex-1 overflow-x-hidden relative min-h-[220px]">
 <AnimatePresence mode="popLayout" initial={false} custom={direction}>
 <motion.div
 key={currentStep}
 custom={direction}
 variants={variants}
 initial="enter"
 animate="center"
 exit="exit"
 transition={{
 x: { type:"spring", stiffness: 300, damping: 30 },
 opacity: { duration: 0.2 }
 }}
 className="w-full h-full pb-2"
 >
 {steps[currentStep].content}
 </motion.div>
 </AnimatePresence>
 </div>

 {/* Footer Navigation */}
 <div className="flex items-center justify-between pt-4 mt-2">
 <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting || isValidating}>
 {currentStep === 0 ?"Cancel" : (
 <>
 <ChevronLeft className="w-4 h-4 mr-2" />
 Back
 </>
 )}
 </Button>

 <Button type="button" onClick={handleNext} disabled={isSubmitting || isValidating}>
 {isValidating || isSubmitting ? (
 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
 ) : null}

 {currentStep === steps.length - 1 ? (
 submitLabel
 ) : (
 <>
 Next
 <ChevronRight className="w-4 h-4 ml-2" />
 </>
 )}
 </Button>
 </div>
 </div>
 )
}
