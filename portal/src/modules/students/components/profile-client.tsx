"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { cn, getImageUrl } from "@/lib/utils";
import { getAblyClient } from "@/contexts/ably-context";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Camera, Lock, User, Phone, MapPin, Home, Briefcase,
  Loader2, Trash2, AlertTriangle, GraduationCap, BookOpen,
  Award, Github, Linkedin, Link2, Code2, FileText, Plus, X,
  CheckCircle2, ExternalLink, AlertCircle, Calculator, Divide,
  Fingerprint, Calendar, Mail, ShieldCheck, Sparkles, Check, Globe,
  Pencil, Save
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ImageCropper } from "@/components/ui/image-cropper";
import { UploadingOverlay } from "@/components/ui/uploading-overlay";
import { LoadingProfile } from "@/components/ui/loading-states";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useSidebar } from "@/components/layout/dashboard/dashboard-layout";
import { INDIAN_STATES, DISTRICTS_BY_STATE } from "@/lib/indian-locations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type StudentProfile = {
  id: string;
  name: string;
  rollNo: number | null;
  admissionId?: string;
  branch: string;
  year?: number | null;
  currentSemester?: number;
  cgpa?: number;
  skills: string[];
  resumeLink?: string | null;
  githubId?: string | null;
  leetcodeId?: string | null;
  codechefId?: string | null;
  linkedinId?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  isProfileLocked: boolean;
  isBasicInfoLocked?: boolean;
  isClass10Locked?: boolean;
  isClass12Locked?: boolean;
  isDiplomaLocked?: boolean;
  studentType?: string;
  course?: string;
  dob?: string | null;
  gender?: string | null;
  class10School?: string;
  class10Board?: string;
  class10Percentage?: number;
  class10Year?: number;
  class12School?: string;
  class12Board?: string;
  class12Percentage?: number;
  class12PcmPercentage?: number;
  class12MathPercentage?: number | null;
  class12Year?: number;
  diplomaInstitute?: string;
  diplomaBranch?: string;
  diplomaPercentage?: number;
  diplomaYear?: number;
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
  fatherName?: string;
  fatherOccupation?: string;
  fatherMobile?: string;
  fatherEmail?: string;
  motherName?: string;
  motherOccupation?: string;
  motherMobile?: string;
  motherEmail?: string;
  semesterResults?: {
    semester: number;
    sgpa: number | null;
    backlogs: number;
    credits?: number | null;
    totalMarks?: number | null;
    obtainedMarks?: number | null;
    percentage?: number | null;
    isLocked?: boolean;
  }[];
};

// ─── Constants ────────────────────────────────────────────────────────────────
const BRANCHES = ["CSE", "CSAI", "CSDS", "CSAIML", "AIML", "AIDS", "IT", "ECE", "EEE", "ME"];
const CURRENT_YEAR = new Date().getFullYear();
const PASSING_YEARS = Array.from({ length: 11 }, (_, i) => (CURRENT_YEAR - i).toString());
const getYearOptions = () => Array.from({ length: 4 }, (_, i) => (CURRENT_YEAR + i).toString());
const getSemesterOptions = (type?: string) => (type === "Lateral Entry" ? [3, 4, 5, 6, 7, 8] : [1, 2, 3, 4, 5, 6, 7, 8]);
const BOARDS = [
  "CBSE",
  "ICSE/ISC",
  "NIOS",
  "Uttar Pradesh Board (UPMSP)",
  "Rajasthan Board (RBSE)",
  "Bihar Board (BSEB)",
  "Maharashtra Board (MSBSHSE)",
  "Karnataka Board (KSEEB/PUE)",
  "Tamil Nadu Board (TNBSE)",
  "Gujarat Board (GSEB)",
  "Andhra Pradesh Board",
  "Telangana Board (TSBIE/BSE)",
  "West Bengal Board (WBBSE/WBCHSE)",
  "Madhya Pradesh Board (MPBSE)",
  "Punjab Board (PSEB)",
  "Haryana Board (HBSE)",
  "Others"
];
const DIPLOMA_BRANCHES = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical",
  "Mechanical",
  "Civil",
  "Others"
];

const ROLL_NO_REGEX = /^\d{13}$/;
const ADMISSION_ID_REGEX = /^[A-Z0-9]{6,15}$/;

// ─── Helper Components ────────────────────────────────────────────────────────
const LockedBadge = () => (
  <span className="inline-flex items-center gap-1.5 rounded-sm bg-brown-900/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brown-900 ring-1 ring-inset ring-brown-900/20">
    <Lock className="h-3 w-3 text-brown-800" />
    <span>Locked</span>
  </span>
);

const LockButton = ({
  onClick,
  saving,
  label = "Save & Lock",
  disabled
}: {
  onClick: () => void;
  saving: boolean;
  label?: string;
  disabled?: boolean;
}) => (
  <Button
    onClick={onClick}
    disabled={disabled || saving}
    size="sm"
    className="h-9 gap-1.5 rounded-sm bg-brown-800 px-4 text-xs font-bold text-cream shadow-sm hover:bg-brown-900 active:scale-[0.98] transition-all"
  >
    {saving ? (
      <>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Locking...
      </>
    ) : (
      <>
        <Lock className="h-3.5 w-3.5 text-amber-400" />
        {label}
      </>
    )}
  </Button>
);

