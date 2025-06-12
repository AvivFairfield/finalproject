import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import HowToReadDashboard from "./HowToReadDashboard";

// Simplified DateRangePicker component
const DateRangePicker = ({ onDateRangeChange, dateRange }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-muted"
			>
				<Calendar className="w-4 h-4" />
				{dateRange.from ? (
					dateRange.to ? (
						<>
							{dateRange.from.toLocaleDateString()} -{" "}
							{dateRange.to.toLocaleDateString()}
						</>
					) : (
						dateRange.from.toLocaleDateString()
					)
				) : (
					<span>Pick a date range</span>
				)}
			</button>

			{isOpen && (
				<div className="absolute top-full left-0 mt-1 p-4 bg-muted border border-white rounded-md shadow-lg z-10">
					<div className="space-y-2">
						<div>
							<label className="block text-sm font-medium text-white">
								From:
							</label>
							<input
								type="date"
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
								onChange={(e) => {
									const newDate = e.target.value
										? new Date(e.target.value)
										: undefined;
									onDateRangeChange({
										from: newDate,
										to: dateRange.to,
									});
								}}
								value={
									dateRange.from
										? dateRange.from
												.toISOString()
												.split("T")[0]
										: ""
								}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-white">
								To:
							</label>
							<input
								type="date"
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
								onChange={(e) => {
									const newDate = e.target.value
										? new Date(e.target.value)
										: undefined;
									onDateRangeChange({
										from: dateRange.from,
										to: newDate,
									});
								}}
								value={
									dateRange.to
										? dateRange.to
												.toISOString()
												.split("T")[0]
										: ""
								}
							/>
						</div>
						<button
							onClick={() => setIsOpen(false)}
							className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
						>
							Apply
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

const symptoms = [
	{ name: "Dystonia", color: "#EC4899", icon: "🔀" },
	{ name: "Tremor", color: "#9c9135", icon: "📳" },
	{ name: "Dyskinesia", color: "#3B82F6", icon: "💃" },
	{ name: "Speech Difficulty", color: "#449455", icon: "🗣️" },
	{ name: "Hyperactivity", color: "#EF4444", icon: "⚡" },
	{ name: "Stool", color: "#75359c", icon: "🚽" },
	{ name: "Other Symptoms", color: "#F97316", icon: "🔍" },
];

const SymptomChart = () => {
	const [timeView, setTimeView] = useState("Last Day");
	const [csvData, setCsvData] = useState([]);
	const [dateRange, setDateRange] = useState({
		from: undefined,
		to: undefined,
	});
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Parse CSV data
	const parseCSV = (csvText) => {
		const lines = csvText.trim().split("\n");
		const headers = lines[0].split(",").map((h) => h.trim());

		return lines.slice(1).map((line) => {
			const values = line.split(",").map((v) => v.trim());
			const row = {};
			headers.forEach((header, index) => {
				row[header] = values[index];
			});
			return row;
		});
	};

	// Load CSV data
	useEffect(() => {
		const loadData = async () => {
			try {
				setLoading(true);
				// Try to read the CSV file
				let csvText;
				try {
					const response = await fetch("/symptoms-data.csv");
					if (!response.ok) throw new Error("CSV file not found");
					csvText = await response.text();
				} catch (fetchError) {
					// If file doesn't exist, create sample data
					console.warn("CSV file not found, using sample data");
					csvText = createSampleCSV();
				}

				const parsedData = parseCSV(csvText);

				// Validate and clean the data
				const cleanedData = parsedData
					.filter(
						(row) =>
							row.ISOdatetime &&
							(row.type || row.symptomName) &&
							row.severity
					)
					.map((row) => ({
						...row,
						ISOdatetime: new Date(row.ISOdatetime).toISOString(),
						severity: parseInt(row.severity, 10),
						symptomName: (row.type || row.symptomName || "").trim(),
					}))
					.filter(
						(row) =>
							!isNaN(new Date(row.ISOdatetime).getTime()) &&
							!isNaN(row.severity) &&
							row.symptomName
					);

				setCsvData(cleanedData);
				setError(null);
			} catch (err) {
				console.error("Failed to load CSV data:", err);
				setError(err.message);
				// Use sample data as fallback
				const sampleData = createSampleData();
				setCsvData(sampleData);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	// Create sample CSV content with multiple entries per day
	const createSampleCSV = () => {
		const now = new Date();
		const lines = [
			"type,symptomName,severity,notes,dateOnly,timeOnly,ISOdatetime",
		];

		// Generate sample data for the last 30 days with multiple entries per day
		for (let i = 0; i < 30; i++) {
			const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

			// Add 3-7 random symptoms for each day at different times
			const numEntries = Math.floor(Math.random() * 5) + 3;
			for (let j = 0; j < numEntries; j++) {
				const symptom =
					symptoms[Math.floor(Math.random() * symptoms.length)];
				const severity = Math.floor(Math.random() * 5) + 1;
				const randomHour = Math.floor(Math.random() * 24);
				const randomMinute = Math.floor(Math.random() * 60);
				const entryDate = new Date(
					date.getFullYear(),
					date.getMonth(),
					date.getDate(),
					randomHour,
					randomMinute
				);

				lines.push(
					`${
						symptom.name
					},,${severity},,${entryDate.toLocaleDateString()},${entryDate.toLocaleTimeString()},${entryDate.toISOString()}`
				);
			}
		}

		return lines.join("\n");
	};

	// Create sample data directly with multiple entries per day
	const createSampleData = () => {
		const latestDate = new Date("2025-06-28");
		const data = [];

		for (let i = 0; i < 30; i++) {
			const date = new Date(
				latestDate.getTime() - i * 24 * 60 * 60 * 1000
			);

			// Multiple entries per day
			const numEntries = Math.floor(Math.random() * 5) + 3;
			for (let j = 0; j < numEntries; j++) {
				const symptom =
					symptoms[Math.floor(Math.random() * symptoms.length)];
				const severity = Math.floor(Math.random() * 5) + 1;
				const randomHour = Math.floor(Math.random() * 24);
				const randomMinute = Math.floor(Math.random() * 60);
				const entryDate = new Date(
					date.getFullYear(),
					date.getMonth(),
					date.getDate(),
					randomHour,
					randomMinute
				);

				data.push({
					ISOdatetime: entryDate.toISOString(),
					symptomName: symptom.name,
					severity: severity,
					type: symptom.name,
				});
			}
		}

		return data;
	};

	// Process data based on time view and date range
	useEffect(() => {
		if (csvData.length === 0) return;

		let filteredData = [];

		// Get the latest date from the data as reference point
		const allDates = csvData
			.map((item) => new Date(item.ISOdatetime))
			.sort((a, b) => b.getTime() - a.getTime());
		const latestDate = allDates[0];

		if (timeView === "Custom Range" && dateRange.from && dateRange.to) {
			filteredData = csvData.filter((item) => {
				const itemDate = new Date(item.ISOdatetime);
				return itemDate >= dateRange.from && itemDate <= dateRange.to;
			});
		} else {
			const startDate = new Date(latestDate);
			if (timeView === "Last Day") {
				startDate.setDate(latestDate.getDate() - 1);
			} else if (timeView === "Last Week") {
				startDate.setDate(latestDate.getDate() - 7);
			} else if (timeView === "Last Month") {
				startDate.setMonth(latestDate.getMonth() - 1);
			}

			filteredData = csvData.filter((item) => {
				const itemDate = new Date(item.ISOdatetime);
				return itemDate >= startDate && itemDate <= latestDate;
			});
		}

		// Convert to chart format
		const chartData = filteredData.map((item) => {
			const symptom = symptoms.find((s) => s.name === item.symptomName);
			return {
				symptom: item.symptomName,
				severity: item.severity,
				timestamp: item.ISOdatetime,
				color: symptom?.color || "#6B7280",
			};
		});

		setData(chartData);
	}, [csvData, timeView, dateRange]);

	const getTimeLabels = () => {
		if (csvData.length === 0) return [];

		const allDates = csvData
			.map((item) => new Date(item.ISOdatetime))
			.sort((a, b) => b.getTime() - a.getTime());
		const latestDate = allDates[0];

		if (timeView === "Custom Range" && dateRange.from && dateRange.to) {
			// For custom range, show all timestamps from the data within the range
			const relevantData = csvData.filter((item) => {
				const itemDate = new Date(item.ISOdatetime);
				return itemDate >= dateRange.from && itemDate <= dateRange.to;
			});

			// Get unique timestamps and sort them
			const uniqueTimestamps = [
				...new Set(relevantData.map((item) => item.ISOdatetime)),
			]
				.sort()
				.map((timestamp) => new Date(timestamp));

			return uniqueTimestamps.map((date) => ({
				dateLabel: date.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				}),
				timeLabel: date.toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
					hour12: false,
				}),
				date: date,
				timestamp: date.toISOString(),
				isMultiDay: true,
			}));
		}

		if (timeView === "Last Day") {
			// Show only time for last day view - use actual data timestamps from that day
			const oneDayAgo = new Date(
				latestDate.getTime() - 24 * 60 * 60 * 1000
			);
			const dayData = csvData.filter((item) => {
				const itemDate = new Date(item.ISOdatetime);
				return itemDate >= oneDayAgo && itemDate <= latestDate;
			});

			// Get unique timestamps and sort them
			const uniqueTimestamps = [
				...new Set(dayData.map((item) => item.ISOdatetime)),
			]
				.sort()
				.map((timestamp) => new Date(timestamp));

			return uniqueTimestamps.map((date) => ({
				timeLabel: date.toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
					hour12: false,
				}),
				date: date,
				timestamp: date.toISOString(),
				isMultiDay: false,
			}));
		} else if (timeView === "Last Week") {
			// Show date and time for last week
			const oneWeekAgo = new Date(
				latestDate.getTime() - 7 * 24 * 60 * 60 * 1000
			);
			const weekData = csvData.filter((item) => {
				const itemDate = new Date(item.ISOdatetime);
				return itemDate >= oneWeekAgo && itemDate <= latestDate;
			});

			// Get unique timestamps and sort them
			const uniqueTimestamps = [
				...new Set(weekData.map((item) => item.ISOdatetime)),
			]
				.sort()
				.map((timestamp) => new Date(timestamp));

			return uniqueTimestamps.map((date) => ({
				dateLabel: date.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				}),
				timeLabel: date.toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
					hour12: false,
				}),
				date: date,
				timestamp: date.toISOString(),
				isMultiDay: true,
			}));
		} else {
			// Show date and time for last month
			const oneMonthAgo = new Date(
				latestDate.getTime() - 30 * 24 * 60 * 60 * 1000
			);
			const monthData = csvData.filter((item) => {
				const itemDate = new Date(item.ISOdatetime);
				return itemDate >= oneMonthAgo && itemDate <= latestDate;
			});

			// Get unique timestamps and sort them
			const uniqueTimestamps = [
				...new Set(monthData.map((item) => item.ISOdatetime)),
			]
				.sort()
				.map((timestamp) => new Date(timestamp));

			return uniqueTimestamps.map((date) => ({
				dateLabel: date.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				}),
				timeLabel: date.toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
					hour12: false,
				}),
				date: date,
				timestamp: date.toISOString(),
				isMultiDay: true,
			}));
		}
	};

	const getDataForTimeSlot = (symptomName, timeSlot) => {
		// Now match exact timestamps instead of grouping by hour/day
		return data.filter((item) => {
			if (item.symptom !== symptomName) return false;

			// For exact timestamp matching
			if (timeSlot.timestamp) {
				return item.timestamp === timeSlot.timestamp;
			}

			// Fallback to approximate matching
			const itemDate = new Date(item.timestamp);
			const slotDate = timeSlot.date;

			// Match within the same minute
			return (
				Math.abs(itemDate.getTime() - slotDate.getTime()) < 60 * 1000
			);
		});
	};

	const timeLabels = getTimeLabels();

	const handleDateRangeChange = (range) => {
		setDateRange(range);
		if (range.from && range.to) {
			setTimeView("Custom Range");
		}
	};

	// Improved responsive cell width calculation
	const getCellWidth = () => {
		const numSlots = timeLabels.length;
		if (numSlots === 1) return "w-40"; // Very wide for single column
		if (numSlots === 2) return "w-32"; // Wide for two columns
		if (numSlots <= 4) return "w-24"; // Medium-wide for few columns
		if (numSlots <= 8) return "w-20"; // Standard width
		if (numSlots <= 12) return "w-16"; // Getting narrower
		if (numSlots <= 20) return "w-14"; // Narrow
		if (numSlots <= 30) return "w-12"; // Very narrow
		return "w-10"; // Minimal for many columns
	};

	// Calculate if table should be constrained or full width
	const getTableStyle = () => {
		const numSlots = timeLabels.length;
		if (numSlots <= 6) {
			return {
				maxWidth: "80%",
				margin: "0 auto",
			};
		}
		return {};
	};

	const cellWidthClass = getCellWidth();
	const tableStyle = getTableStyle();

	if (loading) {
		return (
			<div className="w-full max-w-7xl mx-auto p-8">
				<div className="flex items-center justify-center">
					<div className="text-lg">Loading symptom data...</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full max-w-7xl mx-auto">
			<div className="bg-muted rounded-lg shadow-lg">
				<div className="p-6 border-b border-gray-200">
					<div className="flex justify-between items-center">
						<h1 className="text-2xl font-bold text-white">
							Parkinson's Symptom Tracker
						</h1>
						<div className="flex gap-2 items-center">
							{["Last Day", "Last Week", "Last Month"].map(
								(view) => (
									<button
										key={view}
										onClick={() => setTimeView(view)}
										className={`px-4 py-2 rounded-md transition-all duration-200 ${
											timeView === view
												? "bg-blue-600 text-white"
												: "bg-muted text-white hover:bg-blue-900"
										}`}
									>
										{view}
									</button>
								)
							)}
							<DateRangePicker
								onDateRangeChange={handleDateRangeChange}
								dateRange={dateRange}
							/>
						</div>
					</div>
					<p className="text-white mt-2">
						Monitor and analyze symptom patterns over time
					</p>
					<div className="text-sm text-gray-300 mt-1">
						{data.length > 0
							? (() => {
									const dates = data.map((d) =>
										new Date(d.timestamp).getTime()
									);
									const startDate = new Date(
										Math.min(...dates)
									).toLocaleDateString();
									const endDate = new Date(
										Math.max(...dates)
									).toLocaleDateString();
									return `Showing data from ${startDate} to ${endDate} • Total entries: ${data.length}`;
							  })()
							: "No data available for selected time period"}
					</div>
				</div>

				<div className="p-6">
					<div className="space-y-6">
						{error && (
							<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
								<p className="text-yellow-800">
									<strong>Note:</strong> {error}. Using sample
									data for demonstration.
								</p>
							</div>
						)}

						{/* Severity Scale */}
						<div className="p-4 bg-gray-50 rounded-lg">
							<h3 className="text-sm font-semibold text-gray-700 mb-3">
								Severity Scale
							</h3>
							<div className="flex items-center gap-4">
								{[1, 2, 3, 4, 5].map((severity) => (
									<div
										key={severity}
										className="flex items-center gap-2"
									>
										<div
											className="w-6 h-6 rounded border"
											style={{
												backgroundColor: "#6B7280",
												opacity:
													0.2 + (severity / 5) * 0.8,
											}}
										/>
										<span className="text-sm text-gray-600">
											{severity}
										</span>
									</div>
								))}
							</div>
						</div>

						{/* Legend */}
						<div className="p-4 bg-gray-50 rounded-lg">
							<h3 className="text-sm font-semibold text-gray-700 mb-3">
								Symptoms
							</h3>
							<div className="flex flex-wrap gap-4">
								{symptoms.map((symptom) => (
									<div
										key={symptom.name}
										className="flex items-center gap-2"
									>
										<div
											className="w-4 h-4 rounded"
											style={{
												backgroundColor: symptom.color,
											}}
										/>
										<span className="text-sm text-gray-700">
											{symptom.name}
										</span>
									</div>
								))}
							</div>
						</div>

						{/* Chart Table */}
						<div className="overflow-x-auto flex">
							<div
								className="border border-gray-200 rounded-lg overflow-hidden min-w-fit"
								style={tableStyle}
							>
								{/* Header row */}
								<div className="flex bg-gray-50 border-b border-gray-200">
									<div className="w-48 p-3 font-semibold text-gray-700 text-sm border-r border-gray-200 flex items-center">
										{timeView === "Last Day"
											? "Time →"
											: "Date & Time →"}
									</div>
									{timeLabels.map((timeSlot, index) => (
										<div
											key={index}
											className={`${cellWidthClass} p-1 text-xs text-gray-600 text-center border-r border-gray-200 last:border-r-0 flex flex-col items-center justify-center min-h-[3rem]`}
										>
											{timeSlot.isMultiDay ? (
												<div className="leading-tight text-center">
													<div className="font-medium">
														{timeSlot.dateLabel}
													</div>
													<div className="text-gray-500">
														{timeSlot.timeLabel}
													</div>
												</div>
											) : (
												<div className="leading-tight text-center font-medium">
													{timeSlot.timeLabel}
												</div>
											)}
										</div>
									))}
								</div>

								{/* Data rows */}
								{symptoms.map((symptom, symptomIndex) => (
									<div
										key={symptom.name}
										className={`flex ${
											symptomIndex !== symptoms.length - 1
												? "border-b border-gray-200"
												: ""
										}`}
									>
										{/* Symptom name column */}
										<div className="w-48 p-3 flex items-center gap-2 border-r border-gray-200 bg-white">
											<span className="text-lg">
												{symptom.icon}
											</span>
											<span className="text-sm font-medium text-gray-700">
												{symptom.name}
											</span>
										</div>

										{/* Data cells */}
										{timeLabels.map(
											(timeSlot, timeIndex) => {
												const timeSlotData =
													getDataForTimeSlot(
														symptom.name,
														timeSlot
													);
												const avgSeverity =
													timeSlotData.length > 0
														? timeSlotData.reduce(
																(sum, item) =>
																	sum +
																	item.severity,
																0
														  ) /
														  timeSlotData.length
														: 0;

												return (
													<div
														key={timeIndex}
														className={`${cellWidthClass} h-12 p-1 border-r border-gray-200 last:border-r-0 flex items-center justify-center`}
													>
														{avgSeverity > 0 && (
															<div
																className="w-full h-full rounded transition-all duration-200 hover:scale-95 cursor-pointer"
																style={{
																	backgroundColor:
																		symptom.color,
																	opacity:
																		0.2 +
																		(avgSeverity /
																			5) *
																			0.8,
																}}
																title={
																	timeSlotData.length >
																	0
																		? timeSlotData
																				.map(
																					(
																						entry
																					) => {
																						const entryDate =
																							new Date(
																								entry.timestamp
																							);
																						const dateStr =
																							entryDate.toLocaleDateString();
																						const timeStr =
																							entryDate.toLocaleTimeString(
																								"en-US",
																								{
																									hour: "2-digit",
																									minute: "2-digit",
																									hour12: false,
																								}
																							);
																						// Find the original CSV entry to get notes
																						const csvEntry =
																							csvData.find(
																								(
																									csv
																								) =>
																									csv.ISOdatetime ===
																										entry.timestamp &&
																									csv.symptomName ===
																										entry.symptom
																							);
																						const notes =
																							csvEntry?.notes ||
																							"";
																						return `Type: ${
																							entry.symptom
																						}\nSeverity: ${
																							entry.severity
																						}\nDate: ${dateStr}\nTime: ${timeStr}${
																							notes
																								? `\nNotes: ${notes}`
																								: ""
																						}`;
																					}
																				)
																				.join(
																					"\n\n"
																				)
																		: ""
																}
															/>
														)}
													</div>
												);
											}
										)}
									</div>
								))}
							</div>
						</div>
						<HowToReadDashboard
							title="How to Read This Graph"
							bullets={[
								"The horizontal axis represents the time or date when symptoms were reported.",
								"The vertical axis lists the different symptom types, each with a unique icon and color.",
								"A colored rectangle indicates that a symptom occurred at that time.",
								"The shade (transparency) reflects severity: 1 (lightest) to 5 (darkest).",
								"Hover over a rectangle to see symptom type, severity, date, time, and notes (if provided).",
								"Use the buttons at the top to switch between Last Day, Last Week, Last Month, or a Custom Range.",
								"This chart helps track symptom frequency and intensity, supporting better care planning.",
							]}
							legend={[
								{
									label: "Dystonia",
									color: "#EC4899",
									opacity: 1,
								},
								{
									label: "Speech Difficulty",
									color: "#449455",
									opacity: 1,
								},
								{
									label: "Dyskinesia",
									color: "#3B82F6",
									opacity: 1,
								},
								{
									label: "Tremor",
									color: "#9c9135",
									opacity: 1,
								},
								{
									label: "Hyperactivity",
									color: "#EF4444",
									opacity: 1,
								},
								{
									label: "Stool",
									color: "#75359c",
									opacity: 1,
								},
								{
									label: "Other Symptoms",
									color: "#F97316",
									opacity: 1,
								},
							]}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SymptomChart;
