"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/firebase/client";
import { collection, getDocs, query, where } from "firebase/firestore";

type Props = {
	providerEmail: string;
	value?: string;
	onChange: (email: string, name: string) => void;
};

type Patient = {
	email: string;
	name: string;
};

export default function PatientSelect({
	providerEmail,
	value,
	onChange,
}: Props) {
	const [patients, setPatients] = useState<Patient[]>([]);
	const [selected, setSelected] = useState<Patient | null>(null);

	useEffect(() => {
		const fetchPatients = async () => {
			const q = query(
				collection(db, "connections"),
				where("providerId", "==", providerEmail),
				where("confirmed", "==", true)
			);
			const snapshot = await getDocs(q);

			const result = (
				await Promise.all(
					snapshot.docs.map(async (doc) => {
						const data = doc.data();
						const email = data.patientId;
						if (!email) return null;

						const userQuery = query(
							collection(db, "users"),
							where("email", "==", email)
						);
						const userSnap = await getDocs(userQuery);
						const name = userSnap.empty
							? email.split("@")[0]
							: userSnap.docs[0].data().name || email;

						return { email, name };
					})
				)
			).filter((p): p is Patient => p !== null); // ✅ TypeScript-safe filter

			setPatients(result.filter(Boolean) as Patient[]);
		};

		fetchPatients();
	}, [providerEmail]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					className="input text-primary-100 w-full text-left justify-center flex flex-col items-start gap-0.5 h-15"
					variant="outline"
				>
					<span className="text-base font-medium">
						{selected?.name || "Choose a patient"}
					</span>
					{selected?.email && (
						<span className="text-xs text-gray-400">
							{selected.email}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="w-full text-primary-100">
				<DropdownMenuRadioGroup
					value={value}
					onValueChange={(val) => {
						const selected = patients.find((p) => p.email === val);
						if (selected) {
							setSelected(selected); // sets internal display state
							onChange(selected.email, selected.name); // external update
						}
					}}
				>
					{patients.length > 0 ? (
						patients.map((p) => (
							<DropdownMenuRadioItem
								key={p.email}
								value={p.email}
							>
								{p.name}
							</DropdownMenuRadioItem>
						))
					) : (
						<DropdownMenuRadioItem value="" disabled>
							No patients found
						</DropdownMenuRadioItem>
					)}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
