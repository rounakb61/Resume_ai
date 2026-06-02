import CandidateLayout from "@/components/CandidateLayout";
import { FileText, Building2, MapPin, Clock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useListApplications } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const statusColor: Record<string, string> = {
  applied: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  shortlisted: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  interviewing: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  hired: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function CandidateApplications() {
  const candidateIdStr = localStorage.getItem("candidateId");
  const candidateId = candidateIdStr ? parseInt(candidateIdStr, 10) : undefined;
  
  const { data: applications, isLoading } = useListApplications(candidateId ? { candidateId } : undefined);

  return (
    <CandidateLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading">My Applications</h1>
            <p className="text-muted-foreground mt-1">Track the status of your submitted applications</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : !applications || applications.length === 0 ? (
          <div className="glass-panel p-16 rounded-xl text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No applications found</p>
            <p className="text-sm mb-6">You haven't applied to any jobs yet. Start exploring open positions.</p>
            <Link href="/find-jobs">
              <Button>Find Jobs</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="glass-panel p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{app.job?.title || "Unknown Job"}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    {app.job?.location && (
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{app.job.location}</span>
                    )}
                    {app.job?.employmentType && (
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{app.job.employmentType}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${statusColor[app.status] || statusColor.applied}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CandidateLayout>
  );
}
