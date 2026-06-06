# TalentAI - AI-Powered Recruitment & Onboarding Platform


TalentAI is a complete, production-quality SaaS web application that solves the entire recruitment lifecycle from candidate application to onboarding. Built with modern web technologies and powered by AI, TalentAI provides a seamless, premium experience for both recruiters and candidates.

## 🌟 Key Features

### For Candidates
* **Smart Profile Creation:** Upload a resume (PDF/DOCX) and let AI extract your skills, education, and experience.
* **AI Match Scoring:** View real-time match scores against job postings.
* **AI Interviews:** Conduct asynchronous video interviews evaluated by AI.
* **Onboarding Portal:** Track your onboarding progress and document verification.

### For HR & Recruiters
* **Recruiter Copilot:** An AI chat assistant that helps find top candidates, compare applicants, and recommend interview questions.
* **Resume Parsing & Analysis:** Automatically extract data from resumes and get AI-generated summaries, strengths, and recommendations.
* **Candidate Ranking Engine:** Rank candidates using a composite score based on skill match, project relevance, and experience.
* **Analytics Dashboard:** Visualize the hiring funnel, skill distributions, and application trends with interactive, animated charts.
* **Job Management:** Create, filter, and manage job postings beautifully.
* **Offer Letter Generation:** Generate and download candidate offer letters in PDF format.

## 🛠️ Tech Stack

**Frontend:**
* [React](https://reactjs.org/) (TypeScript)
* [Vite](https://vitejs.dev/)
* [TailwindCSS](https://tailwindcss.com/)
* [ShadCN UI](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
* [Framer Motion](https://www.framer.com/motion/) (for smooth animations)
* [Recharts](https://recharts.org/) (for interactive analytics)
* [React Query](https://tanstack.com/query/latest) & [Wouter](https://github.com/molefrog/wouter)

**Backend:**
* [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
* [Drizzle ORM](https://orm.drizzle.team/)
* [Zod](https://zod.dev/) (for validation)

**Database:**
* [PostgreSQL](https://www.postgresql.org/)

**AI / Integrations:**
* [Groq API](https://groq.com/) (for LLM capabilities)
* Resume parsing modules (pdf-parse, mammoth)

## 📁 Project Structure

This project uses a monorepo setup powered by `pnpm` workspaces:

* `artifacts/talentai`: Frontend web application (React/Vite).
* `artifacts/api-server`: Backend REST API (Express/Node.js).
* `lib/db`: Database schema and migrations using Drizzle.
* `lib/api-zod` & `lib/api-spec`: Shared types and API schemas.

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or higher)
* [pnpm](https://pnpm.io/installation) package manager
* PostgreSQL database
* Groq API Key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Talent-AI-Platform
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   JWT_SECRET="your-super-secret-key"
   GROQ_API_KEY="your-groq-api-key"
   ```

4. Run the Application:
   Start both the frontend and backend development servers concurrently:
   ```bash
   pnpm run dev
   ```

   The application will be accessible at:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

## 👥 User Roles

* **Candidate:** Can browse jobs, upload resumes, view match scores, and complete AI interviews and onboarding tasks.
* **HR Recruiter:** Can manage job listings, review AI-ranked candidates, chat with the AI Copilot, and analyze hiring metrics.
* **Admin:** Can manage overall platform users, recruiters, and global settings.

## 🎨 Design Philosophy

TalentAI was built with a strong focus on exceptional UI/UX, incorporating:
- Glassmorphism and premium gradients.
- Smooth transitions and hover animations via Framer Motion.
- A clean, modern SaaS aesthetic comparable to industry leaders.


