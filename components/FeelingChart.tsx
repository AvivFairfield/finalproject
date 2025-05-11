"use client";

import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { useState } from "react";

const data = [
	{
		date: "29-Jan-25",
		mood_before: 4,
		mood_after: 4,
		physical_before: null,
		physical_after: null,
		parkinson_before: 5,
		parkinson_after: 5,
	},
	{
		date: "30-Jan-25",
		mood_before: 1,
		mood_after: 1,
		physical_before: null,
		physical_after: null,
		parkinson_before: 3,
		parkinson_after: 3,
	},
	{
		date: "31-Jan-25",
		mood_before: 5,
		mood_after: 5,
		physical_before: null,
		physical_after: null,
		parkinson_before: 4,
		parkinson_after: 4,
	},
	{
		date: "3-Feb-25",
		mood_before: 5,
		mood_after: 5,
		physical_before: null,
		physical_after: null,
		parkinson_before: 4,
		parkinson_after: 4,
	},
	{
		date: "11-Mar-25",
		mood_before: 5,
		mood_after: 5,
		physical_before: 4,
		physical_after: 4,
		parkinson_before: 3,
		parkinson_after: 3,
	},
	{
		date: "12-Mar-25",
		mood_before: 5,
		mood_after: 4,
		physical_before: 5,
		physical_after: 5,
		parkinson_before: 5,
		parkinson_after: 4,
	},
	{
		date: "14-Mar-25",
		mood_before: 3,
		mood_after: 4,
		physical_before: 5,
		physical_after: 5,
		parkinson_before: 1,
		parkinson_after: 2,
	},
	{
		date: "17-Mar-25",
		mood_before: 5,
		mood_after: 5,
		physical_before: 4,
		physical_after: 5,
		parkinson_before: 4,
		parkinson_after: 5,
	},
];

export default function FeelingChart() {
	const [moment, setMoment] = useState<"before" | "after">("before");

	return (
		<Card className="bg-[#0B1623] text-white">
			<CardHeader>
				<CardTitle>Feelings Over Time</CardTitle>
				<CardDescription className="text-gray-400 text-sm">
					Toggle between average &quot;before&quot; and
					&quot;after&quot; feeling states by day.
				</CardDescription>
				<div className="mt-4">
					<ToggleGroup
						type="single"
						value={moment}
						onValueChange={(val) =>
							val && setMoment(val as "before" | "after")
						}
						className="gap-2"
					>
						<ToggleGroupItem value="before">Before</ToggleGroupItem>
						<ToggleGroupItem value="after">After</ToggleGroupItem>
					</ToggleGroup>
				</div>
			</CardHeader>
			<CardContent className="h-[350px]">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={data}>
						<XAxis dataKey="date" stroke="#ccc" />
						<YAxis domain={[0, 5]} stroke="#ccc" />
						<Tooltip
							contentStyle={{
								backgroundColor: "#1a1a1a",
								borderColor: "#333",
							}}
						/>
						<Legend />
						<Line
							type="monotone"
							dataKey={`mood_${moment}`}
							name={`Mood (${moment})`}
							stroke="#82ca9d"
							strokeWidth={2}
							dot={{ r: 3 }}
						/>
						<Line
							type="monotone"
							dataKey={`physical_${moment}`}
							name={`Physical (${moment})`}
							stroke="#8884d8"
							strokeWidth={2}
							dot={{ r: 3 }}
						/>
						<Line
							type="monotone"
							dataKey={`parkinson_${moment}`}
							name={`Parkinson's (${moment})`}
							stroke="#ff7f7f"
							strokeWidth={2}
							dot={{ r: 3 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
