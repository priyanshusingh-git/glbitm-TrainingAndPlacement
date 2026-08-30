import { LoadingProfile } from "@/components/ui/loading-states";

export default function StudentProfileLoading() {
  return (
    <div className="space-y-6 animate-fade-up pb-12">
      <div className="h-10 w-24 animate-pulse rounded-md bg-muted/60" />
      <LoadingProfile />
    </div>
  );
}
