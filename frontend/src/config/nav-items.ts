import {
 LayoutDashboard,
 User,
 Users,
 BookOpen,
 FileText,
 Briefcase,
 FolderKanban,
 Award,
 BarChart3,
 Building2,
 Settings,
 Calendar,
 Image as ImageIcon,
 Activity,
 Code,
 Trophy,
} from"lucide-react"

export const studentNavItems = [
  { type: "header", label: "MAIN" },
  { label: "Overview", href: "/student", icon: LayoutDashboard },

  { type: "header", label: "TRAINING" },
  { label: "CDC Training", href: "/student/training", icon: BookOpen, count: 3 },
  { label: "Bootcamps", href: "/student/bootcamps", icon: Award },
  { label: "Tests & Results", href: "/student/tests", icon: FileText },

  { type: "header", label: "PLACEMENT" },
  { label: "Placements", href: "/student/placements", icon: Briefcase, count: 2 },

  { type: "header", label: "TECHNICAL PROFILE" },
  { label: "My Projects", href: "/student/portfolio/projects", icon: FolderKanban },
  { label: "Certifications", href: "/student/portfolio/certifications", icon: Award },
  { label: "Coding Profiles", href: "/student/portfolio/coding-profiles", icon: Code },
  { label: "Hackathons", href: "/student/portfolio/hackathons", icon: Trophy },
]

export const adminNavItems = [
 { type:"header", label:"Overview" },
 { label:"Dashboard", href:"/admin", icon: LayoutDashboard },
 { label:"Analytics", href:"/admin/analytics", icon: BarChart3 },

 { type:"header", label:"Management" },
 { label:"Manage Students", href:"/admin/students", icon: Users },
 { label:"Manage Trainers", href:"/admin/trainers", icon: User },

 { type:"header", label:"Learning & Logistics" },
 { label:"Training Groups", href:"/admin/training", icon: BookOpen },
 { label:"Manage Sessions", href:"/admin/sessions", icon: Calendar },
 { label:"Bootcamps", href:"/admin/bootcamps", icon: Award },
 { label:"Tests", href:"/admin/tests", icon: FileText },

 { type:"header", label:"Corporate Relations" },
 { label:"Companies", href:"/admin/companies", icon: Building2 },
 { label:"Placements", href:"/admin/placements", icon: Briefcase },

 { type:"header", label:"System Administration" },
 { label:"Activity Log", href:"/admin/activity", icon: Activity },
 { label:"Settings", href:"/admin/settings", icon: Settings },
]

export const trainerNavItems = [
 { type:"header", label:"Overview" },
 { label:"Dashboard", href:"/trainer", icon: LayoutDashboard },

 { type:"header", label:"Instruction" },
 { label:"My Groups", href:"/trainer/groups", icon: Users },
 { label:"My Schedule", href:"/trainer/schedule", icon: Calendar },

 { type:"header", label:"System" },
 { label:"Settings", href:"/trainer/settings", icon: Settings },
]

export const recruiterNavItems = [
 { type:"header", label:"Overview" },
 { label:"Dashboard", href:"/recruiter", icon: LayoutDashboard },
]
