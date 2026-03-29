import { Metadata } from"next";
import ActivityClient from"@/modules/analytics/components/activity-client";

export const metadata: Metadata = {
 title:"Activity Log - Admin Dashboard",
 description:"View system audit logs and administrative actions.",
};

export default function Page() {
 return <ActivityClient />;
}
