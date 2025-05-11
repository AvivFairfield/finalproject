"use client";

import { useEffect, useState } from "react";
import {
	collection,
	getDocs,
	query,
	where,
	onSnapshot,
	doc,
	updateDoc,
	deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import { toast } from "sonner";

type Request = {
	id: string;
	email: string;
	name: string;
	profession: string;
};

export default function PendingRequests({
	patientEmail,
}: {
	patientEmail: string;
}) {
	const [requests, setRequests] = useState<Request[]>([]);

	useEffect(() => {
		if (!patientEmail) return;

		const q = query(
			collection(db, "connections"),
			where("patientId", "==", patientEmail),
			where("confirmed", "==", false)
		);

		const unsubscribe = onSnapshot(q, async (snapshot) => {
			const data: Request[] = await Promise.all(
				snapshot.docs.map(async (docSnap) => {
					const connection = docSnap.data();
					const providerEmail = connection.providerId;

					let name = "";
					let profession = "";

					const userQuery = query(
						collection(db, "users"),
						where("email", "==", providerEmail)
					);
					const userSnap = await getDocs(userQuery);
					if (!userSnap.empty) {
						const data = userSnap.docs[0].data();
						name = data.name || "";
						profession = data.profession || "";
					}

					return {
						id: docSnap.id,
						email: providerEmail,
						name: name || providerEmail.split("@")[0],
						profession: profession || "N/A",
					};
				})
			);

			setRequests(data);
		});

		return () => unsubscribe();
	}, [patientEmail]);

	const confirmRequest = async (connectionId: string) => {
		try {
			await updateDoc(doc(db, "connections", connectionId), {
				confirmed: true,
			});
			toast.success("Care provider confirmed!");
		} catch (error) {
			console.error("Error confirming request:", error);
			toast.error("Could not confirm request.");
		}
	};

	const denyRequest = async (connectionId: string) => {
		try {
			await deleteDoc(doc(db, "connections", connectionId));
			toast.success("Request denied");
		} catch (error) {
			console.error("Error denying request:", error);
			toast.error("Failed to deny request.");
		}
	};

	const professionLabelMap: Record<string, string> = {
		fitnesstrainer: "Fitness Trainer",
		physiotherapist: "Physiotherapist",
		nutritionist: "Nutritionist",
	};

	return (
		<div className="space-y-4">
			{requests.length === 0 ? (
				<p className="text-gray-400">No pending requests.</p>
			) : (
				<table className="w-full table-fixed text-left border-collapse">
					<thead>
						<tr className="border-b border-gray-600">
							<th className="py-2 pr-4 w-1/4">Name</th>
							<th className="py-2 px-2 w-1/3">Email</th>
							<th className="py-2 px-2 w-1/4">Profession</th>
							<th className="py-2 px-2">Action</th>
						</tr>
					</thead>
					<tbody>
						{requests.map((req) => (
							<tr
								key={req.id}
								className="border-b border-gray-700 text-white"
							>
								<td className="py-2 pr-4">{req.name}</td>
								<td className="py-2 px-2 break-words">
									{req.email}
								</td>
								<td className="py-2 px-2">
									{professionLabelMap[req.profession] ||
										req.profession}
								</td>
								<td className="py-2 px-2">
									<div className="flex flex-wrap gap-2">
										<button
											onClick={() =>
												confirmRequest(req.id)
											}
											className="px-3 py-1 text-sm font-semibold bg-green-600 hover:bg-green-700 rounded-md"
										>
											Confirm
										</button>
										<button
											onClick={() => denyRequest(req.id)}
											className="px-3 py-1 text-sm font-semibold bg-red-600 hover:bg-red-700 rounded-md"
										>
											Deny
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}
