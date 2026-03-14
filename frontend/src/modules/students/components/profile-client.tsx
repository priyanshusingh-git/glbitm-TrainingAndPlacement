"use client";


import { useEffect, useState } from"react";
import { motion } from"framer-motion";
import { useAuth } from"@/contexts/auth-context";
import { api, API_BASE_URL } from"@/lib/api";
import { cn } from"@/lib/utils";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Label } from"@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from"@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from"@/components/ui/avatar";
import { Badge } from"@/components/ui/badge";
import {
 CalendarIcon, Upload, Camera, Save, Edit2, Lock,
 User, Phone, Mail, MapPin, Home, Building, Briefcase,
 Loader2, Trash2, AlertTriangle, GraduationCap, BookOpen, Award, Info, Settings
} from"lucide-react";
import { useToast } from"@/hooks/use-toast";
import { ImageCropper } from"@/components/ui/image-cropper";
import { UploadingOverlay } from"@/components/ui/uploading-overlay";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/tabs"
import { Checkbox } from"@/components/ui/checkbox"
import { Switch } from"@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from"@/components/ui/alert"
// import { supabase } from"@/lib/supabase" // Supabase removed
import { useSidebar } from"@/components/layout/dashboard/dashboard-layout"
import { INDIAN_STATES, DISTRICTS_BY_STATE } from"@/lib/indian-locations"
import { validators } from"@/lib/validators";
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from"@/components/ui/alert-dialog"

// Custom styles to maintain better readability for disabled fields (85% opacity instead of default 50%)
const customStyles = `
 input:disabled,
 select:disabled {
 opacity: 0.85 !important;
 cursor: not-allowed;
 }
`;

type StudentProfile = {
 id: string;
 name: string;
 rollNo: string;
 admissionId?: string;
 branch: string;
 year?: string;
 currentSemester?: number;
 skills: string[];
 resumeLink?: string | null;
 githubId?: string | null;
 leetcodeId?: string | null;
 photoUrl?: string | null;
 isProfileLocked: boolean;
 isBasicInfoLocked?: boolean;
 isClass10Locked?: boolean;
 isClass12Locked?: boolean;
 isDiplomaLocked?: boolean;
 studentType?: string;
 educationType?: string;

 // Education
 class10School?: string;
 class10Board?: string;
 class10Percentage?: string;
 class10Year?: string;

 class12School?: string;
 class12Board?: string;
 class12Percentage?: string;
 class12PcmPercentage?: string;
 class12MathPercentage?: string;
 class12Year?: string;

 diplomaInstitute?: string;
 diplomaBranch?: string;
 diplomaPercentage?: string;
 diplomaYear?: string;

 // Personal & Address
 mobileNo?: string;
 personalEmail?: string;
 presentHouseNo?: string;
 presentBlock?: string;
 presentLocality?: string;
 presentCity?: string;
 presentTehsil?: string;
 presentDistrict?: string;
 presentState?: string;
 presentCountry?: string;
 presentPincode?: string;
 permanentHouseNo?: string;
 permanentBlock?: string;
 permanentLocality?: string;
 permanentCity?: string;
 permanentTehsil?: string;
 permanentDistrict?: string;
 permanentState?: string;
 permanentCountry?: string;
 permanentPincode?: string;

 // Parents
 fatherName?: string;
 fatherOccupation?: string;
 fatherMobile?: string;
 fatherEmail?: string;
 motherName?: string;
 motherOccupation?: string;
 motherMobile?: string;
 motherEmail?: string;

 semesterResults?: { semester: number; sgpa: number | null; backlogs: number; credits?: number | null; totalMarks?: number | null; obtainedMarks?: number | null; percentage?: number | null; }[];
};

const BRANCHES = ["CSE","CSAI","CSDS","CSAIML","AIML","AIDS","IT","ECE","EEE","ME"];

// Validation Constants
const CURRENT_YEAR = new Date().getFullYear();
const PASSING_YEARS = Array.from({ length: 11 }, (_, i) => (CURRENT_YEAR - i).toString());

const BOARDS = [
"CBSE",
"ICSE/ISC",
"Andhra Pradesh Board",
"Arunachal Pradesh Board",
"Assam Board (SEBA/AHSEC)",
"Bihar Board (BSEB)",
"Chhattisgarh Board (CGBSE)",
"Goa Board (GBSHSE)",
"Gujarat Board (GSEB)",
"Haryana Board (HBSE)",
"Himachal Pradesh Board (HPBOSE)",
"Jammu & Kashmir Board (JKBOSE)",
"Jharkhand Board (JAC)",
"Karnataka Board (KSEEB/PUE)",
"Kerala Board (KBPE)",
"Madhya Pradesh Board (MPBSE)",
"Maharashtra Board (MSBSHSE)",
"Manipur Board (COHSEM/BOSEM)",
"Meghalaya Board (MBOSE)",
"Mizoram Board (MBSE)",
"Nagaland Board (NBSE)",
"Odisha Board (BSE/CHSE)",
"Punjab Board (PSEB)",
"Rajasthan Board (RBSE)",
"Sikkim Board",
"Tamil Nadu Board (TNBSE)",
"Telangana Board (TSBIE/BSE)",
"Tripura Board (TBSE)",
"Uttar Pradesh Board (UPMSP)",
"Uttarakhand Board (UBSE)",
"West Bengal Board (WBBSE/WBCHSE)",
"NIOS",
"IB (International Baccalaureate)",
"Cambridge / IGCSE",
"Others"
];

const DIPLOMA_BRANCHES = [
"Computer Science",
"Information Technology",
"Electronics & Communication",
"Electrical",
"Mechanical",
"Civil",
"Automobile",
"Chemical",
"Others"
];

const getYearOptions = () => {
 const currentYear = new Date().getFullYear();
 const years = [];
 for (let i = 0; i < 4; i++) {
 years.push((currentYear + i).toString());
 }
 return years;
};

const getSemesterOptions = (studentType?: string) => {
 if (studentType === 'Lateral Entry') {
 return [3, 4, 5, 6, 7, 8]; // Lateral entry starts from semester 3
 }
 return [1, 2, 3, 4, 5, 6, 7, 8];
};

