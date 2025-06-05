import React from "react";
import { Button } from "@/components/ui/button";

interface FeelingSelectorProps {
	selectedFeelings: string[];
	onFeelingToggle: (feeling: string) => void;
}

const FeelingSelector: React.FC<FeelingSelectorProps> = ({
	selectedFeelings,
	onFeelingToggle,
}) => {
	const feelings = [
		{ key: "My Mood", label: "My Mood", color: "bg-blue-500" },
		{
			key: "Parkinson's State",
			label: "Parkinson's State",
			color: "bg-red-500",
		},
		{
			key: "Physical Difficulty",
			label: "Physical Difficulty",
			color: "bg-green-500",
		},
	];

	return (
		<div className="mb-6">
			<h3 className="text-lg font-semibold text-white mb-3">
				Select Feeling To Display:
			</h3>
			<div className="flex flex-wrap gap-2">
				{feelings.map((feeling) => (
					<Button
						key={feeling.key}
						variant={
							selectedFeelings.includes(feeling.key)
								? "default"
								: "outline"
						}
						onClick={() => onFeelingToggle(feeling.key)}
						className={`transition-all duration-200 ${
							selectedFeelings.includes(feeling.key)
								? `${feeling.color} hover:opacity-90 text-white shadow-md`
								: "hover:bg-gray-50 border-gray-200"
						}`}
					>
						{feeling.label}
					</Button>
				))}
			</div>
		</div>
	);
};

export default FeelingSelector;
