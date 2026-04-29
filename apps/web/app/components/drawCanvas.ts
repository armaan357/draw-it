import { RefObject } from "react";
import { shapeGeometryType, shapesType } from "../../zustandState/storeTypes";
import { drawPreview } from "./drawPreview";

export interface currShapeBoundingBoxType {
	id: string;
	position: {
		x: number;
		y: number;
	};
	geometry: {
		type: "rect" | "circle" | "line" | "draw" | "text";
		width: number;
		height: number;
	};
}

export const render = (
	ctx: CanvasRenderingContext2D,
	canvas: HTMLCanvasElement,
	allShapes: shapesType[],
	currentShapeRef: RefObject<{
		position: {
			x: number;
			y: number;
		};
		geometry: shapeGeometryType;
	} | null>,
	currentSelectedShapeRef: RefObject<currShapeBoundingBoxType | null>,
	zoom: number,
	offsetX: number,
	offsetY: number,
) => {
	const dpr = window.devicePixelRatio || 1;

	ctx.strokeStyle = "white";
	ctx.lineWidth = 1.5;
	ctx.letterSpacing = "2px";
	ctx.fontKerning = "normal";
	ctx.letterSpacing = "0.1em";
	ctx.font = "16px cursive";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.setTransform(
		zoom * dpr,
		0,
		0,
		zoom * dpr,
		offsetX * dpr,
		offsetY * dpr,
	);

	drawCanvas(ctx, allShapes, currentShapeRef, currentSelectedShapeRef);
};

export function drawCanvas(
	ctx: CanvasRenderingContext2D,
	allShapes: shapesType[],
	currentShapeRef: RefObject<{
		position: {
			x: number;
			y: number;
		};
		geometry: shapeGeometryType;
	} | null>,
	currentSelectedShapeRef: RefObject<currShapeBoundingBoxType | null>,
) {
	ctx.strokeStyle = "white";

	if (!allShapes) {
		return;
	}

	allShapes.forEach((s) => {
		switch (s.geometry.type) {
			case "rect":
				ctx.beginPath();
				ctx.roundRect(
					s.position.x,
					s.position.y,
					s.geometry.width,
					s.geometry.height,
					Math.abs((s.geometry.width + s.geometry.height) / 50),
				);
				ctx.stroke();
				break;
			case "circle":
				ctx.beginPath();
				ctx.ellipse(
					s.position.x,
					s.position.y,
					s.geometry.radX,
					s.geometry.radY,
					0,
					0,
					2 * Math.PI,
					false,
				);
				ctx.stroke();
				break;
			case "line":
				ctx.beginPath();
				ctx.moveTo(s.position.x, s.position.y);
				ctx.lineTo(
					s.geometry.dX + s.position.x,
					s.geometry.dY + s.position.y,
				);
				ctx.stroke();
				break;
			case "draw":
				ctx.lineJoin = "round";
				ctx.beginPath();
				ctx.moveTo(s.position.x, s.position.y);
				s.geometry.allCoordinates.forEach((a) => ctx.lineTo(a.x, a.y));
				ctx.stroke();
				break;
			case "text":
				const textLineArray = s.geometry.text.split("\n");
				// console.log(textLineArray);
				let y = s.position.y;
				textLineArray.forEach((line) => {
					ctx.fillStyle = "white";
					ctx.fillText(line, s.position.x, y);
					y += 24;
				});
				break;
		}
	});

	if (currentSelectedShapeRef.current) {
		drawBoundingBox(ctx, currentSelectedShapeRef.current);
		return;
	}
	if (currentShapeRef.current) {
		drawPreview(ctx, currentShapeRef);
	}
}

const drawBoundingBox = (
	ctx: CanvasRenderingContext2D,
	s: currShapeBoundingBoxType,
) => {
	ctx.strokeStyle = "#2f80ed";
	ctx.lineWidth = 1;
	ctx.beginPath();
	if (s.geometry.type === "line") {
		ctx.beginPath();
		ctx.moveTo(s.position.x, s.position.y);
		ctx.lineTo(
			s.geometry.width + s.position.x,
			s.geometry.height + s.position.y,
		);
		ctx.stroke();
	} else {
		ctx.strokeRect(
			s.position.x,
			s.position.y,
			s.geometry.width,
			s.geometry.height,
		);
	}

	ctx.fillStyle = "black";
	ctx.fillRect(s.position.x - 4, s.position.y - 4, 8, 8);
	ctx.fillRect(
		s.position.x + s.geometry.width - 4,
		s.position.y + s.geometry.height - 4,
		8,
		8,
	);
	ctx.strokeRect(s.position.x - 4, s.position.y - 4, 8, 8);
	ctx.strokeRect(
		s.position.x + s.geometry.width - 4,
		s.position.y + s.geometry.height - 4,
		8,
		8,
	);
	if (s.geometry.type !== "line") {
		ctx.fillRect(
			s.position.x + s.geometry.width - 4,
			s.position.y - 4,
			8,
			8,
		);
		ctx.fillRect(
			s.position.x - 4,
			s.position.y + s.geometry.height - 4,
			8,
			8,
		);
		ctx.strokeRect(
			s.position.x + s.geometry.width - 4,
			s.position.y - 4,
			8,
			8,
		);
		ctx.strokeRect(
			s.position.x - 4,
			s.position.y + s.geometry.height - 4,
			8,
			8,
		);
	}
	// ctx.setTransform(1 * dpr, 0, 0, 1 * dpr, 0, 0);

	// ctx.setTransform(
	// 	zoom * dpr,
	// 	0,
	// 	0,
	// 	zoom * dpr,
	// 	offsetX * dpr,
	// 	offsetY * dpr,
	// );
};
