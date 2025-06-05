import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MoodData, calculateAverage } from "../lib/csvParser";

interface AverageCardsProps {
	data: MoodData[];
	selectedFeelings: string[];
}

const AverageCards: React.FC<AverageCardsProps> = ({
	data,
	selectedFeelings,
}) => {
	const feelings = [
		{
			key: "My Mood",
			label: "My Mood Avg",
			color: "border-blue-200 bg-blue-50",
			icon: "😊",
		},
		{
			key: "Parkinson's State",
			label: "Parkinson's State Avg",
			color: "border-red-200 bg-red-50",
			icon: "🏥",
		},
		{
			key: "Physical Difficulty",
			label: "Physical Difficulty Avg",
			color: "border-green-200 bg-green-50",
			icon: "💪",
		},
	];

	return (
		<div className="mt-8">
			<h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
				Average Score For Each Feeling:
			</h3>
			<div className="flex flex-wrap justify-center gap-4">
				{feelings
					.filter((feeling) => selectedFeelings.includes(feeling.key))
					.map((feeling) => {
						const average = calculateAverage(data, feeling.key);
						return (
							<Card
								key={feeling.key}
								className={`${feeling.color} border-2 min-w-[200px] shadow-sm hover:shadow-md transition-shadow duration-200`}
							>
								<CardContent className="p-4 text-center">
									<div className="text-2xl mb-2">
										{feeling.icon}
									</div>
									<div className="text-sm font-medium text-gray-600 mb-1">
										{feeling.label}
									</div>
									<div className="text-2xl font-bold text-gray-800">
										{average.toFixed(1)}
									</div>
								</CardContent>
							</Card>
						);
					})}
			</div>
		</div>
	);
};

export default AverageCards;
