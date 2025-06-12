import React from "react";
import { Button } from "@/components/ui/button";
import DateRangeSelector from "./DateRangeSelector";

import type { DateRangeOption } from "../lib/stores/dataStore";

interface TimeRangeSelectorProps {
	selectedRange: DateRangeOption;
	onRangeChange: (range: DateRangeOption) => void;
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
	dateRangeInfo,
}) => {
	const ranges: { key: DateRangeOption; label: string }[] = [
		{ key: "today", label: "Last Day" },
		{ key: "lastWeek", label: "Last Week" },
		{ key: "lastMonth", label: "Last Month" },
	];

	return (
		<div className="mb-6">
			<div className="flex flex-col gap-3">
				{/* Time Range Buttons */}
				<div className="flex flex-wrap gap-2">
					{ranges.map((range) => (
						<Button
							key={range.key}
							variant={
								selectedRange === range.key
									? "default"
									: "outline"
							}
							onClick={() => onRangeChange(range.key)}
							className={`transition-all duration-200 ${
								selectedRange === range.key
									? "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
									: "hover:bg-gray-50 border-gray-200"
							}`}
						>
							{range.label}
						</Button>
					))}
					<Button
						variant={
							selectedRange === "custom" ? "default" : "outline"
						}
						onClick={() => onRangeChange("custom")}
						className={`transition-all duration-200 ${
							selectedRange === "custom"
								? "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
								: "hover:bg-gray-50 border-gray-200"
						}`}
					>
						Custom Range
					</Button>
				</div>

				{/* Custom Date Pickers Below */}
				{selectedRange === "custom" && (
					<div className="flex flex-wrap gap-2">
						<DateRangeSelector
							startDate={startDate}
							endDate={endDate}
							onStartDateChange={onStartDateChange}
							onEndDateChange={onEndDateChange}
						/>
					</div>
				)}
			</div>

			{/* Range Info */}
			{dateRangeInfo && (
				<p className="text-sm text-white mt-2">{dateRangeInfo}</p>
			)}
		</div>
	);
};

export default TimeRangeSelector;
