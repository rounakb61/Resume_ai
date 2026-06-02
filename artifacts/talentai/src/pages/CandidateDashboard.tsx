import CandidateLayout from "@/components/CandidateLayout";
import { motion } from "framer-motion";
import { Briefcase, Clock, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useListApplications, useListInterviews } from "@workspace/api-client-react";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const statusColor: Record<string, string> = {
  applied: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  shortlisted: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  interviewing: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  hired: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function CandidateDashboard() {
  const candidateIdStr = localStorage.getItem("candidateId");
  const candidateId = candidateIdStr ? parseInt(candidateIdStr, 10) : undefined;

  const { data: applications } = useListApplications(candidateId ? { candidateId } : undefined);
  const { data: interviews } = useListInterviews(candidateId ? { candidateId } : undefined);

  const stats = [
    { label: "Active Applications", value: applications?.length || 0, icon: Briefcase, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Pending Interviews", value: interviews?.length || 0, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Offers Received", value: applications?.filter(a => a.status === 'hired').length || 0, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <CandidateLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">Here is the status of your current applications.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="glass-panel p-5 rounded-xl"
            >
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className={`text-2xl font-bold font-heading ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Recent Applications */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-panel p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold font-heading">Recent Applications</h2>
            <Link href="/my-applications">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {!applications || applications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No applications found. Time to find your next role!</p>
            ) : (
              applications.slice(0, 3).map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div>
                    <h3 className="font-medium">{app.job?.title || "Unknown Job"}</h3>
                    <p className="text-sm text-muted-foreground">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor[app.status] || statusColor.applied}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </CandidateLayout>
  );
}
