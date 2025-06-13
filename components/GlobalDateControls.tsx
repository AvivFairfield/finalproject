"use client";

import { useRef, useState, useEffect } from "react";
import { CalendarDays, X } from "lucide-react";
import TimeRangeSelector from "./TimeRangeSelector";
import { useDateStore } from "@/lib/stores/dataStore";
import { useClickOutside } from "@/lib/useClickOutside";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
	TooltipArrow,
} from "@/components/ui/tooltip";

const GlobalDateControls = () => {
	const [expanded, setExpanded] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);

	useEffect(() => {
		const opened = sessionStorage.getItem("dateControlOpened") === "true";
		if (!opened) {
			setHasOpened(false); // effect will run
			sessionStorage.setItem("dateControlOpened", "true");
		} else {
			setHasOpened(true); // suppress effect
		}
	}, []);

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

	useEffect(() => {
		if (expanded) {
			localStorage.setItem("dateControlOpened", "true");
			setHasOpened(true);
		}
	}, [expanded]);

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

	useClickOutside([wrapperRef, calendarRef], () => setExpanded(false));

	return (
		<div
			ref={wrapperRef}
			className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2"
		>
			<div
				className={`transition-all duration-500 ease-out transform-gpu
        ${
			expanded
				? "translate-y-0 opacity-100 scale-100"
				: "translate-y-4 opacity-0 scale-95 pointer-events-none"
		}
        bg-gradient-to-br from-[#1f1f1f] to-[#111111]/90
        backdrop-blur-lg border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.6)]
        rounded-2xl ring-1 ring-white/10
        w-[min(100vw-2rem,420px)] px-6 py-6
        hover:ring-2 hover:ring-blue-500/40 hover:shadow-blue-500/10`}
			>
				{expanded && (
					<div className="space-y-4">
						<div className="border-b border-white/10 mb-4 pb-2 flex justify-between items-center">
							<h4 className="text-sm font-semibold text-white/90 tracking-wide">
								Date Filters
							</h4>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setExpanded(false)}
								className="text-white hover:bg-zinc-700 w-8 h-8 rounded-full"
							>
								<X className="w-5 h-5" />
							</Button>
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
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="relative">
								{!hasOpened && (
									<>
										<span className="absolute -inset-2 animate-ping rounded-full bg-blue-500/30 z-0" />
										<div className="absolute -left-[11rem] bottom-2 bg-zinc-800 text-white text-sm px-3 py-1 rounded-lg shadow-lg animate-fade-in ring-1 ring-white/10">
											Select a date range →
										</div>
									</>
								)}
								<Button
									size="icon"
									className="w-14 h-14 relative z-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 text-white shadow-lg hover:scale-105 hover:shadow-xl ring-1 ring-white/10 transition-all"
									onClick={() => setExpanded(true)}
								>
									<CalendarDays className="w-6 h-6" />
								</Button>
							</div>
						</TooltipTrigger>
						<TooltipContent
							side="top"
							className="rounded-md bg-zinc-900 text-white px-3 py-2 text-sm shadow-xl ring-1 ring-blue-500/40 shadow-blue-500/20 backdrop-blur-md animate-fade-in font-medium tracking-tight"
						>
							Date Filter
							<TooltipArrow className="fill-blue-500/20" />
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}
		</div>
	);
};

export default GlobalDateControls;
