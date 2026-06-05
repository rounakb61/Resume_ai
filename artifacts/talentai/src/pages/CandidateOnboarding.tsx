// @ts-nocheck
import CandidateLayout from "@/components/CandidateLayout";
import { motion } from "framer-motion";
import { FileText, UploadCloud, CheckCircle, Clock } from "lucide-react";
import { useListOnboardings, useGetOnboardingDocuments, getGetOnboardingDocumentsQueryKey, getListOnboardingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const CHECKLIST_ITEMS = [
  { key: "offerAccepted", label: "Offer Accepted", description: "You have formally accepted the job offer" },
  { key: "documentsUploaded", label: "Documents Uploaded", description: "ID, degree certificate, and required docs submitted" },
  { key: "verificationComplete", label: "Verification Complete", description: "Background check and document verification done by HR" },
  { key: "trainingAssigned", label: "Training Assigned", description: "Onboarding training modules assigned and scheduled" },
];

export default function CandidateOnboarding() {
  const candidateIdStr = localStorage.getItem("candidateId");
  const candidateId = candidateIdStr ? parseInt(candidateIdStr, 10) : undefined;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: onboardings, isLoading } = useListOnboardings(candidateId ? { candidateId } : undefined, { query: { enabled: !!candidateId } });
  
  // Find the active onboarding (first one for now, usually a candidate only has 1 active onboarding at a time)
  const activeOnboarding = onboardings && onboardings.length > 0 ? onboardings[0] : null;
  const onboardingId = activeOnboarding?.id;

  const { data: documents, isLoading: isDocsLoading } = useGetOnboardingDocuments(onboardingId as number, { query: { enabled: !!onboardingId, queryKey: getGetOnboardingDocumentsQueryKey(onboardingId as number) } });

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !onboardingId) return;
    setIsUploading(true);
    
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/onboarding/${onboardingId}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload document");

      toast({ title: "Document uploaded successfully" });
      queryClient.invalidateQueries({ queryKey: getGetOnboardingDocumentsQueryKey(onboardingId) });
      queryClient.invalidateQueries({ queryKey: getListOnboardingsQueryKey() });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  if (isLoading) {
    return (
      <CandidateLayout>
        <div className="p-8 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </CandidateLayout>
    );
  }

  if (!activeOnboarding) {
    return (
      <CandidateLayout>
        <div className="p-8">
          <div className="glass-panel p-12 rounded-xl text-center flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-2xl font-bold font-heading mb-2">No Active Onboarding</h2>
            <p className="text-muted-foreground max-w-md">
              You don't have any active onboarding processes right now. Once you receive and accept a job offer, your onboarding checklist will appear here!
            </p>
          </div>
        </div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading">Your Onboarding Journey</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to the team! Complete your required checklist items to get ready for day one.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checklist */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" /> Onboarding Checklist
            </h2>
            <div className="space-y-6">
              {CHECKLIST_ITEMS.map((item, idx) => {
                const isComplete = activeOnboarding[item.key as keyof typeof activeOnboarding];
                return (
                  <div key={item.key} className="flex gap-4">
                    <div className="mt-1">
                      {isComplete ? (
                        <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-success" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className={`font-medium ${isComplete ? "text-success" : ""}`}>{item.label}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Document Upload */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-2">Required Documents</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Please upload the following documents to complete your verification:
                <br />• Identity Proof (Passport, Driver's License, National ID)
                <br />• Degree Certificates / Transcripts
                <br />• Signed Offer Letter
                <br />• Tax / Payroll Forms
              </p>

              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-black/20">
                <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">Upload your documents</h3>
                <p className="text-sm text-muted-foreground mb-4">PDF, JPG, or PNG up to 10MB</p>
                <div className="relative">
                  <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                    title="Upload document"
                  />
                  <Button disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Select File"}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Uploaded Documents List */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Uploaded Documents</h2>
              
              {isDocsLoading ? (
                <div className="space-y-3">
                  <div className="h-12 bg-white/5 animate-pulse rounded-lg"></div>
                  <div className="h-12 bg-white/5 animate-pulse rounded-lg"></div>
                </div>
              ) : !documents || documents.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm border border-white/5 rounded-lg bg-black/10">
                  No documents uploaded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{doc.fileName}</p>
                          <p className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <a href={`/${doc.fileUrl}`} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm">View</Button>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </CandidateLayout>
  );
}
