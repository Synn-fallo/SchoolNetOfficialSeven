import React from 'react';
import { Calendar, X } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string | null;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string | null) => void;
  placeholderStart?: string;
  placeholderEnd?: string;
  showEndDate?: boolean;
  label?: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  placeholderStart = 'Date de début',
  placeholderEnd = 'Date de fin',
  showEndDate = true,
  label,
}: DateRangePickerProps) {
  
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onStartDateChange(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEndDateChange(e.target.value || null);
  };

  const clearEndDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEndDateChange(null);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {label && (
        <label className="text-xs font-extrabold text-slate-700 tracking-wide">
          {label}
        </label>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Date de début */}
        <div className="flex-1 relative flex items-center">
          <Calendar className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            placeholder={placeholderStart}
          />
        </div>

        {showEndDate && (
          <>
            <span className="hidden sm:inline text-slate-400 text-sm">→</span>
            
            {/* Date de fin */}
            <div className="flex-1 relative flex items-center">
              <Calendar className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={endDate || ''}
                onChange={handleEndDateChange}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                placeholder={placeholderEnd}
              />
              {endDate && (
                <button
                  type="button"
                  onClick={clearEndDate}
                  className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
