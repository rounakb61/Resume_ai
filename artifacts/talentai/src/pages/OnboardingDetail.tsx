import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { useRoute, Link } from "wouter";
import { 
  useGetOnboarding, 
  useUpdateOnboarding, 
  getGetOnboardingQueryKey, 
  useGetOnboardingDocuments, 
  getGetOnboardingDocumentsQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, Circle, DollarSign, Calendar, FileText, Download, UploadCloud } from "lucide-react";
import { useState } from "react";

const CHECKLIST_ITEMS = [
  { key: "offerAccepted" as const, label: "Offer Accepted", description: "Candidate has formally accepted the job offer" },
  { key: "documentsUploaded" as const, label: "Documents Uploaded", description: "ID, degree certificate, and required docs submitted" },
  { key: "verificationComplete" as const, label: "Verification Complete", description: "Background check and document verification done" },
  { key: "trainingAssigned" as const, label: "Training Assigned", description: "Onboarding training modules assigned and scheduled" },
];

export default function OnboardingDetail() {
  const [, params] = useRoute("/onboarding/:id");
  const id = parseInt(params?.id ?? "0", 10);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: onboarding, isLoading } = useGetOnboarding(id, { query: { enabled: !!id, queryKey: getGetOnboardingQueryKey(id) } });
  const { data: documents, isLoading: isDocsLoading } = useGetOnboardingDocuments(id, { query: { enabled: !!id, queryKey: getGetOnboardingDocumentsQueryKey(id) } });
  const updateOnboarding = useUpdateOnboarding();

  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingOffer, setIsGeneratingOffer] = useState(false);

  const handleToggle = (key: typeof CHECKLIST_ITEMS[number]["key"]) => {
    if (!onboarding) return;
    const current = onboarding[key];
    updateOnboarding.mutate({ id, data: { [key]: !current } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetOnboardingQueryKey(id) });
        toast({ title: `${key} updated` });
      },
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`https://ai-resume-mk0l.onrender.com/api/onboarding/${id}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload document");

      toast({ title: "Document uploaded successfully" });
      queryClient.invalidateQueries({ queryKey: getGetOnboardingDocumentsQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: getGetOnboardingQueryKey(id) });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleGenerateOffer = async () => {
    setIsGeneratingOffer(true);
    try {
      const res = await fetch(`https://ai-resume-mk0l.onrender.com/api/onboarding/${id}/generate-offer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!res.ok) throw new Error("Failed to generate offer letter");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `Offer_Letter_${onboarding?.candidate?.name?.replace(/\s+/g, '_') || 'Candidate'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({ title: "Offer letter downloaded successfully" });
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setIsGeneratingOffer(false);
    }
  };

  if (isLoading) return <Layout><div className="p-8"><Skeleton className="h-64 w-full rounded-xl" /></div></Layout>;
  if (!onboarding) return <Layout><div className="p-8 text-muted-foreground">Record not found</div></Layout>;

  const completed = CHECKLIST_ITEMS.filter(i => onboarding[i.key]).length;
  const total = CHECKLIST_ITEMS.length;
  const percent = Math.round((completed / total) * 100);

  return (
    <Layout>
      <div className="p-8 max-w-3xl">
        <Link href="/onboarding">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Onboarding
          </button>
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-xl mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold">
              {onboarding.candidate?.name?.charAt(0) ?? "?"}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold font-heading">{onboarding.candidate?.name ?? `Candidate #${onboarding.candidateId}`}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">{onboarding.job?.title ?? `Job #${onboarding.jobId}`}</p>
              <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                {onboarding.salary && (
                  <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />${onboarding.salary.toLocaleString()}/yr</span>
                )}
                {onboarding.joiningDate && (
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Joins {new Date(onboarding.joiningDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <Button onClick={handleGenerateOffer} disabled={isGeneratingOffer} className="gap-2 shrink-0">
                <FileText className="w-4 h-4" />
                {isGeneratingOffer ? "Generating..." : "Generate Offer Letter"}
              </Button>
              <div className="text-right">
                <div className={`text-3xl font-bold font-heading ${percent === 100 ? "text-emerald-400" : "text-primary"}`}>{percent}%</div>
                <div className="text-xs text-muted-foreground">{completed}/{total} done</div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5 h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${percent === 100 ? "bg-emerald-500" : "bg-primary"}`}
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Checklist */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-xl space-y-4">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Onboarding Checklist</h2>
            {CHECKLIST_ITEMS.map((item, i) => {
              const done = onboarding[item.key];
              
              // If it's documentsUploaded, make it visual only (auto-toggled by document upload)
              if (item.key === "documentsUploaded") {
                return (
                  <div key={item.key} className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    done ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/5 bg-white/5 opacity-70"
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${done ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {done ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className={`font-medium text-sm ${done ? "text-emerald-400" : ""}`}>{item.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Auto-updated via uploads</div>
                    </div>
                  </div>
                );
              }

              return (
                <motion.button
                  key={item.key}
                  onClick={() => handleToggle(item.key)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    done
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-white/5 bg-white/5 hover:bg-white/10"
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  data-testid={`checklist-${item.key}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    done ? "text-emerald-400" : "text-muted-foreground"
                  }`}>
                    {done ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className={`font-medium text-sm ${done ? "text-emerald-400 line-through opacity-80" : ""}`}>{item.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Documents */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Documents</h2>
              <div className="relative">
                <input 
                  type="file" 
                  onChange={handleFileUpload} 
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                />
                <Button size="sm" variant="outline" className="gap-2 pointer-events-none">
                  <UploadCloud className="w-4 h-4" />
                  {isUploading ? "Uploading..." : "Upload File"}
                </Button>
              </div>
            </div>

            {isDocsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ) : !documents || documents.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-white/10 rounded-lg text-muted-foreground">
                <UploadCloud className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 rounded-md bg-primary/20 text-primary">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" title={doc.fileName}>{doc.fileName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <a href={`/${doc.fileUrl}`} download target="_blank" rel="noreferrer">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {onboarding.notes && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-5 rounded-xl mt-6">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Notes</h3>
            <p className="text-sm text-muted-foreground">{onboarding.notes}</p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}

