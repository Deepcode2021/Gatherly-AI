import { Check, Lock, Utensils } from 'lucide-react';
import { Control, FieldErrors, UseFormRegister, UseFormSetValue, useWatch } from 'react-hook-form';
import { CreateEventFormData } from '@/types/schemas';
import { POPULAR_PRIORITIES } from './presets';

const MAX_PRIORITIES = 6;

interface StepPreferencesProps {
  register: UseFormRegister<CreateEventFormData>;
  errors: FieldErrors<CreateEventFormData>;
  control: Control<CreateEventFormData>;
  setValue: UseFormSetValue<CreateEventFormData>;
}

export function StepPreferences({
  register,
  errors,
  control,
  setValue,
}: StepPreferencesProps) {
  const priorities = useWatch({ control, name: 'priorities' }) ?? [];
  const atLimit = priorities.length >= MAX_PRIORITIES;

  const togglePriority = (priority: string) => {
    if (priorities.includes(priority)) {
      setValue(
        'priorities',
        priorities.filter((item) => item !== priority)
      );
      return;
    }

    if (!atLimit) {
      setValue('priorities', [...priorities, priority]);
    }
  };

  const visiblePriorities = [
    ...POPULAR_PRIORITIES,
    ...priorities.filter((priority) => !POPULAR_PRIORITIES.includes(priority)),
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <h2 className="text-lg font-bold text-[#182620] flex items-center gap-2">
        <Utensils className="w-5 h-5 text-[#2D5A43]" />
        Step 3: Priorities & Preferences
      </h2>

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
        {errors.dietary && (
          <p className="text-xs text-red-600 font-medium">{errors.dietary.message}</p>
        )}
      </div>

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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span id="key-priorities-label" className="text-xs font-semibold text-[#182620]">
            Select Key Priorities (Pick up to 6):
          </span>
          <span
            className={`text-xs font-semibold tabular-nums ${
              atLimit ? 'text-[#C85A32]' : 'text-[#5C6E64]'
            }`}
            aria-live="polite"
          >
            {priorities.length} of 6 selected
          </span>
        </div>
        <div role="group" aria-labelledby="key-priorities-label" className="flex flex-wrap gap-2">
          {visiblePriorities.map((priority) => {
            const isSelected = priorities.includes(priority);
            const isDisabled = !isSelected && atLimit;

            return (
              <button
                key={priority}
                type="button"
                onClick={() => togglePriority(priority)}
                disabled={isDisabled}
                aria-pressed={isSelected}
                title={
                  isDisabled
                    ? 'Maximum 6 priorities selected. Deselect one to choose another.'
                    : undefined
                }
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
                {priority}
              </button>
            );
          })}
        </div>
        {atLimit && (
          <p className="text-[11px] text-[#C85A32] font-medium">
            Limit reached. Deselect a priority to choose a different one.
          </p>
        )}
      </div>

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
  );
}
