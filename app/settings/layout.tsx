import SignOutButton from "@/components/SignOutButton";
import Image from "next/image";
import Link from "next/link";
import { isAuthenticated } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const RootLayout = async ({ children }: { children: ReactNode }) => {
	const isUserAuthenticated = await isAuthenticated();
	if (!isUserAuthenticated) redirect("/sign-in");

	return (
		<div className="min-h-screen flex flex-col bg-background text-foreground">
			<nav className="w-full border-b px-4 py-3 md:px-8">
				<div className="flex justify-between items-center max-w-6xl mx-auto">
					<Link href="/" className="flex items-center gap-2">
						<Image
							src="/logo.svg"
							alt="Logo"
							width={38}
							height={32}
						/>
						<h2 className="text-primary-100 text-lg sm:text-xl">
							ParkinSphere
						</h2>
					</Link>
					<SignOutButton />
				</div>
			</nav>
			<main className="flex-grow w-full px-4 md:px-8 py-6">
				{children}
			</main>
		</div>
	);
};

export default RootLayout;
