// @ts-nocheck
import React from "react";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Video, Mic, CheckCircle, FileText, Brain } from "lucide-react";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetInterview, getGetInterviewQueryKey } from "@workspace/api-client-react";
import { Progress } from "@/components/ui/progress";

export default function InterviewReview() {
  const [, params] = useRoute("/interviews/:id/review");
  const id = parseInt(params?.id ?? "0", 10);

  const { data: interview, isLoading } = useGetInterview(id, { query: { enabled: !!id, queryKey: getGetInterviewQueryKey(id) } });

  if (isLoading) return <Layout><div className="p-8"><Skeleton className="h-[500px] w-full rounded-xl" /></div></Layout>;
  if (!interview) return <Layout><div className="p-8 text-white">Interview not found.</div></Layout>;

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <Link href="/interviews">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-white mb-6 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Interviews
          </button>
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-white mb-1">Interview Review: {interview.candidate?.name}</h1>
            <p className="text-muted-foreground">Applying for {interview.job?.title} • Session {interview.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">AI Overall Score</p>
              <p className="text-3xl font-bold text-primary">{interview.overallScore || "--"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Video and Transcript */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-1 rounded-xl overflow-hidden border border-white/10 shadow-xl shadow-black/50">
              {interview.videoUrl ? (
                <video 
                  src={`/${interview.videoUrl}`} 
                  controls 
                  className="w-full aspect-video rounded-lg object-cover bg-black"
                />
              ) : (
                <div className="w-full aspect-video flex flex-col items-center justify-center text-muted-foreground bg-black/40 rounded-lg">
                  <Video className="w-12 h-12 mb-4 opacity-50" />
                  <p>No video recorded yet.</p>
                </div>
              )}
            </div>

            <div className="glass-panel p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Groq Whisper Transcript
              </h3>
              {interview.transcript ? (
                <div className="p-4 bg-black/30 rounded-lg border border-white/5">
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "{interview.transcript}"
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Transcription pending or not available.</p>
              )}
            </div>
          </div>

          {/* Right Column: AI Analysis */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" /> Llama 3 Analysis
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">Technical Accuracy</span>
                    <span className="font-mono text-muted-foreground">{interview.technicalScore || 0}/100</span>
                  </div>
                  <Progress value={interview.technicalScore || 0} className="h-2 bg-white/10" indicatorClassName="bg-blue-500" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">Communication</span>
                    <span className="font-mono text-muted-foreground">{interview.communicationScore || 0}/100</span>
                  </div>
                  <Progress value={interview.communicationScore || 0} className="h-2 bg-white/10" indicatorClassName="bg-purple-500" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">Confidence & Delivery</span>
                    <span className="font-mono text-muted-foreground">{interview.confidenceScore || 0}/100</span>
                  </div>
                  <Progress value={interview.confidenceScore || 0} className="h-2 bg-white/10" indicatorClassName="bg-emerald-500" />
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">AI Notes</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {interview.aiNotes || "No AI notes generated yet."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
