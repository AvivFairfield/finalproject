"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// 👇 Dynamically import the server action from the edge
export default function SignOutButton() {
	const router = useRouter();

	const handleSignOut = async () => {
		try {
			const { signOutServer } = await import("@/lib/actions/auth.action");
			await signOutServer();

			await signOut(auth);

			toast.success("Signed out successfully");
			router.push("/sign-in");
		} catch (error) {
			console.error("Sign out error:", error);
			toast.error("Failed to sign out");
		}
	};

	return (
		<Button
			onClick={handleSignOut}
			variant="outline"
			className="btn-primary px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-md"
		>
			Sign Out
		</Button>
	);
}
