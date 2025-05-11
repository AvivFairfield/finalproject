import AccountButton from "@/components/AccountButton";
import SignOutButton from "@/components/SignOutButton";
import { isAuthenticated } from "@/lib/actions/auth.action";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const RootLayout = async ({ children }: { children: ReactNode }) => {
	const isUserAuthenticated = await isAuthenticated();
	if (!isUserAuthenticated) redirect("/sign-in");

	return (
		<div className="min-h-screen flex flex-col bg-background text-foreground">
			<nav className="w-full border-b px-4 py-3 md:px-8">
				<div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
					<div className="flex items-center gap-2 min-w-0">
						<Image
							src="/logo.svg"
							alt="Logo"
							width={32}
							height={28}
						/>
						<h2 className="text-primary-100 text-base sm:text-lg whitespace-nowrap truncate">
							ParkinSphere
						</h2>
					</div>

					<div className="flex gap-2 shrink-0">
						<AccountButton />
						<SignOutButton />
					</div>
				</div>
			</nav>

			<main className="flex-grow w-full px-4 md:px-8 py-6">
				{children}
			</main>
		</div>
	);
};

export default RootLayout;
