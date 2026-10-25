// Gatherly AI - Validation Schemas using Zod
import { z } from 'zod';

// Known event type values (used for form select and offline generator)
export const KNOWN_EVENT_TYPES = [
  'wedding',
  'birthday',
  'anniversary',
  'college_fest',
  'community',
  'corporate',
  'baby_shower',
  'housewarming',
  'party',
  'cultural',
  'music_concert',
  'sports_event',
  'fundraiser',
  'other',
] as const;

export const eventTypeSchema = z.enum(
  KNOWN_EVENT_TYPES as unknown as [string, ...string[]]
);

// Flexible event type — accepts any non-empty string so future/custom types never cause a 422
export const flexibleEventTypeSchema = z
  .string()
  .trim()
  .min(1, 'Event type is required')
  .max(80, 'Event type value is too long');

export const venueTypeSchema = z.enum(['indoor', 'outdoor', 'mixed']);

export const taskPrioritySchema = z.enum(['high', 'medium', 'low']);

export const taskCategorySchema = z.enum([
  'venue',
  'catering',
  'decoration',
  'guests',
  'logistics',
  'entertainment',
  'budget',
  'general',
]);

export const vendorCategorySchema = z.enum([
  'venue',
  'catering',
  'decoration',
  'photography',
  'entertainment',
  'transport',
  'rentals',
  'other',
]);

export const vendorStatusSchema = z.enum([
  'not_contacted',
  'contacted',
  'shortlisted',
  'booked',
  'unavailable',
]);

export const ideaCategorySchema = z.enum([
  'theme',
  'decor',
  'activity',
  'food',
  'guest_experience',
  'cost_saving',
  'contingency',
]);

export const costImpactSchema = z.enum(['low', 'medium', 'high', 'free']);
export const effortLevelSchema = z.enum(['easy', 'moderate', 'challenging']);
export const riskSeveritySchema = z.enum(['low', 'medium', 'high']);

// Form schema for creating an event
export const createEventFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Event title must be at least 3 characters')
    .max(100, 'Event title must be under 100 characters'),
  eventType: flexibleEventTypeSchema,
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date (YYYY-MM-DD)'),
  city: z
    .string()
    .trim()
    .min(2, 'City is required')
    .max(60, 'City name is too long'),
  guestCount: z
    .number({ message: 'Guest count must be a number' })
    .int('Guest count must be an integer')
    .min(1, 'Guest count must be at least 1')
    .max(10000, 'Guest count must not exceed 10,000'),
  totalBudget: z
    .number({ message: 'Budget must be a number' })
    .int('Budget must be an integer INR amount')
    .min(5000, 'Minimum budget is ₹5,000')
    .max(100000000, 'Maximum budget is ₹10 Crore'),
  venueType: venueTypeSchema,
  theme: z.string().trim().max(100).default(''),
  dietary: z.string().trim().max(150).default('Mixed (Veg and Non-Veg)'),
  accessibility: z.string().trim().max(200).default('Standard accessibility'),
  priorities: z.array(z.string().trim().max(60)).max(6).default([]),
  additionalNotes: z.string().trim().max(500).default(''),
});

export type CreateEventFormData = z.infer<typeof createEventFormSchema>;

// API request schema — eventType is flexible to accept any non-empty string,
// preventing 422 errors for future/custom event categories from the UI.
export const aiPlanRequestSchema = z.object({
  title: z.string().trim().min(2).max(120),
  eventType: flexibleEventTypeSchema,
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  city: z.string().trim().min(2).max(80),
  guestCount: z.number().int().min(1).max(10000),
  totalBudget: z.number().int().min(5000).max(100000000),
  venueType: venueTypeSchema,
  theme: z.string().trim().max(120).optional().default(''),
  dietary: z.string().trim().max(200).optional().default(''),
  accessibility: z.string().trim().max(200).optional().default(''),
  priorities: z.array(z.string().trim().max(80)).max(8).optional().default([]),
  additionalNotes: z.string().trim().max(600).optional().default(''),
  sectionToRegenerate: z
    .enum(['all', 'ideas', 'timeline', 'budget', 'vendors'])
    .optional()
    .default('all'),
});

