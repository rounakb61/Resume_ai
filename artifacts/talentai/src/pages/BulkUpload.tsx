// @ts-nocheck
import React, { useState, useRef } from "react";
import { UploadCloud, FileType, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { customFetch } from "@workspace/api-client-react";

export default function BulkUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    setProgress(10);
    setResults(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      // We use customFetch to ensure auth headers are attached.
      // But fetch API doesn't support progress events easily, so we simulate it.
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 500);

      const response = await fetch("/api/candidates/bulk-upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      if (!response.ok) {
        throw new Error("Failed to upload resumes.");
      }

      const data = await response.json();
      setResults(data);
      setFiles([]);
      
      toast({
        title: "Upload Complete",
        description: `Successfully processed ${data.successful} out of ${data.total} candidates.`,
      });
    } catch (error: any) {
      setProgress(0);
      toast({
        title: "Upload Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (user?.role === "candidate") return null;

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2 text-white">Bulk Resume Upload</h1>
          <p className="text-muted-foreground">Upload multiple PDFs, DOCX, or CSV files. Our AI will automatically parse and create candidate profiles.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            <div 
              className={`glass-panel border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : 'hover:border-primary hover:bg-white/5'}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                multiple 
                accept=".pdf,.docx,.csv"
                onChange={handleFileSelect}
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <UploadCloud className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Drag & Drop Files Here</h3>
                  <p className="text-sm text-muted-foreground">Supports .pdf, .docx, and .csv files</p>
                </div>
                <Button variant="secondary" className="mt-4 pointer-events-none">
                  Browse Files
                </Button>
              </div>
            </div>

            {isUploading && (
              <div className="glass-panel p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Processing Resumes with Groq AI...</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>

          {/* Files List */}
          <div className="glass-panel p-6 h-fit">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
              Selected Files
              <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">{files.length}</span>
            </h3>
            
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No files selected</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileType className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm text-white truncate">{file.name}</span>
                    </div>
                    <button 
                      onClick={() => removeFile(i)}
                      className="text-muted-foreground hover:text-red-400 p-1"
                      disabled={isUploading}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <Button 
                onClick={handleUpload} 
                disabled={files.length === 0 || isUploading}
                className="w-full"
              >
                {isUploading ? "Uploading..." : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Parsing Results</h2>
              <div className="flex gap-4 text-sm font-medium">
                <span className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> {results.successful} Success</span>
                <span className="text-red-400 flex items-center gap-1"><XCircle className="w-4 h-4" /> {results.failed} Failed</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                  <tr>
                    <th className="px-6 py-3 rounded-tl-lg">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Experience</th>
                    <th className="px-6 py-3">Skills Extracted</th>
                    <th className="px-6 py-3 rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.candidates?.map((c: any, i: number) => (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                      <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{c.email}</td>
                      <td className="px-6 py-4">{c.experience} yrs</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {c.skills?.slice(0, 3).map((s: string, j: number) => (
                            <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">{s}</span>
                          ))}
                          {c.skills?.length > 3 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">+{c.skills.length - 3}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">Success</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
