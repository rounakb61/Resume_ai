import { useState } from "react";
import { useCreateCandidate, useCreateApplication, getListCandidatesQueryKey, getListApplicationsQueryKey, getGetRankedApplicationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function CandidateApplyModal({ jobId, open, onOpenChange }: { jobId: number, open: boolean, onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createCandidate = useCreateCandidate();
  const createApplication = useCreateApplication();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !experience || !skills) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    try {
      // 1. Create the Candidate Profile
      // @ts-ignore
  const candidateResponse = await createCandidate.mutateAsync({ data: {
        name,
        email,
        experience: parseInt(experience, 10),
        skills: skills.split(",").map(s => s.trim()),
      }});

      // 2. Submit the Application
      await createApplication.mutateAsync({ data: {
        candidateId: candidateResponse.id,
        jobId,
        coverLetter: coverLetter || undefined,
      }});

      queryClient.invalidateQueries({ queryKey: getListCandidatesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetRankedApplicationsQueryKey({ jobId }) });

      toast({ title: "Application Submitted Successfully!" });
      onOpenChange(false);
      
      // Reset form
      setName("");
      setEmail("");
      setExperience("");
      setSkills("");
      setCoverLetter("");
    } catch (err) {
      toast({ title: "Failed to submit application", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Apply for Position</DialogTitle>
            <DialogDescription>
              Submit your application. Your profile will be instantly reviewed by our AI engine.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Full Name</label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Candidate" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">Email Address</label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@example.com" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="experience" className="text-sm font-medium">Years of Experience</label>
              <Input id="experience" type="number" value={experience} onChange={e => setExperience(e.target.value)} placeholder="5" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="skills" className="text-sm font-medium">Skills (comma separated)</label>
              <Input id="skills" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, TypeScript, Node.js" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="coverLetter" className="text-sm font-medium">Cover Letter (Optional)</label>
              <Textarea id="coverLetter" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Why are you a great fit?" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createCandidate.isPending || createApplication.isPending}>
              {createApplication.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
