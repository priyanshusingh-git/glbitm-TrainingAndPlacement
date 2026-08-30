
import { Metadata } from "next";
import { Suspense } from "react";
import StudentsPage from "@/modules/students/components/students-client";
import { LoadingTable } from "@/components/ui/loading-states";

export const metadata: Metadata = {
  title: "Students - Admin Dashboard",
  description: "Manage student records, track placement status, and academic progress.",
};

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-6 pb-12 animate-fade-up">
        <LoadingTable rows={6} cols={5} />
      </div>
    }>
      <StudentsPage />
    </Suspense>
  );
}
