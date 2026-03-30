// Admin Dashboard
export const adminQuickActions = [
  { label: "New Student", iconName: "UserPlus", colorClass: "text-brown-800", bgClass: "bg-brown-800/10" },
  { label: "Add Company", iconName: "Building2", colorClass: "text-amber-500", bgClass: "bg-amber-500/10" },
  { label: "Import Data", iconName: "FileSpreadsheet", colorClass: "text-amber-600", bgClass: "bg-amber-500/10" },
  { label: "Send Notice", iconName: "Send", colorClass: "text-brown-900", bgClass: "bg-brown-900/10" },
];

export const adminOverviewConfig = [
  {
    key: "totalStudents",
    title: "Total Students",
    label: "Registered Batch",
    toneClass: "tone-brown",
    hoverClass: "hover:border-brown-800/30",
    iconName: "Users",
    gradient: "rgba(81, 41, 18, 0.12)" // brown-800
  },
  {
    key: "placedStudents",
    title: "Placed Students",
    label: "Successful Offers",
    toneClass: "tone-success",
    hoverClass: "hover:border-emerald-600/30",
    iconName: "UserCheck",
    gradient: "rgba(5, 150, 105, 0.12)" // emerald-600 (approved in rule 5 for success)
  },
  {
    key: "avgScore",
    title: "Average Score",
    label: "Assessment Mean",
    toneClass: "tone-amber",
    hoverClass: "hover:border-amber-500/30",
    iconName: "TrendingUp",
    gradient: "rgba(232, 160, 32, 0.12)" // amber-500
  },
  {
    key: "activeCompanies",
    title: "Active Companies",
    label: "Recruiting Partners",
    toneClass: "tone-brown-light",
    hoverClass: "hover:border-brown-900/30",
    iconName: "Building2",
    gradient: "rgba(58, 28, 11, 0.12)" // brown-900
  }
];

// Student Dashboard
export const getStudentGreeting = (name?: string) => {
  const hour = new Date().getHours();
  let timeOfDay = "Good evening";
  if (hour < 12) timeOfDay = "Good morning";
  else if (hour < 17) timeOfDay = "Good afternoon";
  
  return { timeOfDay, name: name?.split(' ')[0] || "Student" };
};

export const dashboardBanner = {
  status: "Placement Season Active",
  message: "Welcome to your personal placement portal. Track your progress below.",
  metrics: [
    { key: "cgpa", label: "CGPA", fallback: "—" },
    { key: "attendancePercentage", label: "Attendance", suffix: "%", fallback: "—" },
    { key: "applied", label: "Applied", fallback: "0" }
  ]
};

export const pipelineData = {
  company: "Microsoft",
  role: "SDE Role",
  status: "In Progress",
  stages: [
    { label: "Applied", status: "completed" },
    { label: "Shortlisted", status: "completed" },
    { label: "Aptitude", status: "current" },
    { label: "Technical", status: "pending" },
    { label: "HR", status: "pending" },
    { label: "Offer", status: "pending" },
  ],
  nextEvent: {
    label: "Aptitude test scheduled for",
    highlight: "Dec 15, 2024 — 10:00 AM"
  }
};

export const upcomingDrives = [
  { id: "1", name: "Microsoft", role: "SDE", package: "₹42 LPA", date: "Dec 15, 2024" },
  { id: "2", name: "Amazon", role: "SDE-1", package: "₹38 LPA", date: "Dec 18, 2024" },
  { id: "3", name: "Google", role: "Backend", package: "₹45 LPA", date: "Jan 05, 2025" },
];

export const statCards = [
  { 
    id: "trainingLevel",
    label: "Training Level", 
    badge: "Progress", 
    badgeColor: "amber",
    tag: "Trophy"
  },
  { 
    id: "eligibleDrives",
    label: "Drives Applied", 
    badge: "Active", 
    badgeColor: "amber",
    tag: "Briefcase"
  },
  { 
    id: "avgTestScore",
    label: "Avg Test Score", 
    badge: "Score", 
    badgeColor: "brown",
    tag: "CheckCircle",
    suffix: "%"
  },
  { 
    id: "problemsSolved",
    label: "Problems Solved", 
    badge: "Coding", 
    badgeColor: "brown",
    tag: "BookOpen"
  }
];
