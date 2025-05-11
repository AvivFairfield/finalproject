"use client";

import { useEffect, useState } from "react";
import {
	collection,
	query,
	where,
	onSnapshot,
	getDocs,
	deleteDoc,
	doc,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import { toast } from "sonner";

type Provider = {
	id: string;
	email: string;
	name: string;
	profession: string;
};

export default function MyCareProviders({
	patientEmail,
}: {
	patientEmail: string;
}) {
	const [providers, setProviders] = useState<Provider[]>([]);

	useEffect(() => {
		if (!patientEmail) return;

		const q = query(
			collection(db, "connections"),
			where("patientId", "==", patientEmail),
			where("confirmed", "==", true)
		);

		const unsubscribe = onSnapshot(q, async (snapshot) => {
			const data: Provider[] = await Promise.all(
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

			setProviders(data);
		});

		return () => unsubscribe();
	}, [patientEmail]);

	const professionLabelMap: Record<string, string> = {
		fitnesstrainer: "Fitness Trainer",
		physiotherapist: "Physiotherapist",
		nutritionist: "Nutritionist",
	};

	const removeProvider = async (connectionId: string) => {
		try {
			await deleteDoc(doc(db, "connections", connectionId));
			toast.success("Care provider removed.");
		} catch (error) {
			console.error("Error removing provider:", error);
			toast.error("Could not remove provider.");
		}
	};

	return (
		<div className="space-y-4">
			{providers.length === 0 ? (
				<p className="text-gray-400">No providers assigned yet.</p>
			) : (
				<table className="w-full table-fixed text-left border-collapse">
					<thead>
						<tr className="border-b border-gray-600">
							<th className="py-2 pr-4 w-1/4">Name</th>
							<th className="py-2 px-2 w-1/3">Email</th>
							<th className="py-2 px-2 w-1/4">Profession</th>
							<th className="py-2 px-2 w-[100px]">Action</th>
						</tr>
					</thead>

					<tbody>
						{providers.map((provider) => (
							<tr
								key={provider.id}
								className="border-b border-gray-700 text-white"
							>
								<td className="py-2 pr-4">{provider.name}</td>
								<td className="py-2 px-2 break-words">
									{provider.email}
								</td>
								<td className="py-2 px-2">
									{professionLabelMap[provider.profession] ||
										provider.profession}
								</td>
								<td className="py-2 px-2">
									<button
										onClick={() =>
											removeProvider(provider.id)
										}
										className="px-3 py-1 text-sm font-semibold bg-red-600 hover:bg-red-700 rounded-md"
									>
										Remove
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}
