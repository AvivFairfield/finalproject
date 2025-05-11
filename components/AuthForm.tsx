"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Link from "next/link";
import { toast } from "sonner";
import FormField from "./FormField";
import { useRouter } from "next/navigation";
import { RadioGroup } from "./RadioGroup";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/firebase/client";
import { signIn, signUp } from "@/lib/actions/auth.action";

const authFormSchema = (type: FormType) => {
	return z.object({
		name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
		email: z.string().email(),
		password: z.string().min(3),
		profession:
			type === "sign-up"
				? z.string().min(1, "Please select a role")
				: z.string().optional(),
	});
};

const AuthForm = ({ type }: { type: FormType }) => {
	const router = useRouter();
	const formSchema = authFormSchema(type);
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			profession: "",
		},
	});

	// 2. Define a submit handler.
	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			if (type === "sign-up") {
				const { name, email, password, profession } = values;

				const userCredentials = await createUserWithEmailAndPassword(
					auth,
					email,
					password
				);

				const result = await signUp({
					uid: userCredentials.user.uid,
					name: name!,
					email,
					password,
					profession: profession!,
				});

				if (!result?.success) {
					toast.error(result?.message);
					return;
				}

				toast.success("Account created successfully");
				router.push("/sign-in");
			} else {
				const { email, password } = values;
				const userCredential = await signInWithEmailAndPassword(
					auth,
					email,
					password
				);

				const idToken = await userCredential.user.getIdToken();
				if (!idToken) {
					toast.error("Sign in Failed");
					return;
				}

				await signIn({
					email,
					idToken,
				});

				toast.success("Signed in successfully");
				router.push("/");
			}
		} catch (error) {
			console.log(error);
			toast.error(`There was an error ${error}`);
		}
	}

	const isSignIn = type === "sign-in";

	return (
		<div className="card-border lg:min-w-[566px]">
			<div className="flex flex-col gap-6 card py-14 px-10">
				<div className="flex flex-row gap-2 justify-center">
					<Image src="/logo.svg" alt="logo" height={32} width={38} />
					<h2 className="text-primary-100">ParkinSphere</h2>
				</div>
				<h3 className="flex justify-center">Helping Others</h3>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="w-full space-y-6 mt-4 form"
					>
						{!isSignIn && (
							<Controller
								name="profession"
								control={form.control}
								render={({ field }) => (
									<RadioGroup
										value={field.value}
										onChange={field.onChange}
										type="roles"
									/>
								)}
							/>
						)}
						{!isSignIn && (
							<FormField
								control={form.control}
								name="name"
								label="Name"
								placeholder="Your Name"
							/>
						)}

						<FormField
							control={form.control}
							name="email"
							label="Email"
							placeholder="Your Email Address"
							type="email"
						/>
						<FormField
							control={form.control}
							name="password"
							label="Password"
							placeholder="Enter your password"
							type="password"
						/>
						<Button className="btn" type="submit">
							{isSignIn ? "Sign in" : "Create an Account"}
						</Button>
					</form>
				</Form>
				<p className="text-center">
					{isSignIn ? "Register Now!" : "Have an Account Already?"}
					<Link
						href={!isSignIn ? "/sign-in" : "/sign-up"}
						className="font-bold text-user-primary ml-1"
					>
						{!isSignIn ? "Sign in" : "Sign up"}
					</Link>
				</p>
			</div>
		</div>
	);
};

export default AuthForm;
