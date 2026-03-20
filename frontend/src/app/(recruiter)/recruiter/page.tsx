import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BriefcaseBusiness, Clock3 } from "lucide-react"

export default function RecruiterDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="section-h2">Recruiter Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your recruiter workspace is being prepared.
        </p>
      </div>

      <Card className="overflow-hidden border-border/60 bg-card">
        <CardHeader className="border-b border-border/60 bg-muted/15">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                Recruiter tools and workflows will appear here once this area is ready.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <Badge variant="outline" className="w-fit gap-2 border-amber-500/30 bg-amber-500/5 px-3 py-1 text-amber-700">
            <Clock3 className="h-3.5 w-3.5" />
            Dashboard in progress
          </Badge>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Coming soon. This dashboard will host recruiter-specific access, company activity, and future hiring workflows.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
