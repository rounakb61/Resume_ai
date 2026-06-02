import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Search, FileText, Calendar, LogOut, Brain
} from "lucide-react";

const navItems = [
  { href: "/candidate-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/find-jobs", label: "Find Jobs", icon: Search },
  { href: "/my-applications", label: "My Applications", icon: FileText },
  { href: "/my-interviews", label: "Interviews", icon: Calendar },
];

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="h-screen bg-background flex text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-white/5 bg-[hsl(222,47%,9%)] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold font-heading bg-gradient-to-r from-primary via-violet-400 to-blue-400 bg-clip-text text-transparent">
              TalentAI
            </span>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-1">Candidate</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href || location.startsWith(href + "/");
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-primary/15 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                  data-testid={`nav-${label.toLowerCase().replace(" ", "-")}`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-primary" : ""}`} />
                  {label}
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <Link href="/login">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </div>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="min-h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
