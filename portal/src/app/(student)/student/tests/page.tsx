"use client";

import { useEffect, useState } from"react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card";
import { Badge } from"@/components/ui/badge";
import { Button } from"@/components/ui/button";
import { fetchMyResults, fetchTests } from"@/services/training.client";
import { Test, TestResult } from"@/types/training";
import { Loader2, Calendar, Clock, CheckCircle2, AlertCircle, PlayCircle, ExternalLink } from"lucide-react";
import { format, isAfter, isBefore, addMinutes } from"date-fns";
import { useToast } from"@/components/ui/use-toast";

export default function StudentTestsPage() {
 const [results, setResults] = useState<TestResult[]>([]);
 const [upcomingTests, setUpcomingTests] = useState<Test[]>([]);
 const [loading, setLoading] = useState(true);
 const { toast } = useToast();

 useEffect(() => {
 loadData();
 }, []);

 const loadData = async () => {
 try {
 const [resultsData, testsData] = await Promise.all([
 fetchMyResults(),
 fetchTests()
 ]);
 setResults(resultsData);

 // Filter upcoming or ongoing tests
 const now = new Date();
 const relevantTests = testsData.filter(test => {
 const testDate = new Date(test.date);
 const endDate = addMinutes(testDate, test.duration);
 // Return tests that haven't ended yet
 return isAfter(endDate, now);
 });

 // Sort by date ascending (soonest first)
 relevantTests.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

 setUpcomingTests(relevantTests);

 } catch (error) {
 console.error(error);
 toast({
 variant:"destructive",
 title:"Error",
 description:"Failed to load test data"
 });
 } finally {
 setLoading(false);
 }
 };

 const getTestStatus = (test: Test) => {
 const now = new Date();
 const testDate = new Date(test.date);
 const endDate = addMinutes(testDate, test.duration);

 if (isAfter(testDate, now)) return"Scheduled";
 if (isBefore(endDate, now)) return"Completed";
 return"Ongoing";
 };

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
 <Loader2 className="h-8 w-8 animate-spin text-brown-800" />
 <p className="text-sm text-muted-foreground animate-pulse">Loading assessments...</p>
 </div>
 );
 }

 return (
 <div className="space-y-6 animate-in fade-in duration-500">
 <div>
 <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Tests & Results</h1>
 <p className="text-muted-foreground">View your performance and upcoming assessments.</p>
 </div>

 <div className="grid gap-6 lg:grid-cols-3">
 {/* UPCOMING & ONGOING TESTS */}
 <div className="lg:col-span-1 space-y-6">
 <Card className="border-brown-800/20 bg-brown-800/5 shadow-sm">
 <CardHeader className="pb-3 border-b border-brown-800/10">
 <CardTitle className="text-lg flex items-center gap-2">
 <PlayCircle className="h-5 w-5 text-brown-800" /> Active & Upcoming
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4 pt-4">
 {upcomingTests.length === 0 ? (
 <div className="text-center py-6">
 <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
 <p className="text-sm text-muted-foreground">No active assessments scheduled.</p>
 </div>
 ) : (
 upcomingTests.map(test => {
 const status = getTestStatus(test);
 const isOngoing = status ==="Ongoing";

 return (
 <div key={test.id} className="group bg-background border rounded-xl p-4 shadow-sm hover:border-brown-800/50 transition-all">
 <div className="flex justify-between items-start mb-2">
 <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
 {test.type}
 </Badge>
 <Badge className={`${isOngoing
 ?"bg-indigo-500 hover:bg-indigo-600 animate-pulse"
 :"bg-amber-500 hover:bg-amber-600"
 } text-[10px] font-bold uppercase transition-all`}>
 {status}
 </Badge>
 </div>

 <h4 className="font-bold text-base group-hover:text-brown-800 transition-colors">{test.title}</h4>

 <div className="text-xs text-muted-foreground space-y-2 mt-3 p-3 bg-muted/30 rounded-lg">
 <div className="flex items-center justify-between">
 <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Date</span>
 <span className="font-medium text-foreground">{format(new Date(test.date),"PPP")}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Time</span>
 <span className="font-medium text-foreground">{format(new Date(test.date),"p")}</span>
 </div>
 <div className="flex items-center justify-between border-t border-dashed border-muted-foreground/20 pt-2">
 <span className="flex items-center gap-1.5 text-brown-800"><PlayCircle className="h-3.5 w-3.5" /> Duration</span>
 <span className="font-bold text-foreground">{test.duration} mins</span>
 </div>
 </div>

 <Button
 className={`w-full mt-4 min-h-[44px] font-bold transition-all ${isOngoing
 ?"bg-brown-800 shadow-lg shadow-primary/20 hover:scale-[1.02]"
 :"bg-muted text-muted-foreground hover:bg-muted"
 }`}
 onClick={() => {
 if (!isOngoing) return;
 if (test.testUrl) {
 window.open(test.testUrl, '_blank');
 } else if ((test as any).questions?.length > 0 || (test as any)._count?.questions > 0) {
 window.location.href = `/student/tests/${test.id}`;
 }
 }}
 disabled={!isOngoing}
 >
 {isOngoing ? (
 <>Start Assessment <PlayCircle className="ml-2 h-4 w-4" /></>
 ) : (
"Not Started Yet"
 )}
 </Button>

 {test.platform && (
 <p className="text-[10px] text-center mt-2 text-muted-foreground uppercase font-bold tracking-widest">
 Platform: <span className="text-brown-800">{test.platform}</span>
 </p>
 )}
 </div>
 );
 })
 )}
 </CardContent>
 </Card>
 </div>

 {/* TEST RESULTS */}
 <div className="lg:col-span-2 space-y-6">
 <Card className="shadow-sm">
 <CardHeader className="pb-3 border-b bg-muted/10">
 <CardTitle className="text-xl">History & Performance</CardTitle>
 <CardDescription>Review your past assessment scores and feedback.</CardDescription>
 </CardHeader>
 <CardContent className="pt-6">
 <div className="space-y-4">
 {results.length === 0 ? (
 <div className="text-center py-12 border border-dashed rounded-xl bg-muted/5">
 <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
 <h3 className="font-semibold text-lg">No results yet</h3>
 <p className="text-muted-foreground max-w-xs mx-auto text-sm">
 As you complete assessments, your results and performance metrics will appear here.
 </p>
 </div>
 ) : (
 results.map((result) => {
 const passingScore = (result.test?.totalMarks || 100) * 0.4;
 const isPassed = result.marksObtained >= passingScore;

 return (
 <div key={result.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-5 rounded-xl hover:shadow-md hover:border-brown-800/20 transition-all bg-card/50 backdrop-blur-sm">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <h4 className="font-bold text-lg">{result.test?.title ||"Unknown Test"}</h4>
 <Badge variant="outline" className="text-[10px]">{result.test?.type}</Badge>
 </div>
 <p className="text-sm text-muted-foreground flex items-center gap-2">
 <Calendar className="h-3 w-3" />
 {result.test ? format(new Date(result.test.date),"PPP") :"N/A"}
 </p>
 {result.remarks && (
 <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground italic border-l-2 border-brown-800/30">
"{result.remarks}"
 </div>
 )}
 </div>
 <div className="flex items-center gap-6">
 <div className="text-right">
 <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Your Score</p>
 <p className="font-black text-2xl text-brown-800">
 {result.marksObtained}
 <span className="text-sm font-normal text-muted-foreground ml-1">/ {result.test?.totalMarks}</span>
 </p>
 </div>
 <Badge
 className={`h-10 px-4 text-xs font-black uppercase tracking-widest ${isPassed
 ?"bg-emerald-500 hover:bg-emerald-600 text-white"
 :"bg-destructive hover:bg-destructive/90 text-white"
 }`}
 >
 {isPassed ?"Passed" :"Failed"}
 </Badge>
 </div>
 </div>
 );
 })
 )}
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 </div>
 );
}
