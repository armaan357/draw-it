"use client"
import { useEffect, useRef } from "react";
import { canvasContext } from "./canvasContext";
import { drawCanvas } from "./drawCanvas";
import { ShapeToolbar } from "./shapeToolbar";
import { CanvasMenu } from "./canvasMenu";
import { CustomizationToolbar } from "./customizationToolbar";
import { useAppStore } from "../../zustandState/store";
import { useShallow } from "zustand/shallow";

export function Canvas({
	slug,
	socket,
}: {
	slug?: string;
	socket?: WebSocket;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const startX = useRef<number>(0);
	const startY = useRef<number>(0);
	const { currentTool, changeTool, allShapes, addShapes } = useAppStore(
		useShallow((state) => ({
			currentTool: state.currentTool,
			changeTool: state.changeTool,
			allShapes: state.allShapes,
			addShapes: state.addShapes,
		})),
	);
	let roomId: string | null = slug ? slug : null;

	useEffect(() => {
		if (!canvasRef.current) {
			return;
		}
		const canvas = canvasRef.current;
		const cleanUp = canvasContext(
			canvas,
			startX,
			startY,
			roomId,
			socket,
			currentTool,
			changeTool,
			allShapes,
			addShapes,
		);
		return cleanUp;
	}, [currentTool]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return;
		}
		drawCanvas(ctx, allShapes, canvas);
	}, [allShapes]);

	return (
		<div className="min-w-dvw h-dvh stroke-1 stroke-emerald-950 text-white flex justify-center">
			<canvas
				ref={canvasRef}
				width={1536}
				height={695}
				className="bg-[#101011] overflow-hidden"
			></canvas>
			<ShapeToolbar />
			<CustomizationToolbar />
			<CanvasMenu />
		</div>
	);
}

