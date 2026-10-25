# Gatherly AI — Verification & Testing Report

## 1. Automated Test Suite Summary

The application includes unit tests, route integration tests, AI response validation tests, and storage regression tests.

| Test File | Status | Tests | Key Focus Areas |
|---|---|---|---|
| `src/lib/__tests__/gemini.test.ts` | **PASSED** | 9 | Custom eventType requests (`college_fest`, `hackathon`), prompt humanization, codeblock stripping, resilient category normalization |
| `src/utils/__tests__/storage.import.test.ts` | **PASSED** | 9 | JSON backup round-trip, multi-event arrays, full storage wrapper `{ version: 1, events: [...] }`, Windows UTF-8 BOM stripping, duplicate ID disambiguation |
| `src/utils/__tests__/priorities.test.ts` | **PASSED** | 7 | Dynamic priority selection, max priority limits, priority toggle behavior |
| `src/utils/__tests__/budget.test.ts` | **PASSED** | 3 | Deterministic totals, actual vs. estimated variance, category breakdowns, overspending warnings |
| `src/utils/__tests__/timeline.test.ts` | **PASSED** | 5 | Date-fns relative integer offsets, custom date preservation, overdue detection, prerequisite dependencies |
| `src/utils/__tests__/readiness.test.ts` | **PASSED** | 3 | 0-100 multi-factor readiness score, budget exceeded alert, outdoor weather contingency trigger |
| `src/utils/__tests__/storage.test.ts` | **PASSED** | 3 | Versioned localStorage persistence, demo celebration seeding, JSON export |
| `src/utils/__tests__/formatters.test.ts` | **PASSED** | 5 | INR currency formatting, Indian number comma grouping (₹1,50,000), compact notation, countdown labels |
| `src/app/api/ai/plan/__tests__/route.test.ts` | **PASSED** | 3 | Malformed JSON rejection (400), Zod validation failure (422), missing API key handling (401) |
| `src/utils/__tests__/sanity.test.ts` | **PASSED** | 1 | Test runner environment sanity |

**Total Automated Tests**: 48 passed (10 test files, 0 failures)

---

## 2. Test Commands & Reproduction

### Run Automated Unit & Route Tests
```bash
npm run test
```
*Actual output:*
```
 ✓ src/utils/__tests__/sanity.test.ts (1 test)
 ✓ src/utils/__tests__/budget.test.ts (3 tests)
 ✓ src/lib/__tests__/gemini.test.ts (9 tests)
 ✓ src/utils/__tests__/priorities.test.ts (7 tests)
 ✓ src/app/api/ai/plan/__tests__/route.test.ts (3 tests)
 ✓ src/utils/__tests__/timeline.test.ts (5 tests)
 ✓ src/utils/__tests__/readiness.test.ts (3 tests)
 ✓ src/utils/__tests__/formatters.test.ts (5 tests)
 ✓ src/utils/__tests__/storage.import.test.ts (9 tests)
 ✓ src/utils/__tests__/storage.test.ts (3 tests)

 Test Files  10 passed (10)
      Tests  48 passed (48)
```

### Run Gemini API Connectivity Diagnostic
```bash
npm run verify:api
```
*Actual output:*
```
--- Gatherly AI: Gemini API Verification ---
Target Model: gemini-3.5-flash-lite
Status: 🔑 API key detected (Length: 53)
Testing live connection to Gemini API...
Response from Gemini:
{
  "status": "ok",
  "message": "Gemini API connected successfully"
}
✅ Connection to gemini-3.5-flash-lite succeeded!
```

### Run Strict TypeScript Check
```bash
npm run typecheck
```
*Actual output:*
```
> gatherly-ai@0.1.0 typecheck
> tsc --noEmit
(Exit code 0, zero errors)
```

### Run Linting
```bash
npm run lint
```
*Actual output:*
```
> gatherly-ai@0.1.0 lint
> eslint
(Exit code 0, zero errors)
```

### Run Production Build
```bash
npm run build
```
*Actual output:*
```
▲ Next.js 16.4.3 (webpack)
✓ Running next.config.ts took 210ms
✓ Compiled successfully in 7.5s
✓ Generating static pages using 9 workers (6/6) in 3.9s
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/ai/plan
├ ○ /create
├ ○ /dashboard
└ ƒ /events/[id]
(Exit code 0, zero errors)
```

---

## 3. Browser & Visual Verification

Automated browser subagent testing was conducted on actual rendered interfaces:
1. **Landing Page (`http://localhost:3000`)**: Verified hero copy, warm ivory aesthetic, live preview card, and navigation links.
2. **Demo Event Workspace (`/events/demo-bhopal-30th-birthday`)**:
   - Initialized the bundled 60-guest, ₹40,000 celebration plan.
   - Tested **Overview Tab**: verified theme rationale, color palette pills, and readiness score factors.
   - Tested **Budget Engine Tab**: modified actual cost of "Terrace Banquet Hall" to ₹9,000; verified immediate recalculation of committed spend and remaining buffer.
   - Tested **Timeline & Checklist Tab**: checked off a pending task and verified progress bar incremented.
   - Tested **Vendors Pipeline Tab**: switched photography status from "Shortlisted" to "Booked".
   - Tested **Curated Ideas Tab**: clicked the star icon to toggle favorites.
3. **Dashboard (`/dashboard`)**:
   - Verified active celebration cards, quick metrics, and export controls.
   - Verified native file picker opens on **"Import JSON"** button click.
   - Verified empty state card features an **"Import Backup JSON"** button.
4. **Create Event Flow (`/create`)**:
   - Tested "🎸 College Fest (Bengaluru)" preset with custom event type `college_fest`.
   - Verified schema accepts custom event types without validation failures.
5. **Responsive Layouts**: Tested at mobile viewport (375x812) and desktop viewport (1280x800) with zero layout shifts or horizontal overflows.
6. **Console Inspection**: 0 uncaught exceptions or runtime errors.

---

## 4. Known Limitations & Edge Cases

- **Process-Local Rate Limiting**: The in-memory IP rate limiter on `/api/ai/plan` is local to the active container process. For multi-region serverless deployments, an external KV store (e.g., Upstash Redis) is recommended.
- **Client Storage Quotas**: Browser `localStorage` typically has a 5MB limit. Since Gatherly AI plans are concise structured JSON (under 15KB per plan), users can comfortably store over 300 celebrations before reaching browser limits.