export type AIPlanRequest = z.infer<typeof aiPlanRequestSchema>;
export type AIPlanInput = z.input<typeof aiPlanRequestSchema>;

// Resilient normalizers for Gemini responses to handle custom/extended categories
const normalizeVendorCategory = (val: unknown): string => {
  if (typeof val !== 'string') return 'other';
  const lower = val.toLowerCase().trim().replace(/[-_\s]+/g, ' ');
  const exact = ['venue', 'catering', 'decoration', 'photography', 'entertainment', 'transport', 'rentals', 'other'];
  if (exact.includes(lower)) return lower;
  if (lower.includes('food') || lower.includes('cater') || lower.includes('drink') || lower.includes('beverage') || lower.includes('snack') || lower.includes('stall')) return 'catering';
  if (lower.includes('photo') || lower.includes('video') || lower.includes('film') || lower.includes('media') || lower.includes('shoot')) return 'photography';
  if (lower.includes('music') || lower.includes('dj') || lower.includes('artist') || lower.includes('band') || lower.includes('sound') || lower.includes('audio') || lower.includes('perform') || lower.includes('emcee') || lower.includes('mc') || lower.includes('host') || lower.includes('speaker')) return 'entertainment';
  if (lower.includes('decor') || lower.includes('flower') || lower.includes('light') || lower.includes('stage') || lower.includes('backdrop') || lower.includes('floral')) return 'decoration';
  if (lower.includes('transport') || lower.includes('travel') || lower.includes('bus') || lower.includes('cab') || lower.includes('car') || lower.includes('shuttle')) return 'transport';
  if (lower.includes('rent') || lower.includes('equipment') || lower.includes('furniture') || lower.includes('tent') || lower.includes('generator') || lower.includes('rig')) return 'rentals';
  if (lower.includes('venue') || lower.includes('hall') || lower.includes('ground') || lower.includes('auditorium') || lower.includes('space') || lower.includes('campus') || lower.includes('stadium')) return 'venue';
  return 'other';
};

const normalizeTaskCategory = (val: unknown): string => {
  if (typeof val !== 'string') return 'general';
  const lower = val.toLowerCase().trim().replace(/[-_\s]+/g, ' ');
  const exact = ['venue', 'catering', 'decoration', 'guests', 'logistics', 'entertainment', 'budget', 'general'];
  if (exact.includes(lower)) return lower;
  if (lower.includes('venue') || lower.includes('hall') || lower.includes('ground') || lower.includes('space')) return 'venue';
  if (lower.includes('cater') || lower.includes('food') || lower.includes('drink') || lower.includes('beverage')) return 'catering';
  if (lower.includes('decor') || lower.includes('light') || lower.includes('flower') || lower.includes('theme')) return 'decoration';
  if (lower.includes('guest') || lower.includes('invite') || lower.includes('student') || lower.includes('attendee') || lower.includes('registration') || lower.includes('ticket') || lower.includes('rsvp')) return 'guests';
  if (lower.includes('logistic') || lower.includes('security') || lower.includes('permit') || lower.includes('police') || lower.includes('permission') || lower.includes('license') || lower.includes('safety') || lower.includes('medical') || lower.includes('transport') || lower.includes('equipment') || lower.includes('sound') || lower.includes('av') || lower.includes('power') || lower.includes('generator')) return 'logistics';
  if (lower.includes('entertain') || lower.includes('artist') || lower.includes('band') || lower.includes('dj') || lower.includes('music') || lower.includes('perform') || lower.includes('contest') || lower.includes('game') || lower.includes('competition') || lower.includes('event')) return 'entertainment';
  if (lower.includes('budget') || lower.includes('finance') || lower.includes('sponsor') || lower.includes('cost') || lower.includes('fund') || lower.includes('account')) return 'budget';
  return 'general';
};

