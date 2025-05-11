"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AccountButton() {
	const router = useRouter();

	return (
		<Button
			className="btn-primary px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-md"
			variant="outline"
			onClick={() => router.push("/settings")}
		>
			My Account
		</Button>
	);
}
