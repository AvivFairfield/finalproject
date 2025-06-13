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
import HowToReadDashboard from "./HowToReadDashboard";
import { useDateStore } from "@/lib/stores/dataStore";

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

type ViewMode = "today" | "lastWeek" | "lastMonth" | "custom";

const COLORS: Record<string, string> = {
	Protein: "#ff6384",
	Fat: "#36a2eb",
	Carbs: "#ffcd56",
};

export default function NutritionPieTimeline() {
	const [data, setData] = useState<ExtendedNutrientGroup[][]>([]);
	const [labels, setLabels] = useState<string[]>([]);
	const {
		viewMode,

		customStartDate,
		customEndDate,
	} = useDateStore();

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

						const latestDateObj = new Date(
							Math.max(
								...entries.map((e) => e.dateObj!.getTime())
							)
						);
						let startDate: Date = new Date(latestDateObj);
						let endDate: Date = new Date(latestDateObj);

						if (viewMode === "today") {
							startDate.setHours(0, 0, 0, 0);
							endDate.setHours(23, 59, 59, 999);
						} else if (viewMode === "lastWeek") {
							startDate.setDate(startDate.getDate() - 6);
							startDate.setHours(0, 0, 0, 0);
							endDate.setHours(23, 59, 59, 999);
						} else if (viewMode === "lastMonth") {
							startDate.setDate(startDate.getDate() - 29);
							startDate.setHours(0, 0, 0, 0);
							endDate.setHours(23, 59, 59, 999);
						} else if (viewMode === "custom") {
							if (!customStartDate || !customEndDate) return;
							startDate = new Date(customStartDate);
							endDate = new Date(customEndDate);
							endDate.setHours(23, 59, 59, 999);
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

			if (mode === "today") key = format(date, "HH:00");
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
	const isDayView = viewMode !== "today";

	return (
		<div className="p-4">
			<div className="bg-muted rounded-lg p-4 shadow-md">
				<h2 className="text-lg font-semibold mb-1 text-white">
					Macronutrient Timeline (
					{viewMode === "today" ? "by Hour" : "by Date"})
				</h2>

				{labels.length > 1 && (
					<>
						<p className="text-sm text-gray-300 mb-2">
							{viewMode === "custom" &&
							customStartDate &&
							customEndDate ? (
								<>
									Showing data from{" "}
									<strong>
										{format(customStartDate, "PPP")}
									</strong>{" "}
									to{" "}
									<strong>
										{format(customEndDate, "PPP")}
									</strong>
								</>
							) : (
								<>
									Showing data from{" "}
									<strong>{labels[0]}</strong> to{" "}
									<strong>{labels[labels.length - 1]}</strong>
								</>
							)}
						</p>

						{(() => {
							const total = data.flat().reduce((acc, cur) => {
								acc[cur.name] =
									(acc[cur.name] || 0) + cur.value;
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
							? "grid grid-cols-7 gap-4"
							: "flex overflow-x-auto overflow-y-hidden gap-4 scroll-smooth snap-x snap-mandatory max-h-[240px]"
					}
				>
					{data.map((nutrients, idx) => (
						<div
							key={idx}
							className="w-[140px] flex-shrink-0 snap-center rounded-xl bg-[#1f1f1f] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.4)] ring-1 ring-black/30 transition-all duration-300 hover:shadow-[0_6px_16px_rgba(0,0,0,0.5)]"
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

				<HowToReadDashboard
					title="How to Read This Graph"
					bullets={[
						"Each pie chart represents one day's nutritional breakdown.",
						"The chart is divided into three segments for Protein, Fat, and Carbohydrates (Carbs).",
						"The size of each segment shows the proportion of that nutrient in the daily total.",
						"Hover over a chart to see exact grams of each nutrient and the list of foods consumed.",
						"Use the buttons above to switch between Last Day, Last Week, Last Month, or a custom date range.",
						"The summary line at the top displays the total protein, fat, and carbs for the selected time period.",
						"This graph helps you track your dietary balance and spot nutrition trends over time.",
					]}
					legend={[
						{ label: "Protein", color: "#ff6384", opacity: 1 },
						{ label: "Fat", color: "#36a2eb", opacity: 1 },
						{ label: "Carbs", color: "#ffcd56", opacity: 1 },
					]}
				/>
			</div>
		</div>
	);
}
