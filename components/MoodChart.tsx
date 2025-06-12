import React from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	TooltipProps,
	Legend,
} from "recharts";
import { MoodData } from "../lib/csvParser";

interface MoodChartProps {
	data: MoodData[];
	timeRange: string;
}

interface ChartData {
	time: string;
	"My Mood": number | null;
	"Physical Difficulty": number | null;
	"Parkinson's State": number | null;
	originalData: { [key: string]: MoodData };
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
	active,
	payload,
	label,
}) => {
	if (active && payload && payload.length) {
		const data = payload[0]?.payload as ChartData;
		if (!data || !data.originalData) return null;

		return (
			<div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
				<p className="font-semibold text-gray-800 mb-2">{label}</p>
				{payload.map((entry) => {
					if (entry.value === null) return null;
					const feelingType = entry.dataKey as string;
					const originalEntry = data.originalData[feelingType];

					return (
						<div key={feelingType} className="mb-2">
							<p
								className="font-medium"
								style={{ color: entry.color }}
							>
								{feelingType}: {entry.value}
							</p>
							{originalEntry?.notes && (
								<p className="text-sm text-gray-600 italic">
									&quot;{originalEntry.notes}&quot;
								</p>
							)}
						</div>
					);
				})}
			</div>
		);
	}
	return null;
};

const MoodChart: React.FC<MoodChartProps> = ({ data, timeRange }) => {
	const processDataForChart = (): ChartData[] => {
		// Group data by time
		const groupedData: { [key: string]: { [type: string]: MoodData } } = {};

		data.forEach((item) => {
			let timeKey: string;

			if (timeRange === "lastDay") {
				// For last day, show hours with minutes for more precision
				const date = new Date(item.ISO_DateTime);
				const hour = date.getHours();
				const minute = date.getMinutes();
				timeKey = `${hour.toString().padStart(2, "0")}:${minute
					.toString()
					.padStart(2, "0")}`;
			} else {
				// For other ranges, show date
				timeKey = item.DateOnly;
			}

			if (!groupedData[timeKey]) {
				groupedData[timeKey] = {};
			}

			// Keep the latest entry for each type at each time point
			groupedData[timeKey][item.type] = item;
		});

		// Convert to chart format and sort by time
		const chartData: ChartData[] = Object.keys(groupedData)
			.sort((a, b) => {
				if (timeRange === "lastDay") {
					// Sort by time for last day view
					const [aHour, aMin] = a.split(":").map(Number);
					const [bHour, bMin] = b.split(":").map(Number);
					return aHour * 60 + aMin - (bHour * 60 + bMin);
				} else {
					// Sort by date for other views
					return new Date(a).getTime() - new Date(b).getTime();
				}
			})
			.map((timeKey) => {
				const timeData = groupedData[timeKey];

				return {
					time: timeKey,
					"My Mood": timeData["My Mood"]?.severity || null,
					"Physical Difficulty":
						timeData["Physical Difficulty"]?.severity || null,
					"Parkinson's State":
						timeData["Parkinson's State"]?.severity || null,
					originalData: timeData,
				};
			});

		return chartData;
	};

	const chartData = processDataForChart();

	return (
		<div className="w-full h-96 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart
					data={chartData}
					margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
					<XAxis
						dataKey="time"
						stroke="#666"
						fontSize={12}
						tick={{ fill: "#666" }}
					/>
					<YAxis
						domain={[1, 5]}
						stroke="#666"
						fontSize={12}
						tick={{ fill: "#666" }}
						label={{
							value: "Severity (1-5)",
							angle: -90,
							position: "insideLeft",
						}}
					/>
					<Tooltip content={<CustomTooltip />} />
					<Legend
						verticalAlign="bottom"
						height={36}
						wrapperStyle={{ paddingTop: "20px" }}
					/>
					<Line
						type="monotone"
						dataKey="My Mood"
						stroke="#3b82f6"
						strokeWidth={3}
						dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
						connectNulls={true}
						name="My Mood"
					/>
					<Line
						type="monotone"
						dataKey="Physical Difficulty"
						stroke="#10b981"
						strokeWidth={3}
						dot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
						connectNulls={true}
						name="Physical Difficulty"
					/>
					<Line
						type="monotone"
						dataKey="Parkinson's State"
						stroke="#ef4444"
						strokeWidth={3}
						dot={{ fill: "#ef4444", strokeWidth: 2, r: 6 }}
						connectNulls={true}
						name="Parkinson's State"
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};

export default MoodChart;
