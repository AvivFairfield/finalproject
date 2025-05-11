"use client";

import { useEffect, useState } from "react";
import {
	collection,
	getDocs,
	query,
	where,
	onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import { Hourglass } from "lucide-react"; // or use heroicons, etc.

type Patient = {
	id: string;
	email: string;
	name: string;
	confirmed: boolean;
};

export default function MyPatients({
	providerEmail,
}: {
	providerEmail: string;
}) {
	const [patients, setPatients] = useState<Patient[]>([]);

	useEffect(() => {
		if (!providerEmail) return;

		const q = query(
			collection(db, "connections"),
			where("providerId", "==", providerEmail)
		);

		// 🔄 Live listener
		const unsubscribe = onSnapshot(q, async (snapshot) => {
			const data: Patient[] = await Promise.all(
				snapshot.docs.map(async (docSnap) => {
					const connection = docSnap.data();
					const patientEmail = connection.patientId;
					let name = "";

					// 🔍 Fetch name from users collection by email
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

			setPatients(data);
		});

		return () => unsubscribe(); // 🔁 Cleanup on unmount
	}, [providerEmail]);

	return (
		<div className="space-y-4">
			{patients.length === 0 ? (
				<p className="text-gray-400">No patients found.</p>
			) : (
				<table className="w-full table-fixed text-left border-collapse">
					<thead>
						<tr className="border-b border-gray-600">
							<th className="py-2 pr-4 w-1/4">Name</th>
							<th className="py-2 px-2 w-3/5">Email</th>
							<th className="py-2 px-2 w-[100px]">Status</th>
						</tr>
					</thead>

					<tbody>
						{patients.map((patient) => (
							<tr
								key={patient.id}
								className={`border-b border-gray-700 ${
									patient.confirmed
										? "text-white"
										: "text-gray-500"
								}`}
							>
								<td className="py-2 pr-4 w-1/4">
									{patient.name}
								</td>
								<td className="py-2 px-2 w-3/5 break-words text-sm leading-tight">
									{patient.email}
								</td>
								<td className="py-2 px-2 w-[100px] whitespace-nowrap">
									<span className="flex items-center gap-2">
										{patient.confirmed ? (
											<div>
												<span className="text-green-400">
													✔
												</span>{" "}
												Confirmed
											</div>
										) : (
											<>
												<span className="animate-bounce">
													<Hourglass className="w-4 h-4 text-yellow-400" />
												</span>
												<span>Pending</span>
											</>
										)}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}
