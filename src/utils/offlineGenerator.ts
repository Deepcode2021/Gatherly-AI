// Gatherly AI - Deterministic Offline Plan Generator
// Generates fully structured celebration plans when Gemini API is unconfigured or in Demo Mode

import { EventPlan } from '@/types/event';
import { CreateEventFormData } from '@/types/schemas';
import { calculateTaskDueDate } from './timeline';

const EVENT_TYPE_THEMES: Record<
  string,
  {
    themeName: string;
    conceptDescription: string;
    palette: string[];
    approach: string;
  }
> = {
  birthday: {
    themeName: 'Warm Sunset & Earthy Boho Celebration',
    conceptDescription:
      'A golden-hour evening celebration with warm fairy lights, acoustic melodies, and a vibrant street-food chaat & dessert counter.',
    palette: ['#C85A32 (Warm Terracotta)', '#E6AF2E (Golden Amber)', '#2D5A43 (Forest Sage)', '#F7F3EB (Ivory)'],
    approach: 'Focus 45% of budget on interactive live food stations, 25% on atmospheric lighting and photo corners.',
  },
  wedding: {
    themeName: 'Royal Marigold & Heritage Ivory Splendor',
    conceptDescription:
      'A timeless celebration celebrating heritage, brass accents, marigold florals, live Shehnai/flute melodies, and an authentic regional feast.',
    palette: ['#C85A32 (Deep Sindoor)', '#E6AF2E (Royal Marigold)', '#1F3D2B (Emerald Moss)', '#FAF7F2 (Linen Ivory)'],
    approach: 'Balanced allocation across venue ambience, grand buffet feast, and timeless candid photo captures.',
  },
  anniversary: {
    themeName: 'Candlelight Elegance & Nostalgia Reflections',
    conceptDescription:
      'An intimate evening honoring cherished years, featuring personalized memory lanes, acoustic jazz/Bollywood, and candlelit tables.',
    palette: ['#8B263E (Vintage Rose)', '#C49A45 (Brushed Brass)', '#2D3A34 (Slate Sage)', '#FFFDF9 (Pearl)'],
    approach: 'Prioritize atmospheric dining, keepsake guest favors, and acoustic entertainment.',
  },
  college_fest: {
    themeName: 'Neon Euphoria & Campus Pulse',
    conceptDescription:
      'A high-energy student festival featuring battle-of-the-bands, vibrant food trucks, gaming arenas, and fluorescent neon art installations.',
    palette: ['#0284C7 (Electric Cyan)', '#9333EA (Neon Violet)', '#F59E0B (Sunset Flare)', '#0F172A (Midnight)'],
    approach: 'Direct funds heavily into sound/stage engineering, student crowd engagement, and safety logistics.',
  },
  community: {
    themeName: 'Utsav Milan: Vibrant Community Harmony',
    conceptDescription:
      'A festive, welcoming open gathering with traditional folk performances, communal prasadam/langar style dining, and family game arenas.',
    palette: ['#EA580C (Festive Ochre)', '#16A34A (Verdant Green)', '#CA8A04 (Turmeric Yellow)', '#FFFFFF (Pure White)'],
    approach: 'Community-first resource distribution emphasizing generous food arrangements and inclusive family seating.',
  },
  corporate: {
    themeName: 'Modern Horizon Leadership Gala',
    conceptDescription:
      'A sleek, contemporary evening celebrating team milestones, keynotes, gourmet cocktail stations, and networking lounges.',
    palette: ['#1E293B (Navy Slate)', '#0D9488 (Teal Executive)', '#E2E8F0 (Platinum)', '#F59E0B (Gold Accents)'],
    approach: 'High-polish AV projection, streamlined catering service, and commemorative awards.',
  },
  baby_shower: {
    themeName: 'Pastel Meadow Blessing',
    conceptDescription:
      'A soft, gentle afternoon filled with floral arches, mocktail spritzers, sentimental advice cards, and sweet confectionery.',
    palette: ['#F9A8D4 (Blush)', '#93C5FD (Sky Mist)', '#86EFAC (Mint Sage)', '#FEFCE8 (Buttercup)'],
    approach: 'Comfortable lounge seating for mom-to-be, playful guessing games, and gourmet high tea bites.',
  },
  housewarming: {
    themeName: 'Griha Pravesh Warmth & Welcoming Light',
    conceptDescription:
      'A heartwarming auspicious start with fragrant jasmine torans, traditional brass diyas, and authentic festive thali.',
    palette: ['#DC2626 (Auspicious Kumkum)', '#F59E0B (Haldi Glow)', '#15803D (Banana Leaf)', '#FFFBEB (Warm Cream)'],
    approach: 'Focus on priest ceremonies, fragrant floral door decor, and warm seated thali hospitality.',
  },
  other: {
    themeName: 'Joyful Gathering & Curated Moments',
    conceptDescription:
      'A thoughtfully coordinated celebration bringing friends and loved ones together in a welcoming, joyful environment.',
    palette: ['#2D5A43 (Sage)', '#C85A32 (Terracotta)', '#E6AF2E (Amber)', '#FAF7F2 (Ivory)'],
    approach: 'Practical balance of hospitality, good food, and ambient entertainment.',
  },
};