const normalizeIdeaCategory = (val: unknown): string => {
  if (typeof val !== 'string') return 'activity';
  const lower = val.toLowerCase().trim().replace(/[-_\s]+/g, ' ');
  const exact = ['theme', 'decor', 'activity', 'food', 'guest_experience', 'cost_saving', 'contingency'];
  if (exact.includes(lower)) return lower;
  if (lower.includes('theme') || lower.includes('concept') || lower.includes('vibe')) return 'theme';
  if (lower.includes('decor') || lower.includes('stage') || lower.includes('lighting') || lower.includes('art') || lower.includes('installation') || lower.includes('photo')) return 'decor';
  if (lower.includes('food') || lower.includes('cater') || lower.includes('drink') || lower.includes('beverage') || lower.includes('truck') || lower.includes('snack')) return 'food';
  if (lower.includes('guest') || lower.includes('crowd') || lower.includes('experience') || lower.includes('vibe') || lower.includes('memory') || lower.includes('moment')) return 'guest_experience';
  if (lower.includes('cost') || lower.includes('save') || lower.includes('saving') || lower.includes('budget') || lower.includes('sponsor')) return 'cost_saving';
  if (lower.includes('conting') || lower.includes('backup') || lower.includes('risk') || lower.includes('emergency') || lower.includes('safety') || lower.includes('rain')) return 'contingency';
  return 'activity';
};

const coerceInt = (val: unknown): number => {
  if (typeof val === 'number') return Math.max(0, Math.round(val));
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^\d.-]/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? 0 : Math.max(0, num);
  }
  return 0;
};

const coerceSignedInt = (val: unknown): number => {
  if (typeof val === 'number') return Math.round(val);
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^\d.-]/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

// AI structured generation output schema
// NOTE: String length limits and resilient preprocessing accommodate
// the richness of Gemini's output and avoid validation failures.
export const aiGeneratedConceptSchema = z.object({
  themeName: z.string().min(2).max(150),
  conceptDescription: z.string().min(10).max(1200),
  suggestedColorPalette: z.array(z.string().max(60)).min(2).max(8),
  personalizedRationale: z.string().min(10).max(1200),
});

export const aiGeneratedBudgetItemSchema = z.object({
  category: z.preprocess(normalizeVendorCategory, vendorCategorySchema),
  description: z.string().min(2).max(250),
  estimatedCost: z.preprocess(coerceInt, z.number().int().nonnegative()),
  basis: z.string().max(300).optional().default(''),
  assumptions: z.string().max(500).optional().default(''),
});

export const aiGeneratedTaskSchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().min(5).max(600),
  category: z.preprocess(normalizeTaskCategory, taskCategorySchema),
  priority: z.preprocess((val) => {
    if (typeof val !== 'string') return 'medium';
    const lower = val.toLowerCase().trim();
    if (lower === 'high' || lower === 'urgent' || lower === 'critical' || lower === 'p1') return 'high';
    if (lower === 'low' || lower === 'minor' || lower === 'optional' || lower === 'p3') return 'low';
    return 'medium';
  }, taskPrioritySchema),
  daysBeforeEvent: z.preprocess(coerceSignedInt, z.number().int()),
  estimatedDuration: z.string().max(100).optional().default(''),
});

export const aiGeneratedVendorSchema = z.object({
  category: z.preprocess(normalizeVendorCategory, vendorCategorySchema),
  service: z.string().min(2).max(200),
  bookingDeadlineDays: z.preprocess(coerceSignedInt, z.number().int()),
  targetBudget: z.preprocess(coerceInt, z.number().int().nonnegative()),
  questionsToAsk: z.array(z.string().max(400)).min(1).max(8),
});

export const aiGeneratedIdeaSchema = z.object({
  title: z.string().min(2).max(150),
  category: z.preprocess(normalizeIdeaCategory, ideaCategorySchema),
  description: z.string().min(5).max(600),
  whyItFits: z.string().min(5).max(600),
  costImpact: z.preprocess((val) => {
    if (typeof val !== 'string') return 'medium';
    const lower = val.toLowerCase().trim();
    if (lower === 'free' || lower === 'zero' || lower === 'none' || lower === 'no cost') return 'free';
    if (lower === 'low' || lower === 'cheap' || lower === 'budget-friendly') return 'low';
    if (lower === 'high' || lower === 'expensive' || lower === 'premium') return 'high';
    return 'medium';
  }, costImpactSchema),
  effortLevel: z.preprocess((val) => {
    if (typeof val !== 'string') return 'moderate';
    const lower = val.toLowerCase().trim();
    if (lower === 'easy' || lower === 'simple' || lower === 'quick' || lower === 'low') return 'easy';
    if (lower === 'challenging' || lower === 'hard' || lower === 'complex' || lower === 'high') return 'challenging';
    return 'moderate';
  }, effortLevelSchema),
});

