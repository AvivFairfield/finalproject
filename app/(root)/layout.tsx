import AccountButton from "@/components/AccountButton";
import SignOutButton from "@/components/SignOutButton";
import { Button } from "@/components/ui/button";
import { isAuthenticated } from "@/lib/actions/auth.action";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const RootLayout = async ({ children }: { children: ReactNode }) => {
	const isUserAuthenticated = await isAuthenticated();
	if (!isUserAuthenticated) redirect("/sign-in");

	return (
		<div className="root-layout">
			<nav>
				<div className="flex justify-between items-center">
					<Link href="/" className="flex items-center gap-2">
						<Image
							src="/logo.svg"
							alt="Logo"
							width={38}
							height={32}
						/>
						<h2 className="text-primary-100">ParkinSphere</h2>
					</Link>
					<div className="flex gap-4">
						<AccountButton />
						<SignOutButton />
					</div>
				</div>
			</nav>
			{children}
		</div>
	);
};

export default RootLayout;
