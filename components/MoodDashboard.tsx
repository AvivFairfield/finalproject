"use client";

import React, { useState, useEffect } from "react";
import {
	MoodData,
	parseCsvData,
	filterDataByTimeRange,
	getDateRangeDescription,
} from "../lib/csvParser";
import MoodChart from "./MoodChart";
import FeelingSelector from "./FeelingSelector";
import AverageCards from "./AverageCards";
import HowToReadDashboard from "./HowToReadDashboard";
import { useDateStore } from "../lib/stores/dataStore"; // Adjust the path if needed

const MoodDashboard: React.FC = () => {
	const [data, setData] = useState<MoodData[]>([]);
	const [filteredData, setFilteredData] = useState<MoodData[]>([]);
	const [selectedFeelings, setSelectedFeelings] = useState<string[]>([
		"My Mood",
		"Parkinson's State",
		"Physical Difficulty",
	]);
	const [loading, setLoading] = useState(true);

	const { viewMode, customStartDate, customEndDate } = useDateStore();

	useEffect(() => {
		const loadData = async () => {
			try {
				const response = await fetch("/mood-data.csv");
				const csvText = await response.text();
				const parsedData = parseCsvData(csvText);
				setData(parsedData);
				setLoading(false);
			} catch (error) {
				console.error("Error loading CSV data:", error);
				setLoading(false);
			}
		};

		loadData();
	}, []);

	useEffect(() => {
		if (data.length > 0) {
			if (viewMode === "custom" && (!customStartDate || !customEndDate)) {
				setFilteredData([]);
				return;
			}

			const filtered = filterDataByTimeRange(
				data,
				viewMode,
				customStartDate,
				customEndDate
			);

			const feelingFiltered = filtered.filter((item) =>
				selectedFeelings.includes(item.type)
			);
			setFilteredData(feelingFiltered);
		}
	}, [data, viewMode, selectedFeelings, customStartDate, customEndDate]);

	const handleFeelingToggle = (feeling: string) => {
		setSelectedFeelings((prev) => {
			if (prev.includes(feeling)) {
				return prev.filter((f) => f !== feeling);
			} else {
				return [...prev, feeling];
			}
		});
	};

	const dateRangeInfo = getDateRangeDescription(
		viewMode,
		filteredData,
		customStartDate,
		customEndDate
	);

	if (loading) {
		return (
			<div className="min-h-screen bg-[#0B1623] flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
					<p className="text-gray-300">
						Loading your health insights...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen p-4 md:p-8 text-white">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold mb-2">
						Health & Mood Insights
					</h1>
					<p className="text-md text-gray-400">
						Track your wellbeing patterns over time
					</p>
				</div>

				<div className="bg-muted rounded-2xl p-6 md:p-8 shadow-lg mb-6">
					<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
						<div className="flex-1 min-w-[200px]">
							<FeelingSelector
								selectedFeelings={selectedFeelings}
								onFeelingToggle={handleFeelingToggle}
							/>
							{dateRangeInfo}
						</div>

						<div className="flex flex-row gap-3 md:gap-4 md:items-start pr-2">
							<AverageCards
								data={filteredData}
								selectedFeelings={selectedFeelings}
								compact
							/>
						</div>
					</div>

					<MoodChart data={filteredData} timeRange={viewMode} />

					<HowToReadDashboard
						title="How to Read This Graph"
						bullets={[
							"The horizontal axis shows the date of each entry.",
							"The vertical axis represents severity on a scale from 1 (low) to 5 (high).",
							"Each colored line represents a different feeling:",
							"Dots on the lines indicate daily values for each feeling.",
							"Hover over a point to view the exact severity score and any personal note.",
							"Use the buttons above to filter by feeling type or time range.",
							"Interpretation tip: For My Mood, a higher score is better (more positive mood).",
							"For Parkinson’s State and Physical Difficulty, higher scores indicate greater difficulty or symptom severity.",
							"Colored boxes below show the average severity for each selected feeling.",
							"This graph helps recognize emotional and physical trends to support more informed care.",
						]}
						legend={[
							{ label: "My Mood", color: "#3B82F6", opacity: 1 },
							{
								label: "Parkinson’s State",
								color: "#EF4444",
								opacity: 1,
							},
							{
								label: "Physical Difficulty",
								color: "#10B981",
								opacity: 1,
							},
						]}
					/>
				</div>
			</div>
		</div>
	);
};

export default MoodDashboard;
