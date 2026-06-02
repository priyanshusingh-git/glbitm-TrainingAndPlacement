"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flag, Loader2 } from "lucide-react";
import { fetchBootcamps } from "@/services/training.client";
import { Bootcamp } from "@/types/training"; // Ensure this path is correct
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/page-header";

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

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-up stagger-1">
      <PageHeader
        title="Bootcamps"
        description="Intensive training programs to accelerate your skills."
      />

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

      {bootcamps.length === 0 && (
        <div className="text-center py-12 border rounded-md bg-muted/10">
          <p className="text-muted-foreground">No upcoming bootcamps found.</p>
        </div>
      )}
    </div>
  );
}
