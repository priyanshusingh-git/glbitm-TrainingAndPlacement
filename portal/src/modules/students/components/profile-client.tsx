"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { api, API_BASE_URL } from "@/lib/api";
import { cn, getImageUrl } from "@/lib/utils";
import { getAblyClient } from "@/contexts/ably-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Camera, Lock, User, Phone, MapPin, Home, Briefcase,
  Loader2, Trash2, AlertTriangle, GraduationCap, BookOpen,
  Award, Github, Linkedin, Link2, Code2, FileText, Plus, X,
  CheckCircle2, ExternalLink, AlertCircle, Calculator, Divide,
  Fingerprint, Calendar, Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageCropper } from "@/components/ui/image-cropper";
import { UploadingOverlay } from "@/components/ui/uploading-overlay";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSidebar } from "@/components/layout/dashboard/dashboard-layout";
import { INDIAN_STATES, DISTRICTS_BY_STATE } from "@/lib/indian-locations";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type StudentProfile = {
  id: string; name: string; rollNo: number | null; admissionId?: string;
  branch: string; year?: number | null; currentSemester?: number; cgpa?: number;
  skills: string[]; resumeLink?: string | null;
  githubId?: string | null; leetcodeId?: string | null;
  codechefId?: string | null; linkedinId?: string | null; bio?: string | null;
  photoUrl?: string | null;
  isProfileLocked: boolean; isBasicInfoLocked?: boolean;
  isClass10Locked?: boolean; isClass12Locked?: boolean; isDiplomaLocked?: boolean;
  studentType?: string;
  class10School?: string; class10Board?: string; class10Percentage?: number; class10Year?: number;
  class12School?: string; class12Board?: string; class12Percentage?: number;
  class12PcmPercentage?: number; class12MathPercentage?: number | null; class12Year?: number;
  diplomaInstitute?: string; diplomaBranch?: string; diplomaPercentage?: number; diplomaYear?: number;
  mobileNo?: string; personalEmail?: string;
  presentHouseNo?: string; presentBlock?: string; presentLocality?: string;
  presentCity?: string; presentTehsil?: string; presentDistrict?: string;
  presentState?: string; presentCountry?: string; presentPincode?: string;
  permanentHouseNo?: string; permanentBlock?: string; permanentLocality?: string;
  permanentCity?: string; permanentTehsil?: string; permanentDistrict?: string;
  permanentState?: string; permanentCountry?: string; permanentPincode?: string;
  fatherName?: string; fatherOccupation?: string; fatherMobile?: string; fatherEmail?: string;
  motherName?: string; motherOccupation?: string; motherMobile?: string; motherEmail?: string;
  semesterResults?: { semester: number; sgpa: number | null; backlogs: number; credits?: number | null; totalMarks?: number | null; obtainedMarks?: number | null; percentage?: number | null; isLocked?: boolean }[];
};

// ─── Constants ────────────────────────────────────────────────────────────────
const BRANCHES = ["CSE","CSAI","CSDS","CSAIML","AIML","AIDS","IT","ECE","EEE","ME"];
const CURRENT_YEAR = new Date().getFullYear();
const PASSING_YEARS = Array.from({ length: 11 }, (_, i) => (CURRENT_YEAR - i).toString());
const getYearOptions = () => Array.from({ length: 4 }, (_, i) => (CURRENT_YEAR + i).toString());
const getSemesterOptions = (type?: string) => type === "Lateral Entry" ? [3,4,5,6,7,8] : [1,2,3,4,5,6,7,8];
const BOARDS = ["CBSE","ICSE/ISC","NIOS","Uttar Pradesh Board (UPMSP)","Rajasthan Board (RBSE)","Bihar Board (BSEB)","Maharashtra Board (MSBSHSE)","Karnataka Board (KSEEB/PUE)","Tamil Nadu Board (TNBSE)","Gujarat Board (GSEB)","Andhra Pradesh Board","Telangana Board (TSBIE/BSE)","West Bengal Board (WBBSE/WBCHSE)","Madhya Pradesh Board (MPBSE)","Punjab Board (PSEB)","Haryana Board (HBSE)","Others"];
const DIPLOMA_BRANCHES = ["Computer Science","Information Technology","Electronics & Communication","Electrical","Mechanical","Civil","Others"];

// ─── Component ────────────────────────────────────────────────────────────────

// --- Helper Components (Defined outside to prevent focus loss) ---
const LockedBadge = () => (
  <div className="flex items-center gap-1 bg-brown-900/5 border border-brown-900/10 px-2.5 py-1 rounded-lg">
    <Lock className="h-3 w-3 text-brown-900/60" />
    <span className="text-[10px] font-bold uppercase tracking-widest text-brown-900/80">Locked</span>
  </div>
);

// ── Constants ─────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;
const ROLL_NO_REGEX = /^\d{13}$/;
const ADMISSION_ID_REGEX = /^[A-Z0-9]{6,15}$/;

const LockButton = ({ onClick, saving: s, label = "Save & Lock", disabled }: { onClick: () => void, saving: boolean, label?: string, disabled?: boolean }) => (
  <Button onClick={onClick} disabled={disabled || s} size="sm" className="h-10 px-5 text-xs font-bold bg-brown-900 hover:bg-brown-800 text-white rounded-xl shadow-lg shadow-brown-900/10 transition-all active:scale-95">
    {s ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Locking...</> : <><Lock className="mr-2 h-3.5 w-3.5" />{label}</>}
  </Button>
);

