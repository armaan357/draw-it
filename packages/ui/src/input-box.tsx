import { Ref } from "react";

interface propType {
    type: 'text' | 'email' | 'password';
    placeholder: string;
    ref: Ref<HTMLInputElement>;
    purpose: 'primary' | 'send';
    label?: string;
}

const purposeInp = {
    'primary': 'w-full rounded-lg',
    'send': 'rounded-tl-full rounded-bl-full rounded-tr-0 rounded-br-0'
}

export function InputBox({ type, placeholder, ref, purpose, label }: propType) {
    return (
        <div
        className="w-full flex flex-col gap-2">
            {label && <label className="ml-3 font-[450]" >{label}:</label>}
            <input 
                type={type} 
                placeholder={placeholder} 
                ref={ref}
                style={{ padding: '12px 24px' }}
                className={`${purposeInp[purpose]} bg-zinc-800 hover:bg-zinc-700 outline-0 border-0 text-base text-zinc-100 transition-all duration-300`}
            />
            {/* <div className="absolute right-0.5">
                <EyeIcon />
            </div> */}
        </div>
        
    );
}