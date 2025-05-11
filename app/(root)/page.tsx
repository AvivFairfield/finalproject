import FeelingChart from "@/components/FeelingChart";
import HomeClient from "@/components/HomeClient";
import { getCurrrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";

const Page = async () => {
	const user = await getCurrrentUser();

	if (user?.profession === "patient") {
		redirect("/settings");
	}

	return (
		<div className="w-full max-w-7xl mx-auto px-4">
			<HomeClient user={user!} />
			<FeelingChart />
		</div>
	);
};

export default Page;
