"use client";
import styles from '../../page.module.css';
import { useRef, useState } from "react"
import { InputBox } from "@repo/ui/input-box";
import { Button } from "@repo/ui/button";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { SignupSchema } from '@repo/common/schema';
import { z } from 'zod';
import Link from 'next/link';

export default function SignUp() {

    const emailRef = useRef<HTMLInputElement>(null);
    const pwdRef = useRef<HTMLInputElement>(null);
    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);
    const [ msg, setMsg ] = useState<string>("");
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
            if(userInfo.userName.length === 0 || userInfo.password.length === 0 || userInfo.firstName.length === 0 || userInfo.lastName.length === 0){
                return;
            }
            
            const resp = await axios.post('http://localhost:3001/signup', userInfo);
            if(!resp) {
                setMsg('Please try again');
                return;
            }
            else if(resp.data.error?.code === 11000) {
                setMsg('User already exists please sign in');
                console.log(resp.data.error);
                return;
            }
            navigate.push('/signin');
        }catch(e: any) {
            console.log("error: ", e);
        }
    }

    return (
        <div className="flex justify-center items-center h-screen bg-zinc-800 text-zinc-100 font-sans">
            <div className="w-md flex flex-col justify-center items-center gap-6 border-2 border-zinc-700 rounded-lg py-5 px-3 bg-zinc-950/50">
                <div>
                    <h1 className="text-2xl font-semibold">Sign Up</h1>
                </div>
                <div className="flex flex-col w-full gap-5 justify-center items-center max-w-sm">
                    <InputBox label='Email' type="text" purpose='primary' ref={emailRef} placeholder="user@gmail.com" />
                    <InputBox label='Password' ref={pwdRef} type="password" placeholder="Enter a strong password" purpose='primary' />
                    <InputBox label='First Name' ref={firstNameRef} type="text" placeholder="First Name" purpose='primary' />
                    <InputBox label='Last Name' ref={lastNameRef} type="text" placeholder="Last Name" purpose='primary' />
                </div>
                <div className="w-full flex flex-col justify-center items-center gap-2.5 max-w-sm">
                    <Button variant='primary' className="bg-purple-600 hover:bg-purple-700 w-full" size='lg' children={'Sign Up'} onClick={signup} />
                    <p>Already have an account? <Link href='/signin' className="text-blue-600 hover:text-blue-500 hover:underline cursor-pointer">Login</Link></p>
                    {msg.length !== 0 && <p>{msg}</p>}
                </div>
            </div>
        </div>
    );
}