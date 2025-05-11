"use client";

import { useEffect, useState } from "react";
import { getCurrrentUser } from "@/lib/actions/auth.action";
import { db } from "@/firebase/client";
import {
	collection,
	query,
	where,
	onSnapshot,
	getDocs,
} from "firebase/firestore";
import MyPatients from "./MyPatients";
import UserSearch from "./UserSearch";
import MyCareProviders from "./MyCareProviders";
import PendingRequests from "./PendingRequests";

type Patient = {
	id: string;
	email: string;
	name: string;
	confirmed: boolean;
};

type User = {
	name: string;
	email: string;
	profession: string;
};

type UserRole =
	| "patient"
	| "nutritionist"
	| "physiotherapist"
	| "fitnesstrainer";

export default function DashboardContent({ role }: { role: UserRole }) {
	const isPatient = role === "patient";
	const [user, setUser] = useState<User | null>(null);
	const [patients, setPatients] = useState<Patient[]>([]);

	useEffect(() => {
		(async () => {
			const current = await getCurrrentUser();
			setUser(current);
		})();
	}, []);

	useEffect(() => {
		if (!user?.email) return;

		const q = query(
			collection(db, "connections"),
			where("providerId", "==", user.email)
		);

		const unsubscribe = onSnapshot(q, async (snapshot) => {
			const updatedPatients: Patient[] = await Promise.all(
				snapshot.docs.map(async (docSnap) => {
					const connection = docSnap.data();
					const patientEmail = connection.patientId;
					let name = "";

					const userQuery = query(
						collection(db, "users"),
						where("email", "==", patientEmail)
					);
					const userSnap = await getDocs(userQuery);
					if (!userSnap.empty) {
						name = userSnap.docs[0].data().name || "";
					}

					return {
						id: docSnap.id,
						email: patientEmail,
						name: name || patientEmail.split("@")[0],
						confirmed: connection.confirmed,
					};
				})
			);

			setPatients(updatedPatients);
		});

		return () => unsubscribe();
	}, [user?.email]);

	const professionLabelMap: Record<string, string> = {
		fitnesstrainer: "Fitness Trainer",
		physiotherapist: "Physiotherapist",
		nutritionist: "Nutritionist",
	};

	if (!user) return null;

	return (
		<div className="w-full flex justify-center px-2 py-6 md:py-10">
			<div className="w-full max-w-3xl space-y-6 px-4 md:px-6">
				{/* Account Details */}
				<div className="rounded-xl bg-[#0B1623] border border-gray-700 p-6 shadow text-white">
					<h2 className="text-xl md:text-2xl font-bold mb-4">
						Account Details
					</h2>
					<p>
						<span className="text-gray-400">Full Name:</span>{" "}
						{user.name}
					</p>
					<p>
						<span className="text-gray-400">Email:</span>{" "}
						{user.email}
					</p>
					<p>
						<span className="text-gray-400">Profession:</span>{" "}
						{professionLabelMap[user.profession] || user.profession}
					</p>
				</div>

				{isPatient ? (
					<>
						{/* 🧍‍♂️ Patient: My Care Providers */}
						<div className="rounded-xl bg-[#0B1623] border border-gray-700 p-6 shadow text-white">
							<h2 className="text-xl md:text-2xl font-bold mb-4">
								My Care Providers
							</h2>
							<MyCareProviders patientEmail={user.email} />
						</div>

						{/* ⏳ Patient: Pending Requests — coming next */}

						<div className="rounded-xl bg-[#0B1623] border border-gray-700 p-6 shadow text-white">
							<h2 className="text-xl md:text-2xl font-bold mb-4">
								Pending Requests
							</h2>
							<PendingRequests patientEmail={user.email} />
						</div>

						{/* <PendingRequests patientEmail={user.email} /> */}
					</>
				) : (
					<>
						{/* My Current Patients */}
						<div className="rounded-xl bg-[#0B1623] border border-gray-700 p-6 shadow text-white">
							<h2 className="text-xl md:text-2xl font-bold mb-4">
								My Current Patients
							</h2>
							<MyPatients providerEmail={user.email} />
						</div>

						{/* Search for Patients */}
						<div className="rounded-xl bg-[#0B1623] border border-gray-700 p-6 shadow text-white">
							<h2 className="text-xl md:text-2xl font-bold mb-4">
								Search for Patients
							</h2>
							<UserSearch
								providerEmail={user.email}
								patients={patients}
								setPatients={setPatients}
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
