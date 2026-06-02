export interface Certification {
  id: number;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  credentialId: string;
  link: string;
  status: 'verified' | 'pending';
}

export const certifications: Certification[] = [
  {
    id: 1,
    name: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    issueDate: "Dec 15, 2025",
    expiryDate: "Dec 15, 2028",
    credentialId: "AWS-CCP-2025-1234",
    link: "https://aws.amazon.com/verify",
    status: "verified",
  },
  {
    id: 2,
    name: "Meta Front-End Developer Professional Certificate",
    issuer: "Coursera",
    issueDate: "Nov 20, 2025",
    expiryDate: null,
    credentialId: "COURSERA-META-5678",
    link: "https://coursera.org/verify/123",
    status: "verified",
  },
  {
    id: 3,
    name: "Python for Data Science",
    issuer: "IBM",
    issueDate: "Oct 10, 2025",
    expiryDate: null,
    credentialId: "IBM-DS-9012",
    link: "https://ibm.com/badges/123",
    status: "verified",
  },
  {
    id: 4,
    name: "Advanced React Patterns",
    issuer: "Udemy",
    issueDate: "Jan 05, 2026",
    expiryDate: null,
    credentialId: "UDEMY-REACT-3456",
    link: "",
    status: "pending",
  },
];
