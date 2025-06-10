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
import { Button } from "@/components/ui/button";
import DateRangeSelector from "@/components/DateRangeSelector";

interface MedicineEntry {
	name: string;
	quantity: number;
	dateTaken: string;
}

type View = "today" | "lastWeek" | "lastMonth" | "custom";

const MedicineStackedChart: React.FC = () => {
	const [data, setData] = useState<MedicineEntry[]>([]);
	const [view, setView] = useState<View>("lastWeek");
	const [customStart, setCustomStart] = useState<Date | undefined>();
	const [customEnd, setCustomEnd] = useState<Date | undefined>();

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
		const now = new Date();
		const rangeStart = new Date(now);

		if (view === "today") {
			rangeStart.setHours(0, 0, 0, 0);
		} else if (view === "lastWeek") {
			rangeStart.setDate(now.getDate() - 7);
		} else if (view === "lastMonth") {
			rangeStart.setDate(now.getDate() - 30);
		} else if (view === "custom") {
			if (!customStart || !customEnd) return [];
			rangeStart.setTime(customStart.getTime());
			now.setTime(customEnd.getTime());
		}

		const byDateAndMedicine: Record<string, Record<string, number>> = {};

		data.forEach((entry) => {
			const parsed = new Date(entry.dateTaken);
			if (isNaN(parsed.getTime())) return;

			if (parsed >= rangeStart && parsed <= now) {
				const dateKey = format(parsed, "dd/M"); // <-- Changed format here
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
	}, [data, view, customStart, customEnd]);

	const allMedicineNames = useMemo(() => {
		const names = new Set<string>();
		data.forEach((entry) => names.add(entry.name));
		return Array.from(names);
	}, [data]);

	const getDateRangeLabel = () => {
		const now = new Date();
		let from: Date = new Date(now);
		let to: Date = now;

		if (view === "today") {
			from = new Date(now);
			from.setHours(0, 0, 0, 0);
			return `Showing data from ${format(from, "HH:mm")} to ${format(
				to,
				"HH:mm"
			)}`;
		} else if (view === "lastWeek") {
			from = new Date(now);
			from.setDate(now.getDate() - 7);
		} else if (view === "lastMonth") {
			from = new Date(now);
			from.setDate(now.getDate() - 30);
		} else if (view === "custom") {
			if (!customStart || !customEnd) return "Please select a date range";
			from = customStart;
			to = customEnd;
		}

		return `Showing data from ${format(from, "MMM d")} to ${format(
			to,
			"MMM d"
		)}`;
	};

	return (
		<div className="w-full max-w-7xl mx-auto px-4">
			<div className="flex flex-wrap items-center gap-2 my-4">
				<Button
					variant={view === "today" ? "default" : "outline"}
					onClick={() => setView("today")}
				>
					Today
				</Button>
				<Button
					variant={view === "lastWeek" ? "default" : "outline"}
					onClick={() => setView("lastWeek")}
				>
					Last Week
				</Button>
				<Button
					variant={view === "lastMonth" ? "default" : "outline"}
					onClick={() => setView("lastMonth")}
				>
					Last Month
				</Button>
				<Button
					variant={view === "custom" ? "default" : "outline"}
					onClick={() => setView("custom")}
				>
					Custom Range
				</Button>

				{view === "custom" && (
					<DateRangeSelector
						startDate={customStart}
						endDate={customEnd}
						onStartDateChange={setCustomStart}
						onEndDateChange={setCustomEnd}
					/>
				)}
			</div>
			<div className="text-sm text-muted-foreground font-medium mb-2">
				{getDateRangeLabel()}
			</div>

			<div className="bg-muted rounded-lg p-4">
				<h2 className="text-xl font-semibold text-white mb-4">
					Medicine Intake Summary
				</h2>
				<ResponsiveContainer width="100%" height={400}>
					<BarChart data={filteredData}>
						<XAxis dataKey="date" stroke="#8884d8" />
						<YAxis />
						<Tooltip />
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
			</div>
		</div>
	);
};

export default MedicineStackedChart;
