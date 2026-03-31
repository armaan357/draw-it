import { Ref } from "react";

interface propType {
	type: "text" | "email" | "password";
	placeholder: string;
	ref: Ref<HTMLInputElement>;
	purpose: "primary" | "send";
	label?: string;
	autoComplete?: string;
}

const purposeInp = {
	primary: "w-full rounded-lg",
	send: "rounded-tl-full rounded-bl-full rounded-tr-0 rounded-br-0",
};

export function InputBox({
	type,
	placeholder,
	ref,
	purpose,
	label,
	autoComplete,
}: propType) {
	return (
		<div className="w-full flex flex-col gap-2">
			{label && (
				<label className="ml-3 font-[450] select-none">{label}:</label>
			)}
			<input
				type={type}
				placeholder={placeholder}
				ref={ref}
				style={{ padding: "12px 24px" }}
				autoCapitalize="off"
				autoCorrect="off"
				autoComplete={autoComplete}
				className={`${purposeInp[purpose]} bg-white/4 border border-[#d8d6cf]/15 focus-within:border-[#f5f5f5]/25 tracking-wide outline-0 text-[15px] text-[#f5f5f5] placeholder:text-[#f1f0f761] transition-all duration-200 ease-in-out focus-visible:outline-none placeholder:select-none`}
			/>
			{/* <div className="absolute right-0.5">
                <EyeIcon />
            </div> */}
		</div>
	);
}