export function generateOfflinePlan(form: CreateEventFormData): EventPlan {
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const template = EVENT_TYPE_THEMES[form.eventType] || EVENT_TYPE_THEMES.other;
  const budget = form.totalBudget;
  const guests = form.guestCount;
  const eventDate = form.eventDate;

  // Realistic deterministic category allocations
  const venueBudget = Math.round(budget * 0.25);
  const cateringBudget = Math.round(budget * 0.42);
  const decorBudget = Math.round(budget * 0.14);
  const photoBudget = Math.round(budget * 0.09);
  const entertainmentBudget = Math.round(budget * 0.05);
  const contingencyBudget = Math.max(1000, budget - (venueBudget + cateringBudget + decorBudget + photoBudget + entertainmentBudget));

  const perPlateEstimate = Math.max(150, Math.round(cateringBudget / Math.max(1, guests)));

  return {
    id: eventId,
    title: form.title,
    eventType: form.eventType,
    eventDate: form.eventDate,
    city: form.city,
    guestCount: form.guestCount,
    totalBudget: form.totalBudget,
    venueType: form.venueType,
    theme: form.theme || template.themeName,
    dietary: form.dietary || 'Mixed Catering',
    accessibility: form.accessibility || 'Standard Accessibility',
    priorities: form.priorities.length > 0 ? form.priorities : ['Memorable Guest Experience', 'Strict Budget Adherence'],
    additionalNotes: form.additionalNotes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: false,

    concept: {
      themeName: form.theme || template.themeName,
      conceptDescription: template.conceptDescription,
      suggestedColorPalette: template.palette,
      personalizedRationale: `Designed for ${guests} guests in ${form.city} with a ${form.venueType} venue setting and total budget of ₹${budget.toLocaleString('en-IN')}.`,
    },

    summary: {
      approach: template.approach,
      keyPriorities: [
        `Book suitable ${form.venueType} venue in ${form.city}`,
        `Lock catering partner for ${guests} guests with ${form.dietary}`,
        'Finalize lighting & floral ambience within allocated limit',
        'Maintain 5-10% contingency for last-minute guest RSVP fluctuations',
      ],
      majorConsiderations:
        form.venueType === 'outdoor' || form.venueType === 'mixed'
          ? 'Outdoor weather and breeze require covered backup canopies and mosquito repellent provisions.'
          : 'Ensure clear venue acoustics and verified power sockets for music & photo lighting.',
    },

    budgetItems: [
      {
        id: `b-${Date.now()}-1`,
        category: 'venue',
        description: `${form.city} Venue / Hall Space Rental (${form.venueType})`,
        estimatedCost: venueBudget,
        basis: 'Standard half-day / evening slot rental',
        assumptions: 'Excludes outside vendor royalty fees',
      },
      {
        id: `b-${Date.now()}-2`,
        category: 'catering',
        description: `Food & Beverage Buffet for ${guests} Guests (${form.dietary})`,
        estimatedCost: cateringBudget,
        basis: `Approx. ₹${perPlateEstimate}/plate for ${guests} guests`,
        assumptions: 'Includes welcome drinks, starters, main course & desserts',
      },
      {
        id: `b-${Date.now()}-3`,
        category: 'decoration',
        description: 'Floral Arrangements, Ambient Fairy Lights & Stage Backdrop',
        estimatedCost: decorBudget,
        basis: 'Package quote from local florist & decor rental',
        assumptions: 'Focus on seasonal marigolds/roses and reusable warm string lights',
      },
      {
        id: `b-${Date.now()}-4`,
        category: 'photography',
        description: 'Professional Candid Moments & Highlight Reel',
        estimatedCost: photoBudget,
        basis: '4-hour coverage with edited digital photo delivery',
        assumptions: 'Freelancer / local studio package',
      },
      {
        id: `b-${Date.now()}-5`,
        category: 'entertainment',
        description: 'Music Sound System / Acoustic Artist Setup',
        estimatedCost: entertainmentBudget,
        basis: 'PA system rental with microphone and operator',
        assumptions: 'Includes playlist curation or local artist booking',
      },
      {
        id: `b-${Date.now()}-6`,
        category: 'other',
        description: 'Emergency Contingency & Extra Guest Buffer',
        estimatedCost: contingencyBudget,
        basis: 'Safety reserve for unexpected needs',
        assumptions: 'Recommended for all celebrations',
      },
    ],

    tasks: [
      {
        id: `t-${Date.now()}-1`,
        title: `Lock ${form.venueType} Venue Space in ${form.city}`,
        description: 'Visit venue in person, check parking, washroom cleanliness, and electrical outlets.',
        category: 'venue',
        priority: 'high',
        daysBeforeEvent: 25,
        dueDate: calculateTaskDueDate(eventDate, 25),
        isCompleted: false,
        estimatedDuration: '2 hours',
      },
      {
        id: `t-${Date.now()}-2`,
        title: `Finalize Menu Tasting for ${guests} Guests`,
        description: `Confirm taste profile and dietary guidelines (${form.dietary}) with head chef.`,
        category: 'catering',
        priority: 'high',
        daysBeforeEvent: 18,
        dueDate: calculateTaskDueDate(eventDate, 18),
        isCompleted: false,
        estimatedDuration: '1.5 hours',
      },
      {
        id: `t-${Date.now()}-3`,
        title: 'Send Digital WhatsApp RSVP Cards & Track Confirmations',
        description: 'Distribute personalized invitation with venue location pin and dress code instructions.',
        category: 'guests',
        priority: 'high',
        daysBeforeEvent: 15,
        dueDate: calculateTaskDueDate(eventDate, 15),
        isCompleted: false,
        estimatedDuration: '1 hour',
      },
      {
        id: `t-${Date.now()}-4`,
        title: 'Review Decor Backdrop & Color Scheme Palette',
        description: 'Ensure stage backdrop matches the recommended warm palette and photo lighting.',
        category: 'decoration',
        priority: 'medium',
        daysBeforeEvent: 10,
        dueDate: calculateTaskDueDate(eventDate, 10),
        isCompleted: false,
        estimatedDuration: '1 hour',
      },
      {
        id: `t-${Date.now()}-5`,
        title: 'Confirm Photographer Shot-list & Key Moments',
        description: 'List must-have family portraits, stage moments, and candid guest interactions.',
        category: 'general',
        priority: 'medium',
        daysBeforeEvent: 5,
        dueDate: calculateTaskDueDate(eventDate, 5),
        isCompleted: false,
        estimatedDuration: '45 mins',
      },
      {
        id: `t-${Date.now()}-6`,
        title: 'Final Vendor Call & Headcount Reconfirmation',
        description: 'Call venue manager and caterer with finalized guest RSVP numbers.',
        category: 'logistics',
        priority: 'high',
        daysBeforeEvent: 2,
        dueDate: calculateTaskDueDate(eventDate, 2),
        isCompleted: false,
        estimatedDuration: '30 mins',
      },
    ],

    vendors: [
      {
        id: `v-${Date.now()}-1`,
        category: 'venue',
        service: `Event Hall / Lawn Venue in ${form.city}`,
        targetBudget: venueBudget,
        bookingDeadlineDays: 25,
        bookingDeadline: calculateTaskDueDate(eventDate, 25),
        status: 'not_contacted',
        questionsToAsk: [
          'What are the cancellation and date-reschedule terms?',
          'Is generator backup included in case of power interruption?',
          'Until what time is amplified music permitted on premises?',
        ],
      },
      {
        id: `v-${Date.now()}-2`,
        category: 'catering',
        service: `Full Service Catering (${form.dietary})`,
        targetBudget: cateringBudget,
        bookingDeadlineDays: 18,
        bookingDeadline: calculateTaskDueDate(eventDate, 18),
        status: 'not_contacted',
        questionsToAsk: [
          'Do you supply water dispensers, chafing dishes, and serving staff?',
          'What is the grace margin if 5-10 extra guests attend?',
          'Are compostable plates and cutlery included in the per-plate quote?',
        ],
      },
      {
        id: `v-${Date.now()}-3`,
        category: 'decoration',
        service: 'Theme Floral & Lighting Decorator',
        targetBudget: decorBudget,
        bookingDeadlineDays: 14,
        bookingDeadline: calculateTaskDueDate(eventDate, 14),
        status: 'not_contacted',
        questionsToAsk: [
          'Will you provide samples or mockups of the stage photo backdrop?',
          'When does your crew start setup on the event day?',
        ],
      },
      {
        id: `v-${Date.now()}-4`,
        category: 'photography',
        service: 'Event Photographer & Candid Video Highlights',
        targetBudget: photoBudget,
        bookingDeadlineDays: 12,
        bookingDeadline: calculateTaskDueDate(eventDate, 12),
        status: 'not_contacted',
        questionsToAsk: [
          'What is the turnaround time for receiving high-res photos and social reel?',
          'Do you bring continuous lighting for evening shots?',
        ],
      },
    ],

    ideas: [
      {
        id: `i-${Date.now()}-1`,
        title: 'Interactive Guest Polaroid & Message Tree',
        category: 'guest_experience',
        description: 'Provide an instant camera where guests peg their photo along with a handwritten wish.',
        whyItFits: 'Creates a sentimental keepsake album that double-functions as beautiful live party decor.',
        costImpact: 'low',
        effortLevel: 'easy',
        isFavorite: true,
      },
      {
        id: `i-${Date.now()}-2`,
        title: 'Live Signature Mocktail Station',
        category: 'food',
        description: 'Serve two signature infused mocktails (e.g. Masala Guava Fizz and Lychee Mint Cooler).',
        whyItFits: 'Gives the welcome reception an upscale lounge feeling at a fraction of bar catering costs.',
        costImpact: 'low',
        effortLevel: 'easy',
        isFavorite: false,
      },
      {
        id: `i-${Date.now()}-3`,
        title: 'Warm Fairy Light Canopy Ceiling',
        category: 'decor',
        description: 'Drape criss-cross micro LED warm string lights overhead across the main gathering space.',
        whyItFits: 'Instantly elevates ordinary banquet rooms or gardens into an enchanted setting.',
        costImpact: 'low',
        effortLevel: 'moderate',
        isFavorite: true,
      },
      {
        id: `i-${Date.now()}-4`,
        title: 'Crowdsourced Celebration Music Playlist',
        category: 'activity',
        description: 'Invite guests via the RSVP message to recommend one track they love to dance to.',
        whyItFits: 'Engages guests before the celebration starts and guarantees a packed dance floor.',
        costImpact: 'free',
        effortLevel: 'easy',
        isFavorite: false,
      },
    ],

    risks: [
      {
        id: `r-${Date.now()}-1`,
        risk: 'Guest count exceeding RSVP estimates',
        severity: 'medium',
        mitigation: 'Reserve a 10% plate buffer with caterer and prepare backup self-serve appetizers.',
        alternative: 'Contract on a flexible sliding-scale tiered plate price.',
      },
      {
        id: `r-${Date.now()}-2`,
        risk: form.venueType === 'outdoor' ? 'Sudden rainfall, humidity, or wind gusts' : 'AV system echo or microphone feedback',
        severity: 'high',
        mitigation:
          form.venueType === 'outdoor'
            ? 'Ensure venue contract includes covered backup hall or waterproof awning canopy.'
            : 'Schedule 30-minute sound check 2 hours before guests arrive.',
        alternative: 'Keep portable Bluetooth speakers and battery spotlights ready as backup.',
      },
    ],
  };
}
