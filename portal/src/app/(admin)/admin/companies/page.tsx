
import { Metadata } from "next";
import { Suspense } from "react";
import CompaniesPage from "@/modules/companies/components/companies-client";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Companies - CDC Platform",
  description: "Manage recruiting companies and contacts.",
};

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    }>
      <CompaniesPage />
    </Suspense>
  );
}
