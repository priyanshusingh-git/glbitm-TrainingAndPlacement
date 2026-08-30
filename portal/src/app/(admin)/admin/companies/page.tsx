
import { Metadata } from "next";
import { Suspense } from "react";
import CompaniesPage from "@/modules/companies/components/companies-client";
import { LoadingGrid } from "@/components/ui/loading-states";

export const metadata: Metadata = {
  title: "Companies - Training & Placement Portal",
  description: "Manage recruiting companies and contacts.",
};

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-6 pb-12 animate-fade-up">
        <LoadingGrid items={6} />
      </div>
    }>
      <CompaniesPage />
    </Suspense>
  );
}
