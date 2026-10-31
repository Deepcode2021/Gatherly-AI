import { Calendar, MapPin } from 'lucide-react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { CreateEventFormData } from '@/types/schemas';

interface StepBasicsProps {
  register: UseFormRegister<CreateEventFormData>;
  errors: FieldErrors<CreateEventFormData>;
}

export function StepBasics({ register, errors }: StepBasicsProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <h2 className="text-lg font-bold text-[#182620] flex items-center gap-2">
        <Calendar className="w-5 h-5 text-[#2D5A43]" />
        Step 1: Event Basics
      </h2>

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
  );
}
