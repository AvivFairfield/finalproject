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
	console.log(selectedPatientName);

	return (
		<section className="card-cta w-full px-4">
			<div className="flex flex-row justify-between items-center w-full">
				<h2 className="text-2xl font-bold">
					Welcome, {user?.name || "Guest"}
				</h2>

				<div className="flex flex-col gap-2">
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
		</section>
	);
}
