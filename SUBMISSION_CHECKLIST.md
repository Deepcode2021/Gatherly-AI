# PromptWars Virtual — Challenge 5 Submission Checklist

### Project Name: Gatherly AI
**Tagline**: Every celebration, thoughtfully planned.  
**Category**: AI-powered event planning workspace.

---

## 1. Technical & Codebase Verification

- [x] **Framework & Core**: Next.js 16 (App Router), React 19, TypeScript strict mode.
- [x] **Design Tokens & Theme**: Warm ivory background (`#FAF7F2`), deep forest ink text (`#182620`), muted sage green primary (`#2D5A43`), warm coral accents (`#C85A32`).
- [x] **State & Persistence**: Client-side versioned storage (`GATHERLY_AI_EVENTS_V1`) using React 19 `useSyncExternalStore`.
- [x] **Deterministic Budgeting**: 100% integer INR arithmetic, formatted via `Intl.NumberFormat('en-IN')`. No floating-point calculation drift.
- [x] **Timeline Engine**: Date arithmetic powered by `date-fns` using relative integer offsets from event dates.
- [x] **AI Integration**: Server-side Google Gemini client (`@google/genai`) using **`gemini-3.5-flash-lite`** (with `gemini-3.1-flash-lite` fallback) with structured JSON schema output and safe delimiter isolation.
- [x] **Custom Event Types**: Full support for custom celebration categories like `college_fest`, `cultural`, `hackathon`, `sports_event` with resilient category normalization.
- [x] **JSON Import / Export**: One-click export and import of plan backups. Supports UTF-8 BOM stripping, storage wrapper unwrapping (`{ version: 1, events: [...] }`), array imports, and duplicate ID disambiguation.
- [x] **Demo Fallback**: Bundled 60-guest Bhopal 30th birthday demo celebration and an instant offline plan generator for zero-credential testing.
- [x] **Automated Tests**: 48/48 unit, route, and import tests passing (`npm run test`).
- [x] **Linting**: 0 errors with ESLint 9 (`npm run lint`).
- [x] **Typecheck**: 0 TypeScript errors with strict checking (`npm run typecheck`).
- [x] **Production Build**: Clean production build with all pages and routes (`npm run build`).
- [x] **Browser Testing**: Verified live rendering, tab switching, interactive budget editing, checklist completion, and responsive layouts across desktop (1280px) and mobile (375px).

---

## 2. Security & Data Protection Review

- [x] **Secrets Isolation**: `GEMINI_API_KEY` is accessed exclusively on the server in `/api/ai/plan`. Never exposed to client bundles or localStorage.
- [x] **Input Validation**: All incoming requests validated via Zod schemas; payloads capped at 50KB.
- [x] **Rate Limiting**: In-memory IP rate limiter configured on generation endpoint.
- [x] **No Dangerous Code**: No `eval`, no `dangerouslySetInnerHTML`.
- [x] **Backup Validation**: JSON backups strictly validated against `fullEventPlanSchema` before state loading.
- [x] **Sanitized .env.example**: Provided with empty placeholder values; `.env.local` is ignored in `.gitignore`.

---

## 3. Submission Deliverables Checklist

### A. Repository
- [ ] Push local Git repository to GitHub:
  ```bash
  git add .
  git commit -m "feat: complete Gatherly AI celebration planner for PromptWars Challenge 5"
  git remote add origin <your-github-repo-url>
  git push -u origin main
  ```
- [ ] Ensure repository visibility is Public for hackathon reviewers.

### B. Live Deployment (Vercel)
- [ ] Import repository into [Vercel](https://vercel.com).
- [ ] Set environment variables in Vercel project settings:
  - `GEMINI_API_KEY`: `<Your Google AI Studio API Key>`
  - `GEMINI_MODEL`: `gemini-3.5-flash-lite`
- [ ] Trigger deployment and verify live URL.

### C. Demonstration Video
- [ ] Record a 2.5 – 3 minute walkthrough following `DEMO_SCRIPT.md`.
- [ ] Upload video to YouTube or Loom (Public / Unlisted).
- [ ] Add link to hackathon submission portal.

### D. Social / LinkedIn Post
- [ ] Review `LINKEDIN_POST.md`.
- [ ] Replace URL placeholders with verified GitHub repository and live Vercel deployment links.
- [ ] Publish post with `#PromptWars #BuildInPublic` tags.

---

## 4. Required User Account Actions

To finalize deployment and submission:
1. **Google AI Studio Key**: If not already acquired, create an API key at [https://aistudio.google.com/](https://aistudio.google.com/) and paste it into `.env.local` locally and into Vercel environment variables.
2. **GitHub Repository**: Push the code to your GitHub account.
3. **Vercel Hosting**: Link your GitHub repository in Vercel and deploy.
