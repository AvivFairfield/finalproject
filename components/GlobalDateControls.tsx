"use client";

import { useRef, useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import TimeRangeSelector from "./TimeRangeSelector";
import { useDateStore } from "@/lib/stores/dataStore";
import { useClickOutside } from "@/lib/useClickOutside";

const GlobalDateControls = () => {
	const [expanded, setExpanded] = useState(false);
	const wrapperRef = useRef<HTMLElement>(null!);
	const calendarRef = useRef<HTMLElement>(null!);

	const {
		viewMode,
		setViewMode,
		customStartDate,
		setCustomStartDate,
		customEndDate,
		setCustomEndDate,
	} = useDateStore();

	// Try to capture the calendar container if it appears (delayed mount)
	useEffect(() => {
		if (expanded) {
			const interval = setInterval(() => {
				const el = document.querySelector(
					"[data-radix-popper-content-wrapper]"
				) as HTMLElement;
				if (el && calendarRef.current !== el) {
					calendarRef.current = el;
					clearInterval(interval);
				}
			}, 50);

			return () => clearInterval(interval);
		}
	}, [expanded, calendarRef]);

	// Attach both main panel and calendar ref
	useClickOutside([wrapperRef, calendarRef], () => setExpanded(false));

	return (
		<div
			ref={wrapperRef}
			className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2"
		>
			<div
				className={`transition-all duration-300 ease-in-out transform origin-bottom-right ${
					expanded ? "scale-100 opacity-95" : "scale-0 opacity-0"
				} w-[min(100vw-2rem,420px)] px-6 py-6 bg-zinc-900 text-white rounded-xl shadow-xl`}
			>
				{expanded && (
					<div className="space-y-4">
						<div className="flex justify-between items-center mb-2">
							<h4 className="text-sm font-semibold">
								Date Filters
							</h4>
							<button
								onClick={() => setExpanded(false)}
								className="text-white text-xl hover:text-gray-400"
								aria-label="Close"
							>
								&times;
							</button>
						</div>
						<TimeRangeSelector
							selectedRange={viewMode}
							onRangeChange={setViewMode}
							startDate={customStartDate}
							endDate={customEndDate}
							onStartDateChange={setCustomStartDate}
							onEndDateChange={setCustomEndDate}
						/>
					</div>
				)}
			</div>

			{!expanded && (
				<button
					onClick={() => setExpanded(true)}
					aria-label="Open date picker"
					className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-700 text-white shadow-lg hover:bg-gray-600 transition-colors duration-200"
				>
					<CalendarDays className="w-5 h-5" />
				</button>
			)}
		</div>
	);
};

export default GlobalDateControls;
