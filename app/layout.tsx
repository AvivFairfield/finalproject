import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const monatSans = Mona_Sans({
	variable: "--font-mona-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "ParkinSphere",
	description: "Helping Others",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<body className={`${monatSans.className} antialiased pattern`}>
				{children}
				<Toaster />
			</body>
		</html>
	);
}
