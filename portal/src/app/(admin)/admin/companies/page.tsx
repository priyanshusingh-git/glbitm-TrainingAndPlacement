
import { Metadata } from"next";
import CompaniesPage from"@/modules/companies/components/companies-client";

export const metadata: Metadata = {
 title:"Companies - CDC Platform",
 description:"Manage recruiting companies and contacts.",
};

export default function Page() {
 return <CompaniesPage />;
}