const FieldRow = ({
  label,
  children,
  error,
  required: req,
  icon: Icon,
  className
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  icon?: any;
  className?: string;
}) => (
  <div className={cn("space-y-1.5", className)}>
    <div className="flex items-center justify-between px-0.5">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        <Label className="text-xs font-semibold text-foreground/90">
          {label}
          {req && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      </div>
    </div>
    <div className="relative group/field">{children}</div>
    {error && (
      <div className="flex items-center gap-1 text-[11px] font-medium text-destructive animate-in fade-in slide-in-from-top-1 px-0.5 pt-0.5">
        <AlertCircle className="h-3 w-3 shrink-0" />
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
  const [isEditingProfiles, setIsEditingProfiles] = useState(false);
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

  // ─── Save: Career / Online Profiles ───────────────────────────────────────
  const saveCareer = async () => {
    setSaving("career");
    const payload = {
      githubId: formData.githubId || null,
      leetcodeId: formData.leetcodeId || null,
      codechefId: formData.codechefId || null,
      linkedinId: formData.linkedinId || null,
      bio: formData.bio || null,
      resumeLink: formData.resumeLink || null,
      skills: formData.skills
    };
    const prev = profile ? { ...profile } : null;
    setProfile(p => (p ? { ...p, ...payload } : p));
    setIsEditingProfiles(false);
    try {
      await api.put("/students/profile", payload);
      toast({ title: "Online profiles saved ✓" });
    } catch (err: any) {
      if (prev) setProfile(prev);
      setIsEditingProfiles(true);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelProfiles = () => {
    if (profile) {
      setFormData(p => ({
        ...p,
        linkedinId: profile.linkedinId || "",
        githubId: profile.githubId || "",
        leetcodeId: profile.leetcodeId || "",
        resumeLink: profile.resumeLink || "",
      }));
    }
    setIsEditingProfiles(false);
  };

  // ─── Photo Handlers ────────────────────────────────────────────────────────
  const handleDeletePhoto = async () => {
    setIsDeletingPhoto(true);
    try {
      await api.put("/students/profile", { photoUrl: null });
      setProfile(p => (p ? { ...p, photoUrl: null } : p));
      updateUser({ photoUrl: undefined });
      toast({ title: "Photo removed ✓" });
      setIsDeleteDialogOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to remove photo", variant: "destructive" });
    } finally {
      setIsDeletingPhoto(false);
    }
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
      setFormData(p => ({ ...p, skills: [...p.skills, s] }));
      setSkillInput("");
      skillInputRef.current?.focus();
    }
  };
  const removeSkill = (skill: string) => setFormData(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));

  const [activeTab, setActiveTab] = useState("basic");

  // ─── Derived State ─────────────────────────────────────────────────────────
  if (loading) return <LoadingProfile />;

  const isLocked = profile?.isProfileLocked;
  const fullPhotoUrl = getImageUrl(profile?.photoUrl);

  const completionItems = [
    { done: !!profile?.isBasicInfoLocked, weight: 20, label: "Basic Details" },
    { done: !!profile?.isClass10Locked, weight: 15, label: "Class 10" },
    { done: !!(profile?.isClass12Locked || profile?.isDiplomaLocked), weight: 15, label: "Class 12 / Diploma" },
    { done: semesterResults.some(s => s.isLocked), weight: 15, label: "Semester Results" },
    { done: !!(formData.mobileNo && formData.personalEmail), weight: 15, label: "Contact Details" },
    { done: !!formData.resumeLink, weight: 15, label: "Resume" },
    { done: !!(formData.githubId || formData.linkedinId || formData.leetcodeId), weight: 5, label: "Online Profiles" },
  ];
  const completionScore = completionItems.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);

  return (
    <div className="space-y-8 pb-16 animate-fade-up">
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* 🏛️ EXECUTIVE INSTITUTIONAL IDENTITY DOSSIER CARD                        */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm transition-all relative overflow-hidden">
        {/* Top Institutional Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brown-800 via-amber-500 to-brown-900" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Avatar + Primary Identity */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 min-w-0">
            {/* Avatar with Smooth Hover Edit Overlay + Dropdown Options */}
            <div className="relative group shrink-0 w-fit">
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={!!isLocked || !!uploading}>
                  <div
                    className={cn(
                      "relative h-20 w-20 sm:h-22 sm:w-22 rounded-2xl ring-2 ring-amber-500/30 shadow-md bg-brown-900 overflow-hidden select-none transition-all",
                      !isLocked && !uploading ? "cursor-pointer group-hover:ring-amber-500/60" : "cursor-default"
                    )}
                    title={!isLocked ? "Click to manage photo" : undefined}
                  >
                    <Avatar className="h-full w-full rounded-2xl">
                      <AvatarImage src={fullPhotoUrl} className="object-cover" />
                      <AvatarFallback className="rounded-2xl bg-gradient-to-br from-brown-900 to-brown-950 text-cream font-display font-bold text-2xl text-amber-100">
                        {formData.name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase() || "ST"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Smooth Hover Edit Overlay */}
                    {!isLocked && !uploading && (
                      <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-1 text-cream">
                        <Camera className="h-4 w-4 text-amber-300" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100">Edit</span>
                      </div>
                    )}

                    {/* Uploading / Removing State Overlay */}
                    {(uploading || isDeletingPhoto) && (
                      <div className="absolute inset-0 z-20 bg-brown-950/85 backdrop-blur-[2px] flex flex-col items-center justify-center text-cream animate-in fade-in duration-200">
                        <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                        <span className="text-[9px] font-bold tracking-wider uppercase text-amber-200 mt-1">
                          {isDeletingPhoto ? "Removing..." : "Uploading..."}
                        </span>
                      </div>
                    )}
                  </div>
                </DropdownMenuTrigger>

                {!isLocked && !uploading && !isDeletingPhoto && (
                  <DropdownMenuContent align="start" className="w-48 rounded-md border-border/70 shadow-xl p-1">
                    <DropdownMenuItem
                      onClick={() => document.getElementById("photo-upload")?.click()}
                      className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer rounded-sm px-3 py-2 text-foreground hover:bg-muted"
                    >
                      <Camera className="h-4 w-4 text-amber-600" />
                      {profile?.photoUrl ? "Upload New Photo" : "Upload Photo"}
                    </DropdownMenuItem>

                    {profile?.photoUrl && (
                      <DropdownMenuItem
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer rounded-sm px-3 py-2 text-destructive focus:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Photo
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                )}
              </DropdownMenu>
            </div>

            {/* Name, Verified Status & Enrolment Credentials */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
                  {profile?.name || formData.name || <span className="text-muted-foreground italic font-normal">Student Name</span>}
                </h1>
                {profile?.isBasicInfoLocked ? (
                  <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-xs font-bold py-0.5 px-2.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-amber-800 bg-amber-500/10 border-amber-500/20 py-0.5 px-2.5">
                    Pending Verification
                  </Badge>
                )}
                {isLocked && (
                  <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider gap-1">
                    <Lock className="h-3 w-3" /> Locked
                  </Badge>
                )}
              </div>

              {/* Academic Subtitle */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {formData.branch || profile?.branch ? `${formData.branch || profile?.branch} Engineering` : "B.Tech"}
                </span>
                <span className="opacity-40">•</span>
                <span>{formData.course || "Bachelor of Technology"}</span>
                {formData.currentSemester && (
                  <>
                    <span className="opacity-40">•</span>
                    <span>Semester {formData.currentSemester}</span>
                  </>
                )}
                <span className="opacity-40">•</span>
                <span>Class of {formData.year || profile?.year || "2027"}</span>
                {!!profile?.cgpa && Number(profile.cgpa) > 0 && (
                  <>
                    <span className="opacity-40">•</span>
                    <span className="font-bold text-amber-800 bg-amber-500/10 px-2 py-0.5 rounded-sm border border-amber-500/20 font-mono text-xs">
                      CGPA {Number(profile.cgpa).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Roll Number & Admission ID Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-sm border border-border/50">
                  <Award className="h-3.5 w-3.5 text-amber-700" />
                  Roll: <strong className="text-foreground tracking-wider font-semibold">{formData.rollNo || profile?.rollNo || "—"}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-sm border border-border/50">
                  <Fingerprint className="h-3.5 w-3.5 text-amber-700" />
                  Adm: <strong className="text-foreground tracking-wider font-semibold">{formData.admissionId || profile?.admissionId || "—"}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Placement Readiness & Digital Footprint */}
          <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-border/40">
            {/* Profile Readiness Gauge */}
            <div className="space-y-1.5 w-full sm:w-56">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Placement Readiness</span>
                <span
                  className={cn(
                    "font-mono font-bold text-sm",
                    completionScore >= 80 ? "text-emerald-600" : completionScore >= 50 ? "text-amber-700" : "text-destructive"
                  )}
                >
                  {completionScore}%
                </span>
              </div>
              <Progress
                value={completionScore}
                className="h-2 rounded-full [&>div]:bg-[var(--progress-color)]"
                style={
                  {
                    "--progress-color":
                      completionScore >= 80 ? "#10B981" : completionScore >= 50 ? "#E8A020" : "#EF4444"
                  } as any
                }
              />
              {completionScore < 100 && (
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                  <span>Next step:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const pending = completionItems.find(i => !i.done);
                      if (pending?.label === "Basic Details") setActiveTab("basic");
                      else if (pending?.label.includes("Class") || pending?.label.includes("Semester")) setActiveTab("academic");
                      else if (pending?.label.includes("Contact")) setActiveTab("personal");
                      else setActiveTab("profiles");
                    }}
                    className="text-amber-700 font-semibold underline hover:text-amber-800 transition-colors"
                  >
                    + Complete {completionItems.find(i => !i.done)?.label}
                  </button>
                </div>
              )}
            </div>

            {/* Connected Social Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {formData.linkedinId && (
                <a
                  href={`https://linkedin.com/in/${formData.linkedinId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-sm border border-[#0A66C2]/20 bg-[#0A66C2]/10 px-2.5 py-1 text-xs font-semibold text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-all shadow-sm"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                  LinkedIn
                </a>
              )}
              {formData.githubId && (
                <a
                  href={`https://github.com/${formData.githubId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-sm border border-border/70 bg-muted/60 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-all shadow-sm"
                >
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                </a>
              )}
              {formData.leetcodeId && (
                <a
                  href={`https://leetcode.com/${formData.leetcodeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-sm border border-[#FFA116]/20 bg-[#FFA116]/10 px-2.5 py-1 text-xs font-semibold text-[#D97706] hover:bg-[#FFA116]/20 transition-all shadow-sm"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  LeetCode
                </a>
              )}
              {formData.resumeLink ? (
                <a
                  href={formData.resumeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-500/20 transition-all shadow-sm"
                >
                  <FileText className="h-3.5 w-3.5 text-emerald-700" />
                  Resume ↗
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab("profiles")}
                  className="inline-flex items-center gap-1 rounded-sm border border-dashed border-border/70 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" /> + Add Resume
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* 🧭 STRUCTURED SECTION TABS                                              */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full h-auto min-h-0 justify-start rounded-md border border-border/70 bg-card p-1 mb-6 flex overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-1 shadow-xs scroll-smooth shrink-0 sm:grid sm:grid-cols-4">
          {/* Basic Details */}
          <TabsTrigger
            value="basic"
            className="group h-auto flex-1 min-w-[130px] sm:min-w-0 rounded-sm px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all duration-200 data-[state=active]:bg-brown-800 data-[state=active]:text-cream data-[state=active]:shadow-xs hover:bg-muted/50 hover:text-foreground shrink-0 sm:shrink flex items-center justify-center gap-2"
          >
            <User className="h-4 w-4 shrink-0 text-muted-foreground group-data-[state=active]:text-amber-300 transition-colors" />
            <span className="truncate">Basic Details</span>
          </TabsTrigger>

          {/* Academic Standing */}
          <TabsTrigger
            value="academic"
            disabled={!profile?.isBasicInfoLocked}
            className="group h-auto flex-1 min-w-[145px] sm:min-w-0 rounded-sm px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all duration-200 data-[state=active]:bg-brown-800 data-[state=active]:text-cream data-[state=active]:shadow-xs hover:bg-muted/50 hover:text-foreground shrink-0 sm:shrink flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground group-data-[state=active]:text-amber-300 transition-colors" />
            <span className="truncate">Academic Standing</span>
          </TabsTrigger>

          {/* Contact & Family */}
          <TabsTrigger
            value="personal"
            disabled={!profile?.isBasicInfoLocked}
            className="group h-auto flex-1 min-w-[135px] sm:min-w-0 rounded-sm px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all duration-200 data-[state=active]:bg-brown-800 data-[state=active]:text-cream data-[state=active]:shadow-xs hover:bg-muted/50 hover:text-foreground shrink-0 sm:shrink flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Phone className="h-4 w-4 shrink-0 text-muted-foreground group-data-[state=active]:text-amber-300 transition-colors" />
            <span className="truncate">Contact &amp; Family</span>
          </TabsTrigger>

          {/* Online Profiles */}
          <TabsTrigger
            value="profiles"
            className="group h-auto flex-1 min-w-[130px] sm:min-w-0 rounded-sm px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all duration-200 data-[state=active]:bg-brown-800 data-[state=active]:text-cream data-[state=active]:shadow-xs hover:bg-muted/50 hover:text-foreground shrink-0 sm:shrink flex items-center justify-center gap-2"
          >
            <Globe className="h-4 w-4 shrink-0 text-muted-foreground group-data-[state=active]:text-amber-300 transition-colors" />
            <span className="truncate">Online Profiles</span>
          </TabsTrigger>
        </TabsList>

        {/* ── 1. BASIC DETAILS TAB ─────────────────────────────────────────── */}
        <TabsContent value="basic" className="space-y-6 animate-in fade-in duration-300">
          {/* Card: Core Identity */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brown-800/10 text-brown-800">
                  <Fingerprint className="h-4 w-4" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">Core Identity</CardTitle>
              </div>
              {profile?.isBasicInfoLocked ? (
                <LockedBadge />
              ) : (
                <LockButton onClick={handleSaveBasicInfo} saving={saving === "basic"} disabled={!!isLocked} />
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                <FieldRow label="Full Name" required error={errors.name} icon={User} className="sm:col-span-2">
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="As per official certificates"
                    disabled={!!isLocked || !!profile?.isBasicInfoLocked}
                    className={cn(
                      "h-10 rounded-sm bg-card",
                      errors.name && "border-destructive",
                      (isLocked || profile?.isBasicInfoLocked) && "bg-muted/30"
                    )}
                  />
                </FieldRow>
                <FieldRow label="Date of Birth" required error={errors.dob} icon={Calendar}>
                  <Input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    disabled={!!isLocked || !!profile?.isBasicInfoLocked}
                    className={cn(
                      "h-10 rounded-sm bg-card",
                      (isLocked || profile?.isBasicInfoLocked) && "bg-muted/30",
                      errors.dob && "border-destructive"
                    )}
                  />
                </FieldRow>
                <FieldRow label="Gender" required error={errors.gender} icon={User}>
                  <Select
                    value={formData.gender}
                    onValueChange={v => setFormData(p => ({ ...p, gender: v }))}
                    disabled={!!isLocked || !!profile?.isBasicInfoLocked}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-10 rounded-sm bg-card",
                        (isLocked || profile?.isBasicInfoLocked) && "bg-muted/30",
                        errors.gender && "border-destructive"
                      )}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldRow>
              </div>
            </CardContent>
          </Card>

          {/* Card: Academic Standing & University Identifiers */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brown-800/10 text-brown-800">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">Academic Standing &amp; University Info</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FieldRow label="Institution" icon={Home}>
                  <Input value="G.L. Bajaj Institute of Technology and Management" disabled className="h-10 rounded-sm bg-muted/30 font-semibold" />
                </FieldRow>
                <FieldRow label="Degree Course" icon={BookOpen}>
                  <Input value={formData.course || "Bachelor of Technology"} disabled className="h-10 rounded-sm bg-muted/30 font-semibold" />
                </FieldRow>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FieldRow label="Entry Category" required error={errors.studentType} icon={Award}>
                  <Select
                    value={formData.studentType}
                    onValueChange={v => setFormData(p => ({ ...p, studentType: v }))}
                    disabled={!!isLocked || !!profile?.isBasicInfoLocked}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-10 rounded-sm bg-card",
                        errors.studentType && "border-destructive",
                        (isLocked || profile?.isBasicInfoLocked) && "bg-muted/30"
                      )}
                    >
                      <SelectValue placeholder="Select Entry Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular Entry">Regular Entry (4 Years)</SelectItem>
                      <SelectItem value="Lateral Entry">Lateral Entry (Diploma / 3 Years)</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldRow>
                <FieldRow label="Branch Name" required error={errors.branch} icon={Briefcase}>
                  <Select
                    value={formData.branch}
                    onValueChange={v => setFormData(p => ({ ...p, branch: v }))}
                    disabled={!!isLocked || !!profile?.isBasicInfoLocked}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-10 rounded-sm bg-card font-semibold",
                        errors.branch && "border-destructive",
                        (isLocked || profile?.isBasicInfoLocked) && "bg-muted/30"
                      )}
                    >
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map(b => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FieldRow label="Official Student Email" icon={Mail}>
                  <Input value={user?.email || ""} disabled className="h-10 rounded-sm bg-muted/30 font-mono text-xs" />
                </FieldRow>
                <FieldRow label="University Roll No" required error={errors.rollNo} icon={Award}>
                  <Input
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleInputChange}
                    placeholder="13-digit university number"
                    maxLength={13}
                    disabled={!!isLocked || !!profile?.isBasicInfoLocked}
                    className={cn(
                      "h-10 rounded-sm bg-card font-mono tracking-wider",
                      errors.rollNo && "border-destructive",
                      (isLocked || profile?.isBasicInfoLocked) && "bg-muted/30"
                    )}
                  />
                </FieldRow>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <FieldRow label="Admission ID" required error={errors.admissionId} icon={Fingerprint}>
                  <Input
                    name="admissionId"
                    value={formData.admissionId}
                    onChange={handleInputChange}
                    placeholder="e.g. 23B0101001"
                    disabled={!!isLocked || !!profile?.isBasicInfoLocked}
                    className={cn(
                      "h-10 rounded-sm bg-card font-mono uppercase",
                      errors.admissionId && "border-destructive",
                      (isLocked || profile?.isBasicInfoLocked) && "bg-muted/30"
                    )}
                  />
                </FieldRow>
                <FieldRow label="Passing Year (Batch)" required error={errors.year} icon={Calendar}>
                  <Select
                    value={formData.year}
                    onValueChange={v => setFormData(p => ({ ...p, year: v }))}
                    disabled={!!isLocked || !!profile?.isBasicInfoLocked}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-10 rounded-sm bg-card",
                        errors.year && "border-destructive",
                        (isLocked || profile?.isBasicInfoLocked) && "bg-muted/30"
                      )}
                    >
                      <SelectValue placeholder="Graduation Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {getYearOptions().map(y => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>
                <FieldRow label="Current Semester" required error={errors.currentSemester} icon={BookOpen}>
                  <Select
                    value={formData.currentSemester}
                    onValueChange={v => setFormData(p => ({ ...p, currentSemester: v }))}
                    disabled={!!isLocked || !!profile?.isBasicInfoLocked}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-10 rounded-sm bg-card",
                        errors.currentSemester && "border-destructive",
                        (isLocked || profile?.isBasicInfoLocked) && "bg-muted/30"
                      )}
                    >
                      <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSemesterOptions(formData.studentType).map(s => (
                        <SelectItem key={s} value={s.toString()}>
                          Semester {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 2. ACADEMIC STANDING TAB ─────────────────────────────────────── */}
        <TabsContent value="academic" className="space-y-6 animate-in fade-in duration-300">
          {/* Card: Class 10th */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brown-800/10 text-brown-800">
                  <BookOpen className="h-4 w-4" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">Secondary Education (Class 10th)</CardTitle>
              </div>
              {profile?.isClass10Locked ? (
                <LockedBadge />
              ) : (
                <LockButton onClick={handleSaveClass10} saving={saving === "class10"} disabled={!!isLocked} />
              )}
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <FieldRow label="School Name" required error={errors.class10School} icon={Home}>
                <Input
                  name="class10School"
                  value={formData.class10School}
                  onChange={handleInputChange}
                  placeholder="Full name of secondary school"
                  disabled={!!isLocked || !!profile?.isClass10Locked}
                  className={cn(
                    "h-10 rounded-sm bg-card",
                    errors.class10School && "border-destructive",
                    (isLocked || profile?.isClass10Locked) && "bg-muted/30"
                  )}
                />
              </FieldRow>

              <div className="grid gap-6 md:grid-cols-3">
                <FieldRow label="Board of Education" required error={errors.class10Board} icon={Award}>
                  <Select
                    value={formData.class10Board}
                    onValueChange={v => {
                      setFormData(p => ({ ...p, class10Board: v }));
                      clearFieldError("class10Board");
                    }}
                    disabled={!!isLocked || !!profile?.isClass10Locked}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-10 rounded-sm bg-card",
                        (isLocked || profile?.isClass10Locked) && "bg-muted/30",
                        errors.class10Board && "border-destructive"
                      )}
                    >
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    <SelectContent>
                      {BOARDS.map(b => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>
                <FieldRow label="Passing Year" required error={errors.class10Year} icon={GraduationCap}>
                  <Select
                    value={formData.class10Year}
                    onValueChange={v => {
                      setFormData(p => ({ ...p, class10Year: v }));
                      clearFieldError("class10Year");
                    }}
                    disabled={!!isLocked || !!profile?.isClass10Locked}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-10 rounded-sm bg-card",
                        (isLocked || profile?.isClass10Locked) && "bg-muted/30",
                        errors.class10Year && "border-destructive"
                      )}
                    >
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {PASSING_YEARS.map(y => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>
                <FieldRow label="Overall Percentage" required error={errors.class10Percentage} icon={FileText}>
                  <div className="relative">
                    <Input
                      name="class10Percentage"
                      value={formData.class10Percentage}
                      onChange={handleInputChange}
                      placeholder="e.g. 85.5"
                      disabled={!!isLocked || !!profile?.isClass10Locked}
                      className={cn(
                        "h-10 rounded-sm bg-card pr-8 font-mono",
                        errors.class10Percentage && "border-destructive",
                        (isLocked || profile?.isClass10Locked) && "bg-muted/30"
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
                  </div>
                </FieldRow>
              </div>
            </CardContent>
          </Card>

          {/* Card: Class 12th (Regular Entry) */}
          {formData.studentType === "Regular Entry" && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brown-800/10 text-brown-800">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">Senior Secondary (Class 12th)</CardTitle>
                </div>
                {profile?.isClass12Locked ? (
                  <LockedBadge />
                ) : (
                  <LockButton onClick={handleSaveClass12} saving={saving === "class12"} disabled={!!isLocked} />
                )}
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <FieldRow label="School Name" required error={errors.class12School} icon={Home}>
                  <Input
                    name="class12School"
                    value={formData.class12School}
                    onChange={handleInputChange}
                    placeholder="Full name of senior secondary school"
                    disabled={!!isLocked || !!profile?.isClass12Locked}
                    className={cn(
                      "h-10 rounded-sm bg-card",
                      errors.class12School && "border-destructive",
                      (isLocked || profile?.isClass12Locked) && "bg-muted/30"
                    )}
                  />
                </FieldRow>

                <div className="grid gap-6 md:grid-cols-2">
                  <FieldRow label="Board of Education" required error={errors.class12Board} icon={Award}>
                    <Select
                      value={formData.class12Board}
                      onValueChange={v => {
                        setFormData(p => ({ ...p, class12Board: v }));
                        clearFieldError("class12Board");
                      }}
                      disabled={!!isLocked || !!profile?.isClass12Locked}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-10 rounded-sm bg-card",
                          (isLocked || profile?.isClass12Locked) && "bg-muted/30",
                          errors.class12Board && "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="Select Board" />
                      </SelectTrigger>
                      <SelectContent>
                        {BOARDS.map(b => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldRow>
                  <FieldRow label="Passing Year" required error={errors.class12Year} icon={Calendar}>
                    <Select
                      value={formData.class12Year}
                      onValueChange={v => {
                        setFormData(p => ({ ...p, class12Year: v }));
                        clearFieldError("class12Year");
                      }}
                      disabled={!!isLocked || !!profile?.isClass12Locked}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-10 rounded-sm bg-card",
                          (isLocked || profile?.isClass12Locked) && "bg-muted/30",
                          errors.class12Year && "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {PASSING_YEARS.map(y => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldRow>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <FieldRow label="Overall Percentage" required error={errors.class12Percentage} icon={FileText}>
                    <div className="relative">
                      <Input
                        name="class12Percentage"
                        value={formData.class12Percentage}
                        onChange={handleInputChange}
                        placeholder="85.0"
                        disabled={!!isLocked || !!profile?.isClass12Locked}
                        className={cn(
                          "h-10 rounded-sm bg-card pr-8 font-mono",
                          errors.class12Percentage && "border-destructive",
                          (isLocked || profile?.isClass12Locked) && "bg-muted/30"
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
                    </div>
                  </FieldRow>
                  <FieldRow label="PCM Percentage" required error={errors.class12PcmPercentage} icon={Calculator}>
                    <div className="relative">
                      <Input
                        name="class12PcmPercentage"
                        value={formData.class12PcmPercentage}
                        onChange={handleInputChange}
                        placeholder="82.5"
                        disabled={!!isLocked || !!profile?.isClass12Locked}
                        className={cn(
                          "h-10 rounded-sm bg-card pr-8 font-mono",
                          errors.class12PcmPercentage && "border-destructive",
                          (isLocked || profile?.isClass12Locked) && "bg-muted/30"
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
                    </div>
                  </FieldRow>
                  <FieldRow label="Math Percentage" error={errors.class12MathPercentage} icon={Divide}>
                    <div className="relative">
                      <Input
                        name="class12MathPercentage"
                        value={formData.class12MathPercentage}
                        onChange={handleInputChange}
                        placeholder="90.0"
                        disabled={!!isLocked || !!profile?.isClass12Locked}
                        className={cn(
                          "h-10 rounded-sm bg-card pr-8 font-mono",
                          errors.class12MathPercentage && "border-destructive",
                          (isLocked || profile?.isClass12Locked) && "bg-muted/30"
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
                    </div>
                  </FieldRow>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card: Diploma Education (Lateral Entry) */}
          {formData.studentType === "Lateral Entry" && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brown-800/10 text-brown-800">
                    <Award className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">Polytechnic Diploma Education</CardTitle>
                </div>
                {profile?.isDiplomaLocked ? (
                  <LockedBadge />
                ) : (
                  <LockButton onClick={handleSaveDiploma} saving={saving === "diploma"} disabled={!!isLocked} />
                )}
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <FieldRow label="Institute Name" required error={errors.diplomaInstitute} icon={Home}>
                  <Input
                    name="diplomaInstitute"
                    value={formData.diplomaInstitute}
                    onChange={handleInputChange}
                    placeholder="Full name of polytechnic institute"
                    disabled={!!isLocked || !!profile?.isDiplomaLocked}
                    className={cn(
                      "h-10 rounded-sm bg-card",
                      errors.diplomaInstitute && "border-destructive",
                      (isLocked || profile?.isDiplomaLocked) && "bg-muted/30"
                    )}
                  />
                </FieldRow>

                <div className="grid gap-6 md:grid-cols-3">
                  <FieldRow label="Branch Name" required error={errors.diplomaBranch} icon={Briefcase}>
                    <Select
                      value={formData.diplomaBranch}
                      onValueChange={v => {
                        setFormData(p => ({ ...p, diplomaBranch: v }));
                        clearFieldError("diplomaBranch");
                      }}
                      disabled={!!isLocked || !!profile?.isDiplomaLocked}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-10 rounded-sm bg-card",
                          (isLocked || profile?.isDiplomaLocked) && "bg-muted/30",
                          errors.diplomaBranch && "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="Select Branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {DIPLOMA_BRANCHES.map(b => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldRow>
                  <FieldRow label="Passing Year" required error={errors.diplomaYear} icon={GraduationCap}>
                    <Select
                      value={formData.diplomaYear}
                      onValueChange={v => {
                        setFormData(p => ({ ...p, diplomaYear: v }));
                        clearFieldError("diplomaYear");
                      }}
                      disabled={!!isLocked || !!profile?.isDiplomaLocked}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-10 rounded-sm bg-card",
                          (isLocked || profile?.isDiplomaLocked) && "bg-muted/30",
                          errors.diplomaYear && "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {PASSING_YEARS.map(y => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldRow>
                  <FieldRow label="Overall Percentage" required error={errors.diplomaPercentage} icon={FileText}>
                    <div className="relative">
                      <Input
                        name="diplomaPercentage"
                        value={formData.diplomaPercentage}
                        onChange={handleInputChange}
                        placeholder="88.0"
                        disabled={!!isLocked || !!profile?.isDiplomaLocked}
                        className={cn(
                          "h-10 rounded-sm bg-card pr-8 font-mono",
                          errors.diplomaPercentage && "border-destructive",
                          (isLocked || profile?.isDiplomaLocked) && "bg-muted/30"
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
                    </div>
                  </FieldRow>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card: University Semester Results */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brown-800/10 text-brown-800">
                  <Calculator className="h-4 w-4" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">University Semester Performance</CardTitle>
              </div>

              {(() => {
                const minSem = formData.studentType === "Lateral Entry" ? 3 : 1;
                const currentSem = parseInt(formData.currentSemester) || 9;
                const validSems = semesterResults.filter(
                  r => r.totalMarks && r.obtainedMarks && r.semester >= minSem && r.semester < currentSem
                );
                if (validSems.length > 0) {
                  const totalObt = validSems.reduce((s, r) => s + (r.obtainedMarks || 0), 0);
                  const totalMks = validSems.reduce((s, r) => s + (r.totalMarks || 0), 0);
                  const pct = totalMks > 0 ? ((totalObt / totalMks) * 100).toFixed(2) : "0.00";
                  return (
                    <div className="flex items-center gap-2 rounded-sm bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-800">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                      <span>Aggregate Score:</span>
                      <span className="font-mono text-sm">{pct}%</span>
                    </div>
                  );
                }
                return null;
              })()}
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {semesterResults
                .filter(r => {
                  const min = formData.studentType === "Lateral Entry" ? 3 : 1;
                  return r.semester >= min && r.semester < (parseInt(formData.currentSemester) || 9);
                })
                .map(result => {
                  const oi = semesterResults.findIndex(sr => sr.semester === result.semester);
                  const pct =
                    result.totalMarks && result.obtainedMarks && result.totalMarks > 0
                      ? ((result.obtainedMarks / result.totalMarks) * 100).toFixed(2)
                      : null;

                  return (
                    <div
                      key={result.semester}
                      className="rounded-sm border border-border/60 bg-muted/10 p-4 transition-all hover:border-border"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-border/30 gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-brown-800 text-xs font-bold text-cream">
                            S{result.semester}
                          </span>
                          <span className="font-semibold text-sm text-foreground">Semester {result.semester}</span>
                          {pct && (
                            <Badge variant="outline" className="text-[11px] font-mono font-bold bg-card border-border/60">
                              {pct}%
                            </Badge>
                          )}
                        </div>
                        <div>
                          {isLocked || result.isLocked ? (
                            <LockedBadge />
                          ) : (
                            <LockButton
                              onClick={() => handleConfirmSaveSemester(oi)}
                              saving={saving === `sem-${result.semester}`}
                              disabled={!!isLocked}
                              label="Lock Semester"
                            />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { label: "Obtained Marks", field: "obtainedMarks", type: "number" },
                          { label: "Total Marks", field: "totalMarks", type: "number" },
                          { label: "SGPA", field: "sgpa", type: "number", step: "0.01" },
                          { label: "Backlogs", field: "backlogs", type: "number" }
                        ].map(({ label, field, type, step }) => {
                          const errKey = `sem-${result.semester}-${field}`;
                          const hasError = !!errors[errKey];
                          return (
                            <FieldRow key={field} label={label} error={errors[errKey]}>
                              <Input
                                type={type}
                                step={step}
                                value={(result as any)[field] ?? ""}
                                onChange={e => {
                                  const nr = [...semesterResults];
                                  (nr[oi] as any)[field] = e.target.value
                                    ? type === "number"
                                      ? parseFloat(e.target.value)
                                      : parseInt(e.target.value)
                                    : null;
                                  setSemesterResults(nr);
                                  clearFieldError(errKey);
                                }}
                                disabled={!!isLocked || result.isLocked}
                                className={cn(
                                  "h-9 rounded-sm bg-card font-mono text-xs",
                                  (isLocked || result.isLocked) && "bg-muted/30",
                                  hasError && "border-destructive"
                                )}
                              />
                            </FieldRow>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

              {semesterResults.filter(r => {
                const min = formData.studentType === "Lateral Entry" ? 3 : 1;
                return r.semester >= min && r.semester < (parseInt(formData.currentSemester) || 9);
              }).length === 0 && (
                <div className="py-12 border border-dashed rounded-sm text-center bg-muted/10 space-y-2">
                  <GraduationCap className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm font-semibold text-foreground">Semester Records Ready</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Please select your Current Semester in the Basic Details tab to view and lock previous semester scores.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 3. CONTACT & FAMILY TAB ──────────────────────────────────────── */}
        <TabsContent value="personal" className="space-y-6 animate-in fade-in duration-300">
          {/* Card: Direct Contact */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brown-800/10 text-brown-800">
                  <Phone className="h-4 w-4" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">Direct Contact Information</CardTitle>
              </div>
              {!isLocked && (
                isEditingPersonal ? (
                  <Button
                    size="sm"
                    onClick={savePersonalInfo}
                    disabled={!!saving}
                    className="h-9 px-4 rounded-sm bg-brown-800 text-cream hover:bg-brown-900 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 font-bold text-xs shadow-sm min-w-[80px] inline-flex items-center justify-center animate-in fade-in zoom-in-95"
                  >
                    {saving === "personal" ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5 mr-1.5 text-amber-300" />
                        Save
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingPersonal(true)}
                    className="group h-9 px-4 rounded-sm border border-border/70 bg-card text-foreground hover:bg-brown-800/10 hover:text-brown-900 hover:border-brown-800/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 font-semibold text-xs shadow-xs min-w-[80px] inline-flex items-center justify-center animate-in fade-in zoom-in-95"
                  >
                    <Pencil className="h-3 w-3 mr-1.5 text-muted-foreground group-hover:text-brown-800 transition-colors" />
                    Edit
                  </Button>
                )
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FieldRow label="Primary Mobile Number" required error={personalErrors.mobileNo} icon={Phone}>
                  <Input
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={handleInputChange}
                    placeholder="10-digit number"
                    disabled={!isEditingPersonal || isLocked}
                    className={cn(
                      "h-10 rounded-sm bg-card font-mono",
                      personalErrors.mobileNo && "border-destructive",
                      (!isEditingPersonal || isLocked) && "bg-muted/30"
                    )}
                  />
                </FieldRow>
                <FieldRow label="Personal Email Address" required error={personalErrors.personalEmail} icon={Mail}>
                  <Input
                    name="personalEmail"
                    type="email"
                    value={formData.personalEmail}
                    onChange={handleInputChange}
                    placeholder="student@example.com"
                    disabled={!isEditingPersonal || isLocked}
                    className={cn(
                      "h-10 rounded-sm bg-card",
                      personalErrors.personalEmail && "border-destructive",
                      (!isEditingPersonal || isLocked) && "bg-muted/30"
                    )}
                  />
                </FieldRow>
              </div>
            </CardContent>
          </Card>

          {/* Card: Parental Details */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Father's Info */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-brown-800" />
                  Father&apos;s Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <FieldRow label="Full Name" required error={personalErrors.fatherName}>
                  <Input
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    disabled={!isEditingPersonal || isLocked}
                    className={cn("h-10 rounded-sm bg-card", (!isEditingPersonal || isLocked) && "bg-muted/30")}
                  />
                </FieldRow>
                <FieldRow label="Occupation">
                  <Input
                    name="fatherOccupation"
                    value={formData.fatherOccupation}
                    onChange={handleInputChange}
                    disabled={!isEditingPersonal || isLocked}
                    className={cn("h-10 rounded-sm bg-card", (!isEditingPersonal || isLocked) && "bg-muted/30")}
                  />
                </FieldRow>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldRow label="Mobile Number">
                    <Input
                      name="fatherMobile"
                      value={formData.fatherMobile}
                      onChange={handleInputChange}
                      disabled={!isEditingPersonal || isLocked}
                      className={cn("h-10 rounded-sm bg-card font-mono text-xs", (!isEditingPersonal || isLocked) && "bg-muted/30")}
                    />
                  </FieldRow>
                  <FieldRow label="Email">
                    <Input
                      name="fatherEmail"
                      type="email"
                      value={formData.fatherEmail}
                      onChange={handleInputChange}
                      disabled={!isEditingPersonal || isLocked}
                      className={cn("h-10 rounded-sm bg-card text-xs", (!isEditingPersonal || isLocked) && "bg-muted/30")}
                    />
                  </FieldRow>
                </div>
              </CardContent>
            </Card>

            {/* Mother's Info */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-brown-800" />
                  Mother&apos;s Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <FieldRow label="Full Name" required error={personalErrors.motherName}>
                  <Input
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    disabled={!isEditingPersonal || isLocked}
                    className={cn("h-10 rounded-sm bg-card", (!isEditingPersonal || isLocked) && "bg-muted/30")}
                  />
                </FieldRow>
                <FieldRow label="Occupation">
                  <Input
                    name="motherOccupation"
                    value={formData.motherOccupation}
                    onChange={handleInputChange}
                    disabled={!isEditingPersonal || isLocked}
                    className={cn("h-10 rounded-sm bg-card", (!isEditingPersonal || isLocked) && "bg-muted/30")}
                  />
                </FieldRow>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldRow label="Mobile Number">
                    <Input
                      name="motherMobile"
                      value={formData.motherMobile}
                      onChange={handleInputChange}
                      disabled={!isEditingPersonal || isLocked}
                      className={cn("h-10 rounded-sm bg-card font-mono text-xs", (!isEditingPersonal || isLocked) && "bg-muted/30")}
                    />
                  </FieldRow>
                  <FieldRow label="Email">
                    <Input
                      name="motherEmail"
                      type="email"
                      value={formData.motherEmail}
                      onChange={handleInputChange}
                      disabled={!isEditingPersonal || isLocked}
                      className={cn("h-10 rounded-sm bg-card text-xs", (!isEditingPersonal || isLocked) && "bg-muted/30")}
                    />
                  </FieldRow>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card: Addresses */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Present Address */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brown-800" />
                  Present Address
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <FieldRow label="House / Flat No.">
                  <Input
                    name="presentHouseNo"
                    value={formData.presentHouseNo}
                    onChange={handleInputChange}
                    disabled={!isEditingPersonal || isLocked}
                    className={cn("h-10 rounded-sm bg-card", (!isEditingPersonal || isLocked) && "bg-muted/30")}
                  />
                </FieldRow>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldRow label="Block / Sector">
                    <Input
                      name="presentBlock"
                      value={formData.presentBlock}
                      onChange={handleInputChange}
                      disabled={!isEditingPersonal || isLocked}
                      className={cn("h-10 rounded-sm bg-card", (!isEditingPersonal || isLocked) && "bg-muted/30")}
                    />
                  </FieldRow>
                  <FieldRow label="Locality / Area">
                    <Input
                      name="presentLocality"
                      value={formData.presentLocality}
                      onChange={handleInputChange}
                      disabled={!isEditingPersonal || isLocked}
                      className={cn("h-10 rounded-sm bg-card", (!isEditingPersonal || isLocked) && "bg-muted/30")}
                    />
                  </FieldRow>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldRow label="City">
                    <Input
                      name="presentCity"
                      value={formData.presentCity}
                      onChange={handleInputChange}
                      disabled={!isEditingPersonal || isLocked}
                      className={cn("h-10 rounded-sm bg-card", (!isEditingPersonal || isLocked) && "bg-muted/30")}
                    />
                  </FieldRow>
                  <FieldRow label="Tehsil">
                    <Input
                      name="presentTehsil"
                      value={formData.presentTehsil}
                      onChange={handleInputChange}
                      disabled={!isEditingPersonal || isLocked}
                      className={cn("h-10 rounded-sm bg-card", (!isEditingPersonal || isLocked) && "bg-muted/30")}
                    />
                  </FieldRow>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldRow label="State" required error={personalErrors.presentState}>
                    <Select
                      value={formData.presentState}
                      onValueChange={v => setFormData(p => ({ ...p, presentState: v, presentDistrict: "" }))}
                      disabled={!isEditingPersonal || isLocked}
                    >
                      <SelectTrigger className={cn("h-10 rounded-sm bg-card", (!isEditingPersonal || isLocked) && "bg-muted/30")}>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(s => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldRow>
                  <FieldRow label="District" required error={personalErrors.presentDistrict}>
                    <Select
                      value={formData.presentDistrict}
                      onValueChange={v => setFormData(p => ({ ...p, presentDistrict: v }))}
                      disabled={!isEditingPersonal || isLocked || !formData.presentState}
                    >
                      <SelectTrigger className={cn("h-10 rounded-sm bg-card", (!isEditingPersonal || isLocked) && "bg-muted/30")}>
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent>
                        {(DISTRICTS_BY_STATE[formData.presentState as keyof typeof DISTRICTS_BY_STATE] || []).map(d => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldRow>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldRow label="Pincode" required error={personalErrors.presentPincode}>
                    <Input
                      name="presentPincode"
                      value={formData.presentPincode}
                      onChange={handleInputChange}
                      disabled={!isEditingPersonal || isLocked}
                      className={cn("h-10 rounded-sm bg-card font-mono", (!isEditingPersonal || isLocked) && "bg-muted/30")}
                    />
                  </FieldRow>
                  <FieldRow label="Country">
                    <Input value="India" disabled className="h-10 rounded-sm bg-muted/30 font-semibold" />
                  </FieldRow>
                </div>
              </CardContent>
            </Card>

            {/* Permanent Address */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-4 gap-2">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Home className="h-4 w-4 text-brown-800" />
                  Permanent Address
                </CardTitle>
                {isEditingPersonal && !isLocked && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sameAsPresent"
                      checked={formData.sameAsPresent}
                      className="border-border/70 data-[state=checked]:bg-brown-800"
                      onCheckedChange={c => {
                        setFormData(p => {
                          const np = { ...p, sameAsPresent: !!c };
                          if (c) {
                            np.permanentHouseNo = p.presentHouseNo;
                            np.permanentBlock = p.presentBlock;
                            np.permanentLocality = p.presentLocality;
                            np.permanentCity = p.presentCity;
                            np.permanentTehsil = p.presentTehsil;
                            np.permanentDistrict = p.presentDistrict;
                            np.permanentState = p.presentState;
                            np.permanentPincode = p.presentPincode;
                          }
                          return np;
                        });
                      }}
                    />
                    <label htmlFor="sameAsPresent" className="text-xs font-semibold text-muted-foreground cursor-pointer">
                      Same as Present
                    </label>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <FieldRow label="House / Flat No.">
                  <Input
                    name="permanentHouseNo"
                    value={formData.permanentHouseNo}
                    onChange={handleInputChange}
                    disabled={!isEditingPersonal || isLocked || formData.sameAsPresent}
                    className={cn("h-10 rounded-sm bg-card", (!isEditingPersonal || isLocked || formData.sameAsPresent) && "bg-muted/30")}
                  />
                </FieldRow>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldRow label="Block / Sector">
                    <Input
                      name="permanentBlock"
                      value={formData.permanentBlock}
                      onChange={handleInputChange}
                      disabled={!isEditingPersonal || isLocked || formData.sameAsPresent}
                      className={cn("h-10 rounded-sm bg-card", (!isEditingPersonal || isLocked || formData.sameAsPresent) && "bg-muted/30")}
                    />
                  </FieldRow>
                  <FieldRow label="Locality / Area">
                    <Input
                      name="permanentLocality"
                      value={formData.permanentLocality}
                      onChange={handleInputChange}
                      disabled={!isEditingPersonal || isLocked || formData.sameAsPresent}
                      className={cn("h-10 rounded-sm bg-card", (!isEditingPersonal || isLocked || formData.sameAsPresent) && "bg-muted/30")}
                    />
                  </FieldRow>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldRow label="City">
                    <Input
                      name="permanentCity"
                      value={formData.permanentCity}
                      onChange={handleInputChange}
                      disabled={!isEditingPersonal || isLocked || formData.sameAsPresent}
                      className={cn("h-10 rounded-sm bg-card", (!isEditingPersonal || isLocked || formData.sameAsPresent) && "bg-muted/30")}
                    />
                  </FieldRow>
                  <FieldRow label="Tehsil">
                    <Input
                      name="permanentTehsil"
                      value={formData.permanentTehsil}
                      onChange={handleInputChange}
                      disabled={!isEditingPersonal || isLocked || formData.sameAsPresent}
                      className={cn("h-10 rounded-sm bg-card", (!isEditingPersonal || isLocked || formData.sameAsPresent) && "bg-muted/30")}
                    />
                  </FieldRow>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldRow label="State">
                    <Select
                      value={formData.permanentState}
                      onValueChange={v => setFormData(p => ({ ...p, permanentState: v, permanentDistrict: "" }))}
                      disabled={!isEditingPersonal || isLocked || formData.sameAsPresent}
                    >
                      <SelectTrigger className={cn("h-10 rounded-sm bg-card", (!isEditingPersonal || isLocked || formData.sameAsPresent) && "bg-muted/30")}>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(s => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldRow>
                  <FieldRow label="District">
                    <Select
                      value={formData.permanentDistrict}
                      onValueChange={v => setFormData(p => ({ ...p, permanentDistrict: v }))}
                      disabled={!isEditingPersonal || isLocked || formData.sameAsPresent || !formData.permanentState}
                    >
                      <SelectTrigger className={cn("h-10 rounded-sm bg-card", (!isEditingPersonal || isLocked || formData.sameAsPresent) && "bg-muted/30")}>
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent>
                        {(DISTRICTS_BY_STATE[formData.permanentState as keyof typeof DISTRICTS_BY_STATE] || []).map(d => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldRow>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldRow label="Pincode">
                    <Input
                      name="permanentPincode"
                      value={formData.permanentPincode}
                      onChange={handleInputChange}
                      disabled={!isEditingPersonal || isLocked || formData.sameAsPresent}
                      className={cn("h-10 rounded-sm bg-card font-mono", (!isEditingPersonal || isLocked || formData.sameAsPresent) && "bg-muted/30")}
                    />
                  </FieldRow>
                  <FieldRow label="Country">
                    <Input value="India" disabled className="h-10 rounded-sm bg-muted/30 font-semibold" />
                  </FieldRow>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── 4. ONLINE PROFILES TAB ───────────────────────────────────────── */}
        <TabsContent value="profiles" className="space-y-6 animate-in fade-in duration-300">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brown-800/10 text-brown-800">
                  <Globe className="h-4 w-4" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">Online Profiles &amp; Placement Resume</CardTitle>
              </div>
              {!isLocked && (
                isEditingProfiles ? (
                  <Button
                    size="sm"
                    onClick={saveCareer}
                    disabled={!!saving}
                    className="h-9 px-4 rounded-sm bg-brown-800 text-cream hover:bg-brown-900 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 font-bold text-xs shadow-sm min-w-[80px] inline-flex items-center justify-center animate-in fade-in zoom-in-95"
                  >
                    {saving === "career" ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5 mr-1.5 text-amber-300" />
                        Save
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProfiles(true)}
                    className="group h-9 px-4 rounded-sm border border-border/70 bg-card text-foreground hover:bg-brown-800/10 hover:text-brown-900 hover:border-brown-800/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 font-semibold text-xs shadow-xs min-w-[80px] inline-flex items-center justify-center animate-in fade-in zoom-in-95"
                  >
                    <Pencil className="h-3 w-3 mr-1.5 text-muted-foreground group-hover:text-brown-800 transition-colors" />
                    Edit
                  </Button>
                )
              )}
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Digital & Coding Handles */}
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                  Digital Handles &amp; Coding Profiles
                </Label>
                <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-3">
                  <FieldRow label="LinkedIn Username" icon={Linkedin}>
                    <div className="flex">
                      <span className={cn(
                        "inline-flex items-center rounded-l-sm border border-r-0 border-border px-2.5 text-[11px] text-muted-foreground font-mono",
                        (!isEditingProfiles || isLocked) ? "bg-muted/60" : "bg-muted/40"
                      )}>
                        in/
                      </span>
                      <Input
                        name="linkedinId"
                        value={formData.linkedinId}
                        onChange={handleInputChange}
                        placeholder="username"
                        disabled={!isEditingProfiles || isLocked}
                        className={cn("rounded-l-none h-10 bg-card", (!isEditingProfiles || isLocked) && "bg-muted/30")}
                      />
                    </div>
                  </FieldRow>

                  <FieldRow label="GitHub Username" icon={Github}>
                    <div className="flex">
                      <span className={cn(
                        "inline-flex items-center rounded-l-sm border border-r-0 border-border px-2.5 text-[11px] text-muted-foreground font-mono",
                        (!isEditingProfiles || isLocked) ? "bg-muted/60" : "bg-muted/40"
                      )}>
                        github/
                      </span>
                      <Input
                        name="githubId"
                        value={formData.githubId}
                        onChange={handleInputChange}
                        placeholder="username"
                        disabled={!isEditingProfiles || isLocked}
                        className={cn("rounded-l-none h-10 bg-card", (!isEditingProfiles || isLocked) && "bg-muted/30")}
                      />
                    </div>
                  </FieldRow>

                  <FieldRow label="LeetCode Username" icon={Code2}>
                    <div className="flex">
                      <span className={cn(
                        "inline-flex items-center rounded-l-sm border border-r-0 border-border px-2.5 text-[11px] text-muted-foreground font-mono",
                        (!isEditingProfiles || isLocked) ? "bg-muted/60" : "bg-muted/40"
                      )}>
                        leetcode/
                      </span>
                      <Input
                        name="leetcodeId"
                        value={formData.leetcodeId}
                        onChange={handleInputChange}
                        placeholder="username"
                        disabled={!isEditingProfiles || isLocked}
                        className={cn("rounded-l-none h-10 bg-card", (!isEditingProfiles || isLocked) && "bg-muted/30")}
                      />
                    </div>
                  </FieldRow>
                </div>
              </div>

              {/* Resume Repository */}
              <div className="pt-4 border-t border-border/40 space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Active Placement Resume
                </Label>

                <FieldRow label="Google Drive Shareable Link" icon={FileText}>
                  <Input
                    name="resumeLink"
                    value={formData.resumeLink}
                    onChange={handleInputChange}
                    placeholder="https://drive.google.com/file/d/..."
                    disabled={!isEditingProfiles || isLocked}
                    className={cn("h-10 rounded-sm bg-card font-mono text-xs", (!isEditingProfiles || isLocked) && "bg-muted/30")}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Ensure Google Drive access permission is set to &quot;Anyone with the link can view&quot;.
                  </p>
                </FieldRow>

                {formData.resumeLink && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-sm border border-amber-500/20 bg-amber-500/10 p-3.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-amber-500/20 text-amber-800">
                        <Check className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground">Resume Document Linked</p>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">{formData.resumeLink}</p>
                      </div>
                    </div>
                    <a
                      href={formData.resumeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 rounded-sm bg-card border border-border/70 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-sm shrink-0 self-start sm:self-auto"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Preview
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── DIALOGS & OVERLAYS ────────────────────────────────────────────── */}
      <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={onSelectFile} disabled={!!isLocked} />

      <ImageCropper
        open={isCropping}
        imageSrc={cropSrc!}
        onCancel={() => {
          setCropSrc(null);
          setIsCropping(false);
        }}
        onCropComplete={handleCropComplete}
      />

      <UploadingOverlay isUploading={uploading} />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={open => !isDeletingPhoto && setIsDeleteDialogOpen(open)}>
        <AlertDialogContent className="rounded-xl border-border/70 max-w-sm">
          <AlertDialogHeader>
            <div className="mx-auto mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Trash2 className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-center text-base font-bold text-foreground">
              Remove profile photo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs text-muted-foreground">
              Are you sure you want to remove your profile photo? Your avatar will revert to your name initials.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2 pt-2">
            <AlertDialogCancel disabled={isDeletingPhoto} className="rounded-sm text-xs w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault();
                handleDeletePhoto();
              }}
              disabled={isDeletingPhoto}
              className="bg-destructive hover:bg-destructive/90 text-white rounded-sm text-xs font-bold w-full sm:w-auto min-w-[120px] transition-all"
            >
              {isDeletingPhoto ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Yes, Remove
                </>
              )}
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

function ConfirmLockModal({
  open,
  title,
  onClose,
  onConfirm
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="rounded-xl border-border/70 max-w-md w-[calc(100vw-2rem)] sm:w-full shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-base font-bold text-foreground border-b border-border/40 pb-3">
            <Lock className="h-4 w-4 text-amber-600 shrink-0" />
            <span>{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground pt-3 leading-relaxed">
            <span className="font-semibold text-foreground block mb-1">Warning: Irreversible Action</span>
            Once locked, these details become <strong>Read-Only</strong>. You will not be able to edit them without contacting the Training &amp; Placement administration.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <AlertDialogCancel onClick={onClose} className="rounded-sm text-xs h-9 px-4 w-full sm:w-auto">
            Review Again
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="rounded-sm bg-brown-800 text-cream hover:bg-brown-900 text-xs font-bold h-9 px-4 w-full sm:w-auto shadow-sm">
            Yes, Lock &amp; Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


