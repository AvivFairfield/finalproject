import { NextResponse } from "next/server";
import { db } from "@/firebase/admin"; // adjust if needed

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const name = searchParams.get("name");

	if (!name) return NextResponse.json({ users: [] });

	const snapshot = await db
		.collection("users")
		.where("profession", "==", "patient")
		.orderBy("name")
		.startAt(name)
		.endAt(name + "\uf8ff")
		.get();

	const users = snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	}));

	return NextResponse.json({ users });
}
