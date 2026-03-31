"use client";
import { ReactNode } from "react";

const buttonVariant = {
	primary: "border-0 text-white",
	secondary:
		"border text-white border-[#f5f5f5]/20 bg-white/4 hover:bg-white/6",
	outline: "border border-indigo-300 text-purple-700",
	ghost: "border-0 text-white",
	link: "border-0 text-white underline",
};

const buttonSize = {
	sm: "px-3 h-9 rounded-lg text-sm font-medium",
	md: "px-5 h-10 rounded-lg",
	lg: "px-8 h-11 rounded-lg",
	icon: "p-3 rounded-full",
	full: "h-11 w-full rounded-lg",
};

interface ButtonInterface {
	variant: "primary" | "secondary" | "outline" | "ghost" | "link";
	size: "sm" | "md" | "lg" | "icon" | "full";
	className?: string;
	children: ReactNode;
	onClick?: () => void;
	onSubmit?: () => void;
	loading?: boolean;
}

export function Button(props: ButtonInterface) {
    return (
		<button
			style={{ height: "36px" }}
			className={`${buttonVariant[props.variant]} ${props.className} ${buttonSize[props.size]} transition-all duration-200 ease-in-out flex items-center justify-center cursor-pointer focus-within:outline-none outline-none select-none`}
			onClick={props.onClick}
			onSubmit={props.onSubmit}
		>
			{props.children}
		</button>
	);
}
