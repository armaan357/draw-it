import { RefObject } from "react";
import { shapeGeometryType } from "../../zustandState/storeTypes";

export const drawPreview = (
	ctx: CanvasRenderingContext2D,
	currentShapeRef: RefObject<{
		position: {
			x: number;
			y: number;
		};
		geometry: shapeGeometryType;
	} | null>,
) => {
	// ctx.strokeStyle = "white";
	const currentShape = currentShapeRef.current!;
	switch (currentShape.geometry.type) {
		case "rect":
			ctx.beginPath();
			ctx.roundRect(
				currentShape.position.x,
				currentShape.position.y,
				currentShape.geometry.width,
				currentShape.geometry.height,
				Math.abs(
					(currentShape.geometry.width +
						currentShape.geometry.height) /
						50,
				),
			);
			ctx.stroke();
			break;
		case "circle":
			ctx.beginPath();
			ctx.ellipse(
				currentShape.position.x,
				currentShape.position.y,
				currentShape.geometry.radX,
				currentShape.geometry.radY,
				0,
				0,
				2 * Math.PI,
				false,
			);
			ctx.stroke();
			break;
		case "line":
			ctx.beginPath();
			ctx.moveTo(currentShape.position.x, currentShape.position.y);
			ctx.lineTo(
				currentShape.geometry.dX + currentShape.position.x,
				currentShape.geometry.dY + currentShape.position.y,
			);
			ctx.stroke();
			break;
		case "draw":
			ctx.lineJoin = "round";
			ctx.beginPath();
			ctx.moveTo(currentShape.position.x, currentShape.position.y);
			currentShape.geometry.allCoordinates.forEach((a) =>
				ctx.lineTo(a.x, a.y),
			);
			ctx.stroke();
			break;
		case "text":
			ctx.fillStyle = "white";
			ctx.fillText(
				currentShape.geometry.text,
				currentShape.position.x,
				currentShape.position.y,
			);
			break;
	}
};
