
import React from 'react';
import { Button } from '@/components/ui/button';
import DateRangeSelector from './DateRangeSelector';

interface TimeRangeSelectorProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  dateRangeInfo?: string;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ 
  selectedRange, 
  onRangeChange, 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  dateRangeInfo 
}) => {
  const ranges = [
    { key: 'lastDay', label: 'Last Day' },
    { key: 'lastWeek', label: 'Last Week' },
    { key: 'lastMonth', label: 'Last Month' }
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          {ranges.map(range => (
            <Button
              key={range.key}
              variant={selectedRange === range.key ? "default" : "outline"}
              onClick={() => onRangeChange(range.key)}
              className={`transition-all duration-200 ${
                selectedRange === range.key 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md' 
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
            >
              {range.label}
            </Button>
          ))}
          <Button
            variant={selectedRange === 'customRange' ? "default" : "outline"}
            onClick={() => onRangeChange('customRange')}
            className={`transition-all duration-200 ${
              selectedRange === 'customRange' 
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md' 
                : 'hover:bg-gray-50 border-gray-200'
            }`}
          >
            Custom Range
          </Button>
        </div>
        
        {selectedRange === 'customRange' && (
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
          />
        )}
      </div>
      
      {dateRangeInfo && (
        <p className="text-sm text-gray-600 mt-2">{dateRangeInfo}</p>
      )}
    </div>
  );
};

export default TimeRangeSelector;
