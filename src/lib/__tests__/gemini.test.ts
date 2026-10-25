import { describe, it, expect } from 'vitest';
import {
  aiPlanRequestSchema,
  aiPlanResponseSchema,
  createEventFormSchema,
} from '@/types/schemas';
import { buildPromptForEvent, extractAndParseJson } from '../gemini';

describe('Gemini Client & Event Type Schemas', () => {
  describe('aiPlanRequestSchema with custom/extended event types', () => {
    it('accepts standard event types', () => {
      const payload = {
        title: 'Rahul & Priya Sangeet',
        eventType: 'wedding',
        eventDate: '2026-12-15',
        city: 'Jaipur',
        guestCount: 200,
        totalBudget: 1500000,
        venueType: 'outdoor',
      };
      const result = aiPlanRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('accepts college_fest and extended categories without failing validation', () => {
      const festPayload = {
        title: 'Aura 2026 Annual Cultural Fest',
        eventType: 'college_fest',
        eventDate: '2026-11-20',
        city: 'Bengaluru',
        guestCount: 800,
        totalBudget: 350000,
        venueType: 'outdoor',
      };
      const result = aiPlanRequestSchema.safeParse(festPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.eventType).toBe('college_fest');
      }
    });

    it('accepts arbitrary custom event types (e.g. hackathon, alumni_meet)', () => {
      const customPayload = {
        title: 'HackHorizon 2026',
        eventType: 'hackathon',
        eventDate: '2026-11-25',
        city: 'Hyderabad',
        guestCount: 300,
        totalBudget: 200000,
        venueType: 'indoor',
      };
      const result = aiPlanRequestSchema.safeParse(customPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.eventType).toBe('hackathon');
      }
    });
  });

  describe('createEventFormSchema', () => {
    it('validates form data with college_fest and custom types', () => {
      const formData = {
        title: 'Inter-College Rock Competition',
        eventType: 'college_fest',
        eventDate: '2026-11-30',
        city: 'Mumbai',
        guestCount: 500,
        totalBudget: 250000,
        venueType: 'outdoor' as const,
        theme: 'Cyberpunk Neon',
        dietary: 'Food Trucks',
        accessibility: 'Ramps',
        priorities: ['Pro Audio Sound', 'Campus Security'],
        additionalNotes: 'Strict curfew at 10 PM',
      };
      const result = createEventFormSchema.safeParse(formData);
      expect(result.success).toBe(true);
    });
  });

  describe('buildPromptForEvent', () => {
    it('humanizes custom eventType slugs safely in the prompt', () => {
      const prompt = buildPromptForEvent({
        title: 'Aura 2026 Fest',
        eventType: 'college_fest',
        eventDate: '2026-11-20',
        city: 'Bengaluru',
        guestCount: 800,
        totalBudget: 350000,
        venueType: 'outdoor',
      });

      expect(prompt).toContain('College Fest (college_fest)');
      expect(prompt).toContain('Aura 2026 Fest');
      expect(prompt).toContain('₹3,50,000');
    });
  });

  describe('extractAndParseJson', () => {
    it('parses pure JSON correctly', () => {
      const raw = '{"concept": {"themeName": "Neon Pulse"}}';
      expect(extractAndParseJson(raw)).toEqual({
        concept: { themeName: 'Neon Pulse' },
      });
    });

    it('strips markdown ```json fences cleanly', () => {
      const wrapped = '```json\n{"concept": {"themeName": "Neon Pulse"}}\n```';
      expect(extractAndParseJson(wrapped)).toEqual({
        concept: { themeName: 'Neon Pulse' },
      });
    });

    it('extracts JSON even when surrounded by text notes', () => {
      const text =
        'Here is your requested plan:\n{"concept": {"themeName": "Neon Pulse"}}\nHope this helps!';
      expect(extractAndParseJson(text)).toEqual({
        concept: { themeName: 'Neon Pulse' },
      });
    });
  });

  describe('aiPlanResponseSchema resilience', () => {
    it('successfully parses Gemini output for college fest with domain-specific categories and numeric strings', () => {
      const geminiCollegeFestOutput = {
        concept: {
          themeName: 'Neon Pulse & Battle of the Bands',
          conceptDescription:
            'A high-voltage inter-college cultural festival with vibrant concert lighting, student artist showcases, and dynamic food truck plazas.',
          suggestedColorPalette: ['#00F5D4', '#7B2CBF', '#FFB703', '#0F172A'],
          personalizedRationale:
            'Tailored for 800 students in Bengaluru with high emphasis on pro-audio acoustics and campus crowd safety.',
        },
        summary: {
          approach:
            'Allocate 40% to sound and stage production, 25% to food stalls, and 15% to security and campus safety logistics.',
          keyPriorities: [
            'Pro-grade sound engineering and line-array speakers',
            'Campus administration and police clearances',
            'High-efficiency student registration entry lanes',
          ],
          majorConsiderations:
            'Strict adherence to Bengaluru municipal sound cutoff guidelines at 10 PM and monsoon-resistant canopy over the stage rig.',
        },
        budgetItems: [
          {
            category: 'sound and lighting', // Non-standard category returned by Gemini
            description: 'Concert stage line array rig and dynamic moving heads',
            estimatedCost: '120000', // String representation
            basis: '₹1,20,000 package quote',
            assumptions: 'Includes generator backup',
          },
          {
            category: 'catering',
            description: 'Campus food trucks and beverage kiosks',
            estimatedCost: 100000,
            basis: '₹125 per attendee',
            assumptions: 'Revenue sharing with vendors',
          },
          {
            category: 'security & permits', // Non-standard category
            description: 'Private security bouncers and medical booth',
            estimatedCost: 40000,
            basis: '20 guards for 8 hours',
            assumptions: 'Includes first aid nurse',
          },
        ],
        tasks: [
          {
            title: 'Procure Police & Campus Clearances',
            description:
              'Submit loud music permits and crowd management safety plan to local authorities.',
            category: 'security and logistics', // Non-standard
            priority: 'urgent', // Non-standard priority alias
            daysBeforeEvent: '-30',
            estimatedDuration: '3 days',
          },
          {
            title: 'Sign Sound & Light Rigging Vendor',
            description:
              'Finalize pro concert sound engineer and sign contract with 20% advance.',
            category: 'entertainment',
            priority: 'high',
            daysBeforeEvent: -20,
            estimatedDuration: '2 days',
          },
          {
            title: 'Set up Student Registration Desks',
            description:
              'Deploy QR code scanners and wristband distribution booths at main entry gates.',
            category: 'guests',
            priority: 'medium',
            daysBeforeEvent: -2,
            estimatedDuration: '4 hours',
          },
          {
            title: 'Stage Rehearsals & Sound Checks',
            description:
              'Sound engineer completes acoustic tuning and line checks for participating college bands.',
            category: 'entertainment',
            priority: 'high',
            daysBeforeEvent: 0,
            estimatedDuration: '3 hours',
          },
        ],
        vendors: [
          {
            category: 'music & sound', // Non-standard
            service: 'Concert Audio Engineering',
            bookingDeadlineDays: -25,
            targetBudget: 120000,
            questionsToAsk: [
              'Do you supply an on-site technician throughout the event?',
              'What backup generators are provided in case of grid failure?',
            ],
          },
          {
            category: 'rentals',
            service: 'Stage Canopy & Barricades',
            bookingDeadlineDays: -20,
            targetBudget: 50000,
            questionsToAsk: [
              'Are the stage trusses certified for outdoor wind load?',
              'How long does setup and teardown take?',
            ],
          },
        ],
        ideas: [
          {
            title: 'Silent Disco Neon Zone',
            category: 'experience', // Non-standard
            description:
              'Dual-DJ wireless headphone booth for students after the main stage sound curfew.',
            whyItFits:
              'Enables party vibes to continue after 10 PM without violating Bengaluru noise bylaws.',
            costImpact: 'budget-friendly', // Non-standard
            effortLevel: 'simple', // Non-standard
          },
          {
            title: 'Battle of the Bands Trophies',
            category: 'decor',
            description:
              'Custom acrylic and brass guitar-shaped trophies for winning college performers.',
            whyItFits:
              'Creates prestigious bragging rights and memorable stage photo moments.',
            costImpact: 'low',
            effortLevel: 'easy',
          },
        ],
        risks: [
          {
            risk: 'Evening drizzle or sudden thunderstorm damaging stage electronics',
            severity: 'critical', // Non-standard severity alias
            mitigation:
              'Deploy waterproof tarpaulins and heavy-duty stage canopy with grounded power.',
            alternative:
              'Keep college indoor auditorium booked as standby contingency.',
          },
        ],
      };

      const parsed = aiPlanResponseSchema.safeParse(geminiCollegeFestOutput);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        // Confirm categories and enums normalized gracefully
        expect(parsed.data.budgetItems[0].category).toBe('entertainment');
        expect(parsed.data.budgetItems[0].estimatedCost).toBe(120000);
        expect(parsed.data.budgetItems[2].category).toBe('other');
        expect(parsed.data.tasks[0].category).toBe('logistics');
        expect(parsed.data.tasks[0].priority).toBe('high');
        expect(parsed.data.tasks[0].daysBeforeEvent).toBe(-30);
        expect(parsed.data.vendors[0].category).toBe('entertainment');
        expect(parsed.data.ideas[0].category).toBe('guest_experience');
        expect(parsed.data.ideas[0].costImpact).toBe('low');
        expect(parsed.data.ideas[0].effortLevel).toBe('easy');
        expect(parsed.data.risks[0].severity).toBe('high');
      }
    });
  });
});
