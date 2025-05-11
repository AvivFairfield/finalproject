import HomeClient from "@/components/HomeClient";
import { getCurrrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";

const Page = async () => {
	const user = await getCurrrentUser();

	if (user?.profession === "patient") {
		redirect("/settings");
	}

	return <HomeClient user={user} />;
};

export default Page;
