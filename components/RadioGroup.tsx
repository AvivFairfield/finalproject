"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RadioGroupProps {
	value?: string;
	type: "roles" | string;
	onChange: (value: string) => void;
}

export function RadioGroup({ value, onChange, type }: RadioGroupProps) {
	// Only define the label map and button label if type is "roles"
	const labelMap: { [key: string]: string } =
		type === "roles"
			? {
					fitnesstrainer: "Fitness Trainer",
					physiotherapist: "Physiotherapist",
					nutritionist: "Nutritionist",
					patient: "Patient",
			  }
			: {};

	const buttonLabel =
		type === "roles"
			? value
				? labelMap[value]
				: "Choose Your Role"
			: "Temp";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					className="input text-primary-100 w-full text-left justify-start"
					variant="outline"
				>
					{buttonLabel}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-full text-primary-100">
				<DropdownMenuRadioGroup value={value} onValueChange={onChange}>
					{type === "roles" &&
						Object.entries(labelMap).map(([val, label]) => (
							<DropdownMenuRadioItem key={val} value={val}>
								{label}
							</DropdownMenuRadioItem>
						))}
					{/* In the future, you can add other options here for different types */}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
