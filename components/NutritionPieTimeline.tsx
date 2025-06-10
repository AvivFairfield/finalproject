"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	ResponsiveContainer,
	TooltipProps,
} from "recharts";
import { format } from "date-fns"; // ✅ Make sure you have this!
import DateRangeSelector from "@/components/DateRangeSelector"; // adjust the path as needed

// ✅ Correct TypeScript interfaces
interface NutritionEntry {
	foodName: string;
	dateTaken: string;
	proteins: string;
	fats: string;
	carbohydrates: string;
	dateObj?: Date;
}

interface ExtendedNutrientGroup {
	name: "Protein" | "Fat" | "Carbs";
	value: number;
	foods: string[];
	label: string;
	dateObj?: Date;
}

type ViewMode = "day" | "week" | "month" | "custom";

const COLORS: Record<string, string> = {
	Protein: "#ff6384",
	Fat: "#36a2eb",
	Carbs: "#ffcd56",
};

export default function NutritionPieTimeline() {
	const [data, setData] = useState<ExtendedNutrientGroup[][]>([]);
	const [labels, setLabels] = useState<string[]>([]);
	const [viewMode, setViewMode] = useState<ViewMode>("day");
	const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
	const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

	useEffect(() => {
		fetch("/nutritions2.csv")
			.then((res) => res.text())
			.then((csvText) => {
				Papa.parse<NutritionEntry>(csvText, {
					header: true,
					skipEmptyLines: true,
					complete: (result) => {
						const entries = result.data
							.filter((e) => e.foodName && e.dateTaken)
							.map((e) => ({
								...e,
								dateObj: new Date(e.dateTaken.split(" GMT")[0]),
							}));

						const now = new Date();
						let startDate: Date;
						const endDate: Date = now;

						if (viewMode === "day") {
							startDate = new Date();
							startDate.setHours(0, 0, 0, 0);
						} else if (viewMode === "week") {
							startDate = new Date(now);
							startDate.setDate(now.getDate() - 6);
							startDate.setHours(0, 0, 0, 0);
						} else if (viewMode === "month") {
							startDate = new Date(now);
							startDate.setDate(now.getDate() - 29);
							startDate.setHours(0, 0, 0, 0);
						} else if (viewMode === "custom") {
							if (!customStartDate || !customEndDate) return;
							startDate = customStartDate;
							endDate.setTime(customEndDate.getTime());
						}

						const filteredEntries = entries.filter((entry) => {
							return (
								entry.dateObj &&
								entry.dateObj >= startDate &&
								entry.dateObj <= endDate
							);
						});

						const { grouped, labels } = groupByView(
							filteredEntries,
							viewMode
						);
						setData(grouped);
						setLabels(labels);
					},
				});
			});
	}, [viewMode, customStartDate, customEndDate]);

	const groupByView = (
		entries: NutritionEntry[],
		mode: ViewMode
	): { grouped: ExtendedNutrientGroup[][]; labels: string[] } => {
		const groupMap: Record<string, NutritionEntry[]> = {};

		entries.forEach((entry) => {
			const date = entry.dateObj!;
			let key = "";

			if (mode === "day") key = format(date, "HH:00");
			else key = format(date, "MMM d");

			if (!groupMap[key]) groupMap[key] = [];
			groupMap[key].push(entry);
		});

		const grouped: ExtendedNutrientGroup[][] = [];
		const labelList: string[] = [];

		Object.entries(groupMap)
			.map(([label, group]) => {
				const foods = group.map((g) => g.foodName);
				const protein = group.reduce(
					(sum, e) => sum + parseFloat(e.proteins || "0"),
					0
				);
				const fat = group.reduce(
					(sum, e) => sum + parseFloat(e.fats || "0"),
					0
				);
				const carbs = group.reduce(
					(sum, e) => sum + parseFloat(e.carbohydrates || "0"),
					0
				);

				return {
					label,
					dateObj: group[0].dateObj,
					nutrients: [
						{
							name: "Protein" as const,
							value: protein,
							foods,
							label,
							dateObj: group[0].dateObj,
						},
						{
							name: "Fat" as const,
							value: fat,
							foods,
							label,
							dateObj: group[0].dateObj,
						},
						{
							name: "Carbs" as const,
							value: carbs,
							foods,
							label,
							dateObj: group[0].dateObj,
						},
					],
				};
			})
			.sort((a, b) => a.dateObj!.getTime() - b.dateObj!.getTime())
			.forEach(({ label, nutrients }) => {
				grouped.push(nutrients);
				labelList.push(label);
			});

		return { grouped, labels: labelList };
	};

	function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
		if (active && payload?.length) {
			const slices = payload.map(
				(p) => p.payload as ExtendedNutrientGroup
			);
			const { label, foods } = slices[0];

			const foodCounts: Record<string, number> = {};
			for (const food of foods) {
				foodCounts[food] = (foodCounts[food] || 0) + 1;
			}

			return (
				<div className="bg-white text-black dark:bg-gray-900 dark:text-white p-3 rounded-lg shadow-lg text-sm leading-snug max-w-[220px]">
					<p className="font-semibold mb-2">{label}</p>

					<div className="text-gray-800 dark:text-gray-200 mb-2">
						{Object.entries(foodCounts).map(([food, count], i) => (
							<p key={i}>
								🍽 {food}
								{count > 1 ? ` – ${count}x` : ""}
							</p>
						))}
					</div>

					<hr className="my-2 border-gray-300 dark:border-gray-600" />

					{slices.map((n, i) => (
						<p key={i}>
							<span className="font-semibold">{n.name}</span>:{" "}
							{n.value.toFixed(2)}
						</p>
					))}
				</div>
			);
		}
		return null;
	}

	// 👉 For aligning days in weeks (calendar-like grid)
	const isDayView = viewMode !== "day";

	return (
		<div className="p-4">
			<h2 className="text-lg font-semibold mb-1">
				Macronutrient Timeline (
				{viewMode === "day" ? "by Hour" : "by Date"})
			</h2>
			{labels.length > 1 && (
				<>
					<p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
						{viewMode === "custom" &&
						customStartDate &&
						customEndDate ? (
							<>
								Showing data from{" "}
								<strong>
									{format(customStartDate, "PPP")}
								</strong>{" "}
								to{" "}
								<strong>{format(customEndDate, "PPP")}</strong>
							</>
						) : labels.length > 1 ? (
							<>
								Showing data from <strong>{labels[0]}</strong>{" "}
								to <strong>{labels[labels.length - 1]}</strong>
							</>
						) : null}
					</p>

					{(() => {
						const total = data.flat().reduce((acc, cur) => {
							acc[cur.name] = (acc[cur.name] || 0) + cur.value;
							return acc;
						}, {} as Record<string, number>);
						return (
							<p className="text-sm text-muted-foreground mb-4">
								Total in view — Protein:{" "}
								{total.Protein?.toFixed(1) || 0}g, Fat:{" "}
								{total.Fat?.toFixed(1) || 0}g, Carbs:{" "}
								{total.Carbs?.toFixed(1) || 0}g.
							</p>
						);
					})()}
				</>
			)}

			{/* Buttons */}
			<div className="flex flex-wrap items-center gap-3 mb-4">
				{(["day", "week", "month", "custom"] as ViewMode[]).map(
					(mode) => (
						<button
							key={mode}
							className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out transform ${
								viewMode === mode
									? "bg-indigo-500 text-white shadow-md scale-105"
									: "bg-muted text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 scale-100"
							}`}
							onClick={() => setViewMode(mode)}
						>
							{mode === "custom"
								? "Custom"
								: `Last ${
										mode.charAt(0).toUpperCase() +
										mode.slice(1)
								  }`}
						</button>
					)
				)}
				{viewMode === "custom" && (
					<DateRangeSelector
						startDate={customStartDate}
						endDate={customEndDate}
						onStartDateChange={setCustomStartDate}
						onEndDateChange={setCustomEndDate}
					/>
				)}
			</div>

			{/* Legend */}
			<div className="flex items-center gap-4 mb-4 text-sm text-gray-300">
				<div className="flex items-center gap-1">
					<div
						className="w-3 h-3 rounded-full"
						style={{ backgroundColor: "#ff6384" }}
					></div>
					Protein
				</div>
				<div className="flex items-center gap-1">
					<div
						className="w-3 h-3 rounded-full"
						style={{ backgroundColor: "#36a2eb" }}
					></div>
					Fat
				</div>
				<div className="flex items-center gap-1">
					<div
						className="w-3 h-3 rounded-full"
						style={{ backgroundColor: "#ffcd56" }}
					></div>
					Carbs
				</div>
			</div>

			{/* Grid */}
			<div
				className={
					isDayView
						? "grid grid-cols-7 gap-4 px-2 pb-6"
						: "flex overflow-x-auto overflow-y-hidden gap-4 px-2 pb-6 scroll-smooth snap-x snap-mandatory max-h-[240px]"
				}
			>
				{data.map((nutrients, idx) => (
					<div
						key={idx}
						className="w-[140px] flex-shrink-0 snap-center rounded-xl bg-muted p-4 shadow-md relative"
					>
						<p className="text-center text-sm font-semibold mb-2">
							{labels[idx]}
						</p>
						<ResponsiveContainer width={100} height={100}>
							<PieChart>
								<Pie
									data={nutrients}
									dataKey="value"
									nameKey="name"
									outerRadius={45}
								>
									{nutrients.map((slice, i) => (
										<Cell
											key={i}
											fill={COLORS[slice.name]}
										/>
									))}
								</Pie>
								<Tooltip content={<CustomTooltip />} />
							</PieChart>
						</ResponsiveContainer>
					</div>
				))}
			</div>
		</div>
	);
}
