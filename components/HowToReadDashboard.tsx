import React, { useState } from "react";
import { Lightbulb } from "lucide-react";

interface LegendItem {
	label: string;
	color: string;
	opacity: number;
}

interface HowToReadDashboardProps {
	title?: string;
	bullets: string[];
	legend?: LegendItem[];
}

const HowToReadDashboard: React.FC<HowToReadDashboardProps> = ({
	title = "How to Read This Graph",
	bullets,
	legend,
}) => {
	const [open, setOpen] = useState(false);

	return (
		<div className="mt-4">
			{/* Inline Toggle Button */}
			<button
				onClick={() => setOpen(!open)}
				className="bg-yellow-400 hover:bg-yellow-300 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all mb-2"
				title={open ? "Hide Explanation" : "Show Explanation"}
			>
				<Lightbulb className="w-5 h-5 text-black" />
			</button>

			{/* Panel */}
			{open && (
				<div className="mt-2 bg-muted border border-white rounded-lg p-4">
					<div className="flex items-start gap-3">
						<div className="text-yellow-400 text-lg">💡</div>
						<div className="text-sm text-white">
							<p className="font-medium mb-2">{title}</p>
							<div className="space-y-1">
								{bullets.map((text, i) => (
									<p key={i}>• {text}</p>
								))}

								{legend && (
									<div className="ml-4 mt-2 space-y-1">
										{legend.map((item, i) => (
											<div
												key={i}
												className="flex items-center gap-2"
											>
												<div
													className="w-4 h-3 rounded"
													style={{
														backgroundColor:
															item.color,
														opacity: item.opacity,
													}}
												/>
												<span>{item.label}</span>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default HowToReadDashboard;
