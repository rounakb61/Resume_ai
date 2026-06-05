import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const [role, setRole] = useState<"candidate" | "recruiter" | "admin">("candidate");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      if (role === "candidate") {
        const res = await fetch("https://ai-resume-mk0l.onrender.com/api/candidates/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: identifier, password })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        
        setAuth(data.token, { id: data.candidateId, name: identifier, role: "candidate" });
        setLocation("/candidate-dashboard");
      } else {
        const res = await fetch("https://ai-resume-mk0l.onrender.com/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: identifier, password })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        
        // Ensure role matches intended login method if we want to be strict,
        // but for now, successfully authenticating against /auth/login is sufficient
        // as long as the user role is authorized for the dashboard.
        if (data.user.role !== role && data.user.role !== "admin") {
          throw new Error(`Account does not have ${role} privileges.`);
        }

        setAuth(data.token, data.user);
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
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === "candidate" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => { setRole("candidate"); setError(""); setIdentifier(""); }}
          >
            Candidate
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === "recruiter" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => { setRole("recruiter"); setError(""); setIdentifier(""); }}
          >
            HR/Recruiter
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === "admin" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => { setRole("admin"); setError(""); setIdentifier(""); }}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {role === "candidate" ? "Candidate Name" : "Email Address"}
            </label>
            <Input 
              type={role === "candidate" ? "text" : "email"}
              placeholder={role === "candidate" ? "e.g. Rounak Banerjee" : "name@company.com"} 
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
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
            {isLoading ? "Logging in..." : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

