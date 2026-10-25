// Gatherly AI - Demonstration Event Plan
// Bundled sample: 60-guest 30th Milestone Birthday in Bhopal with ₹40,000 budget

import { EventPlan } from '@/types/event';
import { format, addDays } from 'date-fns';

export function getDemoEvent(referenceDate: Date = new Date()): EventPlan {
  const eventDate = format(addDays(referenceDate, 24), 'yyyy-MM-dd');

  return {
    id: 'demo-bhopal-30th-birthday',
    title: "Aarav's 30th Milestone Rooftop Sunset Birthday",
    eventType: 'birthday',
    eventDate,
    city: 'Bhopal, MP',
    guestCount: 60,
    totalBudget: 40000,
    venueType: 'mixed',
    theme: 'Warm Sunset & Earthy Boho Celebration',
    dietary: 'Vegetarian with Live Chaat & Street Food Counters',
    accessibility: 'Elevator access required for rooftop terrace',
    priorities: [
      'Interactive Live Food Counters',
      'Memorable Sunset Photo Booth',
      'Comfortable Acoustic Jam Session',
      'Strict ₹40,000 Budget Control',
    ],
    additionalNotes:
      'Celebration for close college friends and family. Keep it relaxed, heartfelt, and memorable without stiff formal protocols.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true,

    concept: {
      themeName: 'Warm Sunset & Earthy Boho Celebration',
      conceptDescription:
        'A golden-hour rooftop evening with warm fairy lights, jute poufs, brass lanterns, and a relaxed lounge ambience celebrating three decades of memories with closest companions.',
      suggestedColorPalette: [
        '#C85A32 (Terracotta Warmth)',
        '#E6AF2E (Golden Marigold)',
        '#2D5A43 (Forest Sage)',
        '#F7F3EB (Ivory Linen)',
      ],
      personalizedRationale:
        'Tailored to Bhopal’s scenic evening breeze and a ₹40,000 budget for 60 guests, prioritizing hearty live food experiences and intimate acoustic music over expensive venue rentals.',
    },

    summary: {
      approach:
        'Smart resource allocation focusing 48% on crowd-pleasing live food stalls, 22% on DIY ambient decor with fairy lighting, and reserving 10% for unexpected guests.',
      keyPriorities: [
        'Book open terrace with weather backup cover',
        'Finalize live chaat & pasta counter menu',
        'Assemble personalized photo wall with childhood photos',
        'Confirm acoustic guitarist duo for 2-hour set',
      ],
      majorConsiderations:
        'Bhopal evening temperatures drop pleasantly around sunset; ensure light warm wraps or heater provisions if late night.',
    },

    budgetItems: [
      {
        id: 'b-1',
        category: 'venue',
        description: 'Terrace Banquet Hall Rental (Lake View Garden/Terrace)',
        estimatedCost: 10000,
        actualCost: 9500,
        basis: '5-hour evening slot booking with basic sound & lights',
        assumptions: 'Fictional/Generic venue partner placeholder',
        paidAmount: 5000,
      },
      {
        id: 'b-2',
        category: 'catering',
        description: 'Live Chaat, Pav Bhaji, Pasta & Dessert Counter',
        estimatedCost: 16000,
        actualCost: 16000,
        basis: '₹265/plate for 60 guests',
        assumptions: 'Includes welcome mocktails, 3 appetizers, main live stalls & gulab jamun',
        paidAmount: 8000,
      },
      {
        id: 'b-3',
        category: 'decoration',
        description: 'Boho Sunset Fairy Lights, Jute Rugs & Floral Marigold Backdrop',
        estimatedCost: 5000,
        actualCost: 4800,
        basis: 'DIY & local florist combo bundle',
        assumptions: 'Local flower mandi wholesale pricing',
        paidAmount: 4800,
      },
      {
        id: 'b-4',
        category: 'photography',
        description: 'Candid & Golden Hour Photo Session (Freelancer)',
        estimatedCost: 4000,
        actualCost: 4000,
        basis: '3-hour session with 75 retouched digital photos',
        assumptions: 'Student / Freelancer portfolio rate',
        paidAmount: 2000,
      },
      {
        id: 'b-5',
        category: 'entertainment',
        description: 'Acoustic Guitarist & Singer Duo + Portable PA',
        estimatedCost: 2500,
        actualCost: 2500,
        basis: '90-minute live session',
        assumptions: 'Local college artist circle',
        paidAmount: 0,
      },
      {
        id: 'b-6',
        category: 'other',
        description: 'Custom Milestone Bento Cake + Cupcake Tower',
        estimatedCost: 1500,
        actualCost: 1600,
        basis: '1.5 kg artisanal chocolate hazelnut cake',
        assumptions: 'Home baker pre-order',
        paidAmount: 1600,
      },
      {
        id: 'b-7',
        category: 'other',
        description: 'Emergency Contingency & Extra Guest Buffer',
        estimatedCost: 1000,
        actualCost: 0,
        basis: 'Reserve fund for last-minute supplies',
        assumptions: 'Recommended for all celebrations',
        paidAmount: 0,
      },
    ],

    tasks: [
      {
        id: 't-1',
        title: 'Lock Rooftop / Terrace Venue Contract',
        description: 'Inspect terrace plug points, rain awning, and elevator access for grandparents.',
        category: 'venue',
        priority: 'high',
        daysBeforeEvent: 21,
        dueDate: format(addDays(referenceDate, 3), 'yyyy-MM-dd'),
        isCompleted: true,
        completedAt: new Date().toISOString(),
        estimatedDuration: '2 hours',
      },
      {
        id: 't-2',
        title: 'Finalize Live Food Counter Tasting & Menu',
        description: 'Sample the spicy pani puri water, white sauce pasta, and hot jalebis with rabdi.',
        category: 'catering',
        priority: 'high',
        daysBeforeEvent: 16,
        dueDate: format(addDays(referenceDate, 8), 'yyyy-MM-dd'),
        isCompleted: true,
        completedAt: new Date().toISOString(),
        estimatedDuration: '1.5 hours',
      },
      {
        id: 't-3',
        title: 'Curate 90s-00s Nostalgia Digital Playlist & Photo Slideshow',
        description: 'Collect 60 embarrassing and heartwarming photos from school/college friends.',
        category: 'entertainment',
        priority: 'medium',
        daysBeforeEvent: 10,
        dueDate: format(addDays(referenceDate, 14), 'yyyy-MM-dd'),
        isCompleted: false,
        estimatedDuration: '3 hours',
        dependencies: ['t-1'],
      },
      {
        id: 't-4',
        title: 'Send Digital WhatsApp RSVP Cards with Google Maps Pin',
        description: 'Send custom animated RSVP invites with dress code (Earthy tones/Boho).',
        category: 'guests',
        priority: 'high',
        daysBeforeEvent: 14,
        dueDate: format(addDays(referenceDate, 10), 'yyyy-MM-dd'),
        isCompleted: true,
        completedAt: new Date().toISOString(),
        estimatedDuration: '1 hour',
      },
      {
        id: 't-5',
        title: 'Purchase Fairy Lights & Scented Citronella Candles',
        description: 'Get warm yellow 50m micro-LED strings and citronella candles for lakefront breeze.',
        category: 'decoration',
        priority: 'medium',
        daysBeforeEvent: 7,
        dueDate: format(addDays(referenceDate, 17), 'yyyy-MM-dd'),
        isCompleted: false,
        estimatedDuration: '2 hours',
      },
      {
        id: 't-6',
        title: 'Confirm Acoustic Duo Sound Check Time & Mic Stand',
        description: 'Ensure venue provides 2 clean three-pin plugs and an extension cord near the stage.',
        category: 'entertainment',
        priority: 'low',
        daysBeforeEvent: 3,
        dueDate: format(addDays(referenceDate, 21), 'yyyy-MM-dd'),
        isCompleted: false,
        estimatedDuration: '30 mins',
        dependencies: ['t-1'],
      },
      {
        id: 't-7',
        title: 'Pick up Custom Milestone 30th Birthday Cake',
        description: 'Confirm 4:30 PM pickup with safe air-conditioned transport box.',
        category: 'logistics',
        priority: 'high',
        daysBeforeEvent: 0,
        dueDate: format(addDays(referenceDate, 24), 'yyyy-MM-dd'),
        isCompleted: false,
        estimatedDuration: '45 mins',
      },
    ],

    vendors: [
      {
        id: 'v-1',
        category: 'venue',
        service: 'Bhopal Lakeview Terrace Garden (Generic Partner)',
        targetBudget: 10000,
        actualCost: 9500,
        bookingDeadlineDays: 20,
        bookingDeadline: format(addDays(referenceDate, 4), 'yyyy-MM-dd'),
        status: 'booked',
        vendorName: 'Lake Breeze Banquet Terrace (Fictional Partner)',
        contactNotes: 'Manager: Mr. Sharma (98XXXXXXXX) — 50% deposit paid via UPI.',
        quotationNotes: 'Includes cleaning, dustbins, and 8 parking spots.',
        questionsToAsk: [
          'Is outside catering permitted without royalty fees?',
          'Until what time is amplified acoustic music allowed by local rules?',
          'Is generator power backup included during unexpected load shedding?',
        ],
      },
      {
        id: 'v-2',
        category: 'catering',
        service: 'Live Street Food & Chaat Live Stalls',
        targetBudget: 16000,
        actualCost: 16000,
        bookingDeadlineDays: 14,
        bookingDeadline: format(addDays(referenceDate, 10), 'yyyy-MM-dd'),
        status: 'booked',
        vendorName: 'Chaat Bazaar Caterers (Generic Fictional Listing)',
        contactNotes: 'Chef Suresh (97XXXXXXXX) — Agreed on 3 live stations + biodegradable cutlery.',
        quotationNotes: '₹265/head for 60 guests. 5 extra plates grace buffer included.',
        questionsToAsk: [
          'Do you supply eco-friendly leaf plates (Pattal) and wooden cutlery?',
          'Will you bring your own LPG cylinders and water dispensers?',
          'Can we arrange a separate Jain chaat water pot?',
        ],
      },
      {
        id: 'v-3',
        category: 'photography',
        service: 'Golden Hour & Candid Moments Photographer',
        targetBudget: 4000,
        actualCost: 4000,
        bookingDeadlineDays: 10,
        bookingDeadline: format(addDays(referenceDate, 14), 'yyyy-MM-dd'),
        status: 'shortlisted',
        vendorName: 'LensCraft Bhopal Student Collective',
        contactNotes: 'Portfolio reviewed on Instagram. Shortlisted 2 final candidates.',
        quotationNotes: 'Quoted ₹4,000 for 3 hours including drive delivery of all RAWs within 48h.',
        questionsToAsk: [
          'What is the turnaround time for the teaser 15 photos for social media?',
          'Do you bring portable continuous LED fill lights for after-dark photos?',
        ],
      },
      {
        id: 'v-4',
        category: 'entertainment',
        service: 'Acoustic Guitarist & Vocals',
        targetBudget: 2500,
        bookingDeadlineDays: 7,
        bookingDeadline: format(addDays(referenceDate, 17), 'yyyy-MM-dd'),
        status: 'contacted',
        vendorName: 'Indie Strings Trio (Generic Artist Demo)',
        contactNotes: 'Awaiting sample video link of Bollywood acoustic covers.',
        questionsToAsk: [
          'Can you accommodate 5 custom song requests for the cake cutting moment?',
          'Do you bring your own small amplifier and microphone?',
        ],
      },
    ],

    ideas: [
      {
        id: 'i-1',
        title: 'Golden Sunset Polaroid & Fairy Light Memory Wall',
        category: 'guest_experience',
        description:
          'Set up a vintage hanging jute twine wall where guests snap a Polaroid or leave a handwritten index card with their favorite memory of Aarav.',
        whyItFits:
          'Creates a sentimental keepsake album without spending money on expensive photo booths.',
        costImpact: 'low',
        effortLevel: 'easy',
        isFavorite: true,
      },
      {
        id: 'i-2',
        title: 'DIY Live Street Food "Chaat Shots" Welcome Bar',
        category: 'food',
        description:
          'Serve miniature puri filled with mint, pomegranate and tangy tamarind shots on rustic wooden trays as guests arrive.',
        whyItFits:
          'Instant crowd pleaser that feels high-end and experiential while staying strictly budget friendly.',
        costImpact: 'low',
        effortLevel: 'easy',
        isFavorite: true,
      },
      {
        id: 'i-3',
        title: 'Milestone Trivia: "Who Knows Aarav Best?" Live Kahoot Quiz',
        category: 'activity',
        description:
          'A quick 15-minute smartphone quiz on the guest of honor’s funny life moments, hosted by his best friend.',
        whyItFits:
          'Completely free, super high energy, and breaks the ice across different friend circles.',
        costImpact: 'free',
        effortLevel: 'easy',
        isFavorite: false,
      },
      {
        id: 'i-4',
        title: 'Eco-Friendly Plantable Seed Paper Favors',
        category: 'cost_saving',
        description:
          'Give guests miniature clay pots with tulsi or marigold seed paper thank-you notes.',
        whyItFits:
          'Thoughtful sustainable Indian gift that costs under ₹25 per guest and lasts for months.',
        costImpact: 'low',
        effortLevel: 'easy',
        isFavorite: true,
      },
      {
        id: 'i-5',
        title: 'Sunset Marigold Ring Chandelier',
        category: 'decor',
        description:
          'Hang a circular hula-hoop wrapped in fresh yellow genda phool (marigold) and fairy lights right above the cake cutting table.',
        whyItFits:
          'Looks magnificent in photos and costs under ₹600 from local Bhopal phool mandi.',
        costImpact: 'low',
        effortLevel: 'moderate',
        isFavorite: false,
      },
    ],

    risks: [
      {
        id: 'r-1',
        risk: 'Sudden evening thunderstorm or lake wind gusts on open rooftop',
        severity: 'high',
        mitigation:
          'Confirm venue terrace has an adjacent enclosed glass hall or retractable monsoon canopy ready on 15 minutes notice.',
        alternative:
          'Book a hybrid indoor-outdoor venue with seamless sliding glass doors.',
      },
      {
        id: 'r-2',
        risk: 'Guest count exceeding RSVP from 60 to 75 people',
        severity: 'medium',
        mitigation:
          'Caterer contracted with 10% flexible plate buffer; live pasta counter scales easily without per-plate penalties.',
        alternative:
          'Keep dried snacks and bakery appetizers in reserve storage.',
      },
      {
        id: 'r-3',
        risk: 'Local municipal noise curfew after 10:00 PM',
        severity: 'medium',
        mitigation:
          'Schedule acoustic guitar set between 7:30 PM - 9:30 PM; switch to background acoustic Spotify playlist inside after 10 PM.',
        alternative:
          'Start evening earlier at 5:30 PM to catch full golden hour.',
      },
    ],
  };
}