const FieldRow = ({ label, children, error, required: req, icon: Icon, className }: { label: string, children: React.ReactNode, error?: string, required?: boolean, icon?: any, className?: string }) => (
  <div className={cn("space-y-2", className)}>
    <div className="flex items-center gap-2 px-0.5">
      {Icon && <Icon className="h-4 w-4 text-brown-900/50" />}
      <Label className="text-sm font-semibold text-brown-900/80 leading-none">
        {label}
        {req && <span className="text-destructive ml-1">*</span>}
      </Label>
    </div>
    <div className="relative group/field">
      {children}
    </div>
    {error && (
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-destructive/90 animate-in fade-in slide-in-from-top-1 px-1 mt-1.5">
        <AlertCircle className="h-3 w-3" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

export default function StudentProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { toast } = useToast();
  const { setCollapsed } = useSidebar();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [semesterResults, setSemesterResults] = useState<any[]>([]);
  const [showClass12ForLateral, setShowClass12ForLateral] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | boolean>(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [personalErrors, setPersonalErrors] = useState<Record<string, string>>({});
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const skillInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "", dob: "", gender: "", rollNo: "", admissionId: "", course: "Bachelor of Technology",
    studentType: "", branch: "",
    year: "", currentSemester: "",
    githubId: "", leetcodeId: "", codechefId: "", linkedinId: "",
    bio: "", skills: [] as string[], resumeLink: "",
    educationType: "12th",
    class10School: "", class10Board: "", class10Percentage: "", class10Year: "",
    class12School: "", class12Board: "", class12Percentage: "",
    class12PcmPercentage: "", class12MathPercentage: "", class12Year: "",
    diplomaInstitute: "", diplomaBranch: "", diplomaPercentage: "", diplomaYear: "",
    mobileNo: "", personalEmail: "",
    presentHouseNo: "", presentBlock: "", presentLocality: "", presentCity: "",
    presentTehsil: "", presentDistrict: "", presentState: "", presentCountry: "India", presentPincode: "",
    permanentHouseNo: "", permanentBlock: "", permanentLocality: "", permanentCity: "",
    permanentTehsil: "", permanentDistrict: "", permanentState: "", permanentCountry: "India", permanentPincode: "",
    sameAsPresent: false,
    fatherName: "", fatherOccupation: "", fatherMobile: "", fatherEmail: "",
    motherName: "", motherOccupation: "", motherMobile: "", motherEmail: "",
  });

  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; onConfirm: () => void } | null>(null);

  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      const newErrors = { ...errors };
      delete newErrors[fieldName];
      setErrors(newErrors);
    }
  };

  const fetchProfile = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.get("/students/profile");
      setProfile(data);
      setFormData(prev => ({
        ...prev,
        name: (data.name === "Student" ? "" : data.name) || "", 
        dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : "", 
        gender: data.gender || "", 
        rollNo: data.rollNo?.toString() || "", admissionId: data.admissionId || "",
        course: data.course || "Bachelor of Technology", studentType: data.studentType || "",
        branch: data.branch || "", year: data.year?.toString() || "",
        currentSemester: data.currentSemester?.toString() || "",
        githubId: data.githubId || "", leetcodeId: data.leetcodeId || "",
        codechefId: data.codechefId || "", linkedinId: data.linkedinId || "",
        bio: data.bio || "", skills: data.skills || [], resumeLink: data.resumeLink || "",
        educationType: data.studentType === "Lateral Entry" ? "Diploma" : "12th",
        class10School: data.class10School || "", class10Board: data.class10Board || "",
        class10Percentage: data.class10Percentage?.toString() || "", class10Year: data.class10Year?.toString() || "",
        class12School: data.class12School || "", class12Board: data.class12Board || "",
        class12Percentage: data.class12Percentage?.toString() || "", class12Year: data.class12Year?.toString() || "",
        class12PcmPercentage: data.class12PcmPercentage?.toString() || "", class12MathPercentage: data.class12MathPercentage?.toString() || "",
        diplomaInstitute: data.diplomaInstitute || "", diplomaBranch: data.diplomaBranch || "",
        diplomaPercentage: data.diplomaPercentage?.toString() || "", diplomaYear: data.diplomaYear?.toString() || "",
        mobileNo: data.mobileNo || "", personalEmail: data.personalEmail || "",
        presentHouseNo: data.presentHouseNo || "", presentBlock: data.presentBlock || "",
        presentLocality: data.presentLocality || "", presentCity: data.presentCity || "",
        presentTehsil: data.presentTehsil || "", presentDistrict: data.presentDistrict || "",
        presentState: data.presentState || "", presentCountry: data.presentCountry || "India",
        presentPincode: data.presentPincode || "",
        permanentHouseNo: data.permanentHouseNo || "", permanentBlock: data.permanentBlock || "",
        permanentLocality: data.permanentLocality || "", permanentCity: data.permanentCity || "",
        permanentTehsil: data.permanentTehsil || "", permanentDistrict: data.permanentDistrict || "",
        permanentState: data.permanentState || "", permanentCountry: data.permanentCountry || "India",
        permanentPincode: data.permanentPincode || "",
        fatherName: data.fatherName || "", fatherOccupation: data.fatherOccupation || "",
        fatherMobile: data.fatherMobile || "", fatherEmail: data.fatherEmail || "",
        motherName: data.motherName || "", motherOccupation: data.motherOccupation || "",
        motherMobile: data.motherMobile || "", motherEmail: data.motherEmail || "",
        sameAsPresent: !!(data.presentState && data.presentState === data.permanentState &&
          data.presentDistrict === data.permanentDistrict && data.presentPincode === data.permanentPincode),
      }));
      const initialResults = Array.from({ length: 8 }, (_, i) => {
        const ex = data.semesterResults?.find((r: any) => r.semester === i + 1);
        return { semester: i+1, sgpa: ex?.sgpa || null, backlogs: ex?.backlogs || 0,
          credits: ex?.credits || null, totalMarks: ex?.totalMarks || null,
          obtainedMarks: ex?.obtainedMarks || null, percentage: ex?.percentage || null,
          isLocked: ex?.isLocked || false };
      });
      setSemesterResults(initialResults);
    } catch (error: any) {
      if (error.message?.includes("404")) { toast({ title: "Session Expired", variant: "destructive" }); logout(); }
      else toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
    } finally { if (!silent) setLoading(false); }
  }, []);

  useEffect(() => { fetchProfile(); }, []);

  useEffect(() => {
    if (!user?.id) return;
    const client = getAblyClient();
    if (!client) return;
    const channel = client.channels.get(`student-${user.id}`);
    const onUpdate = () => fetchProfile(true);
    channel.subscribe("data-update", onUpdate);
    return () => { channel.unsubscribe("data-update", onUpdate); };
  }, [user?.id, fetchProfile]);

  // ─── Validation ───────────────────────────────────────────────────────────
  const validateBasicInfo = () => {
    const e: Record<string, string> = {};
    if (!formData.name?.trim()) e.name = "Please enter your full name";
    else if (formData.name.trim().length < 2) e.name = "Name must be at least 2 characters";

    if (!formData.dob) e.dob = "Please select your date of birth";
    if (!formData.gender) e.gender = "Please select your gender";

    if (!formData.rollNo?.trim()) e.rollNo = "Please enter your University Roll No";
    else if (!ROLL_NO_REGEX.test(formData.rollNo)) e.rollNo = "Roll No must be exactly 13 digits";

    if (!formData.admissionId?.trim()) e.admissionId = "Please enter your Admission ID";
    else if (!ADMISSION_ID_REGEX.test(formData.admissionId)) e.admissionId = "Admission ID must be 6-15 alphanumeric characters (Caps and Numbers only)";
    if (!formData.studentType) e.studentType = "Please select your entry type";
    if (!formData.branch) e.branch = "Please select your academic branch";
    if (!formData.year) e.year = "Please select your passing year";
    if (!formData.currentSemester) e.currentSemester = "Please select your current semester";
    return e;
  };

  const validatePercent = (val: string, label: string) => {
    if (!val || !val.trim()) return `Please enter your ${label}`;
    if (val.includes("%")) return "Enter numbers only (no % sign)";
    const n = parseFloat(val);
    if (isNaN(n) || n < 1 || n > 100) return "Percentage must be between 1.0 and 100.0";
    return null;
  };

  const handleSaveBasicInfo = () => {
    const errs = validateBasicInfo();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setConfirmDialog({
      open: true,
      title: "Lock Basic Details?",
      onConfirm: async () => {
        await saveBasicInfo();
        setConfirmDialog(null);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "admissionId") v = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (name === "name") v = value.replace(/\b\w/g, (c) => c.toUpperCase());
    setFormData(prev => ({ ...prev, [name]: v }));
    clearFieldError(name);
  };

  // ─── Save: Basic Info ──────────────────────────────────────────────────────
  const saveBasicInfo = async () => {
    const errs = validateBasicInfo();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving("basic");
    const payload: any = { 
        name: formData.name, 
        dob: formData.dob ? new Date(formData.dob).toISOString() : null,
        gender: formData.gender,
        rollNo: formData.rollNo, 
        course: formData.course || "Bachelor of Technology", 
        studentType: formData.studentType, 
        branch: formData.branch, 
        admissionId: formData.admissionId, 
        year: parseInt(formData.year, 10), 
        currentSemester: parseInt(formData.currentSemester, 10), 
        isBasicInfoLocked: true 
    };
    const prev = profile ? { ...profile } : null;
    setProfile(p => p ? { ...p, ...payload } : p);
    try {
      await api.put("/students/profile", payload);
      toast({ title: "Basic Details locked ✓" });
    } catch (err: any) {
      if (prev) setProfile(prev);
      const msg = err.response?.data?.error || err.message || "Failed to save";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally { setSaving(false); }
  };

  // ─── Save: Class 10 ────────────────────────────────────────────────────────
  const saveClass10 = async () => {
    const e: Record<string, string> = {};
    if (!formData.class10School?.trim()) e.class10School = "Please enter your school name";
    if (!formData.class10Board) e.class10Board = "Please select your board";
    const perr = validatePercent(formData.class10Percentage, "Class 10 Percentage"); if (perr) e.class10Percentage = perr;
    if (!formData.class10Year) e.class10Year = "Please select passing year";
    if (Object.keys(e).length) { setErrors(prev => ({ ...prev, ...e })); return; }
    setSaving("class10");
    const payload = { 
        class10School: formData.class10School, 
        class10Board: formData.class10Board, 
        class10Percentage: parseFloat(formData.class10Percentage), 
        class10Year: parseInt(formData.class10Year, 10), 
        isClass10Locked: true 
    };
    const prev = profile ? { ...profile } : null;
    setProfile(p => p ? { ...p, ...payload } : p);
    try {
      await api.put("/students/profile", payload);
      toast({ title: "Class 10 locked ✓" });
    } catch (err: any) { 
        if (prev) setProfile(prev);
        const msg = err.response?.data?.error || err.message || "Failed to save";
        toast({ title: "Error", description: msg, variant: "destructive" }); 
    }
    finally { setSaving(false); }
  };

  const handleSaveClass10 = () => {
    const e: Record<string, string> = {};
    if (!formData.class10School?.trim()) e.class10School = "Please enter your school name";
    if (!formData.class10Board) e.class10Board = "Please select your board";
    const perr = validatePercent(formData.class10Percentage, "Class 10 Percentage"); if (perr) e.class10Percentage = perr;
    if (!formData.class10Year) e.class10Year = "Please select passing year";
    if (Object.keys(e).length) { setErrors(prev => ({ ...prev, ...e })); return; }
    setConfirmDialog({
      open: true,
      title: "Lock Class 10 Details?",
      onConfirm: async () => {
        await saveClass10();
        setConfirmDialog(null);
      }
    });
  };

  // ─── Save: Class 12 ────────────────────────────────────────────────────────
  const saveClass12 = async (optional = false) => {
    const e: Record<string, string> = {};
    if (!formData.class12School?.trim()) e.class12School = "Please enter your school name";
    if (!formData.class12Board) e.class12Board = "Please select your board";
    const perr = validatePercent(formData.class12Percentage, "Overall Percentage"); if (perr) e.class12Percentage = perr;
    const pcmErr = validatePercent(formData.class12PcmPercentage, "PCM Percentage"); if (pcmErr) e.class12PcmPercentage = pcmErr;
    const mErr = validatePercent(formData.class12MathPercentage, "Math Percentage"); if (mErr) e.class12MathPercentage = mErr;
    if (!formData.class12Year) e.class12Year = "Please select passing year";
    if (Object.keys(e).length) { setErrors(prev => ({ ...prev, ...e })); return; }
    setSaving("class12");
    const payload = { 
        class12School: formData.class12School, 
        class12Board: formData.class12Board, 
        class12Percentage: parseFloat(formData.class12Percentage), 
        class12Year: parseInt(formData.class12Year, 10), 
        class12PcmPercentage: parseFloat(formData.class12PcmPercentage), 
        class12MathPercentage: formData.class12MathPercentage ? parseFloat(formData.class12MathPercentage) : null, 
        isClass12Locked: true 
    };
    const prev = profile ? { ...profile } : null;
    setProfile(p => p ? { ...p, ...payload } : p);
    try {
      await api.put("/students/profile", payload);
      toast({ title: "Class 12 locked ✓" });
    } catch (err: any) { 
        if (prev) setProfile(prev);
        const msg = err.response?.data?.error || err.message || "Failed to save";
        toast({ title: "Error", description: msg, variant: "destructive" }); 
    }
    finally { setSaving(false); }
  };

  const handleSaveClass12 = () => {
    const e: Record<string, string> = {};
    if (!formData.class12School?.trim()) e.class12School = "Please enter your school name";
    if (!formData.class12Board) e.class12Board = "Please select your board";
    const perr = validatePercent(formData.class12Percentage, "Overall Percentage"); if (perr) e.class12Percentage = perr;
    const pcmErr = validatePercent(formData.class12PcmPercentage, "PCM Percentage"); if (pcmErr) e.class12PcmPercentage = pcmErr;
    const mErr = validatePercent(formData.class12MathPercentage, "Math Percentage"); if (mErr) e.class12MathPercentage = mErr;
    if (!formData.class12Year) e.class12Year = "Please select passing year";
    if (Object.keys(e).length) { setErrors(prev => ({ ...prev, ...e })); return; }
    setConfirmDialog({
      open: true,
      title: "Lock Class 12 Details?",
      onConfirm: async () => {
        await saveClass12();
        setConfirmDialog(null);
      }
    });
  };

  // ─── Save: Diploma ─────────────────────────────────────────────────────────
  const saveDiploma = async () => {
    const e: Record<string, string> = {};
    if (!formData.diplomaInstitute?.trim()) e.diplomaInstitute = "Please enter your institute name";
    if (!formData.diplomaBranch) e.diplomaBranch = "Please select your branch";
    const perr = validatePercent(formData.diplomaPercentage, "Overall Percentage"); if (perr) e.diplomaPercentage = perr;
    if (!formData.diplomaYear) e.diplomaYear = "Please select passing year";
    if (Object.keys(e).length) { setErrors(prev => ({ ...prev, ...e })); return; }
    setSaving("diploma");
    const payload = { 
        diplomaInstitute: formData.diplomaInstitute, 
        diplomaBranch: formData.diplomaBranch, 
        diplomaPercentage: parseFloat(formData.diplomaPercentage), 
        diplomaYear: parseInt(formData.diplomaYear, 10), 
        isDiplomaLocked: true 
    };
    const prev = profile ? { ...profile } : null;
    setProfile(p => p ? { ...p, ...payload } : p);
    try {
      await api.put("/students/profile", payload);
      toast({ title: "Diploma locked ✓" });
    } catch (err: any) { 
        if (prev) setProfile(prev);
        const msg = err.response?.data?.error || err.message || "Failed to save";
        toast({ title: "Error", description: msg, variant: "destructive" }); 
    }
    finally { setSaving(false); }
  };

  const handleSaveDiploma = () => {
    const e: Record<string, string> = {};
    if (!formData.diplomaInstitute?.trim()) e.diplomaInstitute = "Please enter your institute name";
    if (!formData.diplomaBranch) e.diplomaBranch = "Please select your branch";
    const perr = validatePercent(formData.diplomaPercentage, "Overall Percentage"); if (perr) e.diplomaPercentage = perr;
    if (!formData.diplomaYear) e.diplomaYear = "Please select passing year";
    if (Object.keys(e).length) { setErrors(prev => ({ ...prev, ...e })); return; }
    setConfirmDialog({
      open: true,
      title: "Lock Diploma Details?",
      onConfirm: async () => {
        await saveDiploma();
        setConfirmDialog(null);
      }
    });
  };

  const handleConfirmSaveSemester = (idx: number) => {
    const sem = semesterResults[idx];
    const e: Record<string, string> = {};
    const isMissing = (v: any) => v === null || v === undefined || v.toString().trim() === "";
    
    if (isMissing(sem.obtainedMarks)) e[`sem-${sem.semester}-obtainedMarks`] = "Required";
    if (isMissing(sem.totalMarks)) e[`sem-${sem.semester}-totalMarks`] = "Required";
    if (isMissing(sem.sgpa)) e[`sem-${sem.semester}-sgpa`] = "Required";
    
    if (!isMissing(sem.sgpa) && (parseFloat(sem.sgpa) < 0 || parseFloat(sem.sgpa) > 10)) {
      e[`sem-${sem.semester}-sgpa`] = "SGPA 0-10";
    }
    if (!isMissing(sem.obtainedMarks) && !isMissing(sem.totalMarks) && parseFloat(sem.obtainedMarks) > parseFloat(sem.totalMarks)) {
      e[`sem-${sem.semester}-obtainedMarks`] = "Cannot exceed max";
      e[`sem-${sem.semester}-totalMarks`] = "Check these marks";
    }
    
    if (Object.keys(e).length) { 
      setErrors(prev => ({ ...prev, ...e })); 
      toast({ title: "Validation Error", description: "Please fix the highlighted fields in this semester.", variant: "destructive" }); 
      return; 
    }
    
    setConfirmDialog({
      open: true,
      title: `Lock Semester ${sem.semester} Results?`,
      onConfirm: async () => {
        await saveSemester(idx);
        setConfirmDialog(null);
      }
    });
  };

  // ─── Save: Semester ────────────────────────────────────────────────────────
  const saveSemester = async (idx: number) => {
    const sem = semesterResults[idx];
    // Double check validation before actual save
    if (!sem.obtainedMarks || !sem.totalMarks || !sem.sgpa || sem.sgpa < 0 || sem.sgpa > 10 || sem.obtainedMarks > sem.totalMarks) {
        toast({ title: "Validation Error", description: "Incomplete or invalid semester data.", variant: "destructive" });
        return;
    }
    setSaving(`sem-${sem.semester}`);
    try {
      await api.put("/students/profile", { semesterResults: [{ semester: sem.semester, sgpa: sem.sgpa, backlogs: sem.backlogs || 0, totalMarks: sem.totalMarks, obtainedMarks: sem.obtainedMarks }] });
      await api.post(`/students/${profile?.id}/lock-semester`, { semester: sem.semester });
      const updated = [...semesterResults];
      updated[idx].isLocked = true;
      setSemesterResults(updated);
      toast({ title: `Semester ${sem.semester} locked ✓` });
    } catch (err: any) { 
      const msg = err.response?.data?.error || err.message || "Failed to save";
      toast({ title: "Error", description: msg, variant: "destructive" }); 
    }
    finally { setSaving(false); }
  };

  // ─── Save: Personal Info ───────────────────────────────────────────────────
  const savePersonalInfo = async () => {
    const e: Record<string, string> = {};
    if (!formData.mobileNo || !/^\d{10}$/.test(formData.mobileNo)) e.mobileNo = "Valid 10-digit mobile required";
    if (!formData.personalEmail) e.personalEmail = "Personal email required";
    if (!formData.fatherName?.trim()) e.fatherName = "Father name required";
    if (!formData.motherName?.trim()) e.motherName = "Mother name required";
    if (!formData.presentState) e.presentState = "State required";
    if (!formData.presentDistrict) e.presentDistrict = "District required";
    if (!formData.presentPincode || !/^\d{6}$/.test(formData.presentPincode)) e.presentPincode = "Valid 6-digit pincode required";
    if (Object.keys(e).length) { setPersonalErrors(e); toast({ title: "Fix errors", variant: "destructive" }); return; }
    setSaving("personal");
    const payload = { mobileNo: formData.mobileNo, personalEmail: formData.personalEmail, fatherName: formData.fatherName, fatherOccupation: formData.fatherOccupation, fatherMobile: formData.fatherMobile, fatherEmail: formData.fatherEmail, motherName: formData.motherName, motherOccupation: formData.motherOccupation, motherMobile: formData.motherMobile, motherEmail: formData.motherEmail, presentHouseNo: formData.presentHouseNo, presentBlock: formData.presentBlock, presentLocality: formData.presentLocality, presentCity: formData.presentCity, presentTehsil: formData.presentTehsil, presentDistrict: formData.presentDistrict, presentState: formData.presentState, presentCountry: formData.presentCountry, presentPincode: formData.presentPincode, permanentHouseNo: formData.permanentHouseNo, permanentBlock: formData.permanentBlock, permanentLocality: formData.permanentLocality, permanentCity: formData.permanentCity, permanentTehsil: formData.permanentTehsil, permanentDistrict: formData.permanentDistrict, permanentState: formData.permanentState, permanentCountry: formData.permanentCountry, permanentPincode: formData.permanentPincode };
    const prev = profile ? { ...profile } : null;
    setProfile(p => p ? { ...p, ...payload } : p);
    setIsEditingPersonal(false);
    try { await api.put("/students/profile", payload); toast({ title: "Personal details saved ✓" }); }
    catch (err: any) { if (prev) setProfile(prev); setIsEditingPersonal(true); toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  // ─── Save: Career ──────────────────────────────────────────────────────────
  const saveCareer = async () => {
    setSaving("career");
    const payload = { githubId: formData.githubId || null, leetcodeId: formData.leetcodeId || null, codechefId: formData.codechefId || null, linkedinId: formData.linkedinId || null, bio: formData.bio || null, resumeLink: formData.resumeLink || null, skills: formData.skills };
    const prev = profile ? { ...profile } : null;
    setProfile(p => p ? { ...p, ...payload } : p);
    try { await api.put("/students/profile", payload); toast({ title: "Career profile saved ✓" }); }
    catch (err: any) { if (prev) setProfile(prev); toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  // ─── Photo Handlers ────────────────────────────────────────────────────────
  const handleDeletePhoto = async () => {
    setIsDeleteDialogOpen(false); setIsDeletingPhoto(true);
    try { await api.put("/students/profile", { photoUrl: null }); setProfile(p => p ? { ...p, photoUrl: null } : p); updateUser({ photoUrl: undefined }); toast({ title: "Photo removed" }); }
    catch { toast({ title: "Error", description: "Failed to remove photo", variant: "destructive" }); }
    finally { setIsDeletingPhoto(false); }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { const reader = new FileReader(); reader.onload = () => { setCropSrc(reader.result as string); setIsCropping(true); }; reader.readAsDataURL(e.target.files[0]); e.target.value = ""; }
  };

  const handleCropComplete = async (blob: Blob) => {
    setIsCropping(false); setUploading(true);
    const previousProfile = profile ? { ...profile } : null;
    const previousUser = user ? { ...user } : null;
    try {
      const fd = new FormData();
      fd.append("file", blob, "profile.jpg");
      fd.append("type", "profile-images");
      const res: any = await api.post("/upload", fd);
      if (!res.url) throw new Error("Upload failed");
      await api.put("/students/profile", { photoUrl: res.url });
      
      updateUser({ photoUrl: res.url });
      setProfile(p => p ? { ...p, photoUrl: res.url } : p);
      toast({ title: "Photo updated ✓" });
      fetchProfile(true);
    } catch { if (previousProfile) setProfile(previousProfile); if (previousUser) updateUser(previousUser as any); toast({ title: "Upload failed", variant: "destructive" }); }
    finally { setUploading(false); }
  };

  // ─── Skill Helpers ─────────────────────────────────────────────────────────
  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !formData.skills.includes(s) && formData.skills.length < 20) {
      setFormData(p => ({ ...p, skills: [...p.skills, s] })); setSkillInput("");
      skillInputRef.current?.focus();
    }
  };
  const removeSkill = (skill: string) => setFormData(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));

  // ─── Derived State ─────────────────────────────────────────────────────────
  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  const isLocked = profile?.isProfileLocked;
  const fullPhotoUrl = getImageUrl(profile?.photoUrl);

  const completionItems = [
    { done: !!profile?.isBasicInfoLocked, weight: 20, label: "Basic Details" },
    { done: !!profile?.isClass10Locked, weight: 10, label: "Class 10" },
    { done: !!(profile?.isClass12Locked || profile?.isDiplomaLocked), weight: 10, label: "Class 12 / Diploma" },
    { done: semesterResults.some(s => s.isLocked), weight: 10, label: "Semester Results" },
    { done: !!(formData.mobileNo && formData.personalEmail), weight: 10, label: "Contact Details" },
    { done: !!formData.resumeLink, weight: 15, label: "Resume" },
    { done: !!(formData.githubId || formData.linkedinId), weight: 10, label: "Social Links" },
    { done: formData.skills.length > 0, weight: 15, label: "Skills & Expertise" },
  ];
  const completionScore = completionItems.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);







  return (
    <div className="space-y-6 pb-12">
      {/* ════ IDENTITY HEADER ════════════════════════════════════════════════ */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        {/* Gradient Banner */}
        <div className="relative h-32 bg-gradient-to-br from-brown-950 via-brown-900 to-brown-900">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(255,255,255,.05) 10px,rgba(255,255,255,.05) 11px)" }} />
          {isLocked && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-200 text-[10px] font-bold px-4 py-2 rounded-full backdrop-blur-md uppercase tracking-[0.2em] shadow-xl">
              <Lock className="h-3 w-3" /> Locked by Admin
            </div>
          )}
        </div>

        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          {/* Avatar + Meta row */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 mb-5">
            {/* Avatar with upload */}
            <div className="relative group w-fit shrink-0">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl border-4 border-card shadow-xl">
                <AvatarImage src={fullPhotoUrl} className="object-cover" />
                <AvatarFallback className="rounded-xl bg-brown-900 text-white text-2xl font-display font-bold">
                  {formData.name?.split(" ").map((n: string) => n[0]).join("").substring(0,2).toUpperCase() || "ST"}
                </AvatarFallback>
              </Avatar>
              {!isLocked && (
                <label htmlFor="photo-upload" className="absolute -bottom-1.5 -right-1.5 cursor-pointer z-10">
                  <div className="h-8 w-8 bg-brown-800 rounded-full border-2 border-card flex items-center justify-center shadow-lg hover:bg-brown-700 transition-colors">
                    <Camera className="h-3.5 w-3.5 text-white" />
                  </div>
                </label>
              )}
              {profile?.photoUrl && !isLocked && (
                <button onClick={() => setIsDeleteDialogOpen(true)} className="absolute -top-1.5 -right-1.5 z-10 h-6 w-6 bg-brown-900/80 rounded-full border-2 border-card flex items-center justify-center hover:bg-red-700 transition-colors">
                  <X className="h-3 w-3 text-white" />
                </button>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 sm:pb-1 pt-2 sm:pt-0">
              <div className="flex flex-wrap items-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground leading-tight">
                  {profile?.name || <span className="text-muted-foreground italic text-xl">Your Name</span>}
                </h1>
                {profile?.isBasicInfoLocked && (
                  <Badge variant="outline" className="mt-1 border-brown-900/40 bg-brown-900/5 text-brown-900 text-[10px] font-bold tracking-widest uppercase">
                    <CheckCircle2 className="h-3 w-3 mr-1" />Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2">
                {profile?.branch && <span className="font-medium">{profile.branch}</span>}
                {!!profile?.year && profile.year !== 0 && <><span className="opacity-30">·</span><span>Class of {profile.year}</span></>}
                {!!profile?.cgpa && Number(profile.cgpa) > 0 && <><span className="opacity-30">·</span><span className="font-bold text-brown-900">CGPA {Number(profile.cgpa).toFixed(2)}</span></>}
              </p>
              {formData.bio && (
                <p className="mt-1.5 text-xs text-muted-foreground italic line-clamp-2 max-w-lg">&ldquo;{formData.bio}&rdquo;</p>
              )}
            </div>

            {/* Social pills */}
            <div className="flex flex-wrap gap-2 sm:pb-1">
              {formData.linkedinId && (
                <a href={`https://linkedin.com/in/${formData.linkedinId}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0A66C2]/10 border border-[#0A66C2]/30 text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-colors">
                  <Linkedin className="h-3.5 w-3.5" />LinkedIn
                </a>
              )}
              {formData.githubId && (
                <a href={`https://github.com/${formData.githubId}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-muted border border-border/60 text-foreground hover:bg-muted/70 transition-colors">
                  <Github className="h-3.5 w-3.5" />GitHub
                </a>
              )}
              {formData.leetcodeId && (
                <a href={`https://leetcode.com/${formData.leetcodeId}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brown-900/10 border border-brown-900/30 text-brown-900 hover:bg-brown-900/20 transition-colors">
                  <Code2 className="h-3.5 w-3.5" />LeetCode
                </a>
              )}
              {formData.resumeLink && (
                <a href={formData.resumeLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brown-900/10 border border-brown-900/30 text-brown-900 hover:bg-brown-900/20 transition-colors">
                  <FileText className="h-3.5 w-3.5" />Resume
                </a>
              )}
            </div>
          </div>

          {/* Completion Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Profile Readiness</span>
              <span className={cn("text-xs font-bold tabular-nums", completionScore >= 80 ? "text-brown-900" : completionScore >= 50 ? "text-brown-900" : "text-red-500")}>
                {completionScore}%
              </span>
            </div>
            <Progress value={completionScore} className="h-2 [&>div]:bg-[var(--progress-color)]"
              style={{ "--progress-color": completionScore >= 80 ? "#78350f" : completionScore >= 50 ? "#d97706" : "#991b1b" } as any}
            />
            {completionScore < 100 && (
              <p className="text-[10px] text-muted-foreground">
                Incomplete: {completionItems.filter(i => !i.done).map(i => i.label).join(" · ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ════ CONTENT TABS ═══════════════════════════════════════════════════ */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/20 p-1 rounded-xl border border-border/40 mb-8">
          <TabsTrigger value="basic" className="rounded-lg border border-transparent data-[state=active]:bg-white data-[state=active]:text-brown-900 data-[state=active]:font-bold data-[state=active]:border-brown-900/20 data-[state=active]:shadow-sm">
            <User className="h-4 w-4 mr-2" />Basic
          </TabsTrigger>
          <TabsTrigger value="academic" disabled={!profile?.isBasicInfoLocked} className="rounded-lg border border-transparent data-[state=active]:bg-white data-[state=active]:text-brown-900 data-[state=active]:font-bold data-[state=active]:border-brown-900/20 data-[state=active]:shadow-sm">
            <GraduationCap className="h-4 w-4 mr-2" />Academic {!profile?.isBasicInfoLocked && "🔒"}
          </TabsTrigger>
          <TabsTrigger value="personal" disabled={!profile?.isBasicInfoLocked} className="rounded-lg border border-transparent data-[state=active]:bg-white data-[state=active]:text-brown-900 data-[state=active]:font-bold data-[state=active]:border-brown-900/20 data-[state=active]:shadow-sm">
            <Phone className="h-4 w-4 mr-2" />Contact {!profile?.isBasicInfoLocked && "🔒"}
          </TabsTrigger>
          <TabsTrigger value="career" className="rounded-lg border border-transparent data-[state=active]:bg-white data-[state=active]:text-brown-900 data-[state=active]:font-bold data-[state=active]:border-brown-900/20 data-[state=active]:shadow-sm">
            <Briefcase className="h-4 w-4 mr-2" />Career
          </TabsTrigger>
        </TabsList>

        {/* ── BASIC DETAILS TAB ─────────────────────────────────────────── */}
        <TabsContent value="basic" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Section: Core Identity */}
          <div className="space-y-8">
            <div className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-brown-900/8 border border-brown-900/10 flex items-center justify-center">
                  <Fingerprint className="h-5 w-5 text-brown-900/70" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brown-900 tracking-tight">Core Identity</h3>
                  <p className="text-sm text-muted-foreground">Foundational information for verification</p>
                </div>
              </div>
              {profile?.isBasicInfoLocked ? <LockedBadge /> : <LockButton onClick={handleSaveBasicInfo} saving={saving === "basic"} disabled={!!isLocked} />}
            </div>

            <div className="grid gap-10 p-10 bg-white shadow-xl shadow-brown-900/[0.02] rounded-2xl border border-border/40 relative overflow-hidden group/card">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover/card:opacity-[0.07] transition-opacity">
                <Fingerprint className="h-24 w-24 text-brown-900" />
              </div>
              
              <div className="grid gap-8 md:grid-cols-4 relative z-10">
                <FieldRow label="Full Name" required error={errors.name} icon={User} className="md:col-span-2">
                  <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="As per official documents" disabled={!!isLocked || !!profile?.isBasicInfoLocked} className={cn("h-12 bg-white border-border/40 shadow-sm transition-all focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-medium", errors.name && "border-destructive", (isLocked || profile?.isBasicInfoLocked) && "bg-muted/20")} />
                </FieldRow>
                <FieldRow label="Date of Birth" required error={errors.dob} icon={Calendar} className="md:col-span-1">
                  <Input type="date" name="dob" value={formData.dob} onChange={handleInputChange} disabled={!!isLocked || !!profile?.isBasicInfoLocked} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base transition-all", (isLocked || profile?.isBasicInfoLocked) && "bg-muted/20", errors.dob && "border-destructive")} />
                </FieldRow>
                <FieldRow label="Gender" required error={errors.gender} icon={User} className="md:col-span-1">
                  <Select value={formData.gender} onValueChange={v => setFormData(p => ({ ...p, gender: v }))} disabled={!!isLocked || !!profile?.isBasicInfoLocked}>
                    <SelectTrigger className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-medium transition-all", (isLocked || profile?.isBasicInfoLocked) && "bg-muted/20", errors.gender && "border-destructive")}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                  </Select>
                </FieldRow>
              </div>
              
            </div>
          </div>

          {/* Section: Academic Standing */}
          <div className="space-y-8">
            <div className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-brown-900/8 border border-brown-900/10 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-brown-900/70" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brown-900 tracking-tight">Academic Standing</h3>
                  <p className="text-sm text-muted-foreground">University records and eligibility context</p>
                </div>
              </div>
            </div>

            <div className="grid gap-10 p-10 bg-white shadow-xl shadow-brown-900/[0.02] rounded-2xl border border-border/40 relative overflow-hidden group/card">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover/card:opacity-[0.07] transition-opacity">
                <GraduationCap className="h-24 w-24 text-brown-900" />
              </div>
              
              {/* Row 1: College Name */}
              <div className="grid gap-8 md:grid-cols-4 relative z-10">
                <FieldRow label="College Name" icon={Home} className="md:col-span-4">
                  <Input value="G.L. Bajaj Institute of Technology and Management" disabled className="h-12 bg-muted/20 border-border/40 shadow-sm font-semibold text-brown-900/80" />
                </FieldRow>
              </div>

              {/* Row 2: Degree & Branch */}
              <div className="grid gap-8 md:grid-cols-2 relative z-10">
                <FieldRow label="Degree Course" icon={BookOpen}>
                  <Input value={formData.course || "Bachelor of Technology"} disabled className="h-12 bg-muted/20 border-border/40 shadow-sm font-bold text-brown-900/80" />
                </FieldRow>
                <FieldRow label="Branch Name" required error={errors.branch} icon={Briefcase}>
                  <Select value={formData.branch} onValueChange={v => setFormData(p => ({ ...p, branch: v }))} disabled={!!isLocked || !!profile?.isBasicInfoLocked}>
                    <SelectTrigger className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-semibold text-brown-900/80 transition-all", errors.branch && "border-destructive", (isLocked || profile?.isBasicInfoLocked) && "bg-muted/20")}><SelectValue placeholder="Select Branch" /></SelectTrigger>
                    <SelectContent>{BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </FieldRow>
              </div>

              {/* Row 3: Official Email & Roll No */}
              <div className="grid gap-8 md:grid-cols-2 relative z-10">
                <FieldRow label="Official Email" icon={Mail}>
                  <div className="relative">
                    <Input value={user?.email || ""} disabled className="h-12 bg-muted/20 border-border/40 shadow-sm font-mono text-sm pl-10 text-brown-900/80" />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  </div>
                </FieldRow>
                <FieldRow label="University Roll No" required error={errors.rollNo} icon={Award}>
                  <Input name="rollNo" value={formData.rollNo} onChange={handleInputChange} placeholder="13-digit number" maxLength={13} disabled={!!isLocked || !!profile?.isBasicInfoLocked} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 font-mono text-lg tracking-widest transition-all", errors.rollNo && "border-destructive", (isLocked || profile?.isBasicInfoLocked) && "bg-muted/20")} />
                </FieldRow>
              </div>

              {/* Row 4: Admission ID, Batch, Semester */}
              <div className="grid gap-8 md:grid-cols-4 relative z-10">
                <FieldRow label="Admission ID" required error={errors.admissionId} icon={Fingerprint} className="md:col-span-2">
                  <Input name="admissionId" value={formData.admissionId} onChange={handleInputChange} placeholder="e.g. 23B0101001" disabled={!!isLocked || !!profile?.isBasicInfoLocked} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 font-mono tracking-wider uppercase transition-all", (isLocked || profile?.isBasicInfoLocked) && "bg-muted/20", errors.admissionId && "border-destructive")} />
                </FieldRow>
                <FieldRow label="Batch Year" required error={errors.year} icon={Calendar} className="md:col-span-1">
                  <Select value={formData.year} onValueChange={v => setFormData(p => ({ ...p, year: v }))} disabled={!!isLocked || !!profile?.isBasicInfoLocked}>
                    <SelectTrigger className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base transition-all", errors.year && "border-destructive", (isLocked || profile?.isBasicInfoLocked) && "bg-muted/20")}><SelectValue placeholder="Graduation" /></SelectTrigger>
                    <SelectContent>{getYearOptions().map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                </FieldRow>
                <FieldRow label="Current Semester" required error={errors.currentSemester} icon={BookOpen} className="md:col-span-1">
                  <Select value={formData.currentSemester} onValueChange={v => setFormData(p => ({ ...p, currentSemester: v }))} disabled={!!isLocked || !!profile?.isBasicInfoLocked}>
                    <SelectTrigger className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base transition-all", errors.currentSemester && "border-destructive", (isLocked || profile?.isBasicInfoLocked) && "bg-muted/20")}><SelectValue placeholder="Sem" /></SelectTrigger>
                    <SelectContent>{getSemesterOptions(formData.studentType).map(s => <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>)}</SelectContent>
                  </Select>
                </FieldRow>
              </div>
            </div>
          </div>
          
        </TabsContent>

        {/* ── ACADEMIC TAB ──────────────────────────────────────────────── */}
        <TabsContent value="academic" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Section: Secondary Education */}
          <div className="space-y-8">
            <div className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-brown-900/8 border border-brown-900/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-brown-900/70" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brown-900 tracking-tight">Secondary Education</h3>
                  <p className="text-sm text-muted-foreground">Class 10th records and board verification</p>
                </div>
              </div>
              {profile?.isClass10Locked ? <LockedBadge /> : <LockButton onClick={handleSaveClass10} saving={saving === "class10"} disabled={!!isLocked} />}
            </div>

            <div className="grid gap-10 p-10 bg-white shadow-xl shadow-brown-900/[0.02] rounded-2xl border border-border/40 relative overflow-hidden group/card">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover/card:opacity-[0.07] transition-opacity">
                <BookOpen className="h-24 w-24 text-brown-900" />
              </div>
              
              <div className="grid gap-8 md:grid-cols-1 relative z-10">
                <FieldRow label="School Name" required error={errors.class10School} icon={Home}>
                  <Input name="class10School" value={formData.class10School} onChange={handleInputChange} placeholder="Full name of your school" disabled={!!isLocked || !!profile?.isClass10Locked} className={cn("h-12 bg-white border-border/40 shadow-sm transition-all focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-medium", errors.class10School && "border-destructive", (isLocked || profile?.isClass10Locked) && "bg-muted/20")} />
                </FieldRow>
              </div>

              <div className="grid gap-8 md:grid-cols-2 relative z-10">
                <FieldRow label="Board" required error={errors.class10Board} icon={Award}>
                  <Select value={formData.class10Board} onValueChange={v => { setFormData(p => ({ ...p, class10Board: v })); clearFieldError("class10Board"); }} disabled={!!isLocked || !!profile?.isClass10Locked}>
                    <SelectTrigger className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-medium transition-all", (isLocked || profile?.isClass10Locked) && "bg-muted/20", errors.class10Board && "border-destructive")}><SelectValue placeholder="Select Board" /></SelectTrigger>
                    <SelectContent>{BOARDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </FieldRow>
                <div className="grid grid-cols-2 gap-6">
                  <FieldRow label="Passing Year" required error={errors.class10Year} icon={GraduationCap}>
                    <Select value={formData.class10Year} onValueChange={v => { setFormData(p => ({ ...p, class10Year: v })); clearFieldError("class10Year"); }} disabled={!!isLocked || !!profile?.isClass10Locked}>
                      <SelectTrigger className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-medium transition-all", (isLocked || profile?.isClass10Locked) && "bg-muted/20", errors.class10Year && "border-destructive")}><SelectValue placeholder="Year" /></SelectTrigger>
                      <SelectContent>{PASSING_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                    </Select>
                  </FieldRow>
                  <FieldRow label="Overall %" required error={errors.class10Percentage} icon={FileText}>
                    <div className="relative group">
                      <Input name="class10Percentage" value={formData.class10Percentage} onChange={handleInputChange} placeholder="85.5" disabled={!!isLocked || !!profile?.isClass10Locked} className={cn("h-12 pr-10 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base transition-all", errors.class10Percentage && "border-destructive", (isLocked || profile?.isClass10Locked) && "bg-muted/20")} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold opacity-40">%</span>
                    </div>
                  </FieldRow>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Senior Secondary */}
          {formData.studentType === "Regular Entry" && (
            <div className="space-y-8">
              <div className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-brown-900/8 border border-brown-900/10 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-brown-900/70" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brown-900 tracking-tight">Senior Secondary</h3>
                    <p className="text-sm text-muted-foreground">Class 12th records and PCM proficiency</p>
                  </div>
                </div>
                {profile?.isClass12Locked ? <LockedBadge /> : <LockButton onClick={handleSaveClass12} saving={saving === "class12"} disabled={!!isLocked} />}
              </div>

              <div className="grid gap-10 p-10 bg-white shadow-xl shadow-brown-900/[0.02] rounded-2xl border border-border/40 relative overflow-hidden group/card">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover/card:opacity-[0.07] transition-opacity">
                  <GraduationCap className="h-24 w-24 text-brown-900" />
                </div>
                
                <div className="grid gap-8 md:grid-cols-1 relative z-10">
                  <FieldRow label="School Name" required error={errors.class12School} icon={Home}>
                    <Input name="class12School" value={formData.class12School} onChange={handleInputChange} placeholder="Full name of your school" disabled={!!isLocked || !!profile?.isClass12Locked} className={cn("h-12 bg-white border-border/40 shadow-sm transition-all focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-medium", errors.class12School && "border-destructive", (isLocked || profile?.isClass12Locked) && "bg-muted/20")} />
                  </FieldRow>
                </div>

                <div className="grid gap-8 md:grid-cols-2 relative z-10">
                  <FieldRow label="Board" required error={errors.class12Board} icon={Award}>
                    <Select value={formData.class12Board} onValueChange={v => { setFormData(p => ({ ...p, class12Board: v })); clearFieldError("class12Board"); }} disabled={!!isLocked || !!profile?.isClass12Locked}>
                      <SelectTrigger className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base transition-all", (isLocked || profile?.isClass12Locked) && "bg-muted/20", errors.class12Board && "border-destructive")}><SelectValue placeholder="Select Board" /></SelectTrigger>
                      <SelectContent>{BOARDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                  </FieldRow>
                  <FieldRow label="Passing Year" required error={errors.class12Year} icon={Calendar}>
                    <Select value={formData.class12Year} onValueChange={v => { setFormData(p => ({ ...p, class12Year: v })); clearFieldError("class12Year"); }} disabled={!!isLocked || !!profile?.isClass12Locked}>
                      <SelectTrigger className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-medium transition-all", (isLocked || profile?.isClass12Locked) && "bg-muted/20", errors.class12Year && "border-destructive")}><SelectValue placeholder="Select Year" /></SelectTrigger>
                      <SelectContent>{PASSING_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                    </Select>
                  </FieldRow>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative z-10">
                  <FieldRow label="Overall %" required error={errors.class12Percentage} icon={FileText}>
                    <div className="relative group">
                      <Input name="class12Percentage" value={formData.class12Percentage} onChange={handleInputChange} placeholder="85.0" disabled={!!isLocked || !!profile?.isClass12Locked} className={cn("h-12 pr-10 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base transition-all", errors.class12Percentage && "border-destructive", (isLocked || profile?.isClass12Locked) && "bg-muted/20")} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold opacity-40">%</span>
                    </div>
                  </FieldRow>
                  <FieldRow label="PCM %" required error={errors.class12PcmPercentage} icon={Calculator}>
                    <div className="relative group">
                      <Input name="class12PcmPercentage" value={formData.class12PcmPercentage} onChange={handleInputChange} placeholder="82.5" disabled={!!isLocked || !!profile?.isClass12Locked} className={cn("h-12 pr-10 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base transition-all", errors.class12PcmPercentage && "border-destructive", (isLocked || profile?.isClass12Locked) && "bg-muted/20")} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold opacity-40">%</span>
                    </div>
                  </FieldRow>
                  <FieldRow label="Math %" required error={errors.class12MathPercentage} icon={Divide}>
                    <div className="relative group">
                      <Input name="class12MathPercentage" value={formData.class12MathPercentage} onChange={handleInputChange} placeholder="90" disabled={!!isLocked || !!profile?.isClass12Locked} className={cn("h-12 pr-10 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base transition-all", errors.class12MathPercentage && "border-destructive", (isLocked || profile?.isClass12Locked) && "bg-muted/20")} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold opacity-40">%</span>
                    </div>
                  </FieldRow>
                </div>
              </div>
            </div>
          )}

          {/* Section: Diploma Education */}
          {formData.studentType === "Lateral Entry" && (
            <div className="space-y-8">
              <div className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-brown-900/8 border border-brown-900/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-brown-900/70" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brown-900 tracking-tight">Diploma Education</h3>
                    <p className="text-sm text-muted-foreground">Polytechnic diploma records and institute details</p>
                  </div>
                </div>
                {profile?.isDiplomaLocked ? <LockedBadge /> : <LockButton onClick={handleSaveDiploma} saving={saving === "diploma"} disabled={!!isLocked} />}
              </div>

              <div className="grid gap-10 p-10 bg-white shadow-xl shadow-brown-900/[0.02] rounded-2xl border border-border/40 relative overflow-hidden group/card">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover/card:opacity-[0.07] transition-opacity">
                  <Award className="h-24 w-24 text-brown-900" />
                </div>
                
                <div className="grid gap-8 md:grid-cols-1 relative z-10">
                  <FieldRow label="Institute Name" required error={errors.diplomaInstitute} icon={Home}>
                    <Input name="diplomaInstitute" value={formData.diplomaInstitute} onChange={handleInputChange} placeholder="Full name of your institute" disabled={!!isLocked || !!profile?.isDiplomaLocked} className={cn("h-12 bg-white border-border/40 shadow-sm transition-all focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-medium", errors.diplomaInstitute && "border-destructive", (isLocked || profile?.isDiplomaLocked) && "bg-muted/20")} />
                  </FieldRow>
                </div>

                <div className="grid gap-8 md:grid-cols-2 relative z-10">
                  <FieldRow label="Branch" required error={errors.diplomaBranch} icon={Briefcase}>
                    <Select value={formData.diplomaBranch} onValueChange={v => { setFormData(p => ({ ...p, diplomaBranch: v })); clearFieldError("diplomaBranch"); }} disabled={!!isLocked || !!profile?.isDiplomaLocked}>
                      <SelectTrigger className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-medium transition-all", (isLocked || profile?.isDiplomaLocked) && "bg-muted/20", errors.diplomaBranch && "border-destructive")}><SelectValue placeholder="Select Branch" /></SelectTrigger>
                      <SelectContent>{DIPLOMA_BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                  </FieldRow>
                  <div className="grid grid-cols-2 gap-6">
                    <FieldRow label="Passing Year" required error={errors.diplomaYear} icon={GraduationCap}>
                      <Select value={formData.diplomaYear} onValueChange={v => { setFormData(p => ({ ...p, diplomaYear: v })); clearFieldError("diplomaYear"); }} disabled={!!isLocked || !!profile?.isDiplomaLocked}>
                        <SelectTrigger className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-medium transition-all", (isLocked || profile?.isDiplomaLocked) && "bg-muted/20", errors.diplomaYear && "border-destructive")}><SelectValue placeholder="Select Year" /></SelectTrigger>
                        <SelectContent>{PASSING_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                      </Select>
                    </FieldRow>
                    <FieldRow label="Overall %" required error={errors.diplomaPercentage} icon={FileText}>
                      <div className="relative group">
                        <Input name="diplomaPercentage" value={formData.diplomaPercentage} onChange={handleInputChange} placeholder="88.2" disabled={!!isLocked || !!profile?.isDiplomaLocked} className={cn("h-12 pr-10 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base transition-all", errors.diplomaPercentage && "border-destructive", (isLocked || profile?.isDiplomaLocked) && "bg-muted/20")} />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold opacity-40">%</span>
                      </div>
                    </FieldRow>
                  </div>
                </div>
              </div>
            </div>
          )}

           {/* Semester Results */}
           <div className="space-y-8 mt-12">
             <div className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
               <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-brown-900/10 border border-brown-900/20 flex items-center justify-center">
                   <Calculator className="h-5 w-5 text-brown-900" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-brown-900 tracking-tight">University Performance</h3>
                   <p className="text-sm text-muted-foreground">Verified semester-wise academic records</p>
                 </div>
               </div>
               {(() => {
                 const minSem = formData.studentType === "Lateral Entry" ? 3 : 1;
                 const currentSem = parseInt(formData.currentSemester) || 9;
                 const validSems = semesterResults.filter(r => r.totalMarks && r.obtainedMarks && r.semester >= minSem && r.semester < currentSem);
                 if (validSems.length > 0) {
                   const totalObt = validSems.reduce((s, r) => s + (r.obtainedMarks || 0), 0);
                   const totalMks = validSems.reduce((s, r) => s + (r.totalMarks || 0), 0);
                   const pct = totalMks > 0 ? ((totalObt / totalMks) * 100).toFixed(2) : "0.00";
                   return (
                     <div className="bg-white px-6 py-3 rounded-2xl border border-border bg-opacity-80 shadow-sm flex flex-col items-end">
                       <span className="text-[10px] font-bold text-brown-900/80 uppercase tracking-widest">Aggregate Score</span>
                       <span className="text-2xl font-serif font-bold text-brown-900">{pct}%</span>
                     </div>
                   );
                 }
                 return null;
               })()}
             </div>
 
             <div className="grid gap-6">
               {semesterResults
                 .filter(r => { const min = formData.studentType === "Lateral Entry" ? 3 : 1; return r.semester >= min && r.semester < (parseInt(formData.currentSemester) || 9); })
                 .map((result) => {
                   const oi = semesterResults.findIndex(sr => sr.semester === result.semester);
                   const pct = result.totalMarks && result.obtainedMarks && result.totalMarks > 0 ? ((result.obtainedMarks / result.totalMarks) * 100).toFixed(2) : null;
                   return (
                     <div key={result.semester} className="p-8 bg-white shadow-lg shadow-brown-900/[0.02] rounded-2xl border border-border/40 hover:border-brown-900/20 transition-all group/sem">
                       <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/40">
                         <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-xl bg-muted/20 flex items-center justify-center text-brown-900 font-serif font-bold text-lg group-hover/sem:bg-brown-900 group-hover/sem:text-white transition-colors">
                             S{result.semester}
                           </div>
                           <h4 className="font-serif font-bold text-xl text-brown-900">Semester {result.semester} Details</h4>
                         </div>
                         {(isLocked || result.isLocked) ? <LockedBadge /> : (
                           <LockButton onClick={() => handleConfirmSaveSemester(oi)} saving={saving === `sem-${result.semester}`} disabled={!!isLocked} label="Lock Semester" />
                         )}
                       </div>
 
                       <div className="grid grid-cols-2 sm:grid-cols-5 gap-8 items-end">
                         {[
                           { label: "Obtained Marks", field: "obtainedMarks", type: "number", icon: FileText },
                           { label: "Total Marks", field: "totalMarks", type: "number", icon: Divide },
                           { label: "SGPA", field: "sgpa", type: "number", step: "0.01", icon: Calculator },
                           { label: "Backlogs", field: "backlogs", type: "number", icon: AlertCircle },
                         ].map(({ label, field, type, step, icon: Icon }) => {
                           const errKey = `sem-${result.semester}-${field}`;
                           const hasError = !!errors[errKey];
                           return (
                             <FieldRow key={field} label={label} error={errors[errKey]} icon={Icon}>
                               <Input type={type} step={step} value={(result as any)[field] ?? ""}
                                 onChange={(e) => { 
                                   const nr = [...semesterResults]; 
                                   (nr[oi] as any)[field] = e.target.value ? (type === "number" ? parseFloat(e.target.value) : parseInt(e.target.value)) : null; 
                                   setSemesterResults(nr); 
                                   clearFieldError(errKey);
                                 }}
                                 disabled={!!isLocked || result.isLocked} 
                                 className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 font-medium transition-all", (isLocked || result.isLocked) && "bg-muted/20", hasError && "border-destructive")} />
                             </FieldRow>
                           );
                         })}
                         <div className="p-4 bg-brown-900/[0.03] border border-brown-900/10 rounded-2xl flex flex-col items-center justify-center h-full">
                           <span className="text-[10px] font-bold text-brown-900 uppercase tracking-widest leading-none mb-1">Percentage</span>
                           <span className="text-xl font-serif font-bold text-brown-900">{pct ? `${pct}%` : "—"}</span>
                         </div>
                       </div>
                     </div>
                   );
                 })}
               
               {semesterResults.filter(r => { const min = formData.studentType === "Lateral Entry" ? 3 : 1; return r.semester >= min && r.semester < (parseInt(formData.currentSemester) || 9); }).length === 0 && (
                 <div className="p-20 border border-dashed rounded-2xl text-center bg-muted/10 space-y-4">
                   <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                     <GraduationCap className="h-8 w-8 text-muted-foreground/40" />
                   </div>
                   <div className="space-y-1">
                     <p className="text-lg font-serif font-bold text-brown-900/40">Academic Records Ready</p>
                     <p className="text-sm text-muted-foreground/60 max-w-sm mx-auto">Please confirm your Current Semester in the Basic Details tab to enable academic input fields.</p>
                   </div>
                 </div>
               )}
             </div>
           </div>
        </TabsContent>

        {/* ── CONTACT & FAMILY TAB ──────────────────────────────────────── */}
         {/* ── CONTACT & FAMILY TAB ──────────────────────────────────────── */}
         <TabsContent value="personal" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Section: Contact & Family */}
           <div className="space-y-8">
             <div className="flex flex-row items-end justify-between border-b border-border/40 pb-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-brown-900/[0.08] border border-brown-900/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-brown-900/70" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brown-900 tracking-tight">Contact &amp; Family</h3>
                    <p className="text-sm text-muted-foreground">Communication channels and guardian information</p>
                  </div>
                </div>
               <div className="flex gap-3">
                 {isEditingPersonal && !isLocked && (
                   <>
                     <Button variant="ghost" size="sm" onClick={() => setIsEditingPersonal(false)} className="h-10 px-6 rounded-xl font-semibold">Cancel</Button>
                     <Button size="sm" onClick={savePersonalInfo} disabled={!!saving} className="h-10 px-6 bg-brown-900 hover:bg-brown-800 text-white rounded-xl shadow-lg shadow-brown-900/10">
                       {saving === "personal" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                       Save Changes
                     </Button>
                   </>
                 )}
                 {!isEditingPersonal && !isLocked && (
                   <Button variant="outline" size="sm" onClick={() => setIsEditingPersonal(true)} className="h-10 px-6 border-brown-200 hover:bg-brown-50 text-brown-700 rounded-xl font-semibold transition-all">
                     Edit Information
                   </Button>
                 )}
               </div>
             </div>
 
             <div className="grid gap-10 p-10 bg-white shadow-xl shadow-brown-900/[0.02] rounded-2xl border border-border/40 relative overflow-hidden group/card">
               <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover/card:opacity-[0.07] transition-opacity">
                 <Phone className="h-24 w-24 text-brown-900" />
               </div>
               
               <div className="grid gap-8 md:grid-cols-2 relative z-10">
                 <div className="space-y-6 bg-muted/5 p-8 rounded-2xl border border-border/30">
                   <div className="flex items-center gap-3 mb-2">
                     <div className="h-10 w-10 rounded-xl bg-brown-900/8 border border-brown-900/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-brown-900/70" />
                  </div>
                     <h4 className="font-serif font-bold text-lg text-brown-900">Direct Contact</h4>
                   </div>
                   <div className="space-y-6">
                     <FieldRow label="Mobile Number" required error={personalErrors.mobileNo} icon={Phone}>
                       <Input name="mobileNo" value={formData.mobileNo} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked}
                              className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-medium transition-all", personalErrors.mobileNo && "border-destructive", (!isEditingPersonal || isLocked) && "bg-muted/20")}
                       />
                     </FieldRow>
                     <FieldRow label="Personal Email" required error={personalErrors.personalEmail} icon={Mail}>
                       <Input name="personalEmail" type="email" value={formData.personalEmail} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked}
                              className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-medium transition-all", personalErrors.personalEmail && "border-destructive", (!isEditingPersonal || isLocked) && "bg-muted/20")}
                       />
                     </FieldRow>
                   </div>
                 </div>
                 
                 <div className="flex flex-col justify-center items-center text-center p-8 space-y-4 bg-brown-900/[0.02] border border-brown-900/10 rounded-3xl group/verify">
                   <div className="h-16 w-16 rounded-full bg-brown-900/10 flex items-center justify-center text-brown-900 group-hover/verify:scale-110 transition-transform"><CheckCircle2 className="h-8 w-8" /></div>
                   <div className="space-y-1">
                     <h4 className="font-serif font-bold text-xl text-brown-900">Verified Identity</h4>
                     <p className="text-sm text-brown-900/60 font-medium px-6 leading-relaxed">
                       Recruiters and the CDC platform will use these verified channels for critical communications.
                     </p>
                   </div>
                 </div>
               </div>
 
               <div className="grid gap-8 md:grid-cols-2 relative z-10 pt-4">
                 <div className="p-8 rounded-2xl bg-muted/5 border border-border/40 hover:border-brown-900/30 transition-all">
                   <div className="flex items-center justify-between pb-6 border-b border-border/40 mb-6">
                     <h4 className="font-serif font-bold text-xl text-brown-900">Father&apos;s Identity</h4>
                     <Badge variant="outline" className="bg-brown-900/10 border-brown-900/20 text-brown-900 text-[10px] font-bold tracking-widest uppercase">Primary</Badge>
                   </div>
                   <div className="space-y-6">
                     <FieldRow label="Full Name" required error={personalErrors.fatherName} icon={User}>
                       <Input name="fatherName" value={formData.fatherName} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-medium", (!isEditingPersonal || isLocked) && "bg-muted/20")} />
                     </FieldRow>
                     <FieldRow label="Occupation" icon={Briefcase}>
                       <Input name="fatherOccupation" value={formData.fatherOccupation} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base", (!isEditingPersonal || isLocked) && "bg-muted/20")} />
                     </FieldRow>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <FieldRow label="Mobile" icon={Phone}>
                         <Input name="fatherMobile" value={formData.fatherMobile} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base", (!isEditingPersonal || isLocked) && "bg-muted/20")} />
                       </FieldRow>
                       <FieldRow label="Email" icon={Mail}>
                         <Input name="fatherEmail" type="email" value={formData.fatherEmail} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base", (!isEditingPersonal || isLocked) && "bg-muted/20")} />
                       </FieldRow>
                     </div>
                   </div>
                 </div>
 
                 <div className="p-8 rounded-2xl bg-muted/5 border border-border/40 hover:border-brown-900/30 transition-all">
                   <div className="flex items-center justify-between pb-6 border-b border-border/40 mb-6">
                     <h4 className="font-serif font-bold text-xl text-brown-900">Mother&apos;s Identity</h4>
                   </div>
                   <div className="space-y-6">
                     <FieldRow label="Full Name" required error={personalErrors.motherName} icon={User}>
                       <Input name="motherName" value={formData.motherName} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-medium", (!isEditingPersonal || isLocked) && "bg-muted/20")} />
                     </FieldRow>
                     <FieldRow label="Occupation" icon={Briefcase}>
                       <Input name="motherOccupation" value={formData.motherOccupation} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base", (!isEditingPersonal || isLocked) && "bg-muted/20")} />
                     </FieldRow>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <FieldRow label="Mobile" icon={Phone}>
                         <Input name="motherMobile" value={formData.motherMobile} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base", (!isEditingPersonal || isLocked) && "bg-muted/20")} />
                       </FieldRow>
                       <FieldRow label="Email" icon={Mail}>
                         <Input name="motherEmail" type="email" value={formData.motherEmail} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base", (!isEditingPersonal || isLocked) && "bg-muted/20")} />
                       </FieldRow>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
 
           {/* Section: Residence History */}
           <div className="space-y-8">
             <div className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-brown-900/[0.08] border border-brown-900/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-brown-900/70" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brown-900 tracking-tight">Residence History</h3>
                    <p className="text-sm text-muted-foreground">Present and permanent address details</p>
                  </div>
                </div>
             </div>
             
             <div className="grid gap-10 md:grid-cols-2">
               {/* Present Address */}
               <div className="p-10 rounded-2xl bg-brown-900/[0.01] border border-brown-900/10 shadow-sm relative overflow-hidden group/addr">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover/addr:opacity-[0.05] transition-opacity"><Home className="h-24 w-24 text-brown-900" /></div>
                 <div className="flex items-center gap-3 pb-6 border-b border-brown-900/10 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-brown-900/10 flex items-center justify-center text-brown-900"><MapPin className="h-5 w-5" /></div>
                    <h4 className="font-serif font-bold text-xl text-brown-900">Present Address</h4>
                 </div>
                 <div className="grid grid-cols-2 gap-x-6 gap-y-6 relative z-10">
                   <FieldRow label="House/Flat No." className="col-span-2">
                     <Input name="presentHouseNo" value={formData.presentHouseNo} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base", (!isEditingPersonal || isLocked) && "bg-muted/20")} />
                   </FieldRow>
                   <FieldRow label="Block/Sector">
                     <Input name="presentBlock" value={formData.presentBlock} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base", (!isEditingPersonal || isLocked) && "bg-muted/20")} />
                   </FieldRow>
                   <FieldRow label="Locality/Village">
                     <Input name="presentLocality" value={formData.presentLocality} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base", (!isEditingPersonal || isLocked) && "bg-muted/20")} />
                   </FieldRow>
                   <FieldRow label="City">
                     <Input name="presentCity" value={formData.presentCity} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base", (!isEditingPersonal || isLocked) && "bg-muted/20")} />
                   </FieldRow>
                   <FieldRow label="Tehsil">
                     <Input name="presentTehsil" value={formData.presentTehsil} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base", (!isEditingPersonal || isLocked) && "bg-muted/20")} />
                   </FieldRow>
                   <FieldRow label="State" required error={personalErrors.presentState}>
                     <Select value={formData.presentState} onValueChange={v => setFormData(p => ({ ...p, presentState: v, presentDistrict: "" }))} disabled={!isEditingPersonal || isLocked}>
                        <SelectTrigger className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-medium transition-all", (!isEditingPersonal || isLocked) && "bg-muted/20")}><SelectValue placeholder="State" /></SelectTrigger>
                       <SelectContent>{INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                     </Select>
                   </FieldRow>
                   <FieldRow label="District" required error={personalErrors.presentDistrict}>
                     <Select value={formData.presentDistrict} onValueChange={v => setFormData(p => ({ ...p, presentDistrict: v }))} disabled={!isEditingPersonal || isLocked || !formData.presentState}>
                        <SelectTrigger className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-medium transition-all", (!isEditingPersonal || isLocked) && "bg-muted/20")}><SelectValue placeholder="District" /></SelectTrigger>
                       <SelectContent>
                         {(DISTRICTS_BY_STATE[formData.presentState as keyof typeof DISTRICTS_BY_STATE] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                       </SelectContent>
                     </Select>
                   </FieldRow>
                   <FieldRow label="Pincode" required error={personalErrors.presentPincode} icon={MapPin}>
                     <Input name="presentPincode" value={formData.presentPincode} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-mono", (!isEditingPersonal || isLocked) && "bg-muted/20")} />
                   </FieldRow>
                   <FieldRow label="Country" icon={Home}>
                      <Input name="presentCountry" value="India" disabled className="h-12 bg-muted/20 border border-border/40 shadow-sm font-bold text-brown-900/80" />
                   </FieldRow>
                 </div>
               </div>
 
               {/* Permanent Address */}
               <div className="p-10 rounded-2xl bg-brown-900/[0.01] border border-brown-900/10 shadow-sm relative overflow-hidden group/perm">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover/perm:opacity-[0.05] transition-opacity"><Home className="h-24 w-24 text-brown-900" /></div>
                 <div className="flex items-center justify-between pb-6 border-b border-brown-900/10 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-brown-900/10 flex items-center justify-center text-brown-900"><Home className="h-5 w-5" /></div>
                      <h4 className="font-serif font-bold text-xl text-brown-900">Permanent Address</h4>
                    </div>
                    {isEditingPersonal && !isLocked && (
                      <div className="flex items-center space-x-2 bg-brown-900/5 px-4 py-2.5 rounded-xl border border-brown-900/10 shadow-sm transition-all hover:bg-brown-900/10">
                        <Checkbox
                         id="sameAsPresent"
                         checked={formData.sameAsPresent}
                         className="border-amber-200 data-[state=checked]:bg-brown-900 data-[state=checked]:border-brown-900"
                         onCheckedChange={(c) => {
                            setFormData(p => {
                              const np = { ...p, sameAsPresent: !!c };
                              if (c) {
                                np.permanentHouseNo = p.presentHouseNo; np.permanentBlock = p.presentBlock;
                                np.permanentLocality = p.presentLocality; np.permanentCity = p.presentCity;
                                np.permanentTehsil = p.presentTehsil; np.permanentDistrict = p.presentDistrict;
                                np.permanentState = p.presentState; np.permanentPincode = p.presentPincode;
                              }
                              return np;
                            });
                         }}
                        />
                        <label htmlFor="sameAsPresent" className="text-[10px] font-bold text-brown-900 tracking-[0.15em] uppercase cursor-pointer leading-none">Same as Present</label>
                      </div>
                    )}
                 </div>
                 
                 <div className="grid grid-cols-2 gap-x-6 gap-y-6 relative z-10">
                   <FieldRow label="House/Flat No." className="col-span-2">
                     <Input name="permanentHouseNo" value={formData.permanentHouseNo} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked || formData.sameAsPresent} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base", (!isEditingPersonal || isLocked || formData.sameAsPresent) && "bg-muted/20")} />
                   </FieldRow>
                   <FieldRow label="Block/Sector">
                     <Input name="permanentBlock" value={formData.permanentBlock} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked || formData.sameAsPresent} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base", (!isEditingPersonal || isLocked || formData.sameAsPresent) && "bg-muted/20")} />
                   </FieldRow>
                   <FieldRow label="Locality/Village">
                     <Input name="permanentLocality" value={formData.permanentLocality} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked || formData.sameAsPresent} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base", (!isEditingPersonal || isLocked || formData.sameAsPresent) && "bg-muted/20")} />
                   </FieldRow>
                   <FieldRow label="City">
                     <Input name="permanentCity" value={formData.permanentCity} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked || formData.sameAsPresent} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base", (!isEditingPersonal || isLocked || formData.sameAsPresent) && "bg-muted/20")} />
                   </FieldRow>
                   <FieldRow label="Tehsil">
                     <Input name="permanentTehsil" value={formData.permanentTehsil} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked || formData.sameAsPresent} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base", (!isEditingPersonal || isLocked || formData.sameAsPresent) && "bg-muted/20")} />
                   </FieldRow>
                   <FieldRow label="State">
                     <Select value={formData.permanentState} onValueChange={v => setFormData(p => ({ ...p, permanentState: v, permanentDistrict: "" }))} disabled={!isEditingPersonal || isLocked || formData.sameAsPresent}>
                        <SelectTrigger className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-medium transition-all", (!isEditingPersonal || isLocked || formData.sameAsPresent) && "bg-muted/20")}><SelectValue placeholder="State" /></SelectTrigger>
                       <SelectContent>{INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                     </Select>
                   </FieldRow>
                   <FieldRow label="District">
                     <Select value={formData.permanentDistrict} onValueChange={v => setFormData(p => ({ ...p, permanentDistrict: v }))} disabled={!isEditingPersonal || isLocked || formData.sameAsPresent || !formData.permanentState}>
                        <SelectTrigger className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-medium transition-all", (!isEditingPersonal || isLocked || formData.sameAsPresent) && "bg-muted/20")}><SelectValue placeholder="District" /></SelectTrigger>
                       <SelectContent>
                         {(DISTRICTS_BY_STATE[formData.permanentState as keyof typeof DISTRICTS_BY_STATE] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                       </SelectContent>
                     </Select>
                   </FieldRow>
                   <FieldRow label="Pincode" icon={MapPin}>
                     <Input name="permanentPincode" value={formData.permanentPincode} onChange={handleInputChange} disabled={!isEditingPersonal || isLocked || formData.sameAsPresent} className={cn("h-12 bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 text-base font-mono", (!isEditingPersonal || isLocked || formData.sameAsPresent) && "bg-muted/20")} />
                   </FieldRow>
                   <FieldRow label="Country" icon={Home}>
                      <Input value="India" disabled className="h-12 bg-muted/20 border border-border/40 shadow-sm font-bold text-brown-900/80" />
                   </FieldRow>
                 </div>
               </div>
             </div>
           </div>
         </TabsContent>


         {/* ── CAREER TAB ──────────────────────────────────────────── */}
         <TabsContent value="career" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Section: Career & Branding */}
           <div className="space-y-8">
              <div className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-brown-900/[0.08] border border-brown-900/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-brown-900/70" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brown-900 tracking-tight">Career &amp; Branding</h3>
                    <p className="text-sm text-muted-foreground">Professional identity and technical presence</p>
                  </div>
                </div>
                <Button onClick={saveCareer} disabled={!!saving} className="h-10 px-6 bg-brown-900 hover:bg-brown-800 text-white rounded-xl shadow-lg shadow-brown-900/10 font-bold text-sm">
                  {saving === "career" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Update Profile
                </Button>
              </div>
 
             <div className="grid gap-10 p-10 bg-white shadow-xl shadow-brown-900/[0.02] rounded-2xl border border-border/40 relative overflow-hidden group/career">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/career:opacity-[0.08] transition-opacity">
                 <Briefcase className="h-32 w-32 text-brown-900" />
               </div>
 
               <div className="space-y-10 relative z-10">
                 {/* Professional Summary */}
                 <div className="space-y-6">
                   <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-xl bg-brown-500/10 flex items-center justify-center text-brown-600"><User className="h-5 w-5" /></div>
                     <h4 className="font-serif font-bold text-xl text-brown-900">Professional Summary</h4>
                   </div>
                   <div className="max-w-3xl">
                     <FieldRow label="Elevator Pitch / Bio">
                       <Textarea name="bio" value={formData.bio} onChange={handleInputChange} 
                                 placeholder="Craft a compelling summary of your academic journey and professional aspirations..." 
                                 className="h-32 resize-none bg-white border-border/40 shadow-sm focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 transition-all text-base leading-relaxed rounded-2xl p-6" />
                     </FieldRow>
                   </div>
                 </div>
 
                 {/* Skills Cluster */}
                 <div className="space-y-6">
                   <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-xl bg-brown-900/10 flex items-center justify-center text-brown-900"><Code2 className="h-5 w-5" /></div>
                     <h4 className="font-serif font-bold text-xl text-brown-900">Technical Expertise</h4>
                   </div>
                   <div className="space-y-6">
                     <div className="flex items-center gap-3 max-w-md bg-muted/5 p-2 rounded-2xl border border-border/30">
                       <Input ref={skillInputRef} value={skillInput} onChange={e => setSkillInput(e.target.value)} 
                              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())} 
                              placeholder="Add a skill (e.g. Next.js, Python)" 
                              className="bg-transparent border-none shadow-none focus-visible:ring-0 h-12" />
                       <Button type="button" onClick={addSkill} className="rounded-xl font-bold bg-brown-900 text-white hover:bg-brown-800">Add</Button>
                     </div>
                     
                     <div className="bg-muted/5 rounded-2xl p-8 border border-border/30 min-h-[140px] flex items-center justify-center">
                       {formData.skills.length > 0 ? (
                         <div className="flex flex-wrap gap-3">
                           {formData.skills.map((skill) => (
                             <Badge key={skill} variant="secondary" className="px-5 py-2.5 text-sm font-bold bg-white border border-border/40 shadow-sm text-brown-900 rounded-xl group/skill hover:border-brown-900/50 transition-all">
                               {skill}
                               <button onClick={() => removeSkill(skill)} className="ml-3 text-muted-foreground/40 group-hover/skill:text-destructive transition-colors">
                                 <X className="h-3.5 w-3.5" />
                               </button>
                             </Badge>
                           ))}
                         </div>
                       ) : (
                         <div className="text-center space-y-2 opacity-40">
                           <Code2 className="h-10 w-10 mx-auto text-muted-foreground" />
                           <p className="text-sm font-bold uppercase tracking-widest">No technical skills indexed</p>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
 
                 <div className="grid gap-12 md:grid-cols-2 pt-4">
                   {/* Digital Presence */}
                   <div className="space-y-6">
                     <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-xl bg-brown-900/10 flex items-center justify-center text-brown-900"><Link2 className="h-5 w-5" /></div>
                       <h4 className="font-serif font-bold text-xl text-brown-900">Digital Presence</h4>
                     </div>
                     <div className="space-y-6 bg-muted/5 p-8 rounded-2xl border border-border/30">
                       <FieldRow label="LinkedIn Profile" icon={Linkedin}>
                         <div className="flex group/link">
                           <span className="inline-flex items-center px-4 rounded-l-2xl border border-r-0 border-border/40 bg-white text-muted-foreground text-[10px] font-bold uppercase tracking-tighter">linkedin.com/in/</span>
                           <Input name="linkedinId" value={formData.linkedinId} onChange={handleInputChange} placeholder="username" className="rounded-l-none h-12 bg-white border-border/40 focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 font-medium transition-all" />
                         </div>
                       </FieldRow>
                       <FieldRow label="GitHub Archive" icon={Github}>
                         <div className="flex group/link">
                           <span className="inline-flex items-center px-4 rounded-l-2xl border border-r-0 border-border/40 bg-white text-muted-foreground text-[10px] font-bold uppercase tracking-tighter">github.com/</span>
                           <Input name="githubId" value={formData.githubId} onChange={handleInputChange} placeholder="username" className="rounded-l-none h-12 bg-white border-border/40 focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 font-medium transition-all" />
                         </div>
                       </FieldRow>
                       <FieldRow label="LeetCode Rank" icon={Code2}>
                         <div className="flex group/link">
                           <span className="inline-flex items-center px-4 rounded-l-2xl border border-r-0 border-border/40 bg-white text-muted-foreground text-[10px] font-bold uppercase tracking-tighter">leetcode.com/</span>
                           <Input name="leetcodeId" value={formData.leetcodeId} onChange={handleInputChange} placeholder="username" className="rounded-l-none h-12 bg-white border-border/40 focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 font-medium transition-all" />
                         </div>
                       </FieldRow>
                     </div>
                   </div>
 
                   {/* Resume Repository */}
                   <div className="space-y-6">
                     <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-xl bg-brown-900/10 flex items-center justify-center text-brown-900"><FileText className="h-5 w-5" /></div>
                       <h4 className="font-serif font-bold text-xl text-brown-900">Career Dossier</h4>
                     </div>
                     <div className="space-y-6 bg-muted/5 p-8 rounded-2xl border border-border/30 h-full">
                       <FieldRow label="Resume (Drive Link)">
                          <Input name="resumeLink" value={formData.resumeLink} onChange={handleInputChange} placeholder="https://drive.google.com/..." className="h-12 bg-white border-border/40 focus:border-brown-900/40 focus:ring-2 focus:ring-brown-900/10 font-medium rounded-2xl transition-all" />
                         <div className="flex items-start gap-2 mt-3 px-1">
                           <AlertCircle className="h-3.5 w-3.5 text-muted-foreground/60 mt-0.5" />
                           <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">Ensure link sharing is set to public. PDF format is highly recommended for cross-platform compatibility.</p>
                         </div>
                       </FieldRow>
                       
                       <div className="pt-2">
                         {formData.resumeLink ? (
                           <div className="p-6 rounded-2xl border border-brown-900/20 bg-brown-900/[0.02] flex items-center justify-between group/res">
                             <div className="flex items-center gap-4">
                               <div className="bg-brown-900/10 p-3 rounded-xl"><CheckCircle2 className="h-5 w-5 text-brown-900" /></div>
                               <div>
                                 <p className="text-sm font-bold text-brown-900 font-serif">Resume Active</p>
                                 <p className="text-[10px] text-brown-900/60 font-bold uppercase tracking-widest mt-0.5 underline decoration-brown-900/20 break-all max-w-[140px] truncate">{formData.resumeLink}</p>
                               </div>
                             </div>
                             <a href={formData.resumeLink} target="_blank" rel="noopener noreferrer" className="h-10 w-10 bg-white border border-brown-900/20 rounded-xl flex items-center justify-center text-brown-900 hover:bg-brown-900 hover:text-white transition-all shadow-sm">
                               <ExternalLink className="h-4 w-4" />
                             </a>
                           </div>
                         ) : (
                           <div className="p-8 border border-dashed border-brown-900/30 rounded-2xl text-center bg-brown-900/[0.02] group/missing">
                             <AlertTriangle className="h-8 w-8 text-brown-900 mx-auto mb-3 opacity-30 group-hover/missing:opacity-60 transition-opacity" />
                             <p className="text-sm font-bold text-brown-900 font-serif">Resume Missing</p>
                             <p className="text-xs text-brown-900/50 mt-1 font-medium">Placement eligibility requires a validated resume.</p>
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </TabsContent>
        
      </Tabs>

      {/* ── DIALOGS & OVERLAYS ────────────────────────────────────────────── */}
      <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={onSelectFile} disabled={!!isLocked} />

      <ImageCropper 
        open={isCropping} 
        imageSrc={cropSrc!} 
        onCancel={() => { setCropSrc(null); setIsCropping(false); }} 
        onCropComplete={handleCropComplete} 
      />

      <UploadingOverlay isUploading={uploading} />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove profile photo?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your profile photo? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingPhoto}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeletePhoto(); }} disabled={isDeletingPhoto} className="bg-destructive hover:bg-destructive/90 text-white">
              {isDeletingPhoto ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Removing...</> : "Remove Photo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {confirmDialog && (
        <ConfirmLockModal 
          open={confirmDialog.open}
          title={confirmDialog.title}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDialog.onConfirm}
        />
      )}

    </div>
  );
}

function ConfirmLockModal({ open, title, onClose, onConfirm }: { open: boolean, title: string, onClose: () => void, onConfirm: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="border-brown-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-brown-900 border-b pb-2 flex items-center gap-2">
            <Lock className="h-5 w-5 text-brown-600" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-brown-700 py-4 font-medium flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-brown-900 shrink-0 mt-0.5" />
            <span>Are you sure? Once locked, these details become **Read-Only**. You cannot edit them later without contacting the Admin.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="bg-muted/20 p-2 rounded-b-lg border-t mt-2">
          <AlertDialogCancel onClick={onClose}>Review Again</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-brown-900 text-white hover:bg-brown-800">
            Yes, Lock & Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
