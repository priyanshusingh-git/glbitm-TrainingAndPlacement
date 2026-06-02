
import { Metadata } from "next";
import { Suspense } from "react";
import StudentsPage from "@/modules/students/components/students-client";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Students - Admin Dashboard",
  description: "Manage student records, track placement status, and academic progress.",
};

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    }>
      <StudentsPage />
    </Suspense>
  );
}
