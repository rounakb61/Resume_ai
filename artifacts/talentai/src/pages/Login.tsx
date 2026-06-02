import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [, setLocation] = useLocation();
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      if (role === "candidate") {
        const res = await fetch("/api/candidates/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, password })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        
        localStorage.setItem("candidateId", data.candidateId.toString());
        setLocation("/candidate-dashboard");
      } else {
        const res = await fetch("/api/recruiter/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: name, password })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        
        setLocation("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative z-10">
        <h2 className="text-3xl font-heading font-bold text-center mb-6">Welcome Back</h2>
        
        <div className="flex bg-muted/50 p-1 rounded-lg mb-6">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === "candidate" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => { setRole("candidate"); setError(""); }}
          >
            Candidate
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === "recruiter" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => { setRole("recruiter"); setError(""); }}
          >
            Recruiter
          </button>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {role === "candidate" ? "Candidate Name" : "Username"}
            </label>
            <Input 
              type="text" 
              placeholder={role === "candidate" ? "e.g. Rounak Banerjee" : "e.g. admin"} 
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
          <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
            {isLoading ? "Logging in..." : `Login as ${role === "candidate" ? "Candidate" : "HR Recruiter"}`}
          </Button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted-foreground/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background/80 px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full h-12 text-lg">
              Login as Admin
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
