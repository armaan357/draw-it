import { RefObject } from "react";
import { shapeGeometryType } from "../../zustandState/storeTypes";

export const drawPreview = (
	ctx: CanvasRenderingContext2D,
	currentShapeBeingDrawnRef: RefObject<{
		position: {
			x: number;
			y: number;
		};
		geometry: shapeGeometryType;
	} | null>,
) => {
	// ctx.strokeStyle = "white";
	const currentShapeBeingDrawn = currentShapeBeingDrawnRef.current!;
	switch (currentShapeBeingDrawn.geometry.type) {
		case "rect":
			ctx.beginPath();
			ctx.roundRect(
				currentShapeBeingDrawn.position.x,
				currentShapeBeingDrawn.position.y,
				currentShapeBeingDrawn.geometry.width,
				currentShapeBeingDrawn.geometry.height,
				Math.abs(
					(currentShapeBeingDrawn.geometry.width +
						currentShapeBeingDrawn.geometry.height) /
						50,
				),
			);
			ctx.stroke();
			break;
		case "circle":
			ctx.beginPath();
			ctx.ellipse(
				currentShapeBeingDrawn.position.x,
				currentShapeBeingDrawn.position.y,
				currentShapeBeingDrawn.geometry.radX,
				currentShapeBeingDrawn.geometry.radY,
				0,
				0,
				2 * Math.PI,
				false,
			);
			ctx.stroke();
			break;
		case "line":
			ctx.beginPath();
			ctx.moveTo(
				currentShapeBeingDrawn.position.x,
				currentShapeBeingDrawn.position.y,
			);
			ctx.lineTo(
				currentShapeBeingDrawn.geometry.dX +
					currentShapeBeingDrawn.position.x,
				currentShapeBeingDrawn.geometry.dY +
					currentShapeBeingDrawn.position.y,
			);
			ctx.stroke();
			break;
		case "draw":
			ctx.lineJoin = "round";
			ctx.beginPath();
			ctx.moveTo(
				currentShapeBeingDrawn.position.x,
				currentShapeBeingDrawn.position.y,
			);
			currentShapeBeingDrawn.geometry.allCoordinates.forEach((a) =>
				ctx.lineTo(a.x, a.y),
			);
			ctx.stroke();
			break;
		case "text":
			ctx.fillStyle = "white";
			ctx.fillText(
				currentShapeBeingDrawn.geometry.text,
				currentShapeBeingDrawn.position.x,
				currentShapeBeingDrawn.position.y,
			);
			break;
	}
};
