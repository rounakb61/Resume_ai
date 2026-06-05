import React, { useState, useRef, useEffect } from "react";
import { useRoute } from "wouter";
import { Video, Mic, StopCircle, Play, CheckCircle2, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGetInterview, getGetInterviewQueryKey } from "@workspace/api-client-react";

export default function VideoInterview() {
  const [, params] = useRoute("/video-interview/:id");
  const id = parseInt(params?.id ?? "0", 10);
  const { toast } = useToast();

  const { data: interview, isLoading } = useGetInterview(id, { query: { enabled: !!id, queryKey: getGetInterviewQueryKey(id) } });

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup stream on unmount
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true; // Mute local playback to avoid echo
      }
    } catch (err: any) {
      toast({
        title: "Camera Error",
        description: "Could not access camera and microphone. Please grant permissions.",
        variant: "destructive",
      });
    }
  };

  const startRecording = () => {
    if (!stream) return;
    
    setRecordedChunks([]);
    setVideoUrl(null);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        setRecordedChunks((prev) => [...prev, e.data]);
      }
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop the stream tracks so the light turns off
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  useEffect(() => {
    if (!isRecording && recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.muted = false; // Allow candidate to hear their recording
      }
    }
  }, [isRecording, recordedChunks]);

  const submitVideo = async () => {
    if (recordedChunks.length === 0) return;
    setIsUploading(true);

    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const formData = new FormData();
    formData.append("file", blob, "interview.webm");

    try {
      const res = await fetch(`https://ai-resume-mk0l.onrender.com/api/interviews/${id}/upload-video`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      
      toast({
        title: "Success",
        description: "Video interview submitted and analyzed successfully!",
      });

      // Simple redirect
      setTimeout(() => window.location.href = "/", 2000);

    } catch (error: any) {
      toast({
        title: "Submission Error",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  if (isLoading) return <Layout><div className="p-8 text-white">Loading...</div></Layout>;
  if (!interview) return <Layout><div className="p-8 text-white">Interview not found.</div></Layout>;

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Video Interview</h1>
          <p className="text-muted-foreground">Please record your answer to the question below.</p>
        </div>

        <div className="glass-panel p-8 text-center bg-primary/5 border border-primary/20 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-4">"Describe a challenging technical problem you solved recently and your approach to solving it."</h2>
          <p className="text-muted-foreground">You have up to 3 minutes to answer. Ensure you are in a quiet room with good lighting.</p>
        </div>

        <div className="glass-panel p-6 rounded-xl space-y-6">
          <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
            {!stream && !videoUrl && !isRecording && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Video className="w-8 h-8 text-muted-foreground" />
                </div>
                <Button onClick={startCamera}>Enable Camera & Mic</Button>
              </div>
            )}
            
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              controls={!!videoUrl}
              className={`w-full h-full object-cover ${(stream || videoUrl) ? 'block' : 'hidden'}`}
            />

            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-red-500/30">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium text-white">Recording...</span>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4">
            {stream && !isRecording && !videoUrl && (
              <Button size="lg" onClick={startRecording} className="bg-red-500 hover:bg-red-600 text-white gap-2">
                <Mic className="w-5 h-5" /> Start Recording
              </Button>
            )}

            {isRecording && (
              <Button size="lg" variant="destructive" onClick={stopRecording} className="gap-2">
                <StopCircle className="w-5 h-5" /> Stop Recording
              </Button>
            )}

            {videoUrl && !isRecording && (
              <>
                <Button size="lg" variant="outline" onClick={startCamera} disabled={isUploading}>
                  Retake Video
                </Button>
                <Button size="lg" onClick={submitVideo} disabled={isUploading} className="gap-2">
                  <CheckCircle2 className="w-5 h-5" /> 
                  {isUploading ? "Uploading..." : "Submit Answer"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

