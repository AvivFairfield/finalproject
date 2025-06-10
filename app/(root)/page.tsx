import { getCurrrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import CaregiverDashboard from "@/components/CaregiverDashboard";

const Page = async () => {
	const user = await getCurrrentUser();
	if (!user || user.profession === "patient") redirect("/settings");

	return <CaregiverDashboard user={user} />;
};

export default Page;
