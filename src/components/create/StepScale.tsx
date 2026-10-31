import { Users, Wallet } from 'lucide-react';
import { Control, FieldErrors, UseFormRegister, UseFormSetValue, useWatch } from 'react-hook-form';
import { VenueType } from '@/types/event';
import { CreateEventFormData } from '@/types/schemas';
import { formatINR } from '@/utils/formatters';

const VENUE_TYPES: VenueType[] = ['indoor', 'outdoor', 'mixed'];

interface StepScaleProps {
  register: UseFormRegister<CreateEventFormData>;
  errors: FieldErrors<CreateEventFormData>;
  control: Control<CreateEventFormData>;
  setValue: UseFormSetValue<CreateEventFormData>;
}

export function StepScale({ register, errors, control, setValue }: StepScaleProps) {
  const totalBudget = useWatch({ control, name: 'totalBudget' });
  const venueType = useWatch({ control, name: 'venueType' });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <h2 className="text-lg font-bold text-[#182620] flex items-center gap-2">
        <Wallet className="w-5 h-5 text-[#2D5A43]" />
        Step 2: Scale & Budget
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            Current: {formatINR(Number.isFinite(totalBudget) ? totalBudget : 0)}
          </div>
          {errors.totalBudget && (
            <p className="text-xs text-red-600 font-medium">{errors.totalBudget.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <span id="venue-style-label" className="text-xs font-semibold text-[#182620]">
          Venue Style <span className="text-red-500">*</span>
        </span>
        <div role="group" aria-labelledby="venue-style-label" className="grid grid-cols-3 gap-3">
          {VENUE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={venueType === type}
              onClick={() => setValue('venueType', type)}
              className={`py-3 px-2 rounded-xl text-xs font-bold capitalize border transition-all text-center cursor-pointer ${
                venueType === type
                  ? 'border-[#2D5A43] bg-[#E8F0EB] text-[#1F3E2E] shadow-2xs'
                  : 'border-[#D4C6B6] bg-[#FAF7F2] text-[#4A5950] hover:bg-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

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
  );
}
