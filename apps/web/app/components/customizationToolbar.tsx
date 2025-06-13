import { Menu, Minus } from "lucide-react";
import { useState } from "react";

type strokeWidthType = {
    title: string;
    weight: string;
    width: number;
}

export function CustomizationToolbar() {
    // const [ isOpen, setOpen ] = useState<boolean>(false);
    const strokeColors: string[] = ['bg-white', 'bg-gray-400', 'bg-purple-400', 'bg-purple-800', 'bg-blue-300', 'bg-blue-700', 'bg-yellow-600', 'bg-orange-600', 'bg-green-400', 'bg-green-800', 'bg-pink-500', 'bg-red-700'];

    const strokeWidth: strokeWidthType[] = [
        { title: 'S', weight: 'font-light', width: 5},
        { title: 'M', weight: 'font-medium', width: 7},
        { title: 'L', weight: 'font-bold', width: 9},
        { title: 'XL', weight: 'font-extrabold', width: 11}
    ]

    return (
        <div className="flex flex-col absolute right-4 top-10 w-40 h-auto items-center gap-2 py-5 rounded-lg bg-zinc-800/90 z-40 border-2 border-gray-600/80">
            <div className="flex flex-col items-center gap-2">
                <h4>Stroke Colors</h4>
                <div className="flex px-1 gap-1 justify-center flex-wrap">
                    {strokeColors.map((c, index) => <StrokeColorsContainer key={index} bgColor={c} />)}
                </div>
            </div>
            
            <div className="border-t border-t-gray-600/80 w-full"></div>
            <div className="flex flex-col items-center gap-2">
                <h4>Stroke width</h4>
                <div className="flex px-1 gap-1 justify-center flex-wrap">
                    {strokeWidth.map((s, index) => <StrokeWidthContainer key={index} title={s.title} weight={s.weight} />)}
                </div> 
            </div>
        </div>
    )
}

function StrokeColorsContainer({ bgColor }: { bgColor: string }) {
    return (
        <div className="flex justify-center items-center w-8 h-8 rounded-lg hover:bg-gray-700 duration-300 transition-colors cursor-pointer">
            <div className={`w-4 h-4 z-50 rounded-full ${bgColor} `}></div>
        </div>
        
    )
}
function StrokeWidthContainer({ title, weight }: { title: string, weight: string }) {
    return (
        <div className="flex justify-center items-center w-8 h-8 rounded-lg hover:bg-gray-700 duration-300 transition-colors cursor-pointer">
            <div className={`${weight}`}>{title}</div>
        </div>
    )
}