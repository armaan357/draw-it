"use client"
import { useEffect, useLayoutEffect, useRef } from "react";
import { canvasContext } from "./canvasContext";
import { currShapeBoundingBoxType, render } from "./drawCanvas";
import { ShapeToolbar } from "./shapeToolbar";
import { CanvasMenu } from "./canvasMenu";
import { CustomizationToolbar } from "./customizationToolbar";
import { useAppStore } from "../../zustandState/store";
import { useShallow } from "zustand/shallow";
import { shapeGeometryType, shapesType } from "../../zustandState/storeTypes";
import { toggleTextArea } from "../logic/toggleTextArea";
import { nanoid } from "nanoid";

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
			zoom: state.zoom,
			offsetX: state.offsetX,
			offsetY: state.offSetY,
			changeZoom: state.changeZoom,
			changeOffset: state.changeOffset,
		})),
	);
	let roomId: string | null = slug ? slug : null;

	const startX = useRef<number>(0);
	const startY = useRef<number>(0);
	const shapesRef = useRef<shapesType[]>(allShapes);
	const zoomRef = useRef(zoom);
	const offsetXRef = useRef(offsetX);
	const offsetYRef = useRef(offsetY);
	const currentShapeRef = useRef<{
		position: { x: number; y: number };
		geometry: shapeGeometryType;
	} | null>(null);
	const currSelectedShapeRef = useRef<currShapeBoundingBoxType>(null);
	const isTextAreaActiveRef = useRef<{
		isActive: boolean;
		position: { x: number; y: number } | null;
	}>({ isActive: false, position: null });
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	// useEffect(() => {
	// 	const textArea = textAreaRef.current;
	// 	if (!textArea) return;

	// 	textArea.focus();
	// }, [isTextAreaActive]);

	useLayoutEffect(() => {
		const textArea = textAreaRef.current;
		if (!textArea) return;

		const focusTimeOut = setTimeout(() => {
			textArea.focus();
		}, 50);
		textArea.selectionStart = textArea.value.length;
		textArea.selectionEnd = textArea.value.length;

		return () => clearTimeout(focusTimeOut);
	}, [isTextAreaActive]);

	useEffect(() => {
		const textArea = textAreaRef.current;
		if (textArea) {
			textArea.style.width = "40px";
			textArea.style.height = "50px";
			textArea.style.width = `${textArea.scrollWidth}px`;
			textArea.style.height = `${textArea.scrollHeight}px`;
		}
	}, [textAreaValue]);

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
			setIsTextAreaActive,
			setTextAreaPosition,
			shapesRef,
			addShapes,
			zoomRef,
			offsetXRef,
			offsetYRef,
			changeZoom,
			changeOffset,
			currentShapeRef,
			currSelectedShapeRef,
			isTextAreaActiveRef,
		);
		return cleanUp;
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
			currentShapeRef,
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
		shapesRef.current = allShapes;
	}, [allShapes]);

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
				shapesRef.current,
				currentShapeRef,
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
			shapesRef.current,
			currentShapeRef,
			currSelectedShapeRef,
			zoomRef.current,
			offsetXRef.current,
			offsetYRef.current,
		);
	};

	const handleTextAreaSubmit = () => {
		if (textAreaValue === "") {
			// toggleTextArea(false, setIsTextAreaActive, setTextAreaPosition);
			return;
		}
		const textPosition = {
			x: (textAreaScreenX + 2 - offsetXRef.current) / zoomRef.current,
			y: (textAreaScreenY + 6 - offsetYRef.current) / zoomRef.current,
		};
		// console.log(JSON.stringify(textAreaValue));
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
			<ShapeToolbar />
			{isTextAreaActive && (
				<textarea
					id="text-area"
					ref={textAreaRef}
					className={`resize-none absolute whitespace-pre-wrap break-words h-fit bg-white/30 text-white border-none focus-within:border-none focus-visible:border-none active:border-none active:ring-0 active:outline-none focus-within:outline-none overflow-hidden`}
					onBlur={() => handleTextAreaSubmit()}
					onChange={() => {
						if (textAreaRef.current)
							setTextAreaValue(textAreaRef.current?.value);
					}}
					onMouseDown={() =>
						(isTextAreaActiveRef.current.isActive = true)
					}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							if (!e.shiftKey) {
								e.preventDefault();
								handleTextAreaSubmit();
							}
						}
					}}
					autoCapitalize="none"
					wrap="off"
					style={{
						font: `16px ${canvasRef.current?.getContext("2d")?.font}`,
						letterSpacing: "2px",
						left: `${textAreaScreenX}px`,
						top: `${textAreaScreenY}px`,
						minWidth: "25px",
						width: "25px",
					}}
				/>
			)}
			<CustomizationToolbar />
			<CanvasMenu />
		</div>
	);
}
