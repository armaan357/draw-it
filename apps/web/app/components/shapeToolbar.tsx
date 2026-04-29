// "use client";
import {
	Circle,
	Eraser,
	HandIcon,
	MousePointer2,
	Pen,
	RectangleHorizontal,
	Slash,
	TextIcon,
} from "lucide-react";
import { RefObject, useEffect } from "react";
import { useAppStore } from "../../zustandState/store";
import { useShallow } from "zustand/shallow";
import { currShapeBoundingBoxType } from "./drawCanvas";
import { allToolsType } from "../../zustandState/storeTypes";

export function ShapeToolbar({
	currentSelectedShapeRef,
}: {
	currentSelectedShapeRef: RefObject<currShapeBoundingBoxType | null>;
}) {
	const { currentTool, changeTool } = useAppStore(
		useShallow((state) => ({
			currentTool: state.currentTool,
			changeTool: state.changeTool,
		})),
	);

	const handleToolChange = (tool: allToolsType) => {
		changeTool(tool);
		if (tool !== "cursor") {
			currentSelectedShapeRef.current = null;
		}
	};

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
						handleToolChange("cursor");
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
						handleToolChange("rect");
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
						handleToolChange("circle");
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
						handleToolChange("line");
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
						handleToolChange("draw");
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
						handleToolChange("drag");
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
						handleToolChange("text");
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
						handleToolChange("eraser");
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