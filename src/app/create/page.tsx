'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Wallet,
  Utensils,
  AlertCircle,
  Check,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { createEventFormSchema, CreateEventFormData } from '@/types/schemas';
import { EventPlan, VenueType } from '@/types/event';
import { saveEvent } from '@/utils/storage';
import { calculateTaskDueDate } from '@/utils/timeline';
import { generateOfflinePlan } from '@/utils/offlineGenerator';
import { formatINR } from '@/utils/formatters';

const PRESETS: {
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

const POPULAR_PRIORITIES = [
  'Memorable Live Food Counters',
  'Candid Photography & Reels',
  'Acoustic Live Music / DJ',
  'Eco-Friendly / Zero Waste',
  'Sentimental Photo Memory Wall',
  'Interactive Games & Quizzes',
  'Strict Budget Discipline',
  'Comfortable Seating for Elders',
];

export default function CreateEventPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<{
    type: 'KEY_MISSING' | 'GENERIC';
    message: string;
  } | null>(null);

  // Default event date 30 days in future
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 30);
  const defaultDateStr = defaultDate.toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventFormSchema),
    defaultValues: {
      title: '',
      eventType: 'birthday',
      eventDate: defaultDateStr,
      city: '',
      guestCount: 50,
      totalBudget: 50000,
      venueType: 'indoor',
      theme: '',
      dietary: 'Mixed (Veg and Non-Veg)',
      accessibility: 'Standard ground-floor / lift access',
      priorities: ['Live Food Counters', 'Candid Photography'],
      additionalNotes: '',
    },
  });

  const formValues = watch();

  // Applies a preset field-by-field so every value keeps its exact field type —
  // no dynamic-key cast and no @ts-expect-error suppression is required.
  const handleApplyPreset = (presetData: Partial<CreateEventFormData>) => {
    if (presetData.title !== undefined) setValue('title', presetData.title);
    if (presetData.eventType !== undefined) setValue('eventType', presetData.eventType);
    if (presetData.eventDate !== undefined) setValue('eventDate', presetData.eventDate);
    if (presetData.city !== undefined) setValue('city', presetData.city);
    if (presetData.guestCount !== undefined) setValue('guestCount', presetData.guestCount);
    if (presetData.totalBudget !== undefined) setValue('totalBudget', presetData.totalBudget);
    if (presetData.venueType !== undefined) setValue('venueType', presetData.venueType);
    if (presetData.theme !== undefined) setValue('theme', presetData.theme);
    if (presetData.dietary !== undefined) setValue('dietary', presetData.dietary);
    if (presetData.accessibility !== undefined) {
      setValue('accessibility', presetData.accessibility);
    }
    if (presetData.priorities !== undefined) setValue('priorities', presetData.priorities);
    if (presetData.additionalNotes !== undefined) {
      setValue('additionalNotes', presetData.additionalNotes);
    }
  };

  const togglePriority = (priority: string) => {
    const current = formValues.priorities || [];
    if (current.includes(priority)) {
      setValue(
        'priorities',
        current.filter((p) => p !== priority)
      );
    } else {
      if (current.length < 6) {
        setValue('priorities', [...current, priority]);
      }
    }
  };

  // Submit handler: tries live Gemini API first, falls back gracefully to offline plan if API key is missing
  const onFormSubmit = async (data: CreateEventFormData) => {
    setIsGenerating(true);
    setApiError(null);

    try {
      const response = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        // Map AI response to complete EventPlan domain object
        const aiData = result.data;
        const newEventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const eventPlan: EventPlan = {
          id: newEventId,
          title: data.title,
          eventType: data.eventType,
          eventDate: data.eventDate,
          city: data.city,
          guestCount: data.guestCount,
          totalBudget: data.totalBudget,
          venueType: data.venueType,
          theme: data.theme || aiData.concept.themeName,
          dietary: data.dietary || 'Mixed',
          accessibility: data.accessibility || 'Standard',
          priorities: data.priorities,
          additionalNotes: data.additionalNotes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDemo: false,
          concept: aiData.concept,
          summary: aiData.summary,
          budgetItems: aiData.budgetItems.map(
            (item: {
              category: string;
              description: string;
              estimatedCost: number;
              basis?: string;
              assumptions?: string;
            }, index: number) => ({
              id: `b-${index + 1}`,
              category: item.category,
              description: item.description,
              estimatedCost: item.estimatedCost,
              basis: item.basis || '',
              assumptions: item.assumptions || '',
            })
          ),
          tasks: aiData.tasks.map(
            (t: {
              title: string;
              description: string;
              category: string;
              priority: 'high' | 'medium' | 'low';
              daysBeforeEvent: number;
              estimatedDuration?: string;
            }, index: number) => ({
              id: `t-${index + 1}`,
              title: t.title,
              description: t.description,
              category: t.category,
              priority: t.priority,
              daysBeforeEvent: t.daysBeforeEvent,
              dueDate: calculateTaskDueDate(data.eventDate, t.daysBeforeEvent),
              isCompleted: false,
              estimatedDuration: t.estimatedDuration || '',
            })
          ),
          vendors: aiData.vendors.map(
            (v: {
              category: string;
              service: string;
              bookingDeadlineDays: number;
              targetBudget: number;
              questionsToAsk: string[];
            }, index: number) => ({
              id: `v-${index + 1}`,
              category: v.category,
              service: v.service,
              bookingDeadlineDays: v.bookingDeadlineDays,
              bookingDeadline: calculateTaskDueDate(data.eventDate, v.bookingDeadlineDays),
              targetBudget: v.targetBudget,
              status: 'not_contacted' as const,
              questionsToAsk: v.questionsToAsk,
            })
          ),
          ideas: aiData.ideas.map(
            (i: {
              title: string;
              category: string;
              description: string;
              whyItFits: string;
              costImpact: 'low' | 'medium' | 'high' | 'free';
              effortLevel: 'easy' | 'moderate' | 'challenging';
            }, index: number) => ({
              id: `i-${index + 1}`,
              title: i.title,
              category: i.category,
              description: i.description,
              whyItFits: i.whyItFits,
              costImpact: i.costImpact,
              effortLevel: i.effortLevel,
              isFavorite: index === 0,
            })
          ),
          risks: aiData.risks.map(
            (r: {
              risk: string;
              severity: 'low' | 'medium' | 'high';
              mitigation: string;
              alternative: string;
            }, index: number) => ({
              id: `r-${index + 1}`,
              risk: r.risk,
              severity: r.severity,
              mitigation: r.mitigation,
              alternative: r.alternative,
            })
          ),
        };

        saveEvent(eventPlan);
        router.push(`/events/${eventPlan.id}`);
        return;
      }

      // Handle Missing API Key or provider error
      if (result.error === 'API_KEY_MISSING') {
        setApiError({
          type: 'KEY_MISSING',
          message:
            'Gemini API key is not configured on the server. You can generate your tailored plan instantly using our deterministic offline engine, or configure GEMINI_API_KEY in .env.local.',
        });
      } else {
        setApiError({
          type: 'GENERIC',
          message: result.message || 'Failed to generate event plan.',
        });
      }
    } catch {
      setApiError({
        type: 'GENERIC',
        message: 'Could not connect to AI service. You can use the instant offline plan generator below.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateOffline = () => {
    const offlinePlan = generateOfflinePlan(formValues);
    saveEvent(offlinePlan);
    router.push(`/events/${offlinePlan.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title & Wizard Step Progress */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DDD3] pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182620] tracking-tight">
              Create Celebration Plan
            </h1>
            <p className="text-sm text-[#5C6E64] mt-0.5">
              Enter your event preferences once to generate a structured, personalized workspace.
            </p>
          </div>

          <Badge variant="sage" size="md">
            Step {currentStep} of 3
          </Badge>
        </div>

        {/* Step Indicator Progress Bar */}
        <ProgressBar value={currentStep} max={3} color="sage" size="sm" />
      </div>

      {/* Preset Chips for 1-click testing */}
      <div className="p-4 rounded-xl bg-white border border-[#E5DDD3] space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5C6E64]">
          <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>Quick Inspiration Presets (Click to autofill):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleApplyPreset(preset.data)}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#D4C6B6] bg-[#FAF7F2] hover:bg-[#E8F0EB] text-[#182620] transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <Card className="bg-white p-6 sm:p-8 border-[#E5DDD3] shadow-md space-y-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-[#182620] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#2D5A43]" />
                Step 1: Event Basics
              </h2>

              {/* Event Title */}
              <div className="space-y-1.5">
                <label htmlFor="event-title" className="text-xs font-semibold text-[#182620]">
                  Celebration Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="event-title"
                  type="text"
                  placeholder="e.g. Aarav's 30th Rooftop Sunset Birthday"
                  {...register('title')}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#D4C6B6] focus:border-[#2D5A43] focus:ring-1 focus:ring-[#2D5A43] bg-white text-[#182620]"
                />
                {errors.title && (
                  <p className="text-xs text-red-600 font-medium">{errors.title.message}</p>
                )}
              </div>

              {/* Event Type & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="event-type" className="text-xs font-semibold text-[#182620]">
                    Event Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="event-type"
                    {...register('eventType')}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#D4C6B6] focus:border-[#2D5A43] focus:ring-1 focus:ring-[#2D5A43] bg-white text-[#182620]"
                  >
                    <option value="birthday">Birthday Party</option>
                    <option value="wedding">Wedding / Reception</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="college_fest">College Fest / Cultural Event</option>
                    <option value="community">Community Celebration / Utsav</option>
                    <option value="corporate">Corporate Gala / Team Offsite</option>
                    <option value="baby_shower">Baby Shower / Godh Bharai</option>
                    <option value="housewarming">Housewarming / Griha Pravesh</option>
                    <option value="other">Other Celebration</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="event-date" className="text-xs font-semibold text-[#182620]">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="event-date"
                    type="date"
                    {...register('eventDate')}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#D4C6B6] focus:border-[#2D5A43] focus:ring-1 focus:ring-[#2D5A43] bg-white text-[#182620]"
                  />
                  {errors.eventDate && (
                    <p className="text-xs text-red-600 font-medium">{errors.eventDate.message}</p>
                  )}
                </div>
              </div>

              {/* City / Location */}
              <div className="space-y-1.5">
                <label htmlFor="event-city" className="text-xs font-semibold text-[#182620]">
                  City or Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-[#5C6E64]" />
                  <input
                    id="event-city"
                    type="text"
                    placeholder="e.g. Bhopal, Jaipur, Bengaluru, Mumbai"
                    {...register('city')}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#D4C6B6] focus:border-[#2D5A43] focus:ring-1 focus:ring-[#2D5A43] bg-white text-[#182620]"
                  />
                </div>
                {errors.city && (
                  <p className="text-xs text-red-600 font-medium">{errors.city.message}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Scale, Budget & Venue */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-[#182620] flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#2D5A43]" />
                Step 2: Scale & Budget
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Guest Count */}
                <div className="space-y-1.5">
                  <label htmlFor="guest-count" className="text-xs font-semibold text-[#182620]">
                    Expected Guest Count <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 absolute left-3.5 top-3 text-[#5C6E64]" />
                    <input
                      id="guest-count"
                      type="number"
                      min={1}
                      max={10000}
                      {...register('guestCount', { valueAsNumber: true })}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#D4C6B6] focus:border-[#2D5A43] focus:ring-1 focus:ring-[#2D5A43] bg-white text-[#182620]"
                    />
                  </div>
                  {errors.guestCount && (
                    <p className="text-xs text-red-600 font-medium">{errors.guestCount.message}</p>
                  )}
                </div>

                {/* Total Budget in INR */}
                <div className="space-y-1.5">
                  <label htmlFor="total-budget" className="text-xs font-semibold text-[#182620]">
                    Total Target Budget in INR (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="total-budget"
                    type="number"
                    step={1000}
                    min={5000}
                    {...register('totalBudget', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#D4C6B6] focus:border-[#2D5A43] focus:ring-1 focus:ring-[#2D5A43] bg-white text-[#182620]"
                  />
                  <div className="text-[11px] text-[#2D5A43] font-semibold">
                    Current:{' '}
                    {formatINR(
                      isNaN(formValues.totalBudget) ? 0 : formValues.totalBudget
                    )}
                  </div>
                  {errors.totalBudget && (
                    <p className="text-xs text-red-600 font-medium">
                      {errors.totalBudget.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Venue Type */}
              <div className="space-y-1.5">
                <span id="venue-style-label" className="text-xs font-semibold text-[#182620]">
                  Venue Style <span className="text-red-500">*</span>
                </span>
                <div
                  role="group"
                  aria-labelledby="venue-style-label"
                  className="grid grid-cols-3 gap-3"
                >
                  {(['indoor', 'outdoor', 'mixed'] as VenueType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      aria-pressed={formValues.venueType === type}
                      onClick={() => setValue('venueType', type)}
                      className={`py-3 px-2 rounded-xl text-xs font-bold capitalize border transition-all text-center cursor-pointer ${
                        formValues.venueType === type
                          ? 'border-[#2D5A43] bg-[#E8F0EB] text-[#1F3E2E] shadow-2xs'
                          : 'border-[#D4C6B6] bg-[#FAF7F2] text-[#4A5950] hover:bg-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Theme */}
              <div className="space-y-1.5">
                <label htmlFor="event-theme" className="text-xs font-semibold text-[#182620]">
                  Preferred Theme or Atmosphere (Optional)
                </label>
                <input
                  id="event-theme"
                  type="text"
                  placeholder="e.g. Boho Sunset, Royal Heritage Marigold, Minimalist Pastel"
                  {...register('theme')}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#D4C6B6] focus:border-[#2D5A43] focus:ring-1 focus:ring-[#2D5A43] bg-white text-[#182620]"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Cultural Preferences & Priorities */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-[#182620] flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#2D5A43]" />
                Step 3: Priorities & Preferences
              </h2>

              {/* Dietary Requirements */}
              <div className="space-y-1.5">
                <label htmlFor="dietary-prefs" className="text-xs font-semibold text-[#182620]">
                  Dietary & Catering Preferences
                </label>
                <input
                  id="dietary-prefs"
                  type="text"
                  placeholder="e.g. Pure Vegetarian, Jain options, Live Chaat counters, Mixed"
                  {...register('dietary')}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#D4C6B6] focus:border-[#2D5A43] focus:ring-1 focus:ring-[#2D5A43] bg-white text-[#182620]"
                />
              </div>

              {/* Accessibility */}
              <div className="space-y-1.5">
                <label htmlFor="accessibility-reqs" className="text-xs font-semibold text-[#182620]">
                  Accessibility Requirements
                </label>
                <input
                  id="accessibility-reqs"
                  type="text"
                  placeholder="e.g. Wheelchair access, elevator to terrace, seating for elders"
                  {...register('accessibility')}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#D4C6B6] focus:border-[#2D5A43] focus:ring-1 focus:ring-[#2D5A43] bg-white text-[#182620]"
                />
              </div>

              {/* Key Priorities Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span id="key-priorities-label" className="text-xs font-semibold text-[#182620]">
                    Select Key Priorities (Pick up to 6):
                  </span>
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      (formValues.priorities?.length ?? 0) >= 6
                        ? 'text-[#C85A32]'
                        : 'text-[#5C6E64]'
                    }`}
                    aria-live="polite"
                  >
                    {formValues.priorities?.length ?? 0} of 6 selected
                  </span>
                </div>
                <div
                  role="group"
                  aria-labelledby="key-priorities-label"
                  className="flex flex-wrap gap-2"
                >
                  {/* Render POPULAR_PRIORITIES chips plus any custom preset values not in the list */}
                  {[
                    ...POPULAR_PRIORITIES,
                    ...(formValues.priorities ?? []).filter(
                      (p) => !POPULAR_PRIORITIES.includes(p)
                    ),
                  ].map((p) => {
                    const isSelected = formValues.priorities?.includes(p);
                    const atLimit = (formValues.priorities?.length ?? 0) >= 6;
                    const isDisabled = !isSelected && atLimit;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePriority(p)}
                        disabled={isDisabled}
                        aria-pressed={isSelected}
                        title={isDisabled ? 'Maximum 6 priorities selected. Deselect one to choose another.' : undefined}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'border-[#2D5A43] bg-[#2D5A43] text-white shadow-xs font-medium cursor-pointer'
                            : isDisabled
                            ? 'border-[#E5DDD3] bg-[#F2ECE4] text-[#A0AFA6] cursor-not-allowed opacity-60'
                            : 'border-[#D4C6B6] bg-[#FAF7F2] text-[#4A5950] hover:bg-white cursor-pointer'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        {isDisabled && <Lock className="w-3 h-3" />}
                        {p}
                      </button>
                    );
                  })}
                </div>
                {(formValues.priorities?.length ?? 0) >= 6 && (
                  <p className="text-[11px] text-[#C85A32] font-medium">
                    Limit reached. Deselect a priority to choose a different one.
                  </p>
                )}
              </div>

              {/* Additional Notes */}
              <div className="space-y-1.5">
                <label htmlFor="additional-notes" className="text-xs font-semibold text-[#182620]">
                  Additional Instructions / Context
                </label>
                <textarea
                  id="additional-notes"
                  rows={3}
                  placeholder="e.g. Family celebration with college friends. Keep protocol casual. Lake breeze expected."
                  {...register('additionalNotes')}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#D4C6B6] focus:border-[#2D5A43] focus:ring-1 focus:ring-[#2D5A43] bg-white text-[#182620]"
                />
              </div>
            </div>
          )}

          {/* API Error Notification */}
          {apiError && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-bold">
                    {apiError.type === 'KEY_MISSING' ? 'AI Key Configuration Notice' : 'Notice'}
                  </strong>
                  <p>{apiError.message}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleGenerateOffline}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Generate Plan with Offline Engine
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/events/demo-bhopal-30th-birthday')}
                >
                  Explore Bhopal Demo Plan Instead
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Controls between Steps */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E5DDD3]">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(currentStep - 1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                disabled={isGenerating}
              >
                Previous
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  // Validate basic fields before moving to next step
                  if (currentStep === 1 && (!formValues.title || !formValues.city)) {
                    alert('Please enter a celebration title and city before continuing.');
                    return;
                  }
                  setCurrentStep(currentStep + 1);
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                variant="accent"
                size="lg"
                isLoading={isGenerating}
                leftIcon={<Sparkles className="w-4 h-4" />}
                className="shadow-md"
              >
                {isGenerating ? 'Synthesizing Plan...' : 'Generate Personalized Plan'}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
