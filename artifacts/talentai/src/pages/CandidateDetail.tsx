import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { useRoute, Link } from "wouter";
import {
  useGetCandidate, useGetCandidateResumeAnalysis,
  useGetCandidateMatchScore, getGetCandidateQueryKey, getGetCandidateResumeAnalysisQueryKey
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import ScoreBadge, { ScoreRing } from "@/components/ScoreBadge";
import { ArrowLeft, Mail, Phone, MapPin, GraduationCap, ChevronDown, UploadCloud } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CandidateDetail() {
  const [, params] = useRoute("/candidates/:id");
  const id = parseInt(params?.id ?? "0", 10);
  const [analysisOpen, setAnalysisOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: candidate, isLoading } = useGetCandidate(id, { query: { enabled: !!id, queryKey: getGetCandidateQueryKey(id) } });
  const { data: analysis, isLoading: analysisLoading } = useGetCandidateResumeAnalysis(id, {
    query: { enabled: !!id, queryKey: getGetCandidateResumeAnalysisQueryKey(id) }
  });

  if (isLoading) return <Layout><div className="p-8"><Skeleton className="h-64 w-full rounded-xl" /></div></Layout>;
  if (!candidate) return <Layout><div className="p-8 text-muted-foreground">Candidate not found</div></Layout>;

  const finalScore = candidate.finalScore ?? candidate.resumeScore;

  return (
    <Layout>
      <div className="p-8 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <Link href="/candidates">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Candidates
            </button>
          </Link>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-primary/20 text-primary hover:bg-primary/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Resume
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.docx"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const formData = new FormData();
              formData.append("file", file);
              try {
                const res = await fetch(`https://ai-resume-mk0l.onrender.com/api/candidates/${id}/upload-resume`, {
                  method: "POST",
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                  body: formData
                });
                if (!res.ok) throw new Error("Failed to upload resume");
                toast({ title: "Success", description: "Resume uploaded successfully" });
                window.location.reload();
              } catch (error: any) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
              }
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-xl text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/40 to-blue-500/30 flex items-center justify-center text-2xl font-bold text-primary mx-auto mb-4 border-2 border-primary/20">
                {candidate.name.charAt(0)}{candidate.name.split(" ")[1]?.charAt(0) ?? ""}
              </div>
              <h1 className="text-xl font-bold font-heading mb-1" data-testid="text-candidate-name">{candidate.name}</h1>
              {finalScore != null && (
                <div className="flex justify-center my-3">
                  <ScoreRing score={finalScore} size={80} />
                </div>
              )}
              <ScoreBadge score={finalScore} recommendation={candidate.recommendation} />

              <div className="mt-4 space-y-2 text-sm text-muted-foreground text-left">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0" /><span className="truncate">{candidate.email}</span></div>
                {candidate.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" />{candidate.phone}</div>}
                {candidate.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" />{candidate.location}</div>}
                {candidate.university && <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4 shrink-0" />{candidate.university}</div>}
              </div>
            </motion.div>

            {/* Score Breakdown */}
            {(candidate.resumeScore != null || candidate.interviewScore != null) && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-5 rounded-xl">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Score Breakdown</h3>
                {candidate.resumeScore != null && (
                  <ScoreBar label="Resume Score" value={candidate.resumeScore} weight="40%" color="bg-blue-500" />
                )}
                {candidate.interviewScore != null && (
                  <ScoreBar label="Interview Score" value={candidate.interviewScore} weight="60%" color="bg-violet-500" />
                )}
              </motion.div>
            )}

            {/* Skills */}
            {(candidate.skills?.length ?? 0) > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel p-5 rounded-xl">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills?.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">{s}</span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Analysis */}
          <div className="lg:col-span-2 space-y-5">
            {candidate.summary && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-panel p-6 rounded-xl">
                <h2 className="font-semibold mb-3">Summary</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{candidate.summary}</p>
              </motion.div>
            )}

            {/* AI Resume Analysis */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                onClick={() => setAnalysisOpen(p => !p)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-xs font-bold">AI</span>
                  </div>
                  <h2 className="font-semibold">AI Resume Analysis</h2>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${analysisOpen ? "rotate-180" : ""}`} />
              </button>

              {analysisOpen && (
                <div className="px-6 pb-6 space-y-4">
                  {analysisLoading ? <Skeleton className="h-48 w-full" /> : analysis ? (
                    <>
                      <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnalysisSection title="Strengths" items={analysis.strengths} color="text-emerald-400" dot="bg-emerald-500" />
                        <AnalysisSection title="Weaknesses" items={analysis.weaknesses} color="text-amber-400" dot="bg-amber-500" />
                        <AnalysisSection title="Missing Skills" items={analysis.missingSkills} color="text-red-400" dot="bg-red-500" />
                        <AnalysisSection title="Recommended Roles" items={analysis.recommendedRoles} color="text-blue-400" dot="bg-blue-500" />
                      </div>
                      <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                        <span className="text-sm text-muted-foreground">Hiring Recommendation:</span>
                        <ScoreBadge recommendation={analysis.hiringRecommendation} />
                      </div>
                    </>
                  ) : <p className="text-sm text-muted-foreground">No analysis available</p>}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ScoreBar({ label, value, weight, color }: { label: string; value: number; weight: string; color: string }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-muted-foreground">{label} <span className="text-xs opacity-60">({weight})</span></span>
        <span className="font-semibold">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function AnalysisSection({ title, items, color, dot }: { title: string; items: string[]; color: string; dot: string }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${color}`}>{title}</h4>
      <ul className="space-y-1.5">
        {items.map(item => (
          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dot}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

