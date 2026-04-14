// "use client";
import { Circle, Eraser, HandIcon, MousePointer2, Pen, RectangleHorizontal, Slash, TextIcon } from "lucide-react";
import { useEffect } from "react";
import { useAppStore } from "../../zustandState/store";
import { useShallow } from "zustand/shallow";

export function ShapeToolbar() {
	const { currentTool, changeTool } = useAppStore(
		useShallow((state) => ({
			currentTool: state.currentTool,
			changeTool: state.changeTool,
		})),
	);

	useEffect(() => {
		console.log("current tool = ", currentTool);
	}, [currentTool]);

	return (
		<div className="absolute bottom-4 flex justify-center gap-1 items-center p-1 rounded-lg bg-zinc-800/90 z-50 ">
			<div>
				<button
					className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currentTool == "cursor" ? "bg-purple-700 " : "hover:bg-zinc-700/50 "}`}
					title="select"
					onClick={() => {
						changeTool("cursor");
					}}
				>
					<MousePointer2 className="w-5 h-5" />
				</button>
			</div>
			<div>
				<button
					className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currentTool == "rect" ? "bg-purple-700 " : "hover:bg-zinc-700/50 "}`}
					title="Rectangle"
					onClick={() => {
						changeTool("rect");
					}}
				>
					<RectangleHorizontal className="w-5 h-5" />{" "}
				</button>
			</div>
			<div>
				<button
					className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currentTool == "circle" ? "bg-purple-700 " : "hover:bg-zinc-700/50 "}`}
					title="Circle"
					onClick={() => {
						changeTool("circle");
					}}
				>
					<Circle className="w-5 h-5" />
				</button>
			</div>
			<div>
				<button
					className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currentTool == "line" ? "bg-purple-700 " : "hover:bg-zinc-700/50 "}`}
					title="Line"
					onClick={() => {
						changeTool("line");
					}}
				>
					<Slash className="w-5 h-5" />
				</button>
			</div>
			<div>
				<button
					className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currentTool == "draw" ? "bg-purple-700 " : "hover:bg-zinc-700/50 "}`}
					title="Draw"
					onClick={() => {
						changeTool("draw");
					}}
				>
					<Pen className="w-5 h-5" />
				</button>
			</div>
			<div>
				<button
					className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currentTool == "drag" ? "bg-purple-700 " : "hover:bg-zinc-700/50 "}`}
					title="Drag"
					onClick={() => {
						changeTool("drag");
					}}
				>
					<HandIcon className="w-5 h-5" />
				</button>
			</div>
			<div>
				<button
					className={`flex items-center justify-center h-11 w-11 rounded-md transition-colors duration-200 cursor-pointer ${currentTool == "text" ? "bg-purple-700 " : "hover:bg-zinc-700/50  "}`}
					title="Text"
					onClick={() => {
						changeTool("text");
					}}
				>
					<TextIcon className="w-5 h-5" />
				</button>
			</div>
			<div>
				<button
					className={`flex items-center justify-center h-11 w-11 rounded-md  transition-colors duration-200 cursor-pointer ${currentTool == "eraser" ? "bg-purple-700 " : "hover:bg-zinc-700/50 "}`}
					title="Eraser"
					onClick={() => {
						changeTool("eraser");
					}}
				>
					<Eraser className="w-5 h-5" />
				</button>
			</div>
			{/* <div>
                <button className={`flex items-center justify-center h-11 w-11 rounded-md hover:bg-zinc-700/50 cursor-pointer transition-colors duration-200`} title="More..." onClick={() => {console.log(currShape); } }><ChevronUp className="w-5 h-5" /></button>
            </div> */}
		</div>
	);
}