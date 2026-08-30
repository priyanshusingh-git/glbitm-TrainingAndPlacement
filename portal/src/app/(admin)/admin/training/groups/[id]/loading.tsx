import { LoadingTable } from "@/components/ui/loading-states";

export default function GroupDetailLoading() {
  return (
    <div className="space-y-6 animate-fade-up pb-12">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted/60" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted/40" />
      </div>
      <LoadingTable rows={6} cols={5} />
    </div>
  );
}
