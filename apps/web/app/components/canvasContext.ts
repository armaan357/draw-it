import { RefObject } from "react";
import { coordinatesType } from "../utils";
import sendShapes from "./sendShapes";
import { drawCanvas, render } from "./drawCanvas";
import {
	allToolsType,
	shapeGeometryType,
	shapesType,
} from "../../zustandState/storeTypes";
import { nanoid } from "nanoid";
import { drawPreview } from "./drawPreview";

export function canvasContext(
	canvas: HTMLCanvasElement,
	startX: RefObject<number>,
	startY: RefObject<number>,
	roomId: string | null,
	socket: WebSocket | undefined,
	currentTool: allToolsType,
	changeTool: (tool: allToolsType) => void,
	allShapes: shapesType[],
	addShapes: (newShape: shapesType) => void,
	zoom: number,
	offsetX: number,
	offsetY: number,
	changeZoom: (newZoom: number) => void,
	changeOffset: (newOffsetX: number, newOffsetY: number) => void,
	currentShape: {
		position: { x: number; y: number };
		geometry: shapeGeometryType;
	} | null,
) {
	const ctx = canvas.getContext("2d");
	const userName: string | null = localStorage.getItem("userName")
		? localStorage.getItem("token")
		: null;

	if (!ctx) {
		return;
	}

	ctx.strokeStyle = "white";
	ctx.lineWidth = 1.5;
	ctx.letterSpacing = "2px";
	ctx.fontKerning = "normal";
	ctx.font = "16px cursive";
	let clicked = false;
	// drawCanvas(ctx, allShapes);
	render(ctx, canvas, allShapes, null);
	console.log(
		`In canvas context => clicked = ${clicked} & currentTool = ${currentTool}`,
	);

	let allCoordinates: coordinatesType[] = [];
	let text: string = "";

	const writeText = (e: KeyboardEvent) => {
		if (e.key == "Escape") {
			document.removeEventListener("keydown", writeText);
			const shape: {
				position: { x: number; y: number };
				geometry: shapeGeometryType;
			} = {
				position: {
					x: startX.current,
					y: startY.current,
				},
				geometry: {
					type: "text",
					text: text,
					//mock value for now
					width: 200,
					height: 30,
					fontSize: 15,
				},
			};
			const newText = {
				id: nanoid(),
				position: shape.position,
				geometry: shape.geometry,
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
			text = "";
			changeTool("select");
			return;
		}
		if (currentTool === "cursor") {
			return;
		} else if (currentTool == "text") {
			drawCanvas(ctx, allShapes, null);
			ctx.fillStyle = "white";
			text += e.key;
			ctx.fillText(`${text}`, startX.current, startY.current);
		}
	};

	const findShapes = (e: MouseEvent) => {
		console.log(`x coordinate = ${e.clientX}, y coordinate = ${e.clientY}`);
		console.log("total shapes = ", allShapes.length);

		for (let i = allShapes.length - 1; i >= 0; i--) {
			const tempShape = allShapes[i];
			const worldX = (e.clientX - offsetX) / zoom;
			const worldY = (e.clientY - offsetY) / zoom;
			if (!tempShape) {
				continue;
			}
			if (tempShape.geometry.type === "rect") {
				const isInXAxis =
					worldX >= tempShape.position.x! &&
					worldX <= tempShape.geometry.width! + tempShape.position.x;
				const isInYAxis =
					worldY >= tempShape.position.y! &&
					worldY <= tempShape.geometry.height! + tempShape.position.y;
				console.log(
					`isInXAxis = ${isInXAxis}, isInYAxis = ${isInYAxis}\nx = ${tempShape.position.x}, y = ${tempShape.position.y} and  endX = ${tempShape.geometry.width! + tempShape.position.x}, endY = ${tempShape.geometry.height! + tempShape.position.y}`,
				);
				if (isInXAxis && isInYAxis) {
					console.log(tempShape.id);
					console.log(tempShape);
					return;
				}
			} else if (tempShape.geometry.type === "circle") {
				//after implementing the rotation feature, the points x and y will need to be rotated by the angle of rotation in the opposite direction and then use them for calulation
				const semiMajorAxis =
					tempShape.geometry.radX >= tempShape.geometry.radY
						? tempShape.geometry.radX
						: tempShape.geometry.radY;
				const semiMinorAxis =
					tempShape.geometry.radX <= tempShape.geometry.radY
						? tempShape.geometry.radX
						: tempShape.geometry.radY;

				const isInXAxis =
					((worldX - tempShape.position.x) *
						(worldX - tempShape.position.x)) /
					(semiMajorAxis * semiMajorAxis);
				const isInYAxis =
					((worldY - tempShape.position.y) *
						(worldY - tempShape.position.y)) /
					(semiMinorAxis * semiMinorAxis);
				if (isInXAxis + isInYAxis < 1) {
					console.log(tempShape.id);
					console.log(tempShape);
					return;
				}
			} else if (tempShape.geometry.type === "line") {
				const startX = tempShape.position.x - 6;
				const startY = tempShape.position.y - 6;
				const endX = tempShape.geometry.dX + tempShape.position.x + 6;
				const endY = tempShape.geometry.dY + tempShape.position.y + 6;

				const isInXAxis = worldX >= startX && worldX <= endX;
				const isInYAxis = worldY >= startY && worldY <= endY;

				if (isInXAxis && isInYAxis) {
					console.log(tempShape.id);
					console.log(tempShape);
					return;
				}
			}
		}
	};

	const handleMouseDown = (e: MouseEvent) => {
		if (currentTool == "cursor") {
			findShapes(e);
			// return;
		} else {
			clicked = true;
			startX.current = (e.clientX - offsetX) / zoom;
			startY.current = (e.clientY - offsetY) / zoom;
			if (currentTool == "select") {
				return;
			}
			if (currentTool == "text") {
				document.addEventListener("keydown", writeText);
			}
		}
	};

	const handleMouseUp = (e: MouseEvent) => {
		if (!clicked || currentTool == "cursor") {
			return;
		}
		clicked = false;
		let shape:
			| {
					type: "rect";
					x: number;
					y: number;
					width: number;
					height: number;
			  }
			| {
					type: "circle";
					x: number;
					y: number;
					radX: number;
					radY: number;
			  }
			| {
					type: "line";
					x: number;
					y: number;
					toX: number;
					toY: number;
			  }
			| {
					type: "draw";
					x: number;
					y: number;
					allCoordinates: coordinatesType[];
			  }
			| {
					type: "text";
					x: number;
					y: number;
					text: string;
			  }
			| null = null;
		interface shapeSpecificType {
			position: {
				x: number;
				y: number;
			};
			geometry: shapeGeometryType;
		}
		let shapeSpecificProps: shapeSpecificType | null = null;
		const worldX = (e.clientX - offsetX) / zoom;
		const worldY = (e.clientY - offsetY) / zoom;

		if (currentTool === "rect") {
			let width = worldX - startX.current;
			let height = worldY - startY.current;

			shapeSpecificProps = {
				position: {
					x: startX.current,
					y: startY.current,
				},
				geometry: {
					type: "rect",
					width: width,
					height: height,
				},
			};
		} else if (currentTool === "circle") {
			let centerX = (startX.current + worldX) / 2;
			let centerY = (startY.current + worldY) / 2;
			let radX = Math.abs(centerX - worldX);
			let radY = Math.abs(centerY - worldY);

			shapeSpecificProps = {
				position: {
					x: centerX,
					y: centerY,
				},
				geometry: {
					type: "circle",
					radX: radX,
					radY: radY,
				},
			};
		} else if (currentTool == "line") {
			shapeSpecificProps = {
				position: {
					x: startX.current,
					y: startY.current,
				},
				geometry: {
					type: "line",
					dX: worldX - startX.current,
					dY: worldY - startY.current,
				},
			};
		} else if (currentTool == "draw") {
			shapeSpecificProps = {
				position: {
					x: startX.current,
					y: startY.current,
				},
				geometry: {
					type: "draw",
					allCoordinates: allCoordinates,
				},
			};
			allCoordinates = [];
		}

		if (!shapeSpecificProps) {
			return;
		}
		let genericShape = {
			id: nanoid(),
			position: shapeSpecificProps.position,
			geometry: shapeSpecificProps.geometry,
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
		addShapes(genericShape);

		if (roomId) {
			// console.log('sending');
			sendShapes(socket!, shape!, roomId, userName!);
		}
		// drawCanvas(ctx, allShapes);
		render(ctx, canvas, allShapes, null);
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!clicked || currentTool === "cursor") {
			return;
		}

		canvas.addEventListener("keydown", (e) => {
			// console.log("key pressed = ", e.key);
		});
		console.log("current tool in canvasContext  = ", currentTool);
		const worldX = (e.clientX - offsetX) / zoom;
		const worldY = (e.clientY - offsetY) / zoom;

		if (currentTool === "rect") {
			let width = worldX - startX.current;
			let height = worldY - startY.current;
			// drawCanvas(ctx, allShapes);
			currentShape = {
				position: {
					x: worldX,
					y: worldY,
				},
				geometry: {
					type: "rect",
					width: width,
					height: height,
				},
			};
			render(ctx, canvas, allShapes, currentShape);
		} else if (currentTool === "circle") {
			let centerX = (startX.current + worldX) / 2;
			let centerY = (startY.current + worldY) / 2;
			let radX = Math.abs(centerX - worldX);
			let radY = Math.abs(centerY - worldY);
			drawCanvas(ctx, allShapes, null);
			ctx.beginPath();
			ctx.ellipse(centerX, centerY, radX, radY, 0, 0, 2 * Math.PI, false);
			ctx.stroke();
		} else if (currentTool == "line") {
			drawCanvas(ctx, allShapes, null);
			ctx.beginPath();
			ctx.lineJoin = "round";
			ctx.moveTo(startX.current, startY.current);
			ctx.lineTo(worldX, worldY);
			ctx.lineCap = "round";
			ctx.stroke();
		} else if (currentTool == "draw") {
			allCoordinates.push({ x: worldX, y: worldY });
			drawCanvas(ctx, allShapes, null);

			ctx.lineJoin = "round";
			ctx.beginPath();
			ctx.moveTo(startX.current, startY.current);
			allCoordinates.map((a) => ctx.lineTo(a.x, a.y));
			ctx.stroke();
		}
	};

	const handleWheel = (e: MouseEvent) => {
		console.log(e);
		const zoomFactor = 1.1 | 0.9;

		const newZoom = zoom * zoomFactor;
		const mouseX = (e.clientX - offsetX) / newZoom;
		const mouseY = (e.clientY - offsetY) / newZoom;
		const newOffsetX = mouseX - (mouseX - offsetX) * (newZoom / zoom);
		const newOffsetY = mouseY - (mouseY - offsetY) * (newZoom / zoom);
		changeZoom(newZoom);
		changeOffset(newOffsetX, newOffsetY);
		// drawCanvas(ctx, allShapes, null);
		render(ctx, canvas, allShapes, null);
	};

	canvas.addEventListener("mousedown", handleMouseDown);

	canvas.addEventListener("mouseup", handleMouseUp);

	canvas.addEventListener("mousemove", handleMouseMove);

	// canvas.addEventListener("wheel", handleWheel);

	return () => {
		canvas.removeEventListener("mousedown", handleMouseDown);
		canvas.removeEventListener("mousemove", handleMouseMove);
		canvas.removeEventListener("mouseup", handleMouseUp);
		// canvas.removeEventListener("wheel", handleWheel);
	};
}