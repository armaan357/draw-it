"use client"
import { useEffect, useRef } from "react";
import { canvasContext } from "./canvasContext";
import { render } from "./drawCanvas";
import { ShapeToolbar } from "./shapeToolbar";
import { CanvasMenu } from "./canvasMenu";
import { CustomizationToolbar } from "./customizationToolbar";
import { useAppStore } from "../../zustandState/store";
import { useShallow } from "zustand/shallow";
import { shapeGeometryType, shapesType } from "../../zustandState/storeTypes";

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
			shapesRef,
			addShapes,
			zoomRef,
			offsetXRef,
			offsetYRef,
			changeZoom,
			changeOffset,
			currentShapeRef,
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

		render(ctx, canvas, allShapes, currentShapeRef, zoom, offsetX, offsetY);
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
				zoomRef.current,
				offsetXRef.current,
				offsetYRef.current,
			);
		};

		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		return () => window.removeEventListener("resize", resizeCanvas);
	}, []);

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
		<div className="min-w-dvw h-dvh stroke-1 stroke-emerald-950 text-white flex justify-center">
			<canvas
				ref={canvasRef}
				className="bg-[#101011] overflow-hidden w-screen h-screen block"
			></canvas>
			<ShapeToolbar />
			<CustomizationToolbar />
			<CanvasMenu />
		</div>
	);
}

