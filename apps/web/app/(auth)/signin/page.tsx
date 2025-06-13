"use client";
import styles from '../../page.module.css';
import { useRef, useState } from "react"
import { InputBox } from "@repo/ui/input-box";
import { Button } from "@repo/ui/button";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { SigninSchema } from '@repo/common/schema';
import { z } from 'zod';
import Link from 'next/link';

export default function SignIn() {

    const emailRef = useRef<HTMLInputElement>(null);
    const pwdRef = useRef<HTMLInputElement>(null);
    const [ msg, setMsg ] = useState<string>("");
    const navigate = useRouter();
    type signinType = z.infer<typeof SigninSchema>;
    
    async function signin() {
        try {
            const userInfo: signinType = {
                userName: emailRef.current?.value!,
                password: pwdRef.current?.value!
            };
            if(userInfo.userName.length === 0 || userInfo.password.length === 0){
                return;
            }
            
            const resp = await axios.post('http://localhost:3001/signin', userInfo, { withCredentials: true });
            if(!resp) {
                setMsg('Please try again');
                return;
            }
            else if(resp.data.error) {
                console.log(resp.data.error);
                return;
            }
            localStorage.setItem('token', resp.data.token);
            localStorage.setItem('userName', resp.data.userName);
            navigate.push('/canvas');
        }catch(e: any) {
            console.log("error: ", e);
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-zinc-800 text-zinc-100 font-sans">
            <div className="w-md flex flex-col justify-center items-center gap-6 border-2 border-zinc-700 rounded-lg py-7 px-3 bg-zinc-950/50">
                <div>
                    <h1 className="text-2xl font-semibold">Sign In</h1>
                </div>
                <div className="flex flex-col w-full gap-5 justify-center items-center max-w-sm">
                    <InputBox label='Email' type="email" purpose='primary' ref={emailRef} placeholder="user@gmail.com" />
                    <InputBox label='Password' ref={pwdRef} type="password" placeholder="Enter your password" purpose='primary' />
                </div>
                <div className="w-full flex flex-col justify-center items-center gap-2.5 max-w-sm">
                    <Button variant='primary' size='lg' className="bg-purple-600 hover:bg-purple-700 w-full" children={'Log In'} onClick={signin} />
                    <p>Don't have an account? <Link href='/signup' className="text-blue-600 hover:text-blue-500 hover:underline cursor-pointer">Sign Up</Link></p>
                    {msg.length !== 0 && <p>{msg}</p>}
                </div>
            </div>
        </div>
    );
}