// Updated ActivityDashboard.tsx with consistent style and layout

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parseISO, isAfter, isBefore, isEqual } from "date-fns";
import ActivityChart from "./ActivityChart";

export interface ActivityData {
	activityName: string;
	activityCategory: string;
	duration: number;
	intensity: "High" | "Moderate" | "Low";
	notes: string;
	DateOnly: string;
	TimeOnly: string;
	ISO_DateTime: string;
	ActivityEnd: string;
	ActivityStart: string;
}

type TimeRange = "lastDay" | "lastWeek" | "lastMonth" | "custom";

const ActivityDashboard = () => {
	const [activities, setActivities] = useState<ActivityData[]>([]);
	const [loading, setLoading] = useState(true);
	const [timeRange, setTimeRange] = useState<TimeRange>("lastWeek");
	const [customStartDate, setCustomStartDate] = useState<Date>();
	const [customEndDate, setCustomEndDate] = useState<Date>();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadCSVData = async () => {
			try {
				const response = await fetch("/activity.csv");
				if (!response.ok) throw new Error("Failed to load CSV file");
				const csvText = await response.text();
				const parsedData = parseCSV(csvText);
				setActivities(parsedData);
				setError(null);
			} catch (err) {
				console.error("Error loading CSV:", err);
				setError("Could not load activities.csv from /public folder.");
			} finally {
				setLoading(false);
			}
		};
		loadCSVData();
	}, []);

	const parseCSV = (csvText: string): ActivityData[] => {
		const lines = csvText.trim().split("\n");
		const headers = lines[0].split(",").map((h) => h.trim());
		return lines
			.slice(1)
			.map((line) => {
				const values = line.split(",").map((v) => v.trim());
				if (values.length !== headers.length) return null;
				const row: Record<string, string> = {};
				headers.forEach((h, i) => (row[h] = values[i] || ""));
				return {
					activityName: row.activityName,
					activityCategory: row.activityCategory,
					duration: parseInt(row.duration) || 0,
					intensity:
						(row.intensity as ActivityData["intensity"]) || "Low",
					notes: row.notes,
					DateOnly: row.DateOnly,
					TimeOnly: row.TimeOnly,
					ISO_DateTime: row.ISO_DateTime,
					ActivityEnd: row.ActivityEnd,
					ActivityStart: row.ActivityStart,
				};
			})
			.filter((a): a is ActivityData => !!a && !!a.ISO_DateTime);
	};

	const filteredActivities = useMemo(() => {
		if (!activities.length) return [];
		const times = activities.map((a) => parseISO(a.ISO_DateTime).getTime());
		const max = new Date(Math.max(...times));
		let start = new Date(max);
		if (timeRange === "lastDay") start.setDate(start.getDate() - 1);
		else if (timeRange === "lastWeek") start.setDate(start.getDate() - 7);
		else if (timeRange === "lastMonth") start.setDate(start.getDate() - 30);
		else if (timeRange === "custom" && customStartDate)
			start = customStartDate;
		const end =
			timeRange === "custom" && customEndDate
				? new Date(customEndDate.setHours(23, 59, 59, 999))
				: max;
		return activities.filter((a) => {
			const dt = parseISO(a.ISO_DateTime);
			return (
				(isAfter(dt, start) || isEqual(dt, start)) &&
				(isBefore(dt, end) || isEqual(dt, end))
			);
		});
	}, [activities, timeRange, customStartDate, customEndDate]);

	const currentDateRange = useMemo(() => {
		if (!activities.length) return "";
		const maxDate = new Date(
			Math.max(
				...activities.map((a) => parseISO(a.ISO_DateTime).getTime())
			)
		);
		const start = new Date(maxDate);
		if (timeRange === "lastDay") start.setDate(start.getDate() - 1);
		else if (timeRange === "lastWeek") start.setDate(start.getDate() - 7);
		else if (timeRange === "lastMonth") start.setDate(start.getDate() - 30);
		else if (timeRange === "custom" && customStartDate)
			return `${format(customStartDate, "MMM d")} - ${format(
				customEndDate!,
				"MMM d, yyyy"
			)}`;
		return `${format(start, "MMM d")} - ${format(maxDate, "MMM d, yyyy")}`;
	}, [timeRange, customStartDate, customEndDate, activities]);

	if (loading)
		return (
			<div className="text-center text-gray-500 p-6">
				Loading activity data...
			</div>
		);
	if (error)
		return <div className="text-center text-red-500 p-6">{error}</div>;

	return (
		<div className="w-full max-w-7xl mx-auto px-4 py-6">
			<Card className=" border-border shadow-lg bg-muted">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">
						Activity Impact Analysis
					</CardTitle>
					<p className="text-muted-foreground">{currentDateRange}</p>
					<p className="text-sm text-muted-foreground">
						Showing {filteredActivities.length} activities
					</p>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-2 mb-4">
						{(
							["lastDay", "lastWeek", "lastMonth"] as TimeRange[]
						).map((r) => (
							<Button
								key={r}
								variant={
									timeRange === r ? "default" : "outline"
								}
								onClick={() => setTimeRange(r)}
							>
								{r
									.replace("last", "Last ")
									.replace("Day", "Day")
									.replace("Week", "Week")
									.replace("Month", "Month")}
							</Button>
						))}

						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline">
									<CalendarIcon className="mr-2 h-4 w-4" />
									{customStartDate
										? format(customStartDate, "MMM dd")
										: "Start Date"}
								</Button>
							</PopoverTrigger>
							<PopoverContent>
								<Calendar
									mode="single"
									selected={customStartDate}
									onSelect={(date) => {
										setCustomStartDate(date);
										if (date && customEndDate)
											setTimeRange("custom");
									}}
								/>
							</PopoverContent>
						</Popover>

						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline">
									<CalendarIcon className="mr-2 h-4 w-4" />
									{customEndDate
										? format(customEndDate, "MMM dd")
										: "End Date"}
								</Button>
							</PopoverTrigger>
							<PopoverContent>
								<Calendar
									mode="single"
									selected={customEndDate}
									onSelect={(date) => {
										setCustomEndDate(date);
										if (date && customStartDate)
											setTimeRange("custom");
									}}
								/>
							</PopoverContent>
						</Popover>
					</div>

					<ActivityChart activities={filteredActivities} />
				</CardContent>
			</Card>
		</div>
	);
};

export default ActivityDashboard;
