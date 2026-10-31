'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StepBasics } from '@/components/create/StepBasics';
import { StepPreferences } from '@/components/create/StepPreferences';
import { StepScale } from '@/components/create/StepScale';
import { PRESETS } from '@/components/create/presets';
import { createEventFormSchema, CreateEventFormData } from '@/types/schemas';
import { saveEvent } from '@/utils/storage';
import { generateOfflinePlan } from '@/utils/offlineGenerator';
import { createEventPlanFromAI } from '@/utils/eventMapper';
import { requestEventPlan } from '@/utils/aiPlanClient';

function getDefaultEventDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

const DEFAULT_EVENT_DATE = getDefaultEventDate();

type ApiError = {
  type: 'KEY_MISSING' | 'GENERIC';
  message: string;
};

export default function CreateEventPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventFormSchema),
    defaultValues: {
      title: '',
      eventType: 'birthday',
      eventDate: DEFAULT_EVENT_DATE,
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

  const handleApplyPreset = (presetData: Partial<CreateEventFormData>) => {
    reset({ ...getValues(), ...presetData });
  };

  const onFormSubmit = async (data: CreateEventFormData) => {
    setIsGenerating(true);
    setApiError(null);

    const result = await requestEventPlan(data);

    if (result.status === 'success') {
      const eventPlan = createEventPlanFromAI(data, result.data);
      saveEvent(eventPlan);
      router.push(`/events/${eventPlan.id}`);
      setIsGenerating(false);
      return;
    }

    if (result.status === 'apiKeyMissing') {
      setApiError({
        type: 'KEY_MISSING',
        message:
          'Gemini API key is not configured on the server. You can generate your tailored plan instantly using our deterministic offline engine, or configure GEMINI_API_KEY in .env.local.',
      });
    } else {
      setApiError({ type: 'GENERIC', message: result.message });
    }

    setIsGenerating(false);
  };

  const handleGenerateOffline = () => {
    const offlinePlan = generateOfflinePlan(getValues());
    saveEvent(offlinePlan);
    router.push(`/events/${offlinePlan.id}`);
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      const values = getValues();
      if (!values.title || !values.city) {
        alert('Please enter a celebration title and city before continuing.');
        return;
      }
    }
    setCurrentStep((step) => step + 1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
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

        <ProgressBar value={currentStep} max={3} color="sage" size="sm" />
      </div>

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

      <Card className="bg-white p-6 sm:p-8 border-[#E5DDD3] shadow-md space-y-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {currentStep === 1 && <StepBasics register={register} errors={errors} />}
          {currentStep === 2 && (
            <StepScale
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
            />
          )}
          {currentStep === 3 && (
            <StepPreferences
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
            />
          )}

          {apiError && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-bold">
                    {apiError.type === 'KEY_MISSING'
                      ? 'AI Key Configuration Notice'
                      : 'Notice'}
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

          <div className="flex items-center justify-between pt-4 border-t border-[#E5DDD3]">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setCurrentStep((step) => step - 1)}
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
                onClick={handleContinue}
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
