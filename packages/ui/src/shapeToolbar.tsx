// "use client";
// import { ChevronUp, Circle, Eraser, HandIcon, MousePointer2, RectangleHorizontal, Slash, TextIcon } from "lucide-react";
// import { Dispatch, SetStateAction } from "react";

// export function ShapeToolbar({ currShape, setCurrShape }: {
//     currShape: 'select' | 'rect' | 'circle' | 'line' | 'drag' | 'text' | 'eraser' | null;
//     setCurrShape: Dispatch<SetStateAction<'rect' | 'circle' | 'line' | 'drag' | 'text' | 'eraser' | 'select' | null>>;
// }) {
//     return (
//         <div className="absolute bottom-4 flex justify-center gap-1 items-center p-1 rounded-lg bg-zinc-800/90 z-50 ">
//             <div>
//                 <button className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currShape=='select' ? 'bg-purple-700 p-5 ' : 'hover:bg-zinc-700/50 '}`} title="select" onClick={() => { setCurrShape('select'); console.log(currShape); } }><MousePointer2 className="w-5 h-5" /></button>
//             </div>
//             <div>
//                 <button className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currShape=='rect' ? 'bg-purple-700 ' : 'hover:bg-zinc-700/50 '}`} title="Rectangle" onClick={() => { setCurrShape('rect'); console.log(currShape); } }><RectangleHorizontal className="w-5 h-5" /> </button>
//             </div>
//             <div>
//                 <button className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currShape=='circle' ? 'bg-purple-700 ' : 'hover:bg-zinc-700/50 '}`} title="Circle" onClick={() => { setCurrShape('circle'); console.log(currShape); } }><Circle className="w-5 h-5" /></button>
//             </div>
//             <div>
//                 <button className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currShape=='line' ? 'bg-purple-700 ' : 'hover:bg-zinc-700/50 '}`} title="Arrow" onClick={() => { setCurrShape('line'); console.log(currShape); } }><Slash className="w-5 h-5" /></button>
//             </div>
//             <div>
//                 <button className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currShape=='drag' ? 'bg-purple-700 ' : 'hover:bg-zinc-700/50 '}`} title="Drag" onClick={() => { setCurrShape('drag'); console.log(currShape); } }><HandIcon className="w-5 h-5" /></button>
//             </div>
//             <div>
//                 <button className={`flex items-center justify-center h-11 w-11 rounded-md transition-colors duration-200 cursor-pointer ${currShape=='text' ? 'bg-purple-700 ' : 'hover:bg-zinc-700/50  '}`} title="Text" onClick={() => { setCurrShape('text'); console.log(currShape); } }><TextIcon className="w-5 h-5" /></button>
//             </div>
//             <div>
//                 <button className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currShape=='eraser' ? 'bg-purple-700 ' : 'hover:bg-zinc-700/50 '}`} title="Eraser" onClick={() => { setCurrShape('eraser'); console.log(currShape); } }><Eraser className="w-5 h-5" /></button>
//             </div>
//             <div>
//                 <button className={`flex items-center justify-center h-11 w-11 rounded-md hover:bg-zinc-700/50 cursor-pointer transition-colors duration-200`} title="More..." onClick={() => {console.log(currShape); } }><ChevronUp className="w-5 h-5" /></button>
//             </div>
//         </div>
//     )
// }