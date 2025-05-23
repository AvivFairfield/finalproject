import DashboardContent from "@/components/DashboardContent";
import { getCurrrentUser } from "@/lib/actions/auth.action";

export default async function Page() {
	const user = await getCurrrentUser();
	if (!user) return null;

	type UserRole =
		| "patient"
		| "nutritionist"
		| "physiotherapist"
		| "fitnesstrainer";

	return (
		<div className="max-w-6xl mx-auto w-full">
			<DashboardContent role={user.profession as UserRole} />
		</div>
	);
}
