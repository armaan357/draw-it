"use client";
import { useRef, useState } from "react"
import { InputBox } from "../../ui/input-box";
import { Button } from "../../ui/button";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { SignupSchema } from '@repo/common/schema';
import { z } from 'zod';
import Link from 'next/link';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SignUp() {
	const emailRef = useRef<HTMLInputElement>(null);
	const pwdRef = useRef<HTMLInputElement>(null);
	const firstNameRef = useRef<HTMLInputElement>(null);
	const lastNameRef = useRef<HTMLInputElement>(null);
	const [msg, setMsg] = useState<string>("");
	const navigate = useRouter();
	type signupType = z.infer<typeof SignupSchema>;

	async function signup() {
		try {
			const userInfo: signupType = {
				userName: emailRef.current?.value!,
				password: pwdRef.current?.value!,
				firstName: firstNameRef.current?.value!,
				lastName: lastNameRef.current?.value!,
			};
			if (
				userInfo.userName.length === 0 ||
				userInfo.password.length === 0 ||
				userInfo.firstName.length === 0 ||
				userInfo.lastName.length === 0
			) {
				return;
			}

			const resp = await axios.post(`${backendUrl}/signup`, userInfo);
			if (!resp) {
				setMsg("Please try again");
				return;
			} else if (resp.data.error?.code === 11000) {
				setMsg("User already exists please sign in");
				console.log(resp.data.error);
				return;
			}
			navigate.push("/signin");
		} catch (e: any) {
			console.log("error: ", e);
		}
	}

	return (
		<div className="h-full min-h-screen w-full bg-[#121212] text-zinc-100 font-sans">
			<div className="py-2.5 h-15 w-full flex justify-between items-center px-3 sm:px-8 md:px-12">
				<div></div>
				<div>
					<Link href={"signin"}>
						<Button
							variant="secondary"
							size="md"
							children={"Log In"}
						/>
					</Link>
				</div>
			</div>
			<div className="w-full sm:w-md flex flex-col mx-auto justify-center items-center gap-6 border-none py-7 px-3">
				<div>
					<h1 className="text-2xl font-semibold select-none">
						Sign Up
					</h1>
				</div>
				<div className="flex flex-col w-full gap-5 justify-center items-center max-w-sm">
					<InputBox
						label="Email"
						type="text"
						purpose="primary"
						ref={emailRef}
						placeholder="user@gmail.com"
					/>
					<InputBox
						label="Password"
						ref={pwdRef}
						type="password"
						placeholder="Enter a strong password"
						purpose="primary"
					/>
					<InputBox
						label="First Name"
						ref={firstNameRef}
						type="text"
						placeholder="First Name"
						purpose="primary"
					/>
					<InputBox
						label="Last Name"
						ref={lastNameRef}
						type="text"
						placeholder="Last Name"
						purpose="primary"
					/>
				</div>
				<div className="w-full flex flex-col justify-center items-center gap-2.5 max-w-sm">
					<Button
						variant="primary"
						className="bg-purple-600 hover:bg-purple-700 w-full"
						size="full"
						children={"Sign Up"}
						onClick={signup}
					/>
					{/* <p>
						Already have an account?{" "}
						<Link
							href="/signin"
							className="text-blue-600 hover:text-blue-500 hover:underline cursor-pointer"
						>
							Login
						</Link>
					</p> */}
					{msg.length !== 0 && <p>{msg}</p>}
				</div>
			</div>
		</div>
	);
}