export const aiGeneratedRiskSchema = z.object({
  risk: z.string().min(5).max(300),
  severity: z.preprocess((val) => {
    if (typeof val !== 'string') return 'medium';
    const lower = val.toLowerCase().trim();
    if (lower === 'high' || lower === 'critical' || lower === 'severe' || lower === 'major') return 'high';
    if (lower === 'low' || lower === 'minor' || lower === 'slight') return 'low';
    return 'medium';
  }, riskSeveritySchema),
  mitigation: z.string().min(5).max(600),
  alternative: z.string().min(5).max(600),
});

export const aiGeneratedSummarySchema = z.object({
  approach: z.string().min(10).max(1000),
  keyPriorities: z.array(z.string().max(200)).min(2).max(8),
  majorConsiderations: z.string().min(10).max(1000),
});

export const aiPlanResponseSchema = z.object({
  concept: aiGeneratedConceptSchema,
  summary: aiGeneratedSummarySchema,
  budgetItems: z.array(aiGeneratedBudgetItemSchema).min(3).max(30),
  tasks: z.array(aiGeneratedTaskSchema).min(4).max(40),
  vendors: z.array(aiGeneratedVendorSchema).min(2).max(20),
  ideas: z.array(aiGeneratedIdeaSchema).min(2).max(20),
  risks: z.array(aiGeneratedRiskSchema).min(1).max(12),
});

export type AIPlanResponse = z.infer<typeof aiPlanResponseSchema>;

// Resilient event schema helpers for JSON import & backup restoration
export const eventConceptSchema = z.object({
  themeName: z.string().default('Celebration'),
  conceptDescription: z.string().default(''),
  suggestedColorPalette: z.array(z.string()).default([]),
  personalizedRationale: z.string().default(''),
});

export const eventSummarySchema = z.object({
  approach: z.string().default(''),
  keyPriorities: z.array(z.string()).default([]),
  majorConsiderations: z.string().default(''),
});

export const fullBudgetItemSchema = z.object({
  id: z.string().min(1),
  category: z.preprocess(normalizeVendorCategory, vendorCategorySchema),
  description: z.string().default('Budget Item'),
  estimatedCost: z.preprocess(coerceInt, z.number().int().nonnegative()),
  actualCost: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    return coerceInt(val);
  }, z.number().int().nonnegative().optional()),
  basis: z.string().optional().default(''),
  assumptions: z.string().optional().default(''),
  paidAmount: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    return coerceInt(val);
  }, z.number().int().nonnegative().optional()),
});

export const fullTaskItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().default('Task'),
  description: z.string().default(''),
  category: z.preprocess(normalizeTaskCategory, taskCategorySchema),
  priority: z.preprocess((val) => {
    if (typeof val !== 'string') return 'medium';
    const lower = val.toLowerCase().trim();
    if (lower === 'high' || lower === 'urgent' || lower === 'critical' || lower === 'p1') return 'high';
    if (lower === 'low' || lower === 'minor' || lower === 'optional' || lower === 'p3') return 'low';
    return 'medium';
  }, taskPrioritySchema),
  daysBeforeEvent: z.preprocess(coerceSignedInt, z.number().int()),
  dueDate: z.string().default(''),
  isCustomDate: z.boolean().optional().default(false),
  estimatedDuration: z.string().optional().default(''),
  dependencies: z.array(z.string()).optional().default([]),
  isCompleted: z.boolean().default(false),
  completedAt: z.string().optional(),
});

