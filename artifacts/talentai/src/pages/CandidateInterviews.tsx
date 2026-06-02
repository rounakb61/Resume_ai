import CandidateLayout from "@/components/CandidateLayout";
import { Calendar, Video } from "lucide-react";
import { useListInterviews } from "@workspace/api-client-react";

export default function CandidateInterviews() {
  const candidateIdStr = localStorage.getItem("candidateId");
  const candidateId = candidateIdStr ? parseInt(candidateIdStr, 10) : undefined;
  
  const { data: interviews, isLoading } = useListInterviews(candidateId ? { candidateId } : undefined);

  return (
    <CandidateLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading">My Interviews</h1>
            <p className="text-muted-foreground mt-1">Manage your upcoming and past interviews</p>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-24 bg-white/5 rounded-xl"></div>
          </div>
        ) : !interviews || interviews.length === 0 ? (
          <div className="glass-panel p-16 rounded-xl text-center text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No upcoming interviews</p>
            <p className="text-sm">You have no interviews scheduled at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map(interview => (
              <div key={interview.id} className="glass-panel p-6 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{interview.job?.title || "Unknown Role"}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scheduled for: {new Date(interview.scheduledAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs border ${
                    interview.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  }`}>
                    {interview.status}
                  </span>
                  {interview.status === 'scheduled' && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                      <Video className="w-4 h-4" />
                      Join Call
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CandidateLayout>
  );
}
