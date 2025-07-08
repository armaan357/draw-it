import { Menu } from "lucide-react";
import { useState } from "react";

export function CanvasMenu() {
    const [ isOpen, setOpen ] = useState<boolean>(false);
    return (
        <div className="absolute right-4 bottom-4 flex flex-col items-end gap-1.5 z-50">
            {isOpen && <div className="p-1.5 flex flex-col justify-center rounded-lg bg-zinc-800/90">
                <button className={`flex items-center justify-center h-11 w-auto px-1.5 rounded-md transition-colors duration-200 cursor-pointer hover:bg-zinc-700/50`} title="Menu" >Create a room</button>
                <button className={`flex items-center justify-center h-11 w-auto rounded-md transition-colors duration-200 cursor-pointer hover:bg-zinc-700/50`} title="Menu" >Join a room</button>
            </div>}
            <div className="relative right-0 bottom-0 max-w-fit p-1 rounded-lg bg-zinc-800/90 w-fit">
                <button className={`flex items-center justify-center h-11 w-11 rounded-md transition-colors duration-200 cursor-pointer hover:bg-zinc-700/50`} title="Menu" onClick={() => { setOpen(open => open = !open); } }><Menu className="w-5 h-5" /></button>
            </div>
        </div>
    )
}