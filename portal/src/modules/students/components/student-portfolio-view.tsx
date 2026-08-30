import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ExternalLink, Github, Trophy, Award, Code, FolderGit2 } from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { EnhancedEmpty } from "@/components/ui/enhanced-empty";

interface StudentPortfolioViewProps {
  studentId: string;
}

export function StudentPortfolioView({ studentId }: StudentPortfolioViewProps) {
  const [activeTab, setActiveTab] = useState("coding");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({
    codingProfiles: [],
    projects: [],
    hackathons: [],
    certifications: []
  });

  useEffect(() => {
    if (studentId) {
      fetchAllData();
    }
  }, [studentId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [coding, projects, hackathons, certs] = await Promise.all([
        api.get(`/portfolio/coding-profiles?studentId=${studentId}`),
        api.get(`/portfolio/projects?studentId=${studentId}`),
        api.get(`/portfolio/hackathons?studentId=${studentId}`),
        api.get(`/portfolio/certifications?studentId=${studentId}`)
      ]);
      setData({
        codingProfiles: Array.isArray(coding) ? coding : [],
        projects: Array.isArray(projects) ? projects : [],
        hackathons: Array.isArray(hackathons) ? hackathons : [],
        certifications: Array.isArray(certs) ? certs : []
      });
    } catch (error) {
      console.error("Failed to fetch portfolio data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full h-auto min-h-0 justify-start rounded-md border border-border/70 bg-card p-1 mb-6 flex overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-1 shadow-xs scroll-smooth shrink-0 sm:grid sm:grid-cols-4">
          <TabsTrigger
            value="coding"
            className="group h-auto flex-1 min-w-[120px] sm:min-w-0 rounded-sm px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all duration-200 data-[state=active]:bg-brown-800 data-[state=active]:text-cream data-[state=active]:shadow-xs hover:bg-muted/50 hover:text-foreground shrink-0 sm:shrink flex items-center justify-center gap-2"
          >
            <Code className="h-4 w-4 shrink-0 text-muted-foreground group-data-[state=active]:text-amber-300 transition-colors" />
            <span className="truncate">Coding ({data.codingProfiles.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            className="group h-auto flex-1 min-w-[120px] sm:min-w-0 rounded-sm px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all duration-200 data-[state=active]:bg-brown-800 data-[state=active]:text-cream data-[state=active]:shadow-xs hover:bg-muted/50 hover:text-foreground shrink-0 sm:shrink flex items-center justify-center gap-2"
          >
            <FolderGit2 className="h-4 w-4 shrink-0 text-muted-foreground group-data-[state=active]:text-amber-300 transition-colors" />
            <span className="truncate">Projects ({data.projects.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="hackathons"
            className="group h-auto flex-1 min-w-[120px] sm:min-w-0 rounded-sm px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all duration-200 data-[state=active]:bg-brown-800 data-[state=active]:text-cream data-[state=active]:shadow-xs hover:bg-muted/50 hover:text-foreground shrink-0 sm:shrink flex items-center justify-center gap-2"
          >
            <Trophy className="h-4 w-4 shrink-0 text-muted-foreground group-data-[state=active]:text-amber-300 transition-colors" />
            <span className="truncate">Hackathons ({data.hackathons.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="certs"
            className="group h-auto flex-1 min-w-[120px] sm:min-w-0 rounded-sm px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all duration-200 data-[state=active]:bg-brown-800 data-[state=active]:text-cream data-[state=active]:shadow-xs hover:bg-muted/50 hover:text-foreground shrink-0 sm:shrink flex items-center justify-center gap-2"
          >
            <Award className="h-4 w-4 shrink-0 text-muted-foreground group-data-[state=active]:text-amber-300 transition-colors" />
            <span className="truncate">Certs ({data.certifications.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coding" className="mt-4">
          {data.codingProfiles.length === 0 ? (
            <EnhancedEmpty
              icon={Code}
              title="No Coding Profiles Found"
              description="No connected coding profiles available for this student."
              variant="illustrated"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {data.codingProfiles.map((p: any) => {
                const stats = JSON.parse(p.statsJSON || '{}');
                return (
                  <Card key={p.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex justify-between">
                        {p.platform}
                        {p.profileUrl && (
                          <a href={p.profileUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-brown-800">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </CardTitle>
                      <CardDescription>@{p.username}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm font-medium">Solved: {stats.totalSolved || 0}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Easy: {stats.easy} • Med: {stats.medium} • Hard: {stats.hard}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          {data.projects.length === 0 ? (
            <EnhancedEmpty
              icon={FolderGit2}
              title="No Projects Added"
              description="No portfolio projects listed for this student."
              variant="illustrated"
            />
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {data.projects.map((p: any) => (
                  <Card key={p.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{p.title}</CardTitle>
                          <Badge variant="outline" className="mt-1">{p.status}</Badge>
                        </div>
                        <div className="flex gap-2">
                          {p.githubLink && <a href={p.githubLink} target="_blank" rel="noreferrer"><Github className="h-4 w-4" /></a>}
                          {p.liveLink && <a href={p.liveLink} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {p.techStack.map((t: string) => (
                          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="hackathons" className="mt-4">
          {data.hackathons.length === 0 ? (
            <EnhancedEmpty
              icon={Trophy}
              title="No Hackathons Found"
              description="No hackathon participation recorded for this student."
              variant="illustrated"
            />
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {data.hackathons.map((h: any) => (
                  <Card key={h.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-base">{h.name}</CardTitle>
                        {h.position !== "Participant" && (
                          <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-0">
                            <Trophy className="w-3 h-3 mr-1" /> {h.position}
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{format(new Date(h.date), "MMM yyyy")} • {h.organizer}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium mb-1">{h.problemStatement}</p>
                      <p className="text-xs text-muted-foreground mb-2">Role: {h.role || "Member"}</p>
                      <div className="flex flex-wrap gap-1">
                        {h.techStack.map((t: string) => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="certs" className="mt-4">
          {data.certifications.length === 0 ? (
            <EnhancedEmpty
              icon={Award}
              title="No Certifications Found"
              description="No skill certifications recorded for this student."
              variant="illustrated"
            />
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid gap-4 md:grid-cols-2">
                {data.certifications.map((c: any) => (
                  <Card key={c.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{c.title}</CardTitle>
                      <CardDescription>{c.issuer}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-2">Issued: {format(new Date(c.issueDate), "MMM yyyy")}</p>
                      {c.credentialUrl && (
                        <Button variant="link" size="sm" asChild className="px-0 h-auto">
                          <a href={c.credentialUrl} target="_blank" rel="noreferrer">View Credential</a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
