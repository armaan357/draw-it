// "use client";
import { Circle, Eraser, HandIcon, MousePointer2, Pen, RectangleHorizontal, Slash, TextIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { differentShapeNameType } from "../utils";

export function ShapeToolbar({ currShape, setCurrShape }: {
    currShape: differentShapeNameType;
    setCurrShape: Dispatch<SetStateAction<differentShapeNameType>>;
}) {
    return (
        <div className="absolute bottom-4 flex justify-center gap-1 items-center p-1 rounded-lg bg-zinc-800/90 z-50 ">
            <div>
                <button className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currShape== null ? 'bg-purple-700 ' : 'hover:bg-zinc-700/50 '}`} title="select" onClick={() => { setCurrShape(s => s = null); } }><MousePointer2 className="w-5 h-5" /></button>
            </div>
            <div>
                <button className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currShape=='rect' ? 'bg-purple-700 ' : 'hover:bg-zinc-700/50 '}`} title="Rectangle" onClick={() => { setCurrShape(s => s = 'rect');  } }><RectangleHorizontal className="w-5 h-5" /> </button>
            </div>
            <div>
                <button className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currShape=='circle' ? 'bg-purple-700 ' : 'hover:bg-zinc-700/50 '}`} title="Circle" onClick={() => { setCurrShape(s => s = 'circle'); } }><Circle className="w-5 h-5" /></button>
            </div>
            <div>
                <button className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currShape=='line' ? 'bg-purple-700 ' : 'hover:bg-zinc-700/50 '}`} title="Arrow" onClick={() => { setCurrShape(s => s = 'line'); } }><Slash className="w-5 h-5" /></button>
            </div>
            <div>
                <button className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currShape=='draw' ? 'bg-purple-700 ' : 'hover:bg-zinc-700/50 '}`} title="Draw" onClick={() => { setCurrShape(s => s = 'draw'); } }><Pen className="w-5 h-5" /></button>
            </div>
            <div>
                <button className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currShape=='drag' ? 'bg-purple-700 ' : 'hover:bg-zinc-700/50 '}`} title="Drag" onClick={() => { setCurrShape(s => s = 'drag'); } }><HandIcon className="w-5 h-5" /></button>
            </div>
            <div>
                <button className={`flex items-center justify-center h-11 w-11 rounded-md transition-colors duration-200 cursor-pointer ${currShape=='text' ? 'bg-purple-700 ' : 'hover:bg-zinc-700/50  '}`} title="Text" onClick={() => { setCurrShape(s => s = 'text'); } }><TextIcon className="w-5 h-5" /></button>
            </div>
            <div>
                <button className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currShape=='eraser' ? 'bg-purple-700 ' : 'hover:bg-zinc-700/50 '}`} title="Eraser" onClick={() => { setCurrShape(s => s = 'eraser'); } }><Eraser className="w-5 h-5" /></button>
            </div>
            {/* <div>
                <button className={`flex items-center justify-center h-11 w-11 rounded-md hover:bg-zinc-700/50 cursor-pointer transition-colors duration-200`} title="More..." onClick={() => {console.log(currShape); } }><ChevronUp className="w-5 h-5" /></button>
            </div> */}
        </div>
    )
}