export default function StudentProfilePage() {
 const { user, updateUser, logout } = useAuth();
 const { toast } = useToast();
 const { setCollapsed } = useSidebar();

 // Data State
 const [profile, setProfile] = useState<StudentProfile | null>(null);
 const [semesterResults, setSemesterResults] = useState<any[]>([]);
 const [showClass12ForLateralEntry, setShowClass12ForLateralEntry] = useState(false);

 // UI State
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState<string | boolean>(false);
 const [isEditingPersonal, setIsEditingPersonal] = useState(false); // Default to View mode
 const [uploading, setUploading] = useState(false);
 const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

 // Validation State
 const [errors, setErrors] = useState<Record<string, string>>({});
 const [personalErrors, setPersonalErrors] = useState<Record<string, string>>({});

 // Cropper State
 const [cropSrc, setCropSrc] = useState<string | null>(null);
 const [isCropping, setIsCropping] = useState(false);
 const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

 const handleDeletePhoto = async () => {
 if (isDeletingPhoto) return;
 setIsDeleteDialogOpen(false);
 setIsDeletingPhoto(true);

 try {
 await api.put("/students/profile", { photoUrl: null });
 setProfile(p => p ? ({ ...p, photoUrl: null }) : null);
 updateUser({ photoUrl: undefined });
 toast({ title:"Photo Removed", description:"Your profile photo has been deleted." });
 } catch (err) {
 toast({ title:"Error", description:"Failed to remove photo.", variant:"destructive" });
 } finally {
 setIsDeletingPhoto(false);
 }
 };

 // Form Data
 const [formData, setFormData] = useState({
 name:"",
 rollNo:"",
 admissionId:"",
 course:"Bachelor of Technology",
 studentType:"Regular Entry",
 branch:"CSE",
 year: new Date().getFullYear().toString(),
 currentSemester:"",
 githubId:"",
 leetcodeId:"",
 skills: [] as string[],
 resumeLink:"",

 // Education
 educationType:"12th", // or"Diploma"
 class10School:"", class10Board:"", class10Percentage:"", class10Year:"",
 class12School:"", class12Board:"", class12Percentage:"", class12Year:"",
 class12PcmPercentage:"", class12MathPercentage:"",
 diplomaInstitute:"", diplomaBranch:"", diplomaPercentage:"", diplomaYear:"",

 // Personal
 mobileNo:"", personalEmail:"",

 // Address
 presentHouseNo:"", presentBlock:"", presentLocality:"", presentCity:"", presentTehsil:"", presentDistrict:"", presentState:"", presentCountry:"India", presentPincode:"",
 permanentHouseNo:"", permanentBlock:"", permanentLocality:"", permanentCity:"", permanentTehsil:"", permanentDistrict:"", permanentState:"", permanentCountry:"India", permanentPincode:"",
 sameAsPresent: false,

 // Parents
 fatherName:"", fatherOccupation:"", fatherMobile:"", fatherEmail:"",
 motherName:"", motherOccupation:"", motherMobile:"", motherEmail:"",
 });


 useEffect(() => {
 fetchProfile();
 }, []);

 // TODO: Integrate Firebase Realtime or similar for live updates
 useEffect(() => {
 // if (!user) return;
 // ... realtime logic removed
 }, [user, toast]);

 // Validation Helper Functions
 const validateBasicInfo = () => {
 const newErrors: Record<string, string> = {};

 if (!formData.name || formData.name.trim().length < 2) {
 newErrors.name ="Please enter your full name (at least 2 characters)";
 }
 if (!formData.rollNo || formData.rollNo.trim() ==="") {
 newErrors.rollNo ="Please enter your college roll number";
 }
 if (!formData.admissionId || formData.admissionId.trim() ==="") {
 newErrors.admissionId ="Please enter your admission ID";
 }
 if (!formData.course || formData.course.trim() ==="") {
 newErrors.course ="Please enter your course";
 }
 if (!formData.studentType || formData.studentType.trim() ==="") {
 newErrors.studentType ="Please select your student type";
 }
 if (!formData.branch || formData.branch.trim() ==="") {
 newErrors.branch ="Please select your branch/specialization";
 }
 if (!formData.year || formData.year ==="") {
 newErrors.year ="Please select your current academic year";
 }
 if (!formData.currentSemester || formData.currentSemester ==="") {
 newErrors.currentSemester ="Please select your current semester";
 }

 return newErrors;
 };



 const validateSemester = (result: any) => {
 const errors: Record<string, string> = {};

 // SGPA
 if (result.sgpa === undefined || result.sgpa === null || result.sgpa ==="") {
 errors[`semester_${result.semester}_sgpa`] ="SGPA is required";
 } else if (!validators.sgpa(result.sgpa)) {
 errors[`semester_${result.semester}_sgpa`] ="SGPA must be 0-10";
 }

 // Backlogs (0 or positive integer)
 if (result.backlogs === undefined || result.backlogs ==="" || parseInt(result.backlogs) < 0) {
 errors[`semester_${result.semester}_backlogs`] ="Valid backlog count (≥0) required";
 }

 // Credits (positive)
 if (!result.credits || parseInt(result.credits) <= 0) {
 errors[`semester_${result.semester}_credits`] ="Credits must be > 0";
 }

 // Marks Validation
 if (!result.totalMarks) {
 errors[`semester_${result.semester}_totalMarks`] ="Total marks required";
 } else {
 const total = parseFloat(result.totalMarks);
 if (!validators.marks(total) || total <= 0) {
 errors[`semester_${result.semester}_totalMarks`] ="Total marks must be > 0";
 }

 if (!result.obtainedMarks) {
 errors[`semester_${result.semester}_obtainedMarks`] ="Obtained marks required";
 } else {
 const obtained = parseFloat(result.obtainedMarks);
 if (!validators.marks(obtained)) {
 errors[`semester_${result.semester}_obtainedMarks`] ="Obtained marks must be valid";
 } else if (obtained > total) {
 errors[`semester_${result.semester}_obtainedMarks`] ="Obtained cannot exceed Total";
 }
 }
 }

 return errors;
 };


 const clearFieldError = (fieldName: string) => {
 if (errors[fieldName]) {
 const newErrors = { ...errors };
 delete newErrors[fieldName];
 setErrors(newErrors);
 }
 };

 const fetchProfile = async () => {
 setLoading(true);
 try {
 const data = await api.get("/students/profile");
 setProfile(data);

 setFormData(prev => ({
 ...prev,
 name: data.name ||"",
 rollNo: data.rollNo ||"",
 admissionId: data.admissionId ||"",
 course: data.course ||"Bachelor of Technology",
 studentType: data.studentType ||"Regular Entry",
 branch: data.branch ||"CSE",
 year: data.year || new Date().getFullYear().toString(),
 currentSemester: data.currentSemester?.toString() ||"",
 githubId: data.githubId ||"",
 leetcodeId: data.leetcodeId ||"",
 resumeLink: data.resumeLink ||"",

 class10School: data.class10School ||"",
 class10Board: data.class10Board ||"",
 class10Percentage: data.class10Percentage ||"",
 class10Year: data.class10Year ||"",

 class12School: data.class12School ||"",
 class12Board: data.class12Board ||"",
 class12Percentage: data.class12Percentage ||"",
 class12Year: data.class12Year ||"",
 class12PcmPercentage: data.class12PcmPercentage ||"",
 class12MathPercentage: data.class12MathPercentage ||"",

 diplomaInstitute: data.diplomaInstitute ||"",
 diplomaBranch: data.diplomaBranch ||"",
 diplomaPercentage: data.diplomaPercentage ||"",
 diplomaYear: data.diplomaYear ||"",

 educationType: data.studentType === 'Lateral Entry' ? 'Diploma' : '12th',

 mobileNo: data.mobileNo ||"",
 personalEmail: data.personalEmail ||"",

 presentHouseNo: data.presentHouseNo ||"",
 presentBlock: data.presentBlock ||"",
 presentLocality: data.presentLocality ||"",
 presentCity: data.presentCity ||"",
 presentTehsil: data.presentTehsil ||"",
 presentDistrict: data.presentDistrict ||"",
 presentState: data.presentState ||"",
 presentCountry: data.presentCountry ||"India",
 presentPincode: data.presentPincode ||"",

 permanentHouseNo: data.permanentHouseNo ||"",
 permanentBlock: data.permanentBlock ||"",
 permanentLocality: data.permanentLocality ||"",
 permanentCity: data.permanentCity ||"",
 permanentTehsil: data.permanentTehsil ||"",
 permanentDistrict: data.permanentDistrict ||"",
 permanentState: data.permanentState ||"",
 permanentCountry: data.permanentCountry ||"India",
 permanentPincode: data.permanentPincode ||"",

 fatherName: data.fatherName ||"",
 fatherOccupation: data.fatherOccupation ||"",
 fatherMobile: data.fatherMobile ||"",
 fatherEmail: data.fatherEmail ||"",
 motherName: data.motherName ||"",
 motherOccupation: data.motherOccupation ||"",
 motherMobile: data.motherMobile ||"",
 motherEmail: data.motherEmail ||"",

 sameAsPresent: (
 data.presentHouseNo === data.permanentHouseNo &&
 data.presentBlock === data.permanentBlock &&
 data.presentLocality === data.permanentLocality &&
 data.presentCity === data.permanentCity &&
 data.presentTehsil === data.permanentTehsil &&
 data.presentDistrict === data.permanentDistrict &&
 data.presentState === data.permanentState &&
 data.presentPincode === data.permanentPincode &&
 data.presentState !=="" // Ensure not empty
 )
 }));

 // Initialize Semester Results (1-8)
 const initialResults = Array.from({ length: 8 }, (_, i) => {
 const existing = data.semesterResults?.find((r: any) => r.semester === i + 1);
 return {
 semester: i + 1,
 sgpa: existing?.sgpa || null,
 backlogs: existing?.backlogs || 0,
 credits: existing?.credits || null,
 totalMarks: existing?.totalMarks || null,
 obtainedMarks: existing?.obtainedMarks || null,
 percentage: existing?.percentage || null,
 isLocked: existing?.isLocked || false
 };
 });
 setSemesterResults(initialResults);

 } catch (error: any) {
 console.error("Failed to fetch profile:", error);
 if (error.message?.includes("Profile not found") || error.message?.includes("404")) {
 toast({ title:"Session Expired", description:"Please login again.", variant:"destructive" });
 logout();
 } else {
 toast({ title:"Error", description:"Failed to load profile", variant:"destructive" });
 }
 } finally {
 setLoading(false);
 }
 };

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 const { name, value } = e.target;
 let finalValue = value;
 if (name ==="admissionId") finalValue = value.toUpperCase().replace(/\s/g, '');
 if (name ==="name") finalValue = value.replace(/\b\w/g, (char: string) => char.toUpperCase());
 setFormData(prev => ({ ...prev, [name]: finalValue }));
 // Clear error for this field when user starts typing
 if (errors[name]) {
 clearFieldError(name);
 }
 if (personalErrors[name]) {
 setPersonalErrors(prev => {
 const newErrors = { ...prev };
 delete newErrors[name];
 return newErrors;
 });
 }
 };

 // --- Image Handling ---
 const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files && e.target.files.length > 0) {
 const file = e.target.files[0];
 const reader = new FileReader();
 reader.onload = () => { setCropSrc(reader.result as string); setIsCropping(true); };
 reader.readAsDataURL(file);
 e.target.value ="";
 }
 };

 const handleCropComplete = async (blob: Blob) => {
 setIsCropping(false);
 setUploading(true); // Keep spinner if desired, or remove for total optimism

 // 1. Optimistic Update (Show local blob immediately)
 const localUrl = URL.createObjectURL(blob);
 const previousProfile = { ...profile } as StudentProfile;
 const previousUser = user ? { ...user } : null;

 setProfile(p => p ? ({ ...p, photoUrl: localUrl }) : null);
 updateUser({ photoUrl: localUrl });

 const fd = new FormData();
 fd.append("file", blob,"profile.jpg");

 try {
 // Artificial delay removed for speed
 const res = await api.post("/upload", fd);

 // 2. Sync with Backend
 await api.put("/students/profile", { photoUrl: res.url });

 // Update with real URL (though visually identical)
 updateUser({ photoUrl: res.url });
 setProfile(p => p ? ({ ...p, photoUrl: res.url }) : null);

 toast({ title:"Success", description:"Photo updated" });
 fetchProfile();
 } catch (e) {
 // 3. Rollback
 setProfile(previousProfile);
 if (previousUser) updateUser(previousUser as any);
 toast({ title:"Error", description:"Upload failed", variant:"destructive" });
 } finally {
 setUploading(false);
 }
 };

 // --- Save Handlers per Section ---
 const saveBasicInfo = async () => {
 // Validate
 const validationErrors = validateBasicInfo();
 if (Object.keys(validationErrors).length > 0) {
 setErrors(validationErrors);
 toast({ title:"Validation Error", description:"Please fix all errors before saving", variant:"destructive" });
 return;
 }

 const rollNoRegex = /^\d{13}$/;
 if (!rollNoRegex.test(formData.rollNo)) {
 toast({ title:"Validation Error", description:"University Roll No must be exactly 13 digits.", variant:"destructive" });
 return;
 }

 const payload = {
 name: formData.name,
 rollNo: formData.rollNo,
 course: formData.course ||"Bachelor of Technology",
 studentType: formData.studentType ||"Regular Entry",
 branch: formData.branch,
 admissionId: formData.admissionId,
 year: formData.year,
 currentSemester: parseInt(formData.currentSemester),
 isBasicInfoLocked: true
 };

 // 1. Optimistic Update
 const previousProfile = { ...profile } as StudentProfile;
 const optimisticProfile = { ...previousProfile, ...payload, isBasicInfoLocked: true };
 setProfile(optimisticProfile);

 // Optimistically set saving state (optional, or just remove loading entirely for speed)
 // setSaving("basic"); 

 try {
 await api.put("/students/profile", payload);
 toast({ title:"Success", description:"Basic Information saved and locked." });
 } catch (e: any) {
 // 2. Rollback
 setProfile(previousProfile);
 toast({ title:"Error", description: e.response?.data?.error ||"Failed to save", variant:"destructive" });
 } finally {
 setSaving(false);
 }
 };

 const validateClass10 = () => {
 const errors: Record<string, string> = {};
 if (!validators.name(formData.class10School)) errors.class10School ="Valid school name required";

 if (!formData.class10Board) {
 errors.class10Board ="Board is required";
 } else if (!BOARDS.includes(formData.class10Board)) {
 errors.class10Board ="Please select a valid board from the list";
 }

 if (!validators.percentage(formData.class10Percentage)) errors.class10Percentage ="Valid percentage (0-100) required";
 if (!formData.class10Year) errors.class10Year ="Passing year is required";
 return errors;
 };

 const saveClass10 = async () => {
 const validationErrors = validateClass10();
 if (Object.keys(validationErrors).length > 0) {
 setErrors(validationErrors);
 toast({ title:"Validation Error", description:"Please fix errors.", variant:"destructive" });
 return;
 }

 const payload: any = {
 class10School: formData.class10School,
 class10Board: formData.class10Board,
 class10Percentage: formData.class10Percentage,
 class10Year: formData.class10Year,
 isClass10Locked: true
 };

 // 1. Optimistic Update
 const previousProfile = { ...profile } as StudentProfile;
 const optimisticProfile = { ...previousProfile, ...payload, isClass10Locked: true };
 setProfile(optimisticProfile);

 try {
 await api.put("/students/profile", payload);
 toast({ title:"Success", description:"Class 10 details saved and locked." });
 } catch (e: any) {
 setProfile(previousProfile);
 toast({ title:"Error", description: e.response?.data?.error ||"Failed to save", variant:"destructive" });
 } finally {
 setSaving(false);
 }
 };

 const saveClass12 = async () => {
 const validationErrors = formData.educationType ==="12th" || formData.studentType ==="Regular Entry"
 ? validateClass12()
 : validateDiploma();

 if (Object.keys(validationErrors).length > 0) {
 setErrors(validationErrors);
 toast({ title:"Validation Error", description:"Please fix all errors before saving", variant:"destructive" });
 return;
 }

 const payload: any = {
 class12School: formData.class12School,
 class12Board: formData.class12Board,
 class12Percentage: formData.class12Percentage,
 class12Year: formData.class12Year,
 class12PcmPercentage: formData.class12PcmPercentage,
 class12MathPercentage: formData.class12MathPercentage,

 diplomaInstitute: formData.diplomaInstitute,
 diplomaBranch: formData.diplomaBranch,
 diplomaPercentage: formData.diplomaPercentage,
 diplomaYear: formData.diplomaYear,
 };

 if (formData.educationType ==="12th") {
 delete payload.diplomaInstitute; delete payload.diplomaBranch;
 delete payload.diplomaPercentage; delete payload.diplomaYear;
 payload.isClass12Locked = true;
 } else {
 delete payload.class12School; delete payload.class12Board;
 delete payload.class12Percentage; delete payload.class12Year;
 delete payload.class12PcmPercentage; delete payload.class12MathPercentage;
 payload.isDiplomaLocked = true;
 }

 // 1. Optimistic Update
 const previousProfile = { ...profile } as StudentProfile;
 const optimisticProfile = { ...previousProfile, ...payload };
 // Explicitly set lock flags in optimistic state
 if (payload.isClass12Locked) optimisticProfile.isClass12Locked = true;
 if (payload.isDiplomaLocked) optimisticProfile.isDiplomaLocked = true;

 setProfile(optimisticProfile);

 try {
 await api.put("/students/profile", payload);
 toast({ title:"Success", description: `${formData.educationType} details saved and locked.` });
 } catch (e: any) {
 setProfile(previousProfile);
 toast({ title:"Error", description: e.response?.data?.error ||"Failed to save", variant:"destructive" });
 } finally {
 setSaving(false);
 }
 };

 const validateClass12 = () => {
 const errors: Record<string, string> = {};
 if (!validators.name(formData.class12School)) errors.class12School ="Valid school name required";

 if (!formData.class12Board) {
 errors.class12Board ="Board is required";
 } else if (!BOARDS.includes(formData.class12Board)) {
 errors.class12Board ="Please select a valid board from the list";
 }

 if (!validators.percentage(formData.class12Percentage)) errors.class12Percentage ="Valid percentage (0-100) required";
 if (formData.class12PcmPercentage && !validators.percentage(formData.class12PcmPercentage)) errors.class12PcmPercentage ="Invalid PCM %";
 if (formData.class12MathPercentage && !validators.percentage(formData.class12MathPercentage)) errors.class12MathPercentage ="Invalid Math %";
 if (!formData.class12Year) errors.class12Year ="Passing year is required";
 return errors;
 };

 const validateDiploma = () => {
 const errors: Record<string, string> = {};
 if (!validators.name(formData.diplomaInstitute)) errors.diplomaInstitute ="Valid institute name required";
 if (!formData.diplomaBranch) errors.diplomaBranch ="Branch is required";
 if (!validators.percentage(formData.diplomaPercentage)) errors.diplomaPercentage ="Valid percentage (0-100) required";
 if (!formData.diplomaYear) errors.diplomaYear ="Passing year is required";
 return errors;
 };

 const saveOptionalClass12 = async () => {
 const validationErrors = validateClass12();
 if (Object.keys(validationErrors).length > 0) {
 setErrors(validationErrors);
 toast({ title:"Validation Error", description:"Please fix errors.", variant:"destructive" });
 return;
 }

 setSaving("class12");
 try {
 const payload: any = {
 class12School: formData.class12School,
 class12Board: formData.class12Board,
 class12Percentage: formData.class12Percentage,
 class12Year: formData.class12Year,
 class12PcmPercentage: formData.class12PcmPercentage,
 class12MathPercentage: formData.class12MathPercentage,
 isClass12Locked: true,

 // Required fields for Joi validation
 mobileNo: formData.mobileNo,
 personalEmail: formData.personalEmail,
 fatherName: formData.fatherName,
 motherName: formData.motherName,
 };

 const updated = await api.put("/students/profile", payload);
 setProfile(updated);
 toast({ title:"Success", description:"Optional Class 12 details saved and locked." });
 } catch (e: any) {
 toast({ title:"Error", description: e.response?.data?.error ||"Failed to save", variant:"destructive" });
 } finally {
 setSaving(false);
 }
 };

 const saveDiploma = async () => {
 const validationErrors = validateDiploma();
 if (Object.keys(validationErrors).length > 0) {
 setErrors(validationErrors);
 toast({
 title:"Validation Error",
 description:"Please fix all errors before saving",
 variant:"destructive"
 });
 return;
 }

 const payload = {
 diplomaInstitute: formData.diplomaInstitute,
 diplomaBranch: formData.diplomaBranch,
 diplomaPercentage: formData.diplomaPercentage,
 diplomaYear: formData.diplomaYear,
 isDiplomaLocked: true,

 // Required fields for Joi validation
 mobileNo: formData.mobileNo,
 personalEmail: formData.personalEmail,
 fatherName: formData.fatherName,
 motherName: formData.motherName,
 };

 // 1. Optimistic Update
 const previousProfile = { ...profile } as StudentProfile;
 const optimisticProfile = { ...previousProfile, ...payload, isDiplomaLocked: true };
 setProfile(optimisticProfile);

 try {
 await api.put("/students/profile", payload);
 toast({ title:"Success", description:"Diploma details saved and locked." });
 } catch (e: any) {
 // 2. Rollback
 setProfile(previousProfile);
 toast({ title:"Error", description: e.response?.data?.error ||"Failed to save", variant:"destructive" });
 } finally {
 setSaving(false);
 }
 };

 const saveSemester = async (index: number) => {
 const result = semesterResults[index];
 if (!result) return;

 // Validate semester data
 const validationErrors = validateSemester(result);
 if (Object.keys(validationErrors).length > 0) {
 setErrors(prev => ({ ...prev, ...validationErrors }));
 toast({
 title:"Validation Error",
 description:"Please fix all errors before saving",
 variant:"destructive"
 });
 return;
 }

 const payload = {
 semesterResults: [{
 semester: result.semester,
 sgpa: result.sgpa ? parseFloat(result.sgpa.toString()) : null,
 backlogs: result.backlogs ? parseInt(result.backlogs.toString()) : 0,
 credits: result.credits ? parseInt(result.credits.toString()) : null,
 totalMarks: result.totalMarks ? parseInt(result.totalMarks.toString()) : null,
 obtainedMarks: result.obtainedMarks ? parseInt(result.obtainedMarks.toString()) : null,
 isLocked: true
 }],
 // Additional required fields if strict validation is on
 mobileNo: formData.mobileNo,
 personalEmail: formData.personalEmail,
 fatherName: formData.fatherName,
 motherName: formData.motherName,
 };

 // 1. Optimistic Update
 const previousResults = [...semesterResults];
 const optimisticResults = [...semesterResults];
 optimisticResults[index] = { ...result, isLocked: true };
 setSemesterResults(optimisticResults);

 try {
 await api.put("/students/profile", payload);
 // Success - no further state update needed as optimistic state is correct
 toast({ title:"Success", description: `Semester ${result.semester} details saved.` });
 } catch (e: any) {
 // 2. Rollback
 setSemesterResults(previousResults);
 toast({ title:"Error", description: e.response?.data?.error ||"Failed to save", variant:"destructive" });
 } finally {
 setSaving(false);
 }
 };

 const savePersonalInfo = async () => {
 // Validate required fields
 const newErrors: Record<string, string> = {};

 // Mobile
 if (!validators.mobile(formData.mobileNo)) newErrors.mobileNo = 'Valid 10-digit mobile number required';
 if (!validators.email(formData.personalEmail)) newErrors.personalEmail = 'Valid email address required';

 // Parents
 if (!validators.name(formData.fatherName)) newErrors.fatherName = 'Valid full name required (alphabets only)';
 if (!validators.name(formData.motherName)) newErrors.motherName = 'Valid full name required (alphabets only)';

 // Optional Parent Contacts (if filled)
 if (formData.fatherMobile && !validators.mobile(formData.fatherMobile)) newErrors.fatherMobile = 'Valid 10-digit number required';
 if (formData.fatherEmail && !validators.email(formData.fatherEmail)) newErrors.fatherEmail = 'Valid email required';
 if (formData.motherMobile && !validators.mobile(formData.motherMobile)) newErrors.motherMobile = 'Valid 10-digit number required';
 if (formData.motherEmail && !validators.email(formData.motherEmail)) newErrors.motherEmail = 'Valid email required';

 // Address
 if (!formData.presentState) newErrors.presentState = 'State is required';
 if (!formData.presentDistrict) newErrors.presentDistrict = 'District is required';
 if (!validators.pincode(formData.presentPincode)) newErrors.presentPincode = 'Valid 6-digit Pincode required';
 if (formData.presentCity && !validators.name(formData.presentCity)) newErrors.presentCity = 'Valid city name required';

 if (!formData.permanentState) newErrors.permanentState = 'State is required';
 if (!formData.permanentDistrict) newErrors.permanentDistrict = 'District is required';
 if (!validators.pincode(formData.permanentPincode)) newErrors.permanentPincode = 'Valid 6-digit Pincode required';
 if (formData.permanentCity && !validators.name(formData.permanentCity)) newErrors.permanentCity = 'Valid city name required';

 // If there are validation errors, show them and return
 if (Object.keys(newErrors).length > 0) {
 setPersonalErrors(newErrors);
 toast({
 title:"Validation Error",
 description:"Please check all fields marked in red.",
 variant:"destructive"
 });
 return;
 }

 // Clear errors if validation passes
 setPersonalErrors({});

 const payload: any = {
 mobileNo: formData.mobileNo,
 personalEmail: formData.personalEmail,
 presentHouseNo: formData.presentHouseNo,
 presentBlock: formData.presentBlock,
 presentLocality: formData.presentLocality,
 presentCity: formData.presentCity,
 presentTehsil: formData.presentTehsil,
 presentDistrict: formData.presentDistrict,
 presentState: formData.presentState,
 presentCountry: formData.presentCountry,
 presentPincode: formData.presentPincode,
 permanentHouseNo: formData.permanentHouseNo,
 permanentBlock: formData.permanentBlock,
 permanentLocality: formData.permanentLocality,
 permanentCity: formData.permanentCity,
 permanentTehsil: formData.permanentTehsil,
 permanentDistrict: formData.permanentDistrict,
 permanentState: formData.permanentState,
 permanentCountry: formData.permanentCountry,
 permanentPincode: formData.permanentPincode,
 fatherName: formData.fatherName,
 fatherOccupation: formData.fatherOccupation,
 fatherMobile: formData.fatherMobile,
 fatherEmail: formData.fatherEmail,
 motherName: formData.motherName,
 motherOccupation: formData.motherOccupation,
 motherMobile: formData.motherMobile,
 motherEmail: formData.motherEmail,
 };

 // 1. Optimistic Update
 const previousProfile = { ...profile } as StudentProfile;
 const optimisticProfile = { ...previousProfile, ...payload };
 // Update profile state and close edit mode immediately
 setProfile(optimisticProfile);
 setIsEditingPersonal(false);

 try {
 await api.put("/students/profile", payload);
 toast({ title:"Success", description:"Personal Details saved successfully." });
 } catch (e: any) {
 // 2. Rollback
 setProfile(previousProfile);
 // Re-open edit mode so user can see what failed/retry
 setIsEditingPersonal(true);
 const errorMessage = e.response?.data?.error || e.response?.data?.details ||"Failed to save";
 toast({ title:"Error", description: errorMessage, variant:"destructive" });
 } finally {
 setSaving(false);
 }
 };

 if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

 // Fix: Handle absolute Cloudinary URLs
 const fullPhotoUrl = profile?.photoUrl
 ? (profile.photoUrl.startsWith('http') ? profile.photoUrl : `${API_BASE_URL}${profile.photoUrl}`)
 : undefined;
 const isLocked = profile?.isProfileLocked;
 const isAnySectionLocked = isLocked || profile?.isClass10Locked || profile?.isClass12Locked || profile?.isDiplomaLocked || semesterResults.some(r => r.isLocked);

 return (
 <div className="space-y-6">
 <style dangerouslySetInnerHTML={{ __html: customStyles }} />
 <div className="flex items-center justify-between">
 <h1 className="text-3xl font-bold">My Profile</h1>
 </div>

 {/* Admin Lock - Red Alert */}
 {isLocked && (
 <Alert variant="destructive" className="mb-6 border-destructive/50 bg-red-500/10 text-red-600">
 <Lock className="h-4 w-4" />
 <AlertTitle>Profile Locked by Admin</AlertTitle>
 <AlertDescription>
 Your profile is currently locked by the administrator. Contact admin to make any changes.
 </AlertDescription>
 </Alert>
 )}



 <div className="flex flex-col-reverse gap-6 md:grid md:grid-cols-[1fr_300px]">
 <div className="space-y-6">
 <Tabs defaultValue="basic" className="w-full">
 <TabsList className="grid w-full grid-cols-3 h-auto min-h-[56px] overflow-hidden">
 <TabsTrigger value="basic" className="h-full whitespace-normal px-1 text-[11px] sm:text-sm py-2 sm:py-3 leading-tight">
 <User className="h-3 w-3 mr-1 block sm:hidden" />
 Basic Details
 </TabsTrigger>
 <TabsTrigger value="personal" disabled={!profile?.isBasicInfoLocked} className="h-full whitespace-normal px-1 text-[11px] sm:text-sm py-2 sm:py-3 leading-tight">
 <User className="h-3 w-3 mr-1 block sm:hidden" />
 Personal {!profile?.isBasicInfoLocked &&"🔒"}
 </TabsTrigger>
 <TabsTrigger value="academic" disabled={!profile?.isBasicInfoLocked} className="h-full whitespace-normal px-1 text-[11px] sm:text-sm py-2 sm:py-3 leading-tight">
 <GraduationCap className="h-3 w-3 mr-1 block sm:hidden" />
 Academic {!profile?.isBasicInfoLocked &&"🔒"}
 </TabsTrigger>
 </TabsList>

 <TabsContent value="basic" className="space-y-6">
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <div className="flex items-center gap-2">
 <CardTitle>Basic Details</CardTitle>
 </div>
 {profile?.isBasicInfoLocked && (
 <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
 <Lock className="h-3 w-3 text-muted-foreground" />
 <span className="text-xs font-medium text-muted-foreground">Locked</span>
 </div>
 )}
 {!profile?.isBasicInfoLocked && (
 <Button onClick={saveBasicInfo} disabled={saving ==="basic" || isLocked} size="sm">
 {saving ==="basic" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Locking...</> :"Save & Lock"}
 </Button>
 )}
 </CardHeader>
 <CardContent className="grid gap-6 sm:grid-cols-2 mt-4">
 <div className="space-y-2">
 <Label>Full Name <span className="text-destructive">*</span></Label>
 <Input
 name="name"
 value={formData.name}
 onChange={handleInputChange}
 placeholder="Full Name"
 disabled={isLocked || profile?.isBasicInfoLocked}
 className={`${errors.name ?"border-destructive" :""} ${isLocked || profile?.isBasicInfoLocked ?"bg-muted" :"bg-background"}`}
 />
 {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
 </div>
 <div className="space-y-2">
 <Label>University Roll No <span className="text-destructive">*</span></Label>
 <Input
 name="rollNo"
 value={formData.rollNo}
 onChange={handleInputChange}
 placeholder="University Roll No"
 disabled={isLocked || profile?.isBasicInfoLocked}
 maxLength={13}
 className={`${errors.rollNo ?"border-destructive" :""} ${isLocked || profile?.isBasicInfoLocked ?"bg-muted" :"bg-background"}`}
 />
 {errors.rollNo && <p className="text-xs text-destructive mt-1">{errors.rollNo}</p>}
 </div>
 <div className="space-y-2"><Label>Official Email</Label><Input value={user?.email ||""} disabled className="bg-muted" /></div>
 <div className="space-y-2">
 <Label>Admission ID <span className="text-destructive">*</span></Label>
 <Input
 name="admissionId"
 value={formData.admissionId ||""}
 disabled
 className="bg-muted"
 />
 {/* Typically read-only, but if we allowed editing, we'd add error here. 
 For consisteny with previous logic if it *was* editable: */}
 {errors.admissionId && <p className="text-xs text-destructive mt-1">{errors.admissionId}</p>}
 </div>
 <div className="space-y-2">
 <Label>Course <span className="text-destructive">*</span></Label>
 <Input
 name="course"
 value={formData.course ||"Bachelor of Technology"}
 onChange={handleInputChange}
 disabled={isLocked || profile?.isBasicInfoLocked}
 className={`${errors.course ?"border-destructive" :""} ${isLocked || profile?.isBasicInfoLocked ?"bg-muted" :"bg-background"}`}
 />
 {errors.course && <p className="text-xs text-destructive mt-1">{errors.course}</p>}
 </div>
 <div className="space-y-2">
 <Label>Student Type <span className="text-destructive">*</span></Label>
 <Select value={formData.studentType} onValueChange={(val) => {
 setFormData(p => ({ ...p, studentType: val, educationType: val === 'Lateral Entry' ? 'Diploma' : '12th' }));
 }} disabled={isLocked || profile?.isBasicInfoLocked}>
 <SelectTrigger className={`${errors.studentType ?"border-destructive" :""} ${isLocked || profile?.isBasicInfoLocked ?"bg-muted" :"bg-background"}`}>
 <SelectValue placeholder="Student Type" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="Regular Entry">Regular Entry</SelectItem>
 <SelectItem value="Lateral Entry">Lateral Entry</SelectItem>
 </SelectContent>
 </Select>
 {errors.studentType && <p className="text-xs text-destructive mt-1">{errors.studentType}</p>}
 </div>
 <div className="space-y-2">
 <Label>Branch <span className="text-destructive">*</span></Label>
 <Select value={formData.branch} onValueChange={(val) => setFormData(p => ({ ...p, branch: val }))} disabled={isLocked || profile?.isBasicInfoLocked}>
 <SelectTrigger className={`${errors.branch ?"border-destructive" :""} ${isLocked || profile?.isBasicInfoLocked ?"bg-muted" :"bg-background"}`}>
 <SelectValue placeholder="Branch" />
 </SelectTrigger>
 <SelectContent>{BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
 </Select>
 {errors.branch && <p className="text-xs text-destructive mt-1">{errors.branch}</p>}
 </div>
 <div className="space-y-2">
 <Label>Passing Year <span className="text-destructive">*</span></Label>
 <Select value={formData.year} onValueChange={(val) => setFormData(p => ({ ...p, year: val }))} disabled={isLocked || profile?.isBasicInfoLocked}>
 <SelectTrigger className={`${errors.year ?"border-destructive" :""} ${isLocked || profile?.isBasicInfoLocked ?"bg-muted" :"bg-background"}`}>
 <SelectValue placeholder="Year" />
 </SelectTrigger>
 <SelectContent>{getYearOptions().map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
 </Select>
 {errors.year && <p className="text-xs text-destructive mt-1">{errors.year}</p>}
 </div>
 <div className="space-y-2">
 <Label>Current Semester <span className="text-destructive">*</span></Label>
 <Select value={formData.currentSemester} onValueChange={(val) => setFormData(p => ({ ...p, currentSemester: val }))} disabled={isLocked || profile?.isBasicInfoLocked}>
 <SelectTrigger className={`${errors.currentSemester ?"border-destructive" :""} ${isLocked || profile?.isBasicInfoLocked ?"bg-muted" :"bg-background"}`}>
 <SelectValue placeholder="Semester" />
 </SelectTrigger>
 <SelectContent>{getSemesterOptions(formData.studentType).map(s => <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>)}</SelectContent>
 </Select>
 {errors.currentSemester && <p className="text-xs text-destructive mt-1">{errors.currentSemester}</p>}
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="personal" className="space-y-6">
 {/* Personal Details - Always editable, moved here */}
 </TabsContent>

 <TabsContent value="academic" className="space-y-6">
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <div className="flex items-center gap-2">
 <BookOpen className="h-5 w-5 text-brown-800" />
 <CardTitle>Class 10</CardTitle>
 </div>
 {profile?.isClass10Locked && (
 <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
 <Lock className="h-3 w-3 text-muted-foreground" />
 <span className="text-xs font-medium text-muted-foreground">Locked</span>
 </div>
 )}
 {!profile?.isClass10Locked && (
 <Button onClick={saveClass10} disabled={saving ==="class10" || isLocked} size="sm">
 {saving ==="class10" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Locking...</> :"Save & Lock"}
 </Button>
 )}
 </CardHeader>
 <CardContent className="space-y-4 mt-4">
 <div className="bg-muted/30 p-4 rounded-lg border grid gap-4 sm:grid-cols-2">
 <div className="space-y-2">
 <Label>School Name <span className="text-destructive">*</span></Label>
 <Input
 name="class10School"
 value={formData.class10School}
 onChange={handleInputChange}
 placeholder="School Name"
 disabled={isLocked || profile?.isClass10Locked}
 className={`${errors.class10School ?"border-destructive" :""} ${isLocked || profile?.isClass10Locked ?"bg-muted" :"bg-background"}`}
 />
 {errors.class10School && <p className="text-xs text-destructive mt-1">{errors.class10School}</p>}
 </div>
 <div className="space-y-2">
 <Label>Board <span className="text-destructive">*</span></Label>
 <Select
 value={formData.class10Board}
 onValueChange={(val) => {
 setFormData(p => ({ ...p, class10Board: val }));
 if (errors.class10Board) {
 setErrors(prev => {
 const newErrors = { ...prev };
 delete newErrors.class10Board;
 return newErrors;
 });
 }
 }}
 disabled={isLocked || profile?.isClass10Locked}
 >
 <SelectTrigger className={`${errors.class10Board ?"border-destructive" :""} ${isLocked || profile?.isClass10Locked ?"bg-muted" :"bg-background"}`}>
 <SelectValue placeholder="Select Board" />
 </SelectTrigger>
 <SelectContent>
 {BOARDS.map(board => (
 <SelectItem key={board} value={board}>{board}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.class10Board && <p className="text-xs text-destructive mt-1">{errors.class10Board}</p>}
 </div>
 <div className="space-y-2">
 <Label>Percentage / CGPA <span className="text-destructive">*</span></Label>
 <Input
 name="class10Percentage"
 value={formData.class10Percentage}
 onChange={handleInputChange}
 placeholder="Percentage / CGPA"
 disabled={isLocked || profile?.isClass10Locked}
 className={`${errors.class10Percentage ?"border-destructive" :""} ${isLocked || profile?.isClass10Locked ?"bg-muted" :"bg-background"}`}
 />
 {errors.class10Percentage && <p className="text-xs text-destructive mt-1">{errors.class10Percentage}</p>}
 </div>
 <div className="space-y-2">
 <Label>Passing Year <span className="text-destructive">*</span></Label>
 <Select
 value={formData.class10Year}
 onValueChange={(val) => setFormData(prev => ({ ...prev, class10Year: val }))}
 disabled={isLocked || profile?.isClass10Locked}
 >
 <SelectTrigger className={errors.class10Year ?"border-destructive" :""}>
 <SelectValue placeholder="Select Year" />
 </SelectTrigger>
 <SelectContent>
 {PASSING_YEARS.map((y) => (
 <SelectItem key={y} value={y}>{y}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.class10Year && <p className="text-xs text-destructive mt-1">{errors.class10Year}</p>}
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Class 12 - Show only for Regular Entry */}
 {formData.studentType ==="Regular Entry" && (
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <div className="flex items-center gap-2">
 <BookOpen className="h-5 w-5 text-brown-800" />
 <CardTitle>Class 12</CardTitle>
 </div>
 {profile?.isClass12Locked && (
 <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
 <Lock className="h-3 w-3 text-muted-foreground" />
 <span className="text-xs font-medium text-muted-foreground">Locked</span>
 </div>
 )}
 {!profile?.isClass12Locked && (
 <Button onClick={saveClass12} disabled={saving ==="class12" || isLocked} size="sm">
 {saving ==="class12" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Locking...</> :"Save & Lock"}
 </Button>
 )}
 </CardHeader>
 <CardContent className="space-y-4 mt-4">
 <div className="bg-muted/30 p-4 rounded-lg border grid gap-4 sm:grid-cols-2">
 <div className="space-y-2">
 <Label>School Name <span className="text-destructive">*</span></Label>
 <Input name="class12School" value={formData.class12School} onChange={handleInputChange} placeholder="School Name" disabled={isLocked || profile?.isClass12Locked} className={`${errors.class12School ?"border-destructive" :""} ${isLocked || profile?.isClass12Locked ?"bg-muted" :"bg-background"}`} />
 {errors.class12School && <p className="text-xs text-destructive mt-1">{errors.class12School}</p>}
 </div>
 <div className="space-y-2">
 <Label>Board <span className="text-destructive">*</span></Label>
 <Select
 value={formData.class12Board}
 onValueChange={(val) => {
 setFormData(p => ({ ...p, class12Board: val }));
 if (errors.class12Board) {
 setErrors(prev => {
 const newErrors = { ...prev };
 delete newErrors.class12Board;
 return newErrors;
 });
 }
 }}
 disabled={isLocked || profile?.isClass12Locked}
 >
 <SelectTrigger className={`${errors.class12Board ?"border-destructive" :""} ${isLocked || profile?.isClass12Locked ?"bg-muted" :"bg-background"}`}>
 <SelectValue placeholder="Select Board" />
 </SelectTrigger>
 <SelectContent>
 {BOARDS.map(board => (
 <SelectItem key={board} value={board}>{board}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.class12Board && <p className="text-xs text-destructive mt-1">{errors.class12Board}</p>}
 </div>
 <div className="space-y-2">
 <Label>Overall Percentage <span className="text-destructive">*</span></Label>
 <Input name="class12Percentage" value={formData.class12Percentage} onChange={handleInputChange} placeholder="Overall %" disabled={isLocked || profile?.isClass12Locked} className={`${errors.class12Percentage ?"border-destructive" :""} ${isLocked || profile?.isClass12Locked ?"bg-muted" :"bg-background"}`} />
 {errors.class12Percentage && <p className="text-xs text-destructive mt-1">{errors.class12Percentage}</p>}
 </div>
 <div className="space-y-2">
 <Label>Passing Year <span className="text-destructive">*</span></Label>
 <Select
 value={formData.class12Year}
 onValueChange={(val) => setFormData(prev => ({ ...prev, class12Year: val }))}
 disabled={isLocked || profile?.isClass12Locked}
 >
 <SelectTrigger className={errors.class12Year ?"border-destructive" :""}>
 <SelectValue placeholder="Select Year" />
 </SelectTrigger>
 <SelectContent>
 {PASSING_YEARS.map((y) => (
 <SelectItem key={y} value={y}>{y}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.class12Year && <p className="text-xs text-destructive mt-1">{errors.class12Year}</p>}
 </div>
 <div className="space-y-2">
 <Label>PCM Percentage <span className="text-destructive">*</span></Label>
 <Input name="class12PcmPercentage" value={formData.class12PcmPercentage} onChange={handleInputChange} placeholder="PCM %" disabled={isLocked || profile?.isClass12Locked} className={`${errors.class12PcmPercentage ?"border-destructive" :""} ${isLocked || profile?.isClass12Locked ?"bg-muted" :"bg-background"}`} />
 {errors.class12PcmPercentage && <p className="text-xs text-destructive mt-1">{errors.class12PcmPercentage}</p>}
 </div>
 <div className="space-y-2">
 <Label>Math Percentage <span className="text-destructive">*</span></Label>
 <Input name="class12MathPercentage" value={formData.class12MathPercentage} onChange={handleInputChange} placeholder="Math %" disabled={isLocked || profile?.isClass12Locked} className={`${errors.class12MathPercentage ?"border-destructive" :""} ${isLocked || profile?.isClass12Locked ?"bg-muted" :"bg-background"}`} />
 {errors.class12MathPercentage && <p className="text-xs text-destructive mt-1">{errors.class12MathPercentage}</p>}
 </div>
 </div>
 </CardContent>
 </Card>
 )}

 {/* Optional Class 12 for Lateral Entry - Between Class 10 and Diploma */}
 {formData.studentType ==="Lateral Entry" && (
 <>
 {!showClass12ForLateralEntry && !profile?.isClass12Locked ? (
 <Card>
 <CardContent className="pt-6">
 <Button
 onClick={() => setShowClass12ForLateralEntry(true)}
 variant="outline"
 className="w-full"
 disabled={isLocked}
 >
 + Add Class 12 Details (Optional)
 </Button>
 </CardContent>
 </Card>
 ) : (showClass12ForLateralEntry || profile?.isClass12Locked) && (
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <div className="flex items-center gap-2">
 <BookOpen className="h-5 w-5 text-brown-800" />
 <CardTitle>Class 12 (Optional)</CardTitle>
 </div>
 {profile?.isClass12Locked && (
 <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
 <Lock className="h-3 w-3 text-muted-foreground" />
 <span className="text-xs font-medium text-muted-foreground">Locked</span>
 </div>
 )}
 {!profile?.isClass12Locked && (
 <div className="flex gap-2">
 <Button
 onClick={() => setShowClass12ForLateralEntry(false)}
 variant="ghost"
 size="sm"
 disabled={isLocked}
 >
 Remove
 </Button>
 <Button onClick={saveOptionalClass12} disabled={saving ==="class12" || isLocked} size="sm">
 {saving ==="class12" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Locking...</> :"Save & Lock"}
 </Button>
 </div>
 )}
 </CardHeader>
 <CardContent className="space-y-4 mt-4">
 <div className="bg-muted/30 p-4 rounded-lg border grid gap-4 sm:grid-cols-2">
 <div className="space-y-2">
 <Label>School Name <span className="text-destructive">*</span></Label>
 <Input name="class12School" value={formData.class12School} onChange={handleInputChange} placeholder="School Name" disabled={isLocked || profile?.isClass12Locked} className={`${errors.class12School ?"border-destructive" :""} ${isLocked || profile?.isClass12Locked ?"bg-muted" :"bg-background"}`} />
 {errors.class12School && <p className="text-xs text-destructive mt-1">{errors.class12School}</p>}
 </div>
 <div className="space-y-2">
 <Label>Board <span className="text-destructive">*</span></Label>
 <Select
 value={formData.class12Board}
 onValueChange={(val) => {
 setFormData(p => ({ ...p, class12Board: val }));
 if (errors.class12Board) {
 setErrors(prev => {
 const newErrors = { ...prev };
 delete newErrors.class12Board;
 return newErrors;
 });
 }
 }}
 disabled={isLocked || profile?.isClass12Locked}
 >
 <SelectTrigger className={`${errors.class12Board ?"border-destructive" :""} ${isLocked || profile?.isClass12Locked ?"bg-muted" :"bg-background"}`}>
 <SelectValue placeholder="Select Board" />
 </SelectTrigger>
 <SelectContent>
 {BOARDS.map(board => (
 <SelectItem key={board} value={board}>{board}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.class12Board && <p className="text-xs text-destructive mt-1">{errors.class12Board}</p>}
 </div>
 <div className="space-y-2">
 <Label>Overall Percentage <span className="text-destructive">*</span></Label>
 <Input name="class12Percentage" value={formData.class12Percentage} onChange={handleInputChange} placeholder="Overall %" disabled={isLocked || profile?.isClass12Locked} className={`${errors.class12Percentage ?"border-destructive" :""} ${isLocked || profile?.isClass12Locked ?"bg-muted" :"bg-background"}`} />
 {errors.class12Percentage && <p className="text-xs text-destructive mt-1">{errors.class12Percentage}</p>}
 </div>
 <div className="space-y-2">
 <Label>Passing Year <span className="text-destructive">*</span></Label>
 <Select
 value={formData.class12Year}
 onValueChange={(val) => setFormData(prev => ({ ...prev, class12Year: val }))}
 disabled={isLocked || profile?.isClass12Locked}
 >
 <SelectTrigger className={errors.class12Year ?"border-destructive" :""}>
 <SelectValue placeholder="Select Year" />
 </SelectTrigger>
 <SelectContent>
 {PASSING_YEARS.map((y) => (
 <SelectItem key={y} value={y}>{y}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.class12Year && <p className="text-xs text-destructive mt-1">{errors.class12Year}</p>}
 </div>
 <div className="space-y-2">
 <Label>PCM Percentage <span className="text-destructive">*</span></Label>
 <Input name="class12PcmPercentage" value={formData.class12PcmPercentage} onChange={handleInputChange} placeholder="PCM %" disabled={isLocked || profile?.isClass12Locked} className={`${errors.class12PcmPercentage ?"border-destructive" :""} ${isLocked || profile?.isClass12Locked ?"bg-muted" :"bg-background"}`} />
 {errors.class12PcmPercentage && <p className="text-xs text-destructive mt-1">{errors.class12PcmPercentage}</p>}
 </div>
 <div className="space-y-2">
 <Label>Math Percentage <span className="text-destructive">*</span></Label>
 <Input name="class12MathPercentage" value={formData.class12MathPercentage} onChange={handleInputChange} placeholder="Math %" disabled={isLocked || profile?.isClass12Locked} className={`${errors.class12MathPercentage ?"border-destructive" :""} ${isLocked || profile?.isClass12Locked ?"bg-muted" :"bg-background"}`} />
 {errors.class12MathPercentage && <p className="text-xs text-destructive mt-1">{errors.class12MathPercentage}</p>}
 </div>
 </div>
 </CardContent>
 </Card>
 )}
 </>
 )}

 {/* Diploma - Show only for Lateral Entry */}
 {formData.studentType ==="Lateral Entry" && (
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <div className="flex items-center gap-2">
 <Award className="h-5 w-5 text-brown-800" />
 <CardTitle>Diploma</CardTitle>
 </div>
 {profile?.isDiplomaLocked && (
 <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
 <Lock className="h-3 w-3 text-muted-foreground" />
 <span className="text-xs font-medium text-muted-foreground">Locked</span>
 </div>
 )}
 {!profile?.isDiplomaLocked && (
 <Button onClick={saveDiploma} disabled={saving ==="diploma" || isLocked} size="sm">
 {saving ==="diploma" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Locking...</> :"Save & Lock"}
 </Button>
 )}
 </CardHeader>
 <CardContent className="space-y-4 mt-4">
 <div className="bg-muted/30 p-4 rounded-lg border grid gap-4 sm:grid-cols-2">
 <div className="space-y-2">
 <Label>Institute Name <span className="text-destructive">*</span></Label>
 <Input name="diplomaInstitute" value={formData.diplomaInstitute} onChange={handleInputChange} placeholder="Institute Name" disabled={isLocked || profile?.isDiplomaLocked} className={`${errors.diplomaInstitute ?"border-destructive" :""} ${isLocked || profile?.isDiplomaLocked ?"bg-muted" :"bg-background"}`} />
 {errors.diplomaInstitute && <p className="text-xs text-destructive mt-1">{errors.diplomaInstitute}</p>}
 </div>
 <div className="space-y-2">
 <Label>Branch <span className="text-destructive">*</span></Label>
 <Select
 value={formData.diplomaBranch}
 onValueChange={(val) => setFormData(prev => ({ ...prev, diplomaBranch: val }))}
 disabled={isLocked || profile?.isDiplomaLocked}
 >
 <SelectTrigger className={errors.diplomaBranch ?"border-destructive" :""}>
 <SelectValue placeholder="Select Branch" />
 </SelectTrigger>
 <SelectContent>
 {DIPLOMA_BRANCHES.map((b) => (
 <SelectItem key={b} value={b}>{b}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.diplomaBranch && <p className="text-xs text-destructive mt-1">{errors.diplomaBranch}</p>}
 </div>
 <div className="space-y-2">
 <Label>Percentage <span className="text-destructive">*</span></Label>
 <Input name="diplomaPercentage" value={formData.diplomaPercentage} onChange={handleInputChange} placeholder="Percentage" disabled={isLocked || profile?.isDiplomaLocked} className={`${errors.diplomaPercentage ?"border-destructive" :""} ${isLocked || profile?.isDiplomaLocked ?"bg-muted" :"bg-background"}`} />
 {errors.diplomaPercentage && <p className="text-xs text-destructive mt-1">{errors.diplomaPercentage}</p>}
 </div>
 <div className="space-y-2">
 <Label>Passing Year <span className="text-destructive">*</span></Label>
 <Select
 value={formData.diplomaYear}
 onValueChange={(val) => setFormData(prev => ({ ...prev, diplomaYear: val }))}
 disabled={isLocked || profile?.isDiplomaLocked}
 >
 <SelectTrigger className={errors.diplomaYear ?"border-destructive" :""}>
 <SelectValue placeholder="Select Year" />
 </SelectTrigger>
 <SelectContent>
 {PASSING_YEARS.map((y) => (
 <SelectItem key={y} value={y}>{y}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.diplomaYear && <p className="text-xs text-destructive mt-1">{errors.diplomaYear}</p>}
 </div>
 </div>
 </CardContent>
 </Card>
 )}

 <Card>
 <CardHeader>
 <div className="flex items-center gap-2">
 <GraduationCap className="h-5 w-5 text-brown-800" />
 <CardTitle>Semester Results</CardTitle>
 </div>
 <CardDescription>Enter your semester-wise academic performance</CardDescription>
 </CardHeader>
 <CardContent>
 {/* Overall Percentage */}
 {(() => {
 // Filter semesters based on type (Lateral Entry starts from 3)
 const minSemester = formData.studentType ==="Lateral Entry" ? 3 : 1;
 const validSemesters = semesterResults.filter(r => r.totalMarks && r.obtainedMarks && r.semester >= minSemester && r.semester < (parseInt(formData.currentSemester) || 9));
 if (validSemesters.length > 0) {
 const totalObtained = validSemesters.reduce((sum, r) => sum + (r.obtainedMarks || 0), 0);
 const totalMarks = validSemesters.reduce((sum, r) => sum + (r.totalMarks || 0), 0);
 const overallPercentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(2) : '0.00';

 return (
 <div className="mb-6 p-4 bg-brown-800/5 border border-brown-800/20 rounded-lg">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium">Overall Percentage</span>
 <span className="text-2xl font-bold text-brown-800">{overallPercentage}%</span>
 </div>
 </div>
 );
 }
 return null;
 })()}

 <div className="space-y-4">
 {semesterResults
 .filter(r => {
 const minSemester = formData.studentType ==="Lateral Entry" ? 3 : 1;
 return r.semester >= minSemester && r.semester < (parseInt(formData.currentSemester) || 9);
 })
 .map((result) => {
 // Find original index to update state correctly
 const originalIndex = semesterResults.findIndex(sr => sr.semester === result.semester);

 // Calculate percentage
 const percentage = result.totalMarks && result.obtainedMarks && result.totalMarks > 0
 ? ((result.obtainedMarks / result.totalMarks) * 100).toFixed(2)
 : null;

 return (
 <div key={result.semester} className="p-4 bg-muted/30 border rounded-lg space-y-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="font-bold text-lg">Semester {result.semester}</div>
 </div>
 {(isLocked || result.isLocked) && (
 <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
 <Lock className="h-3 w-3 text-muted-foreground" />
 <span className="text-xs font-medium text-muted-foreground">Locked</span>
 </div>
 )}
 {!result.isLocked && (
 <Button
 onClick={() => saveSemester(originalIndex)}
 disabled={saving === `sem-${result.semester}` || isLocked}
 size="sm"
 >
 {saving === `sem-${result.semester}` ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Locking...</> :"Save & Lock"}
 </Button>
 )}
 </div>

 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 <div className="space-y-1">
 <Label className="text-xs text-muted-foreground">Total Marks <span className="text-destructive">*</span></Label>
 <Input
 type="number"
 placeholder="Total Marks"
 value={result.totalMarks || ''}
 onChange={(e) => {
 const newRes = [...semesterResults];
 newRes[originalIndex].totalMarks = e.target.value ? parseInt(e.target.value) : null;
 setSemesterResults(newRes);
 }}
 disabled={isLocked || result.isLocked}
 className={isLocked || result.isLocked ?"bg-muted" :"bg-background"}
 />
 </div>
 <div className="space-y-1">
 <Label className="text-xs text-muted-foreground">Obtained Marks <span className="text-destructive">*</span></Label>
 <Input
 type="number"
 placeholder="Obtained Marks"
 value={result.obtainedMarks || ''}
 onChange={(e) => {
 const newRes = [...semesterResults];
 newRes[originalIndex].obtainedMarks = e.target.value ? parseInt(e.target.value) : null;
 setSemesterResults(newRes);
 }}
 disabled={isLocked || result.isLocked}
 className={isLocked || result.isLocked ?"bg-muted" :"bg-background"}
 />
 </div>
 <div className="space-y-1">
 <Label className="text-xs text-muted-foreground">Percentage</Label>
 <Input
 value={percentage || 'N/A'}
 disabled
 className="bg-muted font-medium"
 />
 </div>
 <div className="space-y-1">
 <Label className="text-xs text-muted-foreground">SGPA <span className="text-destructive">*</span></Label>
 <Input
 type="number"
 step="0.01"
 placeholder="SGPA"
 value={result.sgpa || ''}
 onChange={(e) => {
 const newRes = [...semesterResults];
 newRes[originalIndex].sgpa = e.target.value ? parseFloat(e.target.value) : null;
 setSemesterResults(newRes);
 }}
 disabled={isLocked || result.isLocked}
 className={isLocked || result.isLocked ?"bg-muted" :"bg-background"}
 />
 </div>
 <div className="space-y-1">
 <Label className="text-xs text-muted-foreground">Backlogs <span className="text-destructive">*</span></Label>
 <Input
 type="number"
 placeholder="Backlogs"
 value={result.backlogs ?? ''}
 onChange={(e) => {
 const newRes = [...semesterResults];
 newRes[originalIndex].backlogs = e.target.value !=="" ? parseInt(e.target.value) : null;
 setSemesterResults(newRes);
 }}
 disabled={isLocked || result.isLocked}
 className={isLocked || result.isLocked ?"bg-muted" :"bg-background"}
 />
 </div>
 <div className="space-y-1">
 <Label className="text-xs text-muted-foreground">Credits <span className="text-destructive">*</span></Label>
 <Input
 type="number"
 placeholder="Credits"
 value={result.credits || ''}
 onChange={(e) => {
 const newRes = [...semesterResults];
 newRes[originalIndex].credits = e.target.value ? parseInt(e.target.value) : null;
 setSemesterResults(newRes);
 }}
 disabled={isLocked || result.isLocked}
 className={isLocked || result.isLocked ?"bg-muted" :"bg-background"}
 />
 </div>
 </div>
 </div>
 )
 })}
 {semesterResults.filter(r => r.semester < (parseInt(formData.currentSemester) || 9)).length === 0 && (
 <div className="text-center text-muted-foreground py-8">
 Select a semester in Basic Details to see previous semester results.
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="personal" className="space-y-6">
 <Card>
 <CardHeader className="flex flex-row items-center justify-between">
 <div className="flex items-center gap-2">
 <User className="h-5 w-5 text-brown-800" />
 <div>
 <CardTitle>Personal & Address Details</CardTitle>
 <CardDescription>Contact information and addresses</CardDescription>
 </div>
 </div>
 <Button onClick={(e) => {
 e.preventDefault();
 if (isEditingPersonal) {
 savePersonalInfo();
 } else {
 // Entering edit mode: uncheck"Same as Present" so fields are ready to edit if needed
 setFormData(prev => ({ ...prev, sameAsPresent: false }));
 setIsEditingPersonal(true);
 }
 }} disabled={saving ==="personal" || isLocked}>{saving ==="personal" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {isEditingPersonal ? 'Save' : 'Edit'}
 </Button>
 </CardHeader>
 <CardContent className="space-y-8 mt-4">
 {/* Contact Section */}
 <div className="bg-muted/30 p-4 rounded-lg border">
 <div className="flex items-center gap-2 mb-4">
 <Phone className="h-4 w-4 text-brown-800" />
 <h4 className="font-semibold text-sm text-brown-800">Contact Information</h4>
 </div>
 <div className="grid gap-4 sm:grid-cols-2">
 <div className="space-y-2">
 <Label>Mobile <span className="text-destructive">*</span></Label>
 <Input name="mobileNo" value={formData.mobileNo} onChange={handleInputChange} placeholder="10-digit mobile number" disabled={isLocked || !isEditingPersonal} required className={isLocked || !isEditingPersonal ?"bg-muted" :"bg-background"} />
 {personalErrors.mobileNo && <p className="text-xs text-destructive">{personalErrors.mobileNo}</p>}
 </div>
 <div className="space-y-2">
 <Label>Personal Email <span className="text-destructive">*</span></Label>
 <Input name="personalEmail" type="email" value={formData.personalEmail} onChange={handleInputChange} placeholder="your.email@example.com" disabled={isLocked || !isEditingPersonal} required className={isLocked || !isEditingPersonal ?"bg-muted" :"bg-background"} />
 {personalErrors.personalEmail && <p className="text-xs text-destructive">{personalErrors.personalEmail}</p>}
 </div>
 </div>
 </div>

 {/* Parents Section */}
 <div className="bg-muted/30 p-4 rounded-lg border">
 <div className="flex items-center gap-2 mb-4">
 <User className="h-4 w-4 text-brown-800" />
 <h4 className="font-semibold text-sm text-brown-800">Parents Details</h4>
 </div>
 <div className="grid gap-4 sm:grid-cols-2">
 <div className="space-y-2">
 <Label>Father Name <span className="text-destructive">*</span></Label>
 <Input name="fatherName" value={formData.fatherName} onChange={handleInputChange} placeholder="Father's Full Name" disabled={isLocked || !isEditingPersonal} required className={isLocked || !isEditingPersonal ?"bg-muted" :"bg-background"} />
 {personalErrors.fatherName && <p className="text-xs text-destructive">{personalErrors.fatherName}</p>}
 </div>
 <div className="space-y-2"><Label>Father Occupation</Label><Input name="fatherOccupation" value={formData.fatherOccupation} onChange={handleInputChange} placeholder="Father's Occupation" disabled={isLocked || !isEditingPersonal} className={isLocked || !isEditingPersonal ?"bg-muted" :"bg-background"} /></div>
 <div className="space-y-2"><Label>Father Mobile</Label><Input name="fatherMobile" value={formData.fatherMobile} onChange={handleInputChange} placeholder="Father's Mobile" disabled={isLocked || !isEditingPersonal} className={isLocked || !isEditingPersonal ?"bg-muted" :"bg-background"} /></div>
 <div className="space-y-2"><Label>Father Email</Label><Input name="fatherEmail" type="email" value={formData.fatherEmail} onChange={handleInputChange} placeholder="Father's Email" disabled={isLocked || !isEditingPersonal} className={isLocked || !isEditingPersonal ?"bg-muted" :"bg-background"} /></div>
 <div className="space-y-2">
 <Label>Mother Name <span className="text-destructive">*</span></Label>
 <Input name="motherName" value={formData.motherName} onChange={handleInputChange} placeholder="Mother's Full Name" disabled={isLocked || !isEditingPersonal} required className={isLocked || !isEditingPersonal ?"bg-muted" :"bg-background"} />
 {personalErrors.motherName && <p className="text-xs text-destructive">{personalErrors.motherName}</p>}
 </div>
 <div className="space-y-2"><Label>Mother Occupation</Label><Input name="motherOccupation" value={formData.motherOccupation} onChange={handleInputChange} placeholder="Mother's Occupation" disabled={isLocked || !isEditingPersonal} className={isLocked || !isEditingPersonal ?"bg-muted" :"bg-background"} /></div>
 <div className="space-y-2"><Label>Mother Mobile</Label><Input name="motherMobile" value={formData.motherMobile} onChange={handleInputChange} placeholder="Mother's Mobile" disabled={isLocked || !isEditingPersonal} className={isLocked || !isEditingPersonal ?"bg-muted" :"bg-background"} /></div>
 <div className="space-y-2"><Label>Mother Email</Label><Input name="motherEmail" type="email" value={formData.motherEmail} onChange={handleInputChange} placeholder="Mother's Email" disabled={isLocked || !isEditingPersonal} className={isLocked || !isEditingPersonal ?"bg-muted" :"bg-background"} /></div>
 </div>
 </div>

 {/* Present Address Section */}
 <div className="space-y-4">
 <div className="flex items-center gap-2">
 <MapPin className="h-4 w-4 text-brown-800" />
 <h4 className="font-semibold text-sm text-brown-800">Present Address</h4>
 </div>
 <div className="grid gap-4 sm:grid-cols-2 bg-muted/30 p-4 rounded-lg border">
 <div className="space-y-2"><Label>House No. <span className="text-xs text-muted-foreground">(Optional)</span></Label><Input name="presentHouseNo" value={formData.presentHouseNo} onChange={handleInputChange} placeholder="House/Flat No." disabled={isLocked || !isEditingPersonal} className={isLocked || !isEditingPersonal ?"bg-muted" :"bg-background"} /></div>
 <div className="space-y-2"><Label>Block/Sector</Label><Input name="presentBlock" value={formData.presentBlock} onChange={handleInputChange} placeholder="Block/Sector" disabled={isLocked || !isEditingPersonal} className={isLocked || !isEditingPersonal ?"bg-muted" :"bg-background"} /></div>
 <div className="space-y-2"><Label>Locality/Area</Label><Input name="presentLocality" value={formData.presentLocality} onChange={handleInputChange} placeholder="Locality/Area" disabled={isLocked || !isEditingPersonal} className={isLocked || !isEditingPersonal ?"bg-muted" :"bg-background"} /></div>
 <div className="space-y-2"><Label>City</Label><Input name="presentCity" value={formData.presentCity} onChange={handleInputChange} placeholder="City" disabled={isLocked || !isEditingPersonal} className={isLocked || !isEditingPersonal ?"bg-muted" :"bg-background"} /></div>
 <div className="space-y-2"><Label>Tehsil <span className="text-xs text-muted-foreground">(Optional)</span></Label><Input name="presentTehsil" value={formData.presentTehsil} onChange={handleInputChange} placeholder="Tehsil" disabled={isLocked || !isEditingPersonal} className={isLocked || !isEditingPersonal ?"bg-muted" :"bg-background"} /></div>
 <div className="space-y-2">
 <Label>State <span className="text-destructive">*</span></Label>
 <Select value={formData.presentState} onValueChange={(value) => {
 setFormData(p => ({ ...p, presentState: value, presentDistrict: '' }));
 if (personalErrors.presentState) {
 setPersonalErrors(prev => {
 const newErrors = { ...prev };
 delete newErrors.presentState;
 return newErrors;
 });
 }
 }} disabled={isLocked || !isEditingPersonal} required>
 <SelectTrigger className={isLocked || !isEditingPersonal ?"bg-muted" :"bg-background"}><SelectValue placeholder="Select State" /></SelectTrigger>
 <SelectContent>{INDIAN_STATES.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent>
 </Select>
 {personalErrors.presentState && <p className="text-xs text-destructive">{personalErrors.presentState}</p>}
 </div>
 <div className="space-y-2">
 <Label>District <span className="text-destructive">*</span></Label>
 <Select value={formData.presentDistrict} onValueChange={(value) => {
 setFormData(p => ({ ...p, presentDistrict: value }));
 if (personalErrors.presentDistrict) {
 setPersonalErrors(prev => {
 const newErrors = { ...prev };
 delete newErrors.presentDistrict;
 return newErrors;
 });
 }
 }} disabled={isLocked || !isEditingPersonal || !formData.presentState} required>
 <SelectTrigger className={isLocked || !isEditingPersonal || !formData.presentState ?"bg-muted" :"bg-background"}><SelectValue placeholder={formData.presentState ?"Select District" :"Select State First"} /></SelectTrigger>
 <SelectContent>{formData.presentState && DISTRICTS_BY_STATE[formData.presentState]?.map(district => <SelectItem key={district} value={district}>{district}</SelectItem>)}</SelectContent>
 </Select>
 {personalErrors.presentDistrict && <p className="text-xs text-destructive">{personalErrors.presentDistrict}</p>}
 </div>
 <div className="space-y-2"><Label>Country</Label><Input name="presentCountry" value={formData.presentCountry || 'India'} disabled={true} className="bg-muted" /></div>
 <div className="space-y-2">
 <Label>Pincode <span className="text-destructive">*</span></Label>
 <Input name="presentPincode" value={formData.presentPincode} onChange={handleInputChange} placeholder="6-digit Pincode" maxLength={6} disabled={isLocked || !isEditingPersonal} required className={isLocked || !isEditingPersonal ?"bg-muted" :"bg-background"} />
 {personalErrors.presentPincode && <p className="text-xs text-destructive">{personalErrors.presentPincode}</p>}
 </div>
 </div>
 </div>

 {/* Permanent Address Section */}
 <div>
 <div className="flex items-center justify-between mb-4 pt-4 border-t">
 <div className="flex items-center gap-2">
 <Home className="h-4 w-4 text-brown-800" />
 <h4 className="font-semibold text-sm text-brown-800">Permanent Address</h4>
 </div>
 <div className="flex items-center space-x-2 px-3 py-1">
 <Checkbox id="sameAsPresent" checked={formData.sameAsPresent} onCheckedChange={(c) => {
 if (c) setFormData(p => ({
 ...p,
 sameAsPresent: true,
 permanentHouseNo: p.presentHouseNo,
 permanentBlock: p.presentBlock,
 permanentLocality: p.presentLocality,
 permanentCity: p.presentCity,
 permanentTehsil: p.presentTehsil,
 permanentDistrict: p.presentDistrict,
 permanentState: p.presentState,
 permanentCountry: p.presentCountry,
 permanentPincode: p.presentPincode
 }));
 else setFormData(p => ({ ...p, sameAsPresent: false }));
 }} disabled={isLocked || !isEditingPersonal} />
 <Label htmlFor="sameAsPresent" className="text-xs font-medium cursor-pointer">Same as Present</Label>
 </div>
 </div>
 <div className="grid gap-4 sm:grid-cols-2 bg-muted/30 p-4 rounded-lg border">
 <div className="space-y-2"><Label>House No. <span className="text-xs text-muted-foreground">(Optional)</span></Label><Input name="permanentHouseNo" value={formData.permanentHouseNo} onChange={handleInputChange} placeholder="House/Flat No." disabled={isLocked || !isEditingPersonal || formData.sameAsPresent} className={isLocked || !isEditingPersonal || formData.sameAsPresent ?"bg-muted" :"bg-background"} /></div>
 <div className="space-y-2"><Label>Block/Sector</Label><Input name="permanentBlock" value={formData.permanentBlock} onChange={handleInputChange} placeholder="Block/Sector" disabled={isLocked || !isEditingPersonal || formData.sameAsPresent} className={isLocked || !isEditingPersonal || formData.sameAsPresent ?"bg-muted" :"bg-background"} /></div>
 <div className="space-y-2"><Label>Locality/Area</Label><Input name="permanentLocality" value={formData.permanentLocality} onChange={handleInputChange} placeholder="Locality/Area" disabled={isLocked || !isEditingPersonal || formData.sameAsPresent} className={isLocked || !isEditingPersonal || formData.sameAsPresent ?"bg-muted" :"bg-background"} /></div>
 <div className="space-y-2"><Label>City</Label><Input name="permanentCity" value={formData.permanentCity} onChange={handleInputChange} placeholder="City" disabled={isLocked || !isEditingPersonal || formData.sameAsPresent} className={isLocked || !isEditingPersonal || formData.sameAsPresent ?"bg-muted" :"bg-background"} /></div>
 <div className="space-y-2"><Label>Tehsil <span className="text-xs text-muted-foreground">(Optional)</span></Label><Input name="permanentTehsil" value={formData.permanentTehsil} onChange={handleInputChange} placeholder="Tehsil" disabled={isLocked || !isEditingPersonal || formData.sameAsPresent} className={isLocked || !isEditingPersonal || formData.sameAsPresent ?"bg-muted" :"bg-background"} /></div>
 <div className="space-y-2">
 <Label>State <span className="text-destructive">*</span></Label>
 <Select value={formData.permanentState} onValueChange={(value) => {
 setFormData(p => ({ ...p, permanentState: value, permanentDistrict: '' }));
 if (personalErrors.permanentState) {
 setPersonalErrors(prev => {
 const newErrors = { ...prev };
 delete newErrors.permanentState;
 return newErrors;
 });
 }
 }} disabled={isLocked || !isEditingPersonal || formData.sameAsPresent} required>
 <SelectTrigger className={isLocked || !isEditingPersonal || formData.sameAsPresent ?"bg-muted" :"bg-background"}><SelectValue placeholder="Select State" /></SelectTrigger>
 <SelectContent>{INDIAN_STATES.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent>
 </Select>
 {personalErrors.permanentState && <p className="text-xs text-destructive">{personalErrors.permanentState}</p>}
 </div>
 <div className="space-y-2">
 <Label>District <span className="text-destructive">*</span></Label>
 <Select value={formData.permanentDistrict} onValueChange={(value) => {
 setFormData(p => ({ ...p, permanentDistrict: value }));
 if (personalErrors.permanentDistrict) {
 setPersonalErrors(prev => {
 const newErrors = { ...prev };
 delete newErrors.permanentDistrict;
 return newErrors;
 });
 }
 }} disabled={isLocked || !isEditingPersonal || formData.sameAsPresent || !formData.permanentState} required>
 <SelectTrigger className={isLocked || !isEditingPersonal || formData.sameAsPresent || !formData.permanentState ?"bg-muted" :"bg-background"}><SelectValue placeholder={formData.permanentState ?"Select District" :"Select State First"} /></SelectTrigger>
 <SelectContent>{formData.permanentState && DISTRICTS_BY_STATE[formData.permanentState]?.map(district => <SelectItem key={district} value={district}>{district}</SelectItem>)}</SelectContent>
 </Select>
 {personalErrors.permanentDistrict && <p className="text-xs text-destructive">{personalErrors.permanentDistrict}</p>}
 </div>
 <div className="space-y-2"><Label>Country</Label><Input name="permanentCountry" value={formData.permanentCountry || 'India'} disabled={true} className="bg-muted" /></div>
 <div className="space-y-2">
 <Label>Pincode <span className="text-destructive">*</span></Label>
 <Input name="permanentPincode" value={formData.permanentPincode} onChange={handleInputChange} placeholder="6-digit Pincode" maxLength={6} disabled={isLocked || !isEditingPersonal || formData.sameAsPresent} required className={isLocked || !isEditingPersonal || formData.sameAsPresent ?"bg-muted" :"bg-background"} />
 {personalErrors.permanentPincode && <p className="text-xs text-destructive">{personalErrors.permanentPincode}</p>}
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>
 </div>

 <div className="space-y-6">
 {/* Profile Image - No Background, Increased Size, No Text */}
 <div className="flex justify-center pb-4">
 <motion.div
 className="relative group w-40 h-40"
 whileHover={{ scale: 1.05 }}
 transition={{ type:"spring", stiffness: 400, damping: 10 }}
 >
 <motion.div
 animate={!profile?.photoUrl ? {
 boxShadow: ["0 0 0 0px rgba(59, 130, 246, 0)","0 0 0 4px rgba(59, 130, 246, 0.2)","0 0 0 0px rgba(59, 130, 246, 0)"]
 } : {}}
 transition={{ duration: 2, repeat: Infinity }}
 className="rounded-lg h-40 w-40"
 >
 <Avatar className="h-40 w-40 rounded-lg border-4 border-white shadow-lg cursor-pointer">
 <AvatarImage src={fullPhotoUrl} className="object-cover" />
 <AvatarFallback className="text-4xl bg-muted">ST</AvatarFallback>
 </Avatar>
 </motion.div>

 {!isLocked && (
 <>
 {/* Professional Badge: Upload/Camera (Bottom Left) */}
 <label
 htmlFor="photo-upload"
 className={cn(
"absolute -bottom-2 -left-2 z-20 cursor-pointer shadow-xl transition-all duration-200"
 )}
 >
 <div className="h-9 w-9 bg-brown-800 rounded-full text-brown-800-foreground border-4 border-background shadow-md flex items-center justify-center">
 <Camera className="h-4 w-4" />
 </div>
 </label>

 {/* Professional Badge: Delete (Bottom Right - Only if photo exists) */}
 {profile?.photoUrl && (
 <motion.button
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.9 }}
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 setIsDeleteDialogOpen(true);
 }}
 className={cn(
"absolute -bottom-2 -right-2 z-20 shadow-lg",
"h-9 w-9 bg-destructive border-4 border-background rounded-full text-destructive-foreground flex items-center justify-center",
"disabled:opacity-50 disabled:cursor-not-allowed"
 )}
 disabled={isDeletingPhoto}
 >
 {isDeletingPhoto ? (
 <Loader2 className="h-4 w-4 animate-spin" />
 ) : (
 <Trash2 className="h-4 w-4" />
 )}
 </motion.button>
 )}

 {/* Desktop Hover Hint */}
 <div className="absolute inset-0 bg-black/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center pointer-events-none border-2 border-brown-800/20">
 </div>
 </>
 )}
 <input id="photo-upload" type="file" className="hidden" onChange={onSelectFile} disabled={uploading || isLocked} />
 </motion.div>
 </div>

 {/* Policy Advisory - Separated from card */}
 <Alert className="bg-red-50 border-destructive text-red-900 text-left">
 <AlertTitle className="flex items-center gap-2 text-red-800 font-bold">
 <AlertTriangle className="h-4 w-4" />
 Profile Policy
 </AlertTitle>
 <AlertDescription className="text-xs leading-relaxed opacity-90">
 Please review your details carefully. Once you click Save & Lock, that section becomes read-only.<br />
 To make changes after locking, you must contact the admin.
 </AlertDescription>
 </Alert>
 </div>
 </div >

 <ImageCropper open={isCropping} imageSrc={cropSrc} onCancel={() => setIsCropping(false)} onCropComplete={handleCropComplete} />
 <UploadingOverlay isUploading={uploading} />

 <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>Remove Profile Photo?</AlertDialogTitle>
 <AlertDialogDescription>
 Are you sure you want to remove your profile photo? This action cannot be undone immediately, but you can always upload a new photo.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>Cancel</AlertDialogCancel>
 <AlertDialogAction onClick={handleDeletePhoto} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Remove</AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 );
}
