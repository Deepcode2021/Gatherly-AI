# Gatherly AI — Video Walkthrough & Demo Script

> **Duration**: 2.5 – 3 minutes  
> **Speaker Role**: Full-stack developer & product designer  
> **Target Audience**: PromptWars Virtual judges, event planners, and developers

---

## Act 1: The Problem & The Vision (0:00 – 0:35)

**Visual**: Screen opens on the **Landing Page** (`http://localhost:3000`). Scroll smoothly to show the warm ivory background, sage green accents, and the interactive preview card.

**Voiceover Narration**:
> *"Hello! I'm excited to present **Gatherly AI** — built for PromptWars Virtual Challenge 5: Celebration & Event Planner.
> 
> Planning celebrations—whether it's an Indian wedding, a rooftop 30th birthday, an annual college fest, or a community utsav—usually means drowning in WhatsApp group chats, messy spreadsheets, and unpredictable vendor quotes.
> 
> Most AI planners just act as chatbots, dumping uneditable walls of text. Gatherly AI takes a completely different approach: you input your celebration requirements once, and the AI synthesizes an interactive, editable workspace with deterministic INR budgeting, a date-calculated checklist, a vendor pipeline, and real-time readiness scoring."*

---

## Act 2: The Demonstration Event & Workspace Tour (0:35 – 1:30)

**Visual**: Click **Explore Demo Plan** to open `http://localhost:3000/events/demo-bhopal-30th-birthday`.

**Voiceover Narration**:
> *"Let's explore our bundled demonstration celebration: 'Aarav's 30th Milestone Rooftop Sunset Birthday in Bhopal' with a strict ₹40,000 budget for 60 guests.
> 
> At the top, you see our **Event Readiness Score: 82/100**. This isn't an arbitrary number—clicking the chevron reveals our deterministic formula evaluating checklist execution, vendor bookings, budget discipline, and weather risks.
> 
> Notice our real-time alerts warning that outdoor lakefront venues need a rain contingency plan."*

**Visual**: Click on the **Budget Engine** tab. In the itemized table, find "Terrace Banquet Hall Rental" and change the Actual Cost from ₹9,500 to ₹9,000. Point to the top numbers.

**Voiceover Narration**:
> *"Now let's switch to the **Budget Engine**. All financial math is pure integer INR arithmetic without floating-point errors.
> 
> Watch as I update the actual quote for the terrace rental from ₹9,500 to ₹9,000. Instantly, our committed spend, remaining buffer, and category breakdown recalculate on the fly. No page reload, no hallucinations."*

---

## Act 3: Checklist, Vendors & Ideas (1:30 – 2:15)

**Visual**: Switch to the **Timeline & Checklist** tab. Check off a pending task ("Curate 90s Nostalgia Playlist"). Notice the confetti burst and the task crossing off.

**Voiceover Narration**:
> *"In the **Timeline & Checklist**, deadlines aren't hardcoded dates from the AI—they are relative integer offsets calculated from the event date using `date-fns`.
> 
> When I check off a completed milestone, confetti celebrates progress, and our readiness score immediately adjusts. Notice also the dependency indicators: tasks clearly flag if a prerequisite hasn't been completed yet."*

**Visual**: Switch to **Vendors Pipeline** tab. Show the status dropdown for the photographer changing from "Shortlisted" to "Booked". Highlight the "Questions to Ask Before Booking" section.

**Voiceover Narration**:
> *"In the **Vendors Pipeline**, we provide structured negotiation tools: booking statuses, contact notes, and crucial cultural questions to ask—like outside catering royalty terms or power generator backups."*

**Visual**: Switch to **Curated Ideas** tab. Star an idea to favorite it.

**Voiceover Narration**:
> *"In **Curated Ideas**, each suggestion includes cultural context, why it fits the theme, and estimated cost impact. You can favorite ideas, or regenerate fresh ideas without losing your saved vendor quotes."*

---

## Act 4: Creating a New Plan, Custom Event Types & Export/Import (2:15 – 3:00)

**Visual**: Click **Dashboard** in the navbar. Point to the metrics cards. Then click **Import JSON** to demonstrate the native backup loader, or click **New Event** (`/create`). Click the **"🎸 College Fest (Bengaluru)"** preset chip.

**Voiceover Narration**:
> *"On the **Dashboard**, you can manage multiple active celebrations, view aggregate spend, download JSON backups, or restore previous backups with one click.
> 
> In the **Creation Wizard**, we support all celebrations, including custom categories like college cultural fests, hackathons, and community gatherings.
> 
> Our backend integration uses Google's latest Gemini 3.5 Flash Lite (`@google/genai`) with structured JSON schema outputs. Even when Gemini generates specialized categories like sound rigs, campus security, or permits, our resilient normalization layer maps them directly into actionable workspace columns.
> 
> Finally, every plan can be exported as a validated JSON backup or printed as a clean, physical agenda for event coordinators.
> 
> Gatherly AI: Every celebration, thoughtfully planned. Thank you!"*

**Visual**: Click **Print / Save PDF** to show the clean print preview dialog.
