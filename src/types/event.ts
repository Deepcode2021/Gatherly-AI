// Gatherly AI - Core Domain Types
// Strict TypeScript types for celebrations & event planning

export type EventType =
  | 'wedding'
  | 'birthday'
  | 'anniversary'
  | 'college_fest'
  | 'community'
  | 'corporate'
  | 'baby_shower'
  | 'housewarming'
  | 'party'
  | 'cultural'
  | 'music_concert'
  | 'sports_event'
  | 'fundraiser'
  | 'other'
  | (string & {});

export type VenueType = 'indoor' | 'outdoor' | 'mixed';

export type TaskPriority = 'high' | 'medium' | 'low';

export type TaskCategory =
  | 'venue'
  | 'catering'
  | 'decoration'
  | 'guests'
  | 'logistics'
  | 'entertainment'
  | 'budget'
  | 'general';

export type VendorCategory =
  | 'venue'
  | 'catering'
  | 'decoration'
  | 'photography'
  | 'entertainment'
  | 'transport'
  | 'rentals'
  | 'other';

export type VendorStatus =
  | 'not_contacted'
  | 'contacted'
  | 'shortlisted'
  | 'booked'
  | 'unavailable';

export type IdeaCategory =
  | 'theme'
  | 'decor'
  | 'activity'
  | 'food'
  | 'guest_experience'
  | 'cost_saving'
  | 'contingency';

export type CostImpact = 'low' | 'medium' | 'high' | 'free';
export type EffortLevel = 'easy' | 'moderate' | 'challenging';
export type RiskSeverity = 'low' | 'medium' | 'high';

export interface BudgetItem {
  id: string;
  category: VendorCategory;
  description: string;
  estimatedCost: number; // Integer INR
  actualCost?: number; // Integer INR (user edited)
  basis?: string; // e.g. "₹650/plate for 60 guests"
  assumptions?: string;
  paidAmount?: number; // Integer INR
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  daysBeforeEvent: number; // Relative integer offset from event date (e.g. 30 = 30 days before)
  dueDate: string; // ISO string YYYY-MM-DD
  isCustomDate?: boolean;
  estimatedDuration?: string;
  dependencies?: string[]; // IDs of predecessor tasks
  isCompleted: boolean;
  completedAt?: string;
}

export interface VendorItem {
  id: string;
  category: VendorCategory;
  service: string;
  targetBudget: number; // Integer INR
  actualCost?: number; // Integer INR
  bookingDeadlineDays: number;
  bookingDeadline: string; // ISO string YYYY-MM-DD
  status: VendorStatus;
  vendorName?: string;
  contactNotes?: string;
  quotationNotes?: string;
  followUpDate?: string;
  questionsToAsk: string[];
}

export interface PersonalizedIdea {
  id: string;
  title: string;
  category: IdeaCategory;
  description: string;
  whyItFits: string;
  costImpact: CostImpact;
  effortLevel: EffortLevel;
  isFavorite: boolean;
}

export interface RiskAlternative {
  id: string;
  risk: string;
  severity: RiskSeverity;
  mitigation: string;
  alternative: string;
}

export interface EventConcept {
  themeName: string;
  conceptDescription: string;
  suggestedColorPalette: string[];
  personalizedRationale: string;
}

export interface EventSummary {
  approach: string;
  keyPriorities: string[];
  majorConsiderations: string;
}

export interface EventPlan {
  id: string;
  title: string;
  eventType: EventType;
  eventDate: string; // ISO string YYYY-MM-DD
  city: string;
  guestCount: number;
  totalBudget: number; // Integer INR
  venueType: VenueType;
  theme: string;
  dietary: string;
  accessibility: string;
  priorities: string[];
  additionalNotes: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;

  concept: EventConcept;
  summary: EventSummary;
  budgetItems: BudgetItem[];
  tasks: TaskItem[];
  vendors: VendorItem[];
  ideas: PersonalizedIdea[];
  risks: RiskAlternative[];
}

export interface ReadinessScoreBreakdown {
  overallScore: number; // 0 - 100
  taskScore: number;
  vendorScore: number;
  budgetScore: number;
  riskScore: number;
  completedTasks: number;
  totalTasks: number;
  bookedVendors: number;
  totalVendors: number;
  budgetUtilizedPercentage: number;
  details: {
    label: string;
    score: number;
    maxScore: number;
    explanation: string;
  }[];
  criticalAlerts: {
    id: string;
    type: 'danger' | 'warning' | 'info';
    title: string;
    message: string;
    actionTab?: string;
  }[];
}

export interface BudgetSummary {
  totalBudget: number;
  totalEstimated: number;
  totalActual: number;
  effectiveTotal: number;
  remainingBudget: number;
  utilizationPercentage: number;
  isOverBudget: boolean;
  overspendingAmount: number;
  contingencyAllocated: number;
  totalPaid: number;
  remainingToPay: number;
  categoryBreakdown: {
    category: VendorCategory;
    label: string;
    allocated: number;
    actual: number;
    percentage: number;
    itemCount: number;
  }[];
  savingsOpportunities: {
    category: string;
    suggestion: string;
    potentialSavings: number;
  }[];
}
