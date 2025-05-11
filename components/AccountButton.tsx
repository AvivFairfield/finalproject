"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AccountButton() {
	const router = useRouter();

	return (
		<Button
			className="btn-primary"
			variant="outline"
			onClick={() => router.push("/settings")}
		>
			My Account
		</Button>
	);
}
