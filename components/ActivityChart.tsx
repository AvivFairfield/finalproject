import React, { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ActivityData } from "./ActivityDashboard";
import HowToReadDashboard from "./HowToReadDashboard";

interface ActivityChartProps {
	activities: ActivityData[];
}

const ActivityChart: React.FC<ActivityChartProps> = ({ activities }) => {
	const { chartData, categories, timeRange, isLastDayView } = useMemo(() => {
		if (!activities.length) {
			return {
				chartData: [],
				categories: [],
				timeRange: { min: 0, max: 24 },
				isLastDayView: false,
			};
		}

		// Normalize category names
		const normalizeCategory = (category: string) => {
			return category.toLowerCase().includes("sport")
				? "Sport Activities"
				: category;
		};

		const uniqueCategories = Array.from(
			new Set(
				activities.map((a) => normalizeCategory(a.activityCategory))
			)
		);

		// Calculate min/max time to determine view type
		const activityTimes = activities.map((a) =>
			parseISO(a.ActivityStart).getTime()
		);
		const minTimestamp = Math.min(...activityTimes);
		const maxTimestamp = Math.max(...activityTimes);
		const timeSpanMs = maxTimestamp - minTimestamp;
		const isLastDayView = timeSpanMs <= 24 * 60 * 60 * 1000;

		const processedActivities = activities.map((activity) => {
			const start = parseISO(activity.ActivityStart);
			const end = parseISO(activity.ActivityEnd);

			let startTime: number;
			let endTime: number;

			if (isLastDayView) {
				// For single day view, use milliseconds since start of that day
				const dayStart = new Date(start);
				dayStart.setHours(0, 0, 0, 0);

				startTime = start.getTime() - dayStart.getTime();
				endTime = end.getTime() - dayStart.getTime();
			} else {
				// For multi-day views, use actual timestamps
				startTime = start.getTime();
				endTime = end.getTime();
			}

			const durationMs = end.getTime() - start.getTime(); // Always use actual duration

			return {
				...activity,
				startTime,
				endTime,
				durationMs,
				activityCategory: normalizeCategory(activity.activityCategory),
				categoryIndex: uniqueCategories.indexOf(
					normalizeCategory(activity.activityCategory)
				),
				date: start,
			};
		});

		const timeRange = isLastDayView
			? { min: 0, max: 24 * 60 * 60 * 1000 } // 24 hours in ms
			: { min: minTimestamp, max: maxTimestamp };

		return {
			chartData: processedActivities,
			categories: uniqueCategories,
			timeRange,
			isLastDayView,
		};
	}, [activities]);

	const getIntensityOpacity = (intensity: string) => {
		switch (intensity) {
			case "High":
				return 1;
			case "Moderate":
				return 0.6;
			case "Low":
				return 0.3;
			default:
				return 0.5;
		}
	};

	const getCategoryColor = (category: string) => {
		switch (category) {
			case "Sport Activities":
			case "Sports Activities":
				return "#3B82F6";
			case "Cognitive Activities":
				return "#10B981";
			case "Home Activities":
				return "#F59E0B";
			default:
				return "#6B7280";
		}
	};

	const chartWidth = 1200;
	const chartHeight = 400;
	const marginTop = 60;
	const marginBottom = 80;
	const marginLeft = 120;
	const marginRight = 60;

	const plotWidth = chartWidth - marginLeft - marginRight;
	const plotHeight = chartHeight - marginTop - marginBottom;

	const categoryHeight = plotHeight / Math.max(categories.length, 1);
	const timeScale = plotWidth / (timeRange.max - timeRange.min);

	// Generate time labels based on view type
	const timeLabels: number[] = [];

	if (isLastDayView) {
		// For single day: show every 2 hours
		for (let hour = 0; hour <= 24; hour += 2) {
			timeLabels.push(hour * 60 * 60 * 1000); // Convert hours to milliseconds
		}
	} else {
		// For multi-day views: show dates with times
		const timeSpanMs = timeRange.max - timeRange.min;
		const timeSpanDays = timeSpanMs / (24 * 60 * 60 * 1000);

		let intervalMs: number;
		if (timeSpanDays <= 7) {
			// For week view: show every 12 hours
			intervalMs = 12 * 60 * 60 * 1000;
		} else {
			// For month view: show every day at noon
			intervalMs = 24 * 60 * 60 * 1000;
		}

		// Start from the beginning of the first day
		const startDate = new Date(timeRange.min);
		startDate.setHours(0, 0, 0, 0);

		let current = startDate.getTime();
		while (current <= timeRange.max) {
			if (current >= timeRange.min) {
				timeLabels.push(current);
			}
			current += intervalMs;
		}

		// Ensure we have the end point
		if (!timeLabels.includes(timeRange.max)) {
			timeLabels.push(timeRange.max);
		}
	}

	return (
		<div className="w-full">
			<div className="mb-6">
				<div className="text-sm font-semibold text-foreground mb-2">
					Activity Summary – Grouped by Category
				</div>

				<div className="flex flex-wrap gap-4 mb-4">
					{categories.map((category) => (
						<div key={category} className="flex items-center gap-2">
							<div
								className="w-4 h-4 rounded"
								style={{
									backgroundColor: getCategoryColor(category),
								}}
							/>
							<span className="text-sm text-muted-foreground">
								{category}
							</span>
						</div>
					))}
				</div>

				<div>
					<div className="text-sm font-semibold text-foreground mb-2">
						Intensity Legend (Transparency)
					</div>
					<div className="flex gap-4">
						{[
							{ label: "High", opacity: 1 },
							{ label: "Moderate", opacity: 0.6 },
							{ label: "Low", opacity: 0.3 },
						].map((item) => (
							<div
								key={item.label}
								className="flex items-center gap-2"
							>
								<div
									className="w-4 h-4 rounded bg-gray-500"
									style={{ opacity: item.opacity }}
								/>
								<span className="text-sm text-muted-foreground">
									{item.label}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
				<div className="flex">
					<div
						style={{
							width: marginLeft + 20,
							height: plotHeight,
							paddingTop: marginTop,
							display: "flex",
							flexDirection: "column",
							paddingRight: "5px",
							marginRight: "-50px",
						}}
					>
						{categories.map((category) => (
							<div
								key={category}
								style={{
									height: categoryHeight,
									display: "flex",
									alignItems: "center",
									justifyContent: "flex-end",
									marginBottom: "70px", // Add this line for extra spacing
								}}
								className="text-sm font-medium text-gray-700"
							>
								{category}
							</div>
						))}
					</div>
					<div className="flex-1">
						<svg
							width={chartWidth}
							height={chartHeight}
							className="min-w-full"
						>
							<g
								transform={`translate(${marginLeft}, ${
									chartHeight - marginBottom
								})`}
							>
								<line
									x1={0}
									y1={0}
									x2={plotWidth}
									y2={0}
									stroke="#E5E7EB"
									strokeWidth={1}
								/>
								{timeLabels.map((timestamp) => {
									const x =
										(timestamp - timeRange.min) * timeScale;
									let label: string;

									if (isLastDayView) {
										// For single day: show time only
										const hours = Math.floor(
											timestamp / (60 * 60 * 1000)
										);
										label = `${hours
											.toString()
											.padStart(2, "0")}:00`;
									} else {
										// For multi-day: show date and time
										const timeSpanDays =
											(timeRange.max - timeRange.min) /
											(24 * 60 * 60 * 1000);
										if (timeSpanDays <= 7) {
											label = format(
												new Date(timestamp),
												"MMM d HH:mm"
											);
										} else {
											label = format(
												new Date(timestamp),
												"MMM d"
											);
										}
									}

									return (
										<g key={timestamp}>
											<line
												x1={x}
												y1={
													-chartHeight +
													marginTop +
													marginBottom
												}
												x2={x}
												y2={0}
												stroke="#F3F4F6"
												strokeWidth={1}
											/>
											<line
												x1={x}
												y1={0}
												x2={x}
												y2={5}
												stroke="#9CA3AF"
												strokeWidth={1}
											/>
											<text
												x={x}
												y={20}
												textAnchor="end"
												transform={`rotate(-35, ${x}, 20)`}
												className="text-xs fill-gray-600"
											>
												{label}
											</text>
										</g>
									);
								})}
							</g>

							<g
								transform={`translate(${marginLeft}, ${marginTop})`}
							>
								{chartData.map((activity, index) => {
									const x =
										(activity.startTime - timeRange.min) *
										timeScale;
									const height = categoryHeight * 0.5;
									const y =
										activity.categoryIndex *
											categoryHeight +
										(categoryHeight - height) / 2;

									// Calculate width based on actual duration
									let width: number;
									if (isLastDayView) {
										// For single day view, use duration directly
										width = Math.max(
											activity.durationMs * timeScale,
											10
										);
									} else {
										// For multi-day views, use a logarithmic scale to better show duration differences
										const minWidth = 6; // Minimum width for visibility
										const maxWidth = 60; // Maximum width to prevent overcrowding

										// Find min/max durations in the dataset for scaling
										const allDurations = chartData.map(
											(a) => a.durationMs
										);
										const minDuration = Math.min(
											...allDurations
										);
										const maxDuration = Math.max(
											...allDurations
										);

										if (minDuration === maxDuration) {
											width = minWidth + 10; // All same duration
										} else {
											// Use logarithmic scaling for better visual differentiation
											const logMin = Math.log(
												minDuration + 1
											);
											const logMax = Math.log(
												maxDuration + 1
											);
											const logCurrent = Math.log(
												activity.durationMs + 1
											);

											const normalizedLog =
												(logCurrent - logMin) /
												(logMax - logMin);
											width =
												minWidth +
												normalizedLog *
													(maxWidth - minWidth);
										}
									}

									const opacity = getIntensityOpacity(
										activity.intensity
									);
									const color = getCategoryColor(
										activity.activityCategory
									);

									return (
										<g key={index}>
											<rect
												x={x}
												y={y}
												width={width}
												height={height}
												fill={color}
												fillOpacity={opacity}
												stroke={color}
												strokeWidth={2}
												style={{
													filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
												}}
												rx={3}
												className="cursor-pointer hover:stroke-2 transition-all"
											>
												<title
													style={{
														fontSize: "50px",
														fontWeight: "bold",
														lineHeight: "5",
													}}
												>
													{`${format(
														parseISO(
															activity.ISO_DateTime
														),
														"MMM d, HH:mm"
													)}
Activity: ${activity.activityName}
Duration: ${Math.round(activity.durationMs / 60000)} min
Intensity: ${activity.intensity}${
														activity.notes
															? `\nNotes: ${activity.notes}`
															: ""
													}`}
												</title>
											</rect>
										</g>
									);
								})}
							</g>

							<text
								x={chartWidth / 2}
								y={30}
								textAnchor="middle"
								className="text-lg font-semibold fill-gray-900"
							>
								Activity Summary – Grouped by Category
							</text>
						</svg>
					</div>
				</div>
			</div>

			<HowToReadDashboard
				bullets={[
					"Horizontal position indicates the time of day the activity occurred.",
					"Length of the rectangle reflects the duration of the activity in minutes.",
					"Color transparency shows the intensity of the activity:",
					"Tip: Hover over any rectangle to view a tooltip with the exact activity name and its duration.",
				]}
				legend={[
					{ label: "High = bold", color: "#3B82F6", opacity: 1 },
					{
						label: "Moderate = semi-transparent",
						color: "#3B82F6",
						opacity: 0.6,
					},
					{ label: "Low = light", color: "#3B82F6", opacity: 0.3 },
				]}
			/>
		</div>
	);
};

export default ActivityChart;
