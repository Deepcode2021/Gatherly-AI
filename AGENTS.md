# Gatherly AI — Developer and Agent Guidelines

## 1. Project Overview & Architecture
Gatherly AI is an AI-powered celebration and event planning workspace for Indian and global events (weddings, birthdays, anniversaries, college fests, community events).
- Framework: Next.js 16 (App Router), React 19, TypeScript (strict mode)
- Styling: Tailwind CSS with custom design tokens for a warm ivory, deep forest-green, sage, and warm coral palette.
- State & Persistence: Client-side versioned `localStorage` (`GATHERLY_AI_EVENTS_V1`) with JSON export/import and offline-first reliability.
- AI Integration: Server-side Gemini API (`@google/genai`) using structured JSON schema output, falling back gracefully to a fully functional demo mode when credentials are not configured.

---

## 2. Coding Standards
- **Strict TypeScript**: Do not use `any` as an escape hatch. Define explicit types and interfaces in `src/types/`.
- **Component Architecture**: Keep components focused, modular, and single-responsibility. Co-locate UI components in `src/components/` with clean client/server boundaries (`"use client"` only when interactive state is required).
- **Deterministic Math & Budgeting**: All currency and budget calculations must be deterministic integer INR arithmetic. Use `Intl.NumberFormat('en-IN')` for Indian numbering format (e.g., ₹1,50,000). Never allow the AI or floating point errors to dictate budget math.
- **Date Handling**: Store event dates in ISO strings (`YYYY-MM-DD`). Compute all task deadlines deterministically using `date-fns` based on integer offsets from the event date.
- **Form Management**: Use `react-hook-form` with `zod` schema resolvers for robust client-side validation.

---

## 3. Security Constraints
- **Secrets Isolation**: `GEMINI_API_KEY` must **only** be accessed in server-side route handlers (`src/app/api/ai/...`). Never prefix with `NEXT_PUBLIC_` or leak to the client bundle.
- **Input Sanitization & Bounds**: All incoming API requests must be validated with Zod, bounded by max lengths, and rate-limited process-locally. Treat all user input in AI prompts as untrusted delimited data.
- **No Dangerous Execution**: Do not use `eval`, `dangerouslySetInnerHTML` with unsanitized content, or dynamic execution.
- **Safe Import/Export**: All imported JSON backup files must strictly validate against the event schema before loading into application state.

---

## 4. User Data Preservation
- **Never Overwrite Silently**: Regeneration of tasks, ideas, or budget items must never silently clobber user-edited costs or completed checklist tasks.
- **Versioned Storage**: Store data under `GATHERLY_AI_EVENTS_V1` and support schema validation with fallback recovery.
- **Destructive Action Confirmation**: Deletion of events or tasks must require explicit user confirmation.

---

## 5. Accessibility (WCAG 2.2 AA)
- Semantic HTML landmarks (`<header>`, `<main>`, `<nav>`, `<section>`, `<footer>`).
- All interactive controls must have accessible labels (`aria-label` for icon-only buttons).
- Full keyboard navigability with visible high-contrast focus rings.
- Color contrast ratio of at least 4.5:1 for normal text and 3:1 for large text/icons.
- Fully responsive across mobile (360px), tablet (768px), and desktop (1280px+).

---

## 6. Verification & Quality Assurance
- **Verification Rule**: Every new feature or bugfix must be verified through automated tests (`npm run test`), linting (`npm run lint`), type-checking (`npm run typecheck`), and a production build (`npm run build`).
- **Browser Testing**: Verify actual rendered appearance, interactivity, responsive layouts, and zero console errors.
