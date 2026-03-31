"use client";
import { useRef, useState } from "react"
import { InputBox } from "../../ui/input-box";
import { Button } from "../../ui/button";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { SigninSchema } from '@repo/common/schema';
import { z } from 'zod';
import Link from 'next/link';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SignIn() {
	const emailRef = useRef<HTMLInputElement>(null);
	const pwdRef = useRef<HTMLInputElement>(null);
	const [msg, setMsg] = useState<string>("");
	const navigate = useRouter();
	type signinType = z.infer<typeof SigninSchema>;
	console.log("backend url = ", backendUrl);

	async function signin() {
		try {
			const userInfo: signinType = {
				userName: emailRef.current?.value!,
				password: pwdRef.current?.value!,
			};
			if (
				userInfo.userName.length === 0 ||
				userInfo.password.length === 0
			) {
				return;
			}
			// { withCredentials: true }
			const resp = await axios.post(`${backendUrl}/signin`, userInfo);
			if (!resp) {
				setMsg("Please try again");
				return;
			} else if (resp.data.error) {
				console.log(resp.data.error);
				return;
			}
			localStorage.setItem("token", resp.data.token);
			localStorage.setItem("userName", resp.data.userName);
			navigate.push("/canvas");
		} catch (e: any) {
			console.log("error: ", e);
		}
	}

	return (
		<div className="h-full min-h-screen w-full bg-[#121212] text-zinc-100 font-sans">
			<div className="py-2.5 h-15 w-full flex justify-between items-center px-3 sm:px-8 md:px-12">
				<div></div>
				<div>
					<Link href={"signup"}>
						<Button
							variant="secondary"
							size="md"
							children={"Log In"}
						/>
					</Link>
				</div>
			</div>
			<div className="w-full sm:w-md mx-auto flex flex-col justify-center items-center gap-6 border-none py-7 px-3">
				<div>
					<h1 className="text-2xl font-semibold">Sign In</h1>
				</div>
				<div className="flex flex-col w-full gap-5 justify-center items-center max-w-sm">
					<InputBox
						label="Email"
						type="email"
						purpose="primary"
						ref={emailRef}
						placeholder="user@gmail.com"
					/>
					<InputBox
						label="Password"
						ref={pwdRef}
						type="password"
						placeholder="Enter your password"
						purpose="primary"
					/>
				</div>
				<div className="w-full flex flex-col justify-center items-center gap-2.5 max-w-sm">
					<Button
						variant="primary"
						size="full"
						className="bg-purple-600 hover:bg-purple-700 w-full"
						children={"Log In"}
						onClick={signin}
					/>
					{/* <p>
						Don't have an account?{" "}
						<Link
							href="/signup"
							className="text-blue-600 hover:text-blue-500 hover:underline cursor-pointer"
						>
							Sign Up
						</Link>
					</p> */}
					{msg.length !== 0 && <p>{msg}</p>}
				</div>
			</div>
		</div>
	);
}