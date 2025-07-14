"use client";

import { useState } from "react";
import PatientSelect from "@/components/PatientSelect";
import MoodDashboard from "@/components/MoodDashboard";
import NutritionPieTimeline from "@/components/NutritionPieTimeline";
import ActivityDashboard from "@/components/ActivityDashboard";
import SymptomChart from "@/components/SymptomChart";
import MedicineStackedChart from "@/components/MedicineStackedChart";

type Role = "nutritionist" | "fitnesstrainer" | "physiotherapist";

const roleLabels: Record<Role, string> = {
	nutritionist: "Nutritionist",
	fitnesstrainer: "Fitness Trainer",
	physiotherapist: "Physiotherapist",
};

type User = {
	name: string;
	email: string;
	profession: Role;
};

export default function HomeClient({ user }: { user: User }) {
	const [selectedPatientEmail, setSelectedPatientEmail] =
		useState<string>("");
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [selectedPatientName, setSelectedPatientName] = useState<string>("");
	const hasSelectedPatient = Boolean(selectedPatientEmail);
	const [activeTab, setActiveTab] = useState<string>(user.profession);

	return (
		<div className="w-full max-w-7xl mx-auto px-4">
			<section className="card-cta w-full px-4">
				<div className="flex flex-row justify-between items-center w-full">
					<h2 className="text-2xl font-bold">
						Welcome, {user?.name || "Guest"}
					</h2>

					<div className="relative">
						{!hasSelectedPatient && (
							<span className="absolute -inset-1 animate-ping rounded-full bg-blue-500/30 pointer-events-none z-0" />
						)}
						<div className="relative z-10 flex flex-col gap-2">
							<PatientSelect
								providerEmail={user.email}
								value={selectedPatientEmail}
								onChange={(email, name) => {
									setSelectedPatientEmail(email);
									setSelectedPatientName(name);
								}}
							/>
						</div>
					</div>
				</div>
			</section>

			{hasSelectedPatient ? (
				<>
					<MoodDashboard />
					<div className="flex gap-4 my-6 justify-center">
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

					{activeTab === "nutritionist" && (
						<>
							<NutritionPieTimeline />
							<MedicineStackedChart />
						</>
					)}
					{activeTab === "fitnesstrainer" && <ActivityDashboard />}
					{activeTab === "physiotherapist" && <SymptomChart />}
				</>
			) : (
				<div className="text-center text-muted-foreground mt-8">
					👤 Please choose a patient to view data.
				</div>
			)}
		</div>
	);
}
