import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MoodData, calculateAverage } from "../lib/csvParser";

interface AverageCardsProps {
	data: MoodData[];
	selectedFeelings: string[];
	compact?: boolean;
}

const AverageCards: React.FC<AverageCardsProps> = ({
	data,
	selectedFeelings,
	compact,
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
			<div className="flex flex-wrap justify-end gap-4">
				{feelings
					.filter((feeling) => selectedFeelings.includes(feeling.key))
					.map((feeling) => {
						const average = calculateAverage(data, feeling.key);
						return (
							<Card
								key={feeling.key}
								className={`${
									feeling.color
								} border min-w-[120px] ${
									compact ? "text-xs px-2 py-2" : "text-base"
								} shadow-sm hover:shadow-md transition-shadow duration-200`}
							>
								<CardContent
									className={`text-center ${
										compact ? "p-2" : "p-4"
									}`}
								>
									<div
										className={`mb-1 ${
											compact ? "text-base" : "text-2xl"
										}`}
									>
										{feeling.icon}
									</div>
									<div
										className={`${
											compact
												? "text-xs mb-0.5"
												: "text-sm mb-1"
										} font-medium text-gray-600`}
									>
										{feeling.label}
									</div>
									<div
										className={`font-bold text-gray-800 ${
											compact ? "text-lg" : "text-2xl"
										}`}
									>
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