export const fullVendorItemSchema = z.object({
  id: z.string().min(1),
  category: z.preprocess(normalizeVendorCategory, vendorCategorySchema),
  service: z.string().default('Vendor Service'),
  targetBudget: z.preprocess(coerceInt, z.number().int().nonnegative()),
  actualCost: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    return coerceInt(val);
  }, z.number().int().nonnegative().optional()),
  bookingDeadlineDays: z.preprocess(coerceSignedInt, z.number().int()).default(0),
  bookingDeadline: z.string().default(''),
  status: z.preprocess((val) => {
    if (typeof val !== 'string') return 'not_contacted';
    const lower = val.toLowerCase().trim();
    const valid = ['not_contacted', 'contacted', 'shortlisted', 'booked', 'unavailable'];
    return valid.includes(lower) ? lower : 'not_contacted';
  }, vendorStatusSchema).default('not_contacted'),
  vendorName: z.string().optional().default(''),
  contactNotes: z.string().optional().default(''),
  quotationNotes: z.string().optional().default(''),
  followUpDate: z.string().optional(),
  questionsToAsk: z.array(z.string()).default([]),
});

export const fullIdeaItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().default('Idea'),
  category: z.preprocess(normalizeIdeaCategory, ideaCategorySchema),
  description: z.string().default(''),
  whyItFits: z.string().default(''),
  costImpact: z.preprocess((val) => {
    if (typeof val !== 'string') return 'medium';
    const lower = val.toLowerCase().trim();
    if (lower === 'free' || lower === 'zero' || lower === 'none' || lower === 'no cost') return 'free';
    if (lower === 'low' || lower === 'cheap' || lower === 'budget-friendly') return 'low';
    if (lower === 'high' || lower === 'expensive' || lower === 'premium') return 'high';
    return 'medium';
  }, costImpactSchema).default('medium'),
  effortLevel: z.preprocess((val) => {
    if (typeof val !== 'string') return 'moderate';
    const lower = val.toLowerCase().trim();
    if (lower === 'easy' || lower === 'simple' || lower === 'quick' || lower === 'low') return 'easy';
    if (lower === 'challenging' || lower === 'hard' || lower === 'complex' || lower === 'high') return 'challenging';
    return 'moderate';
  }, effortLevelSchema).default('moderate'),
  isFavorite: z.boolean().default(false),
});

export const fullRiskItemSchema = z.object({
  id: z.string().min(1),
  risk: z.string().default('Risk'),
  severity: z.preprocess((val) => {
    if (typeof val !== 'string') return 'medium';
    const lower = val.toLowerCase().trim();
    if (lower === 'high' || lower === 'critical' || lower === 'severe' || lower === 'major') return 'high';
    if (lower === 'low' || lower === 'minor' || lower === 'slight') return 'low';
    return 'medium';
  }, riskSeveritySchema).default('medium'),
  mitigation: z.string().default(''),
  alternative: z.string().default(''),
});

// Complete EventPlan schema for validation during JSON import
export const fullEventPlanSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  eventType: flexibleEventTypeSchema.default('other'),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date format required (YYYY-MM-DD)'),
  city: z.string().default('City'),
  guestCount: z.preprocess(coerceInt, z.number().int().positive()),
  totalBudget: z.preprocess(coerceInt, z.number().int().positive()),
  venueType: z.preprocess((val) => {
    if (typeof val !== 'string') return 'mixed';
    const lower = val.toLowerCase().trim();
    if (lower.includes('in')) return 'indoor';
    if (lower.includes('out')) return 'outdoor';
    return 'mixed';
  }, venueTypeSchema).default('mixed'),
  theme: z.string().default(''),
  dietary: z.string().default(''),
  accessibility: z.string().default(''),
  priorities: z.array(z.string()).default([]),
  additionalNotes: z.string().default(''),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
  isDemo: z.boolean().optional().default(false),
  concept: eventConceptSchema.default({
    themeName: 'Celebration',
    conceptDescription: '',
    suggestedColorPalette: [],
    personalizedRationale: '',
  }),
  summary: eventSummarySchema.default({
    approach: '',
    keyPriorities: [],
    majorConsiderations: '',
  }),
  budgetItems: z.array(fullBudgetItemSchema).default([]),
  tasks: z.array(fullTaskItemSchema).default([]),
  vendors: z.array(fullVendorItemSchema).default([]),
  ideas: z.array(fullIdeaItemSchema).default([]),
  risks: z.array(fullRiskItemSchema).default([]),
});
