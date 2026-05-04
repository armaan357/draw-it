"use client"
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { currShapeBoundingBoxType, render } from "./drawCanvas";
import { ShapeToolbar } from "./shapeToolbar";
import { CanvasMenu } from "./canvasMenu";
import { CustomizationToolbar } from "./customizationToolbar";
import { useAppStore } from "../../zustandState/store";
import { useShallow } from "zustand/shallow";
import { shapeGeometryType, shapesType } from "../../zustandState/storeTypes";
import { toggleTextArea } from "../logic/toggleTextArea";
import { nanoid } from "nanoid";
import { CanvasEngine } from "../logic/canvasEngine";
import {
	EngineActionsArgumentType,
	EngineRefsArgumentType,
	EngineStateArgumentType,
} from "../../types";

export function Canvas({
	slug,
	socket,
}: {
	slug?: string;
	socket?: WebSocket;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	// const dpr = window.devicePixelRatio || 1;
	const {
		currentTool,
		changeTool,
		isTextAreaActive,
		textAreaScreenX,
		textAreaScreenY,
		textAreaValue,
		textAreaEditingShapeId,
		setIsTextAreaActive,
		setTextAreaPosition,
		setTextAreaValue,
		setTextAreaEditingShapeId,
		allShapes,
		addShapes,
		removeShape,
		repositionShape,
		resizeShape,
		zoom,
		offsetX,
		offsetY,
		changeZoom,
		changeOffset,
	} = useAppStore(
		useShallow((state) => ({
			currentTool: state.currentTool,
			changeTool: state.changeTool,
			isTextAreaActive: state.isTextAreaActive,
			textAreaScreenX: state.textAreaScreenX,
			textAreaScreenY: state.textAreaScreenY,
			textAreaValue: state.textAreaValue,
			textAreaEditingShapeId: state.textAreaEditingShapeId,
			setIsTextAreaActive: state.setIsTextAreaActive,
			setTextAreaPosition: state.setTextAreaPosition,
			setTextAreaValue: state.setTextAreaValue,
			setTextAreaEditingShapeId: state.setTextAreaEditingShapeId,
			allShapes: state.allShapes,
			addShapes: state.addShapes,
			removeShape: state.removeShape,
			repositionShape: state.repositionShape,
			resizeShape: state.resizeShape,
			zoom: state.zoom,
			offsetX: state.offsetX,
			offsetY: state.offSetY,
			changeZoom: state.changeZoom,
			changeOffset: state.changeOffset,
		})),
	);
	let roomId: string | null = slug ? slug : null;

	const startXRef = useRef<number>(0);
	const startYRef = useRef<number>(0);
	const allShapesRef = useRef<shapesType[]>(allShapes);
	const zoomRef = useRef(zoom);
	const offsetXRef = useRef(offsetX);
	const offsetYRef = useRef(offsetY);
	const currentShapeBeingDrawnRef = useRef<{
		position: { x: number; y: number };
		geometry: shapeGeometryType;
	} | null>(null);
	const currSelectedShapeRef = useRef<currShapeBoundingBoxType>(null);
	const isTextAreaActiveRef = useRef<{
		isActive: boolean;
		position: { x: number; y: number } | null;
	}>({ isActive: false, position: null });
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	const canvasEngineRef = useRef<CanvasEngine>(null);

	// const [engine, setEngine] = useState<CanvasEngine>();

	useLayoutEffect(() => {
		const textArea = textAreaRef.current;
		if (!textArea) return;

		const focusTimeOut = setTimeout(() => {
			textArea.focus();
		}, 50);
		textArea.selectionStart = textArea.value.length;
		textArea.selectionEnd = textArea.value.length;
		let maxWidth = canvasRef.current?.clientWidth! - textAreaScreenX - 20;
		textArea.style.width = `${Math.min(textArea.scrollWidth, maxWidth)}px`;
		return () => clearTimeout(focusTimeOut);
	}, [isTextAreaActive]);

	useEffect(() => {
		const textArea = textAreaRef.current;

		if (textArea) {
			let maxWidth =
				canvasRef.current?.clientWidth! - textAreaScreenX - 20;
			textArea.style.width = `${Math.min(textArea.scrollWidth, maxWidth)}px`;
			textArea.style.height = `${textArea.scrollHeight}px`;
			if (maxWidth <= textArea.scrollWidth) {
				textArea.style.whiteSpace = "pre-wrap";
				textArea.style.overflowWrap = "break-word";
			} else {
				textArea.style.whiteSpace = "pre";
				textArea.style.wordBreak = "normal";
			}
		}
	}, [textAreaValue]);

	useEffect(() => {
		if (!canvasRef.current) {
			return;
		}
		const canvas = canvasRef.current;

		const engineRefs: EngineRefsArgumentType = {
			startXRef,
			startYRef,
			allShapesRef,
			zoomRef,
			offsetXRef,
			offsetYRef,
			currentShapeBeingDrawnRef,
			currSelectedShapeRef,
			isTextAreaActiveRef,
		};
		const engineActions: EngineActionsArgumentType = {
			addShapes,
			removeShape,
			repositionShape,
			resizeShape,
			setIsTextAreaActive,
			setTextAreaPosition,
			setTextAreaValue,
			changeZoom,
			changeOffset,
		};
		const engineState: EngineStateArgumentType = {
			canvas,
			roomId,
			socket,
			currentTool,
		};

		canvasEngineRef.current = new CanvasEngine(
			engineState,
			engineRefs,
			engineActions,
		);

		return () => {
			canvasEngineRef.current ? canvasEngineRef.current.destroy() : null;
		};
	}, [currentTool]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const dpr = window.devicePixelRatio || 1;

		canvas.width = canvas.clientWidth * dpr;
		canvas.height = canvas.clientHeight * dpr;

		render(
			ctx,
			canvas,
			allShapes,
			currentShapeBeingDrawnRef,
			currSelectedShapeRef,
			zoom,
			offsetX,
			offsetY,
		);
	}, [allShapes, zoom, offsetX, offsetY]);

	useEffect(() => {
		zoomRef.current = zoom;
	}, [zoom]);

	useEffect(() => {
		offsetXRef.current = offsetX;
		offsetYRef.current = offsetY;
	}, [offsetX, offsetY]);

	useEffect(() => {
		allShapesRef.current = allShapes;
	}, [allShapes]);

	useEffect(() => {
		isTextAreaActiveRef.current.isActive = isTextAreaActive;
	}, [isTextAreaActive]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const resizeCanvas = () => {
			const dpr = window.devicePixelRatio || 1;

			canvas.width = canvas.clientWidth * dpr;
			canvas.height = canvas.clientHeight * dpr;
			render(
				ctx,
				canvas,
				allShapesRef.current,
				currentShapeBeingDrawnRef,
				currSelectedShapeRef,
				zoomRef.current,
				offsetXRef.current,
				offsetYRef.current,
			);
		};

		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		return () => window.removeEventListener("resize", resizeCanvas);
	}, []);

	const renderText = (position: { x: number; y: number }, value: string) => {
		if (value === "") return;

		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const textLines = value.split("\n");
		const longest = textLines.reduce((a, b) => {
			return a.length > b.length ? a : b;
		}, "");
		const textWidth = ctx.measureText(longest).width;
		const textHeight = textLines.length * 24;

		const textGeometry: shapeGeometryType = {
			type: "text",
			text: value,
			width: textWidth,
			height: textHeight,
			fontSize: 14,
		};
		const newText = {
			id: nanoid(),
			position: {
				x: position.x,
				y: position.y,
			},
			geometry: textGeometry,
			style: {
				fill: true,
				color: "white",
				strokeWidth: 2,
				opacity: 1,
			},
			transform: {
				rotation: 0,
				scaleX: 1,
				scaleY: 2,
			},
			metadata: {
				createdAt: Date.now(),
				updatedAt: Date.now(),
				createdBy: "User1",
			},
		};

		addShapes(newText);
		render(
			ctx,
			canvas,
			allShapesRef.current,
			currentShapeBeingDrawnRef,
			currSelectedShapeRef,
			zoomRef.current,
			offsetXRef.current,
			offsetYRef.current,
		);
	};

	const handleTextAreaSubmit = () => {
		const textPosition = {
			x: (textAreaScreenX + 2 - offsetXRef.current) / zoomRef.current,
			y: (textAreaScreenY + 6 - offsetYRef.current) / zoomRef.current,
		};
		renderText(textPosition, textAreaValue);

		toggleTextArea(false, setIsTextAreaActive, setTextAreaPosition);
		isTextAreaActiveRef.current.isActive = false;
		setTextAreaValue("");
	};

	// useEffect(() => {
	// 	const dpr = window.devicePixelRatio || 1;
	// 	const canvas = canvasRef.current;
	// 	if (!canvas) {
	// 		return;
	// 	}
	// 	canvas.width = canvas.clientWidth * dpr;
	// 	canvas.height = canvas.clientHeight * dpr;
	// 	const ctx = canvas.getContext("2d");
	// 	if (!ctx) {
	// 		return;
	// 	}
	// 	ctx.setTransform(1, 0, 0, 1, 0, 0);
	// 	ctx.scale(dpr, dpr);
	// 	ctx.strokeStyle = "white";
	// 	drawCanvas(ctx, allShapes, canvas);
	// 	const handleWindowResize = () => {
	// 		const dpr = window.devicePixelRatio || 1;
	// 		canvas.width = canvas.clientWidth * dpr;
	// 		canvas.height = canvas.clientHeight * dpr;
	// 		ctx.setTransform(1, 0, 0, 1, 0, 0);
	// 		ctx.scale(dpr, dpr);
	// 		ctx.strokeStyle = "white";
	// 		drawCanvas(ctx, allShapes, canvas);
	// 	};
	// 	window.addEventListener("resize", handleWindowResize);

	// 	return () => window.removeEventListener("resize", handleWindowResize);
	// }, [allShapes, zoom, offsetX, offsetY]);

	// useEffect(() => {
	// 	const handleWindowResize = () => {
	// 		const dpr = window.devicePixelRatio || 1;
	// 		if (!canvasRef.current) return;
	// 		canvasRef.current.width = canvasRef.current.clientWidth * dpr;
	// 		canvasRef.current.height = canvasRef.current.clientHeight * dpr;
	// 	};
	// 	window.addEventListener("resize", handleWindowResize);

	// 	return window.removeEventListener("resize", handleWindowResize);
	// }, []);

	return (
		<div className="min-w-dvw h-dvh stroke-1 stroke-emerald-950 text-white flex justify-center relative">
			<canvas
				ref={canvasRef}
				className="bg-[#101011] overflow-hidden w-screen h-screen block"
			></canvas>
			<ShapeToolbar currentSelectedShapeRef={currSelectedShapeRef} />
			{isTextAreaActive && (
				<textarea
					id="text-area"
					ref={textAreaRef}
					className={`resize-none absolute min-h-12.5 bg-white/30 text-white border-none focus-within:border-none focus-visible:border-none active:border-none active:ring-0 active:outline-none focus-within:outline-none tracking-widest overflow-hidden`}
					value={textAreaValue}
					onBlur={() => handleTextAreaSubmit()}
					onChange={() => {
						if (textAreaRef.current)
							setTextAreaValue(textAreaRef.current?.value);
					}}
					onMouseDown={() =>
						(isTextAreaActiveRef.current.isActive = true)
					}
					// onKeyDown={(e) => {
					// 	if (e.key === "Enter") {
					// 		if (!e.shiftKey) {
					// 			e.preventDefault();
					// 			handleTextAreaSubmit();
					// 		}
					// 	}
					// }}
					autoCapitalize="none"
					style={{
						font: `16px cursive`,
						left: `${textAreaScreenX}px`,
						top: `${textAreaScreenY}px`,
						minWidth: `50px`,
						minHeight: "40px",
					}}
				/>
			)}
			<CustomizationToolbar />
			<CanvasMenu />
		</div>
	);
}
