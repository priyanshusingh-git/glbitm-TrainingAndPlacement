"use client"

import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/card"
import { Button } from"@/components/ui/button"
import { Badge } from"@/components/ui/badge"
import { Building2, Plus, MapPin, Users, IndianRupee, Calendar } from"lucide-react"

interface CompanySectionProps {
 companies?: any[];
}

const defaultCompanies = [
 {
 id: 1,
 name:"TechCorp India",
 industry:"Technology",
 location:"Bangalore",
 positions: 15,
 package:"12-18 LPA",
 driveDate:"Feb 10, 2026",
 status:"upcoming",
 },
 // ... Mock data usually here, simplified for brevity as fallback
];

export function CompanySection({ companies }: CompanySectionProps) {
 const displayCompanies = companies || []; // defaultCompanies;

 return (
 <Card className="overflow-hidden border-border/50 bg-card">
 <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/10 pb-4">
  <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
    <div className="rounded-xl border border-border/60 bg-primary/10 p-2 shadow-sm">
      <Building2 className="h-5 w-5 text-primary" />
    </div>
    Company Management
  </CardTitle>
 <Button size="sm">
 <Plus className="mr-2 h-4 w-4" />
 Add Company
 </Button>
 </CardHeader>
 <CardContent className="p-5">
 <div className="grid gap-5 sm:grid-cols-2">
 {displayCompanies.length === 0 ? (
 <p className="text-sm text-muted-foreground">No companies found.</p>
 ) : displayCompanies.map((company) => (
  <div
    key={company.id}
    className="premium-muted space-y-4 rounded-xl border border-border/50 p-5 transition-all duration-300 hover:bg-card-hover hover:border-primary/30 hover:shadow-md"
  >
 <div className="flex items-start justify-between">
 <div>
 <h3 className="font-semibold">{company.name}</h3>
 <p className="text-sm text-muted-foreground">
 {company.industry}
 </p>
 </div>
  <Badge
    variant={company.status ==="upcoming" ?"default" :"secondary"}
    className={
      company.status ==="upcoming"
      ?"bg-primary/10 text-primary border-primary/20"
      :"bg-success/10 text-success border-success/20"
    }
  >
 {company.status ==="upcoming" ?"Upcoming" :"Completed"}
 </Badge>
 </div>

 <div className="grid grid-cols-2 gap-2 text-sm">
 <div className="flex items-center gap-1.5 text-muted-foreground">
 <MapPin className="h-3.5 w-3.5" />
 <span>{company.location}</span>
 </div>
 <div className="flex items-center gap-1.5 text-muted-foreground">
 <Users className="h-3.5 w-3.5" />
 <span>{company.positions} positions</span>
 </div>
 <div className="flex items-center gap-1.5 text-muted-foreground">
 <IndianRupee className="h-3.5 w-3.5" />
 <span>{company.package}</span>
 </div>
 <div className="flex items-center gap-1.5 text-muted-foreground">
 <Calendar className="h-3.5 w-3.5" />
 <span>{company.driveDate}</span>
 </div>
 </div>

 {company.status ==="completed" && company.hired && (
 <div className="border-t border-border/60 pt-2">
 <p className="text-sm">
 <span className="font-medium text-success">{company.hired}</span>
 <span className="text-muted-foreground">
 {""}
 students hired out of {company.positions} positions
 </span>
 </p>
 </div>
 )}

 <div className="flex gap-2 pt-2">
 <Button variant="outline" size="sm" className="flex-1 bg-transparent">
 View Details
 </Button>
 {company.status ==="upcoming" && (
 <Button size="sm" className="flex-1">
 Manage Drive
 </Button>
 )}
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 )
}
