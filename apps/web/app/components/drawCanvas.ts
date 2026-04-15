import { shapeGeometryType, shapesType } from "../../zustandState/storeTypes";
import { drawPreview } from "./drawPreview";

export const render = (
	ctx: CanvasRenderingContext2D,
	canvas: HTMLCanvasElement,
	allShapes: shapesType[],
	currentShape: {
		position: { x: number; y: number };
		geometry: shapeGeometryType;
	} | null,
) => {
	const dpr = window.devicePixelRatio || 1;

	ctx.strokeStyle = "white";
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// ctx.setTransform(
	// 	zoom * dpr,
	// 	0,
	// 	0,
	// 	zoom * dpr,
	// 	offsetX * dpr,
	// 	offsetY * dpr,
	// );
	ctx.setTransform(1, 0, 0, 1, 0, 0);

	drawCanvas(ctx, allShapes, currentShape);
};

export function drawCanvas(
	ctx: CanvasRenderingContext2D,
	allShapes: shapesType[],
	currentShape: {
		position: { x: number; y: number };
		geometry: shapeGeometryType;
	} | null,
) {
	ctx.strokeStyle = "white";
	// ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (!allShapes) {
		// console.log('All shapes does not exist');
		return;
	}

	if (allShapes.length === 0) {
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
				ctx.fillStyle = "white";
				ctx.fillText(s.geometry.text, s.position.x, s.position.y);
				break;
		}
	});
}
