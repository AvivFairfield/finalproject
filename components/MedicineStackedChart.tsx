"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { useDateStore } from "@/lib/stores/dataStore";
import HowToReadDashboard from "./HowToReadDashboard";
import CustomTooltip from "./CustomTooltip";

interface MedicineEntry {
	name: string;
	quantity: number;
	dateTaken: string;
}

const MedicineStackedChart: React.FC = () => {
	const [data, setData] = useState<MedicineEntry[]>([]);
	const { viewMode, customStartDate, customEndDate } = useDateStore();

	useEffect(() => {
		fetch("/fabricated_medicines_mar_jun_utf8bom.csv")
			.then((res) => res.text())
			.then((text) => {
				const lines = text.trim().split("\n");
				const headers = lines[0].split(",");
				const entries = lines.slice(1).map((line) => {
					const values = line.split(",");
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const entry: any = {};
					headers.forEach((h, i) => {
						entry[h.trim()] = values[i]?.trim();
					});
					return {
						name: entry.name,
						quantity: parseFloat(entry.quantity),
						dateTaken: entry.dateTaken,
					} as MedicineEntry;
				});
				setData(entries);
			});
	}, []);

	const filteredData = useMemo(() => {
		if (!data.length) return [];

		let start: Date;
		let end: Date;
		const maxDate = new Date(
			Math.max(...data.map((d) => new Date(d.dateTaken).getTime()))
		);

		if (viewMode === "today") {
			start = new Date(maxDate);
			start.setHours(0, 0, 0, 0);
			end = new Date(maxDate);
			end.setHours(23, 59, 59, 999);
		} else if (viewMode === "lastWeek") {
			start = new Date(maxDate);
			start.setDate(start.getDate() - 6);
			start.setHours(0, 0, 0, 0);
			end = new Date(maxDate);
			end.setHours(23, 59, 59, 999);
		} else if (viewMode === "lastMonth") {
			start = new Date(maxDate);
			start.setDate(start.getDate() - 29);
			start.setHours(0, 0, 0, 0);
			end = new Date(maxDate);
			end.setHours(23, 59, 59, 999);
		} else {
			if (!customStartDate || !customEndDate) return [];
			start = new Date(customStartDate);
			start.setHours(0, 0, 0, 0);
			end = new Date(customEndDate);
			end.setHours(23, 59, 59, 999);
		}

		const byDateAndMedicine: Record<string, Record<string, number>> = {};

		data.forEach((entry) => {
			const parsed = new Date(entry.dateTaken);
			if (isNaN(parsed.getTime())) return;

			if (parsed >= start && parsed <= end) {
				const dateKey = format(parsed, "dd/M");
				if (!byDateAndMedicine[dateKey]) {
					byDateAndMedicine[dateKey] = {};
				}
				if (!byDateAndMedicine[dateKey][entry.name]) {
					byDateAndMedicine[dateKey][entry.name] = 0;
				}
				byDateAndMedicine[dateKey][entry.name] += entry.quantity;
			}
		});

		return Object.entries(byDateAndMedicine).map(([date, meds]) => ({
			date,
			...meds,
		}));
	}, [data, viewMode, customStartDate, customEndDate]);

	const allMedicineNames = useMemo(() => {
		const names = new Set<string>();
		data.forEach((entry) => names.add(entry.name));
		return Array.from(names);
	}, [data]);

	const getDateRangeLabel = () => {
		if (!data.length) return "No data available";
		const maxDate = new Date(
			Math.max(...data.map((d) => new Date(d.dateTaken).getTime()))
		);
		const end = new Date(maxDate);

		if (viewMode === "custom" && customStartDate && customEndDate) {
			return `Showing data from ${format(
				customStartDate,
				"MMM d"
			)} to ${format(customEndDate, "MMM d")}`;
		}

		const start = new Date(end);
		if (viewMode === "today") start.setHours(0, 0, 0, 0);
		else if (viewMode === "lastWeek") start.setDate(start.getDate() - 6);
		else if (viewMode === "lastMonth") start.setDate(start.getDate() - 29);

		return `Showing data from ${format(start, "MMM d")} to ${format(
			end,
			"MMM d"
		)}`;
	};

	return (
		<div className="w-full max-w-7xl mx-auto px-4">
			<div className="bg-muted rounded-lg p-4 shadow-md">
				<h2 className="text-xl font-semibold text-white mb-4">
					Medicine Intake Summary
				</h2>

				<div className="text-sm text-muted-foreground font-medium mb-4">
					{getDateRangeLabel()}
				</div>

				<ResponsiveContainer width="100%" height={400}>
					<BarChart data={filteredData}>
						<XAxis dataKey="date" stroke="#8884d8" />
						<YAxis />
						<Tooltip content={<CustomTooltip />} />
						<Legend />
						{allMedicineNames.map((name, idx) => (
							<Bar
								key={name}
								dataKey={name}
								stackId="a"
								fill={`hsl(${(idx * 47) % 360}, 70%, 60%)`}
							/>
						))}
					</BarChart>
				</ResponsiveContainer>

				<HowToReadDashboard
					title="How to Read This Graph"
					bullets={[
						"Each bar represents one day, showing all medications taken on that date.",
						"The height of the bar indicates the total number of doses taken that day.",
						"Each colored segment within a bar corresponds to a specific medication and dose.",
						"The legend below the chart shows which color represents each medication.",
						"Hover over a bar to view details including medication names, dosages, and intake date.",
						"Use the global date picker to switch between timeframes.",
						"This graph helps track medication adherence and compare daily intake patterns over time.",
					]}
				/>
			</div>
		</div>
	);
};

export default MedicineStackedChart;
