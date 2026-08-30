"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flag, GraduationCap, Loader2 } from "lucide-react";
import { fetchBootcamps } from "@/services/training.client";
import { Bootcamp } from "@/types/training"; // Ensure this path is correct
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/page-header";
import { EnhancedEmpty } from "@/components/ui/enhanced-empty";
import { LoadingGrid } from "@/components/ui/loading-states";

export default function StudentBootcampsPage() {
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBootcamps();
  }, []);

  const loadBootcamps = async () => {
    try {
      const data = await fetchBootcamps();
      setBootcamps(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-up stagger-1">
      <PageHeader
        title="Bootcamps"
        description="Intensive training programs to accelerate your skills."
      />

      {loading ? (
        <LoadingGrid items={6} />
      ) : bootcamps.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bootcamps.map((bootcamp) => (
            <Card key={bootcamp.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="bg-brown-800/10 text-brown-800 border-brown-800/20">
                    Upcoming
                  </Badge>
                  <Flag className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="mt-2 line-clamp-1">{bootcamp.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(bootcamp.date), "PPP")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {bootcamp.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EnhancedEmpty
          icon={GraduationCap}
          title="No Bootcamps Available"
          description="Intensive training bootcamps will appear here once scheduled by the T&P office."
          variant="illustrated"
        />
      )}
    </div>
  );
}
