import { CreateEventFormData } from '@/types/schemas';

export const PRESETS: {
  label: string;
  data: Partial<CreateEventFormData>;
}[] = [
  {
    label: '🎂 30th Birthday (Bhopal)',
    data: {
      title: "Aarav's 30th Rooftop Sunset Birthday",
      eventType: 'birthday',
      city: 'Bhopal',
      guestCount: 60,
      totalBudget: 40000,
      venueType: 'mixed',
      theme: 'Warm Sunset & Earthy Boho',
      dietary: 'Vegetarian with Live Chaat & Street Food Stalls',
      accessibility: 'Elevator access required for rooftop terrace',
      priorities: ['Live Chaat Stalls', 'Sunset Photo Booth', 'Acoustic Music'],
    },
  },
  {
    label: '💍 Marigold Wedding (Jaipur)',
    data: {
      title: 'Ananya & Kabir Heritage Wedding',
      eventType: 'wedding',
      city: 'Jaipur',
      guestCount: 250,
      totalBudget: 850000,
      venueType: 'mixed',
      theme: 'Royal Marigold & Rajasthani Heritage',
      dietary: 'Pure Vegetarian Royal Feast with Dal Baati Churma',
      accessibility: 'Wheelchair ramps and elderly golf-cart transfers',
      priorities: ['Royal Decor Backdrop', 'Candid Wedding Photography', 'Grand Buffet Spread'],
    },
  },
  {
    label: '🎸 College Fest (Bengaluru)',
    data: {
      title: 'Aura 2026: Annual Inter-College Cultural Fest',
      eventType: 'college_fest',
      city: 'Bengaluru',
      guestCount: 800,
      totalBudget: 350000,
      venueType: 'outdoor',
      theme: 'Neon Pulse & Battle of the Bands',
      dietary: 'Campus Food Trucks & Quick Bites',
      accessibility: 'Signage, medical booth, and clear crowd emergency lanes',
      priorities: ['Pro Concert Sound/Light Rig', 'Student Artist Battle', 'Campus Safety Logistics'],
    },
  },
];

export const POPULAR_PRIORITIES = [
  'Memorable Live Food Counters',
  'Candid Photography & Reels',
  'Acoustic Live Music / DJ',
  'Eco-Friendly / Zero Waste',
  'Sentimental Photo Memory Wall',
  'Interactive Games & Quizzes',
  'Strict Budget Discipline',
  'Comfortable Seating for Elders',
];
