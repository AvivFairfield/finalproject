"use client";

import React, { useEffect, useState } from "react";
import MoodDashboard from "@/components/MoodDashboard";
import NutritionPieTimeline from "@/components/NutritionPieTimeline";
import HomeClient from "@/components/HomeClient";
import ActivityDashboard from "./ActivityDashboard";
import SymptomChart from "./SymptomChart";
import MedicineStackedChart from "./MedicineStackedChart";

type Role = "nutritionist" | "fitnesstrainer" | "physiotherapist";

const roleLabels: Record<Role, string> = {
	nutritionist: "Nutritionist",
	fitnesstrainer: "Fitness Trainer",
	physiotherapist: "Physiotherapist",
};

interface Props {
	user: {
		name: string;
		email: string;
		id: string;
		profession: string;
	};
}

const CaregiverDashboard: React.FC<Props> = ({ user }) => {
	const [activeTab, setActiveTab] = useState<string>(user.profession);

	useEffect(() => {
		if (user.profession) {
			setActiveTab(user.profession);
		}
	}, [user.profession]);

	return (
		<div className="w-full max-w-7xl mx-auto px-4">
			<HomeClient user={user} />

			<div className="flex gap-4 my-6">
				{(
					[
						"nutritionist",
						"fitnesstrainer",
						"physiotherapist",
					] as Role[]
				).map((role) => (
					<button
						key={role}
						className={`px-4 py-2 rounded-full font-medium transition ${
							activeTab === role
								? "bg-indigo-500 text-white"
								: "bg-muted text-gray-800 dark:text-white"
						}`}
						onClick={() => setActiveTab(role)}
					>
						{roleLabels[role]}
					</button>
				))}
			</div>

			<MoodDashboard />

			{activeTab === "nutritionist" && (
				<>
					<NutritionPieTimeline /> <MedicineStackedChart />
				</>
			)}
			{activeTab === "fitnesstrainer" && <ActivityDashboard />}

			{activeTab === "physiotherapist" && <SymptomChart />}
		</div>
	);
};

export default CaregiverDashboard;
