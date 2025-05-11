"use client";

import { useEffect, useState } from "react";
import {
	collection,
	addDoc,
	deleteDoc,
	doc,
	onSnapshot,
	query,
	where,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

type Patient = {
	id: string;
	name: string;
	email: string;
	confirmed: boolean;
};

type User = {
	id: string;
	name: string;
	email: string;
	profession: string;
};

export default function UserSearch({
	providerEmail,
	patients,
	setPatients,
}: {
	providerEmail: string;
	patients: Patient[];
	setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
}) {
	const [queryText, setQueryText] = useState("");
	const [debouncedQuery] = useDebounce(queryText, 500);
	const [results, setResults] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [existingPatients, setExistingPatients] = useState<
		{ email: string; connectionId: string }[]
	>([]);

	console.log(patients);

	// Live listener for existing connections
	useEffect(() => {
		if (!providerEmail) return;

		const q = query(
			collection(db, "connections"),
			where("providerId", "==", providerEmail)
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
			const patients = snapshot.docs.map((doc) => ({
				email: doc.data().patientId,
				connectionId: doc.id,
			}));
			setExistingPatients(patients);
		});

		return () => unsubscribe();
	}, [providerEmail]);

	// Debounced live search
	useEffect(() => {
		const fetchResults = async () => {
			if (!debouncedQuery.trim()) {
				setResults([]);
				return;
			}

			setLoading(true);

			try {
				const res = await fetch(
					`/api/search-users?name=${debouncedQuery}`
				);
				if (!res.ok) {
					toast.error("Search failed.");
					return;
				}
				const data = await res.json();
				setResults(data.users);
			} catch (error) {
				console.error("Error during search:", error);
				toast.error("Search error occurred.");
			} finally {
				setLoading(false);
			}
		};

		fetchResults();
	}, [debouncedQuery]);

	// Send connection request
	const createConnection = async (patient: User) => {
		try {
			await addDoc(collection(db, "connections"), {
				providerId: providerEmail,
				patientId: patient.email,
				confirmed: false,
				createdAt: new Date(),
			});

			toast.success(`Request sent to ${patient.name}`);

			// ✅ Only add if not already in patients list (by email)
			setPatients((prev) => {
				const exists = prev.some((p) => p.email === patient.email);
				if (exists) return prev;

				return [
					...prev,
					{
						id: "temp-" + patient.email,
						email: patient.email,
						name: patient.name,
						confirmed: false,
					},
				];
			});
		} catch (error) {
			console.error("Error creating connection:", error);
			toast.error("Failed to send request.");
		}
	};

	// Cancel pending request
	const cancelRequest = async (connectionId: string, email: string) => {
		try {
			await deleteDoc(doc(db, "connections", connectionId));
			toast.success("Request cancelled");
			setPatients((prev) => prev.filter((p) => p.email !== email));
		} catch (error) {
			console.error("Error cancelling request:", error);
			toast.error("Failed to cancel request.");
		}
	};

	return (
		<div className="space-y-4">
			<input
				type="text"
				value={queryText}
				onChange={(e) => setQueryText(e.target.value)}
				placeholder="Search by patient name..."
				className="w-full px-4 py-2 border border-gray-600 rounded-md bg-[#0f1b2e] text-white"
			/>

			<div className="space-y-2">
				{loading ? (
					<div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
						<svg
							className="animate-spin h-5 w-5 text-white"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8v8H4z"
							></path>
						</svg>
						<span>Searching...</span>
					</div>
				) : debouncedQuery && results.length === 0 ? (
					<p className="text-gray-400 text-sm">No users found.</p>
				) : (
					results.map((user) => {
						const connection = existingPatients.find(
							(p) => p.email === user.email
						);
						const alreadyRequested = !!connection;

						return (
							<div
								key={user.id}
								className="flex items-center justify-between p-3 bg-[#1a2a3c] text-white rounded-md border border-gray-700"
							>
								<div>
									<p className="font-semibold">{user.name}</p>
									<p className="text-sm text-gray-400">
										{user.email}
									</p>
								</div>

								{alreadyRequested ? (
									<button
										className="ml-4 px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 transition text-white text-sm font-semibold"
										onClick={() =>
											cancelRequest(
												connection.connectionId,
												user.email
											)
										}
									>
										Cancel Request
									</button>
								) : (
									<button
										className="ml-4 px-3 py-1 rounded-md bg-green-600 hover:bg-green-700 transition text-white text-lg font-bold"
										onClick={() => createConnection(user)}
									>
										+
									</button>
								)}
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
