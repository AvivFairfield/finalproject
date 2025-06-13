"use client";

import { useState } from "react";
import PatientSelect from "@/components/PatientSelect";

type User = {
	name: string;
	email: string;
	profession: string;
};

export default function HomeClient({ user }: { user: User }) {
	const [selectedPatientEmail, setSelectedPatientEmail] =
		useState<string>("");
	const [selectedPatientName, setSelectedPatientName] = useState<string>("");
	const hasSelectedPatient = Boolean(selectedPatientEmail);

	return (
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
	);
}
