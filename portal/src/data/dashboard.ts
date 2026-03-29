export const dashboardBanner = {
  greeting: "Good morning",
  status: "Placement Season Active",
  message: "You have 2 new shortlists and 3 upcoming CDC sessions this week.",
  metrics: [
    { label: "CGPA", value: "8.4" },
    { label: "Attendance", value: "78%" },
    { label: "Applied", value: "4" }
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
    id: "cgpa",
    label: "Overall CGPA", 
    value: "8.4", 
    badge: "Current", 
    badgeColor: "amber",
    tag: "Trophy"
  },
  { 
    id: "applied",
    label: "Drives Applied", 
    value: "4", 
    badge: "4 Active", 
    badgeColor: "blue",
    tag: "Briefcase"
  },
  { 
    id: "shortlisted",
    label: "Shortlisted", 
    value: "2", 
    badge: "2 New", 
    badgeColor: "emerald",
    tag: "CheckCircle"
  },
  { 
    id: "training",
    label: "Training Progress", 
    value: "78%", 
    badge: "Top 10%", 
    badgeColor: "indigo",
    tag: "BookOpen"
  }